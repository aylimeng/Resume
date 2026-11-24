<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import * as THREE from 'three'
import { TresCanvas } from '@tresjs/core'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { sections, experiences, projects, skills, skillDetails } from '../data/resume.js'

const activeSection = ref('about')
const avatar = shallowRef(null)
const loading = ref(true)
const loadProgress = ref(0)
const loadError = ref(false)
const cameraZ = ref(9.5)
const dogLayer = ref(null)
const progressBar = ref(null)
const worksSection = ref(null)
const worksTrack = ref(null)
const targetPose = { x: 0, y: 0, scale: 0.88, yaw: -0.1 }

const dogBg = `${import.meta.env.BASE_URL}images/white-dog.webp`

let avatarRoot = null
let animationFrame = 0
let lastFrameTime = 0
let pointerYaw = 0
let pointerPitch = 0
let resizeFrame = 0
let revealObserver = null
let worksOverflow = 0

// 镜头编排: 首页居中 → 履历怼脸特写 → 作品转身 → 联系转回正面, 整页绕头一圈
const poses = [
  { x: 0, y: 0, scale: 0.88, yaw: -0.1, camZ: 9.5 },
  { x: -1.7, y: 0, scale: 0.9, yaw: 1.5, camZ: 4.6 },
  { x: -1.9, y: 0, scale: 0.85, yaw: 3.1, camZ: 7.0 },
  { x: -2.2, y: -0.05, scale: 0.62, yaw: 6.18, camZ: 9.5 },
]

function isMobile() {
  return window.innerWidth <= 720
}

// 横向 Works 区: 竖向滚动距离 = 横向可滑距离, 滚到底正好播完最后一张卡片
function measureWorks() {
  if (!worksSection.value || !worksTrack.value) return
  if (isMobile()) {
    worksSection.value.style.height = ''
    worksTrack.value.style.transform = ''
    worksOverflow = 0
    return
  }
  worksOverflow = Math.max(0, worksTrack.value.scrollWidth - window.innerWidth)
  worksSection.value.style.height = `${window.innerHeight + worksOverflow}px`
}

function updateTargetPose() {
  const sectionCenters = sections.map((section) => {
    const element = document.getElementById(section.id)
    return element ? element.getBoundingClientRect().top + window.scrollY + element.offsetHeight / 2 : 0
  })
  const scrollCenter = window.scrollY + window.innerHeight * 0.52
  let nearestIndex = 0
  let nearestDistance = Number.POSITIVE_INFINITY

  for (let index = 0; index < sectionCenters.length; index += 1) {
    const distance = Math.abs(sectionCenters[index] - scrollCenter)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestIndex = index
    }
  }
  activeSection.value = sections[nearestIndex].id

  // 内容章节(作品/联系)时白狗淡出, 避免白字压在白狗上难读; 首页与履历保持
  // 按视口中心实际所在的章节判断, 移动端竖排长列表时也覆盖整个作品区
  if (dogLayer.value) {
    const sectionRanges = sections.map((section) => {
      const element = document.getElementById(section.id)
      if (!element) return { top: 0, bottom: 0 }
      const top = element.getBoundingClientRect().top + window.scrollY
      return { top, bottom: top + element.offsetHeight }
    })
    const currentIndex = sectionRanges.findIndex((range) => scrollCenter >= range.top && scrollCenter < range.bottom)
    const currentId = sections[currentIndex >= 0 ? currentIndex : nearestIndex].id
    dogLayer.value.style.opacity = (currentId === 'projects' || currentId === 'contact') ? '0.15' : '1'
  }

  let startIndex = 0
  while (startIndex < sectionCenters.length - 2 && scrollCenter > sectionCenters[startIndex + 1]) startIndex += 1
  const start = sectionCenters[startIndex]
  const end = sectionCenters[startIndex + 1]
  const rawProgress = THREE.MathUtils.clamp((scrollCenter - start) / Math.max(1, end - start), 0, 1)
  const progress = rawProgress * rawProgress * (3 - 2 * rawProgress)
  const nextPose = poses[startIndex + 1] ?? poses[startIndex]
  const pose = poses[startIndex]
  const mobile = isMobile()

  targetPose.x = THREE.MathUtils.lerp(pose.x, nextPose.x, progress) * (mobile ? 0.25 : 1)
  targetPose.y = THREE.MathUtils.lerp(pose.y, nextPose.y, progress)
  targetPose.scale = THREE.MathUtils.lerp(pose.scale, nextPose.scale, progress) * (mobile ? 0.85 : 1)
  targetPose.yaw = THREE.MathUtils.lerp(pose.yaw, nextPose.yaw, progress)
  cameraZ.value = THREE.MathUtils.lerp(pose.camZ, nextPose.camZ, progress) + (mobile ? 1.2 : 0)

  // 顶部滚动进度条
  if (progressBar.value) {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    progressBar.value.style.width = `${(window.scrollY / max) * 100}%`
  }
  // 横向 Works: 竖向滚动驱动横向平移
  if (worksSection.value && worksTrack.value && !mobile && worksOverflow > 0) {
    const rect = worksSection.value.getBoundingClientRect()
    const total = Math.max(1, rect.height - window.innerHeight)
    const worksProgress = THREE.MathUtils.clamp(-rect.top / total, 0, 1)
    worksTrack.value.style.transform = `translate3d(${(-worksProgress * worksOverflow).toFixed(1)}px, 0, 0)`
  }
}

function onPointerMove(event) {
  pointerYaw = ((event.clientX / window.innerWidth) - 0.5) * 0.3
  pointerPitch = ((event.clientY / window.innerHeight) - 0.5) * 0.06
}

function onResize() {
  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    measureWorks()
    updateTargetPose()
  })
}

function animateAvatar(now) {
  // 按真实时间插值, 低帧率设备上也能在约 1.5 秒内转到位, 不依赖每帧固定步长
  const dt = Math.min(0.05, (now - lastFrameTime) / 1000 || 0.016)
  lastFrameTime = now
  const easing = 1 - Math.exp(-dt * 3.2)
  if (!document.hidden) {
    if (avatarRoot) {
      avatarRoot.position.x += (targetPose.x - avatarRoot.position.x) * easing
      avatarRoot.position.y += (targetPose.y - avatarRoot.position.y) * easing
      avatarRoot.rotation.y += (targetPose.yaw + pointerYaw - avatarRoot.rotation.y) * easing
      avatarRoot.rotation.x += (pointerPitch - avatarRoot.rotation.x) * easing
      const nextScale = avatarRoot.scale.x + (targetPose.scale - avatarRoot.scale.x) * easing
      avatarRoot.scale.setScalar(nextScale)
      // 待机浮动
      avatarRoot.position.y += Math.sin(now * 0.0011) * 0.0012
    }
  }
  animationFrame = requestAnimationFrame(animateAvatar)
}

function loadAvatar() {
  const loader = new GLTFLoader()
  // Three r187 的 DRACOLoader 默认使用打包进 bundle 的解码器, 不需要 public/draco/ 副本。
  const dracoLoader = new DRACOLoader()
  loader.setDRACOLoader(dracoLoader)
  const modelUrl = `${import.meta.env.BASE_URL}models/limeng.glb`
  loader.load(
    modelUrl,
    (gltf) => {
      const model = gltf.scene
      model.updateMatrixWorld(true)
      const bounds = new THREE.Box3().setFromObject(model)
      const size = bounds.getSize(new THREE.Vector3())
      const center = bounds.getCenter(new THREE.Vector3())
      const modelScale = 5.35 / Math.max(size.y, 0.01)
      model.scale.setScalar(modelScale)
      model.position.set(-center.x * modelScale, -center.y * modelScale, -center.z * modelScale)
      model.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true
          object.receiveShadow = true
          if (object.material) {
            // 去木纹: 法线贴图的细密划痕 + 粗糙度贴图的明暗起伏, 在强光与 2 倍高光下被放大成木纹;
            // 实测三者都去掉后皮肤与球面恢复平滑, 故禁用法线贴图、改用统一粗糙度 0.9、关掉高光
            object.material.normalMap = null
            object.material.metallicRoughnessTexture = null
            object.material.roughness = 0.9
            object.material.metalness = 0
            object.material.specularIntensity = 0
            object.material.needsUpdate = true
          }
        }
      })

      avatarRoot = new THREE.Group()
      avatarRoot.name = 'Li Meng character from supplied GLB'
      avatarRoot.add(model)
      avatarRoot.position.set(targetPose.x, targetPose.y, 0)
      avatarRoot.scale.setScalar(targetPose.scale)
      avatar.value = avatarRoot
      addBallText(avatarRoot)
      loading.value = false
      updateTargetPose()
    },
    (event) => {
      if (event.total > 0) loadProgress.value = Math.round((event.loaded / event.total) * 100)
    },
    () => {
      loading.value = false
      loadError.value = true
    },
  )
}

// 球后弧形文字: "HELLO WORLD" 白色大写, 挂在球体背面, 与球面留约 0.5 间隙,
// 每个字母沿水平圆弧排布、法线朝外, 与球面平行; 只有人物转身到背面(作品区 yaw≈3.1)时才可见。
// 字母投阴影靠前向主光源(已开 cast-shadow)+ alphaTest 镂空, 阴影落在球面上。
const BALL_TEXT = 'HELLO WORLD'
const BALL_CENTER_Y = -1.2 // 实测: 球直径约 511px、球心约 y=-1.2、球半径约 1.45(局部坐标)
const BALL_TEXT_RADIUS = 1.95 // 球半径 + 约 0.5 间隙, 保证字母整体在球面之外

function createLetterTexture(char) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.font = '700 190px "Playfair Display", Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(char, 128, 134)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function addBallText(root) {
  const build = () => {
    const letters = [...BALL_TEXT]
    const step = THREE.MathUtils.degToRad(8) // 跨度 110°→80°, 整词收进球后正中可见窗口, 两端字母不再被球面遮挡
    letters.forEach((char, index) => {
      if (char === ' ') return
      const texture = createLetterTexture(char)
      if (!texture) return
      // alphaTest 让阴影按字母形状镂空, 而不是整块矩形
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.4 })
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.56), material)
      const theta = ((letters.length - 1) / 2 - index) * step - THREE.MathUtils.degToRad(8) // 首字母在后视者左侧, 转过来后正读; 整体再右移 8°, 因球在画面左侧, 避免首字母 H 出画
      mesh.position.set(
        BALL_TEXT_RADIUS * Math.sin(theta),
        BALL_CENTER_Y,
        -BALL_TEXT_RADIUS * Math.cos(theta),
      )
      mesh.rotation.y = Math.PI - theta
      mesh.castShadow = true
      root.add(mesh)
    })
  }
  // 等 Playfair 字体就绪再画, 否则 canvas 会回退到 Georgia
  if (document.fonts?.load) {
    document.fonts.load('700 190px "Playfair Display"').catch(() => {}).finally(build)
  } else {
    build()
  }
}

function retryLoad() {  loadError.value = false
  loading.value = true
  loadProgress.value = 0
  loadAvatar()
}

function onVisibilityChange() {
  if (!document.hidden) updateTargetPose()
}

onMounted(() => {
  loadAvatar()
  measureWorks()
  updateTargetPose()
  window.addEventListener('scroll', updateTargetPose, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('visibilitychange', onVisibilityChange)
  animationFrame = requestAnimationFrame(animateAvatar)

  // 内容入场动画
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        revealObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12 })
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el))
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  cancelAnimationFrame(resizeFrame)
  revealObserver?.disconnect()
  window.removeEventListener('scroll', updateTargetPose)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  avatarRoot?.traverse((object) => {
    if (!object.isMesh) return
    object.geometry.dispose()
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      for (const value of Object.values(material)) {
        if (value?.isTexture) value.dispose()
      }
      material.dispose()
    })
  })
})

</script>

<template>
  <div class="portfolio">
    <div ref="progressBar" class="scroll-progress" aria-hidden="true"></div>
    <div class="scene-bg" aria-hidden="true">
      <div ref="dogLayer" class="dog-layer">
        <img class="dog-bg" :src="dogBg" alt="" />
      </div>
      <TresCanvas
        class="avatar-canvas"
        :alpha="true"
        :clear-alpha="0"
        :clear-color="'#121212'"
        :antialias="true"
        :shadows="true"
        :dpr="[1, 1.5]"
      >
        <TresPerspectiveCamera :position="[0, 0.12, cameraZ]" :fov="35" />
        <TresAmbientLight :intensity="2.1" />
        <TresDirectionalLight :position="[4, 7, 5]" :intensity="3.3" cast-shadow />
        <TresDirectionalLight :position="[-5, 3, -3]" :intensity="1.45" color="#f1d7b2" />
        <TresPointLight :position="[2, -0.2, 4]" :intensity="19" color="#f3c59f" :distance="9" />
        <TresMesh :position="[0, -2.7, -0.1]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
          <TresCircleGeometry :args="[2.2, 64]" />
          <TresMeshBasicMaterial color="#000000" :transparent="true" :opacity="0.14" />
        </TresMesh>
        <primitive v-if="avatar" :object="avatar" />
      </TresCanvas>
      <div v-if="loading" class="loading-card" role="status" aria-live="polite">
        <span class="loading-mark">LM</span>
        <span>正在加载 3D 形象</span>
        <div class="loading-track"><i :style="{ width: `${loadProgress}%` }"></i></div>
        <small>{{ loadProgress ? `${loadProgress}%` : '首次加载需要一点时间' }}</small>
      </div>
      <div v-else-if="loadError" class="loading-card load-error" role="status">
        3D 形象暂时没有加载成功，请检查网络后重试。
        <button class="retry-button" type="button" @click="retryLoad">重新加载</button>
      </div>
    </div>

    <main class="story">
      <section id="about" class="story-section hero-section">
        <div class="hero-copy reveal">
          <h1>About <em>Li Meng</em></h1>
          <p class="hero-intro">一个把想法做成体验的前端工程师。10 年以上前端开发经验，长期独立承担项目从排期、开发、提测到上线维护的完整闭环。</p>
          <div class="hero-stats">
            <div><strong>10+</strong><small>年开发经验</small></div>
            <div><strong>5</strong><small>精选项目</small></div>
            <div><strong>∞</strong><small>持续保持好奇</small></div>
          </div>
          <div class="scroll-cue"><span>SCROLL</span><i></i></div>
        </div>
      </section>

      <section id="resume" class="story-section resume-section">
        <div class="timeline-wrap reveal">
          <div class="education-row"><span class="period">学历</span><div><strong>本科 · 软件工程</strong><small>工作年限 10 年以上</small></div></div>
          <div class="timeline">
            <article v-for="item in experiences" :key="item.period" class="timeline-item reveal">
              <span class="timeline-dot" aria-hidden="true"></span>
              <span class="period">{{ item.period }}</span>
              <div><h3>{{ item.role }}</h3><p class="company">{{ item.company }}</p><p class="note">{{ item.note }}</p></div>
            </article>
          </div>
        </div>
      </section>

      <section id="projects" ref="worksSection" class="works-section">
        <div class="works-sticky">
          <div class="works-head reveal"><h2>主要项目</h2></div>
          <div ref="worksTrack" class="works-track">
            <article v-for="project in projects" :key="project.no" class="work-card project-card reveal">
              <span class="card-kicker">{{ project.no }} / 05</span>
              <h3>{{ project.title }}</h3>
              <p class="project-meta">{{ project.type }} · {{ project.period }}</p>
              <p class="project-desc">{{ project.description }}</p>
              <div class="project-tags"><span v-for="tag in project.tags" :key="tag">{{ tag }}</span></div>
            </article>
            <article class="work-card skills-card reveal">
              <span class="card-kicker">SKILLS</span>
              <h3>专业技能</h3>
              <div class="skill-detail-list">
                <div v-for="skill in skillDetails" :key="skill.name" class="skill-detail">
                  <strong>{{ skill.name }}</strong><p>{{ skill.detail }}</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="contact" class="story-section contact-section">
        <div class="contact-copy reveal">
          <h2>Say <em>Hello</em></h2>
          <p class="section-body">如果你也在做有意思的事，欢迎来聊聊。</p>
          <a class="email-card" href="mailto:pijiaso@126.com"><span>EMAIL ME</span><strong>pijiaso@126.com</strong><b>↗</b></a>
          <a class="github-link" href="https://github.com/aylimeng" target="_blank" rel="noreferrer">GITHUB ↗ <span>BEIJING, CHINA</span></a>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
:global(html) { scroll-behavior: smooth; background: #121212; }
:global(body) { min-width: 320px; background: #121212; color: #e2ffc2; font-family: "Segoe UI", "Microsoft YaHei", sans-serif; }
:global(body) { scrollbar-color: #3a3a3a #121212; }

.portfolio { position: relative; min-height: 100vh; overflow: clip; background: #121212; color: #e2ffc2; }
.scroll-progress { position: fixed; z-index: 11; top: 0; left: 0; height: 3px; width: 0; background: rgb(197 210 183 / var(--tw-bg-opacity, 1)); }
.scene-bg { position: fixed; z-index: 0; inset: 0; overflow: hidden; pointer-events: none; background: #121212; }
/* 白狗: 透明底 webp, 固定不动(无视差), 居中偏左上, 高度 64vh(v6 稍放大), 人在前比狗大 */
.dog-layer { position: absolute; z-index: 0; inset: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; transform: translate(-6vw, -4vh); transition: opacity .6s ease; }
.dog-bg { height: min(64vh, 980px); max-width: 94vw; width: auto; object-fit: contain; }
.avatar-canvas { position: absolute; z-index: 2; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.loading-card { position: absolute; z-index: 4; left: 50%; top: 50%; transform: translate(-50%,-50%); width: 240px; display: grid; gap: 11px; padding: 18px; background: #1c1c1c; color: #e2ffc2; font-size: 12px; }.loading-mark { display: grid; place-items: center; width: 28px; height: 28px; color: #e2ffc2; font: 9px Georgia,serif; }.loading-track { height: 2px; overflow: hidden; background: rgba(255,255,255,.14); }.loading-track i { display: block; height: 100%; background: rgb(197 210 183 / var(--tw-bg-opacity, 1)); transition: width .2s; }.loading-card small { color: #e2ffc2; font-size: 10px; }.load-error { width: auto; max-width: 300px; line-height: 1.7; }
.retry-button { margin-top: 4px; padding: 8px 12px; border-radius: 999px; background: rgb(197 210 183 / .14); color: #e2ffc2; font: inherit; font-size: 12px; cursor: pointer; }
.retry-button:hover { background: rgb(197 210 183 / .24); }

.story { position: relative; z-index: 2; }
.story-section { position: relative; min-height: 100svh; display: flex; align-items: center; padding: 110px clamp(20px,6vw,90px) 80px; scroll-margin-top: 0; }
.reveal { opacity: 0; transform: translateY(30px); transition: opacity .8s ease, transform .8s ease; }.reveal.is-visible { opacity: 1; transform: none; }

/* 压在 3D 人物/白狗上的文字加深色光晕, 保证在蓝色球体上也能读; v6 全文改为 #e2ffc2 后光晕更重要, 履历时间线也加上 */
.hero-copy,.contact-copy h2,.github-link,.works-head h2,.timeline-wrap { text-shadow: 0 1px 18px rgba(0,0,0,.85), 0 0 4px rgba(0,0,0,.6); }

/* 首页: 人物居中, 标题压在人物下方 */
.hero-section { align-items: flex-end; justify-content: center; padding-bottom: 9vh; }
.hero-copy { width: min(860px,94vw); text-align: center; }
.hero-copy h1 { position: relative; left: 50%; transform: translateX(-50%); width: max-content; max-width: none; margin: 0; color: #ffffff; font: 400 clamp(56px,9vw,124px)/1 "Playfair Display",Didot,"Bodoni MT",Georgia,"Times New Roman",serif; letter-spacing: .02em; text-transform: uppercase; white-space: nowrap; }
.hero-copy h1 em { color: #ffffff; font-weight: 400; }
.hero-intro { max-width: 620px; margin: 22px auto 0; color: #e2ffc2; font-size: 15px; line-height: 1.9; }
.hero-stats { display: flex; justify-content: center; gap: 34px; width: fit-content; margin: 34px auto 0; }
.hero-stats div { display: grid; gap: 6px; }
.hero-stats strong { color: #e2ffc2; font: 34px/.9 "Playfair Display",Georgia,serif; }
.hero-stats small { color: #e2ffc2; font-size: 11px; }
.scroll-cue { display: grid; justify-items: center; gap: 10px; margin-top: 44px; color: #e2ffc2; font-size: 11px; letter-spacing: .3em; }
.scroll-cue i { display: block; width: 1px; height: 44px; background: linear-gradient(rgb(197 210 183 / var(--tw-bg-opacity, 1)),transparent); animation: cue-drop 1.8s ease-in-out infinite; }
@keyframes cue-drop { 0% { transform: scaleY(0); transform-origin: top; } 55% { transform: scaleY(1); transform-origin: top; } 56% { transform-origin: bottom; } 100% { transform: scaleY(0); transform-origin: bottom; } }

/* 履历: 无背景面板, 纵向时间线, 间距约为 v3 的 2 倍 */
.resume-section { align-items: flex-start; padding-top: 16vh; }
.timeline-wrap { width: min(620px,94vw); margin-left: auto; }
.education-row { display: grid; grid-template-columns: 110px 1fr; gap: 14px; margin-top: 30px; padding: 16px 0; }
.period { color: #e2ffc2; font-size: 12px; font-weight: 600; white-space: nowrap; }
.education-row strong,.education-row small { display: block; }
.education-row strong { color: #e2ffc2; font-size: 15px; font-weight: 600; }
.education-row small { margin-top: 5px; color: #e2ffc2; font-size: 12px; }
.timeline { position: relative; margin-top: 8px; padding-left: 34px; }
.timeline::before { content: ""; position: absolute; left: 5px; top: 12px; bottom: 12px; width: 2px; background: rgb(197 210 183 / var(--tw-bg-opacity, 1)); }
.timeline-item { position: relative; display: grid; grid-template-columns: 110px 1fr; gap: 14px; min-height: 32vh; padding: 36px 0; }
.timeline-dot { position: absolute; left: -34px; top: 44px; width: 12px; height: 12px; border-radius: 50%; background: rgb(197 210 183 / var(--tw-bg-opacity, 1)); border: 3px solid #121212; box-shadow: 0 0 0 2px rgb(197 210 183 / var(--tw-bg-opacity, 1)); }
.timeline-item h3 { margin: 0; color: #e2ffc2; font-size: 17px; font-weight: 600; }
.company { margin: 5px 0 0; color: #e2ffc2; font-size: 13px; font-weight: 600; }
.note { margin: 8px 0 0; color: #e2ffc2; font-size: 14px; line-height: 1.9; }

/* Works: sticky 横向滚动区, 无框透明卡片 */
.works-section { position: relative; }
.works-sticky { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; display: flex; flex-direction: column; justify-content: center; gap: 34px; }
.works-head { padding: 0 6vw; }
.works-head h2 { margin: 0; color: #e2ffc2; font: 400 clamp(40px,5vw,64px)/1.05 "Playfair Display",Georgia,serif; letter-spacing: .02em; }
.works-track { display: flex; gap: 24px; width: max-content; padding: 0 6vw; will-change: transform; }
.work-card { flex: 0 0 auto; width: 520px; max-width: 86vw; height: min(500px,70vh); overflow: hidden; padding: 32px 30px; background: transparent; }
.skills-card { width: 520px; }
.card-kicker { color: #e2ffc2; font-size: 11px; font-weight: 700; letter-spacing: .24em; }
.work-card h3 { margin: 12px 0 0; color: #e2ffc2; font: 400 26px/1.4 "Playfair Display",Georgia,serif; }
/* 去磨砂后卡片文字直接压在 3D 场景上, 加深色光晕保证可读 */
.work-card h3,.work-card .project-desc,.work-card .project-meta,.work-card .skill-detail { text-shadow: 0 1px 10px rgba(0,0,0,.85), 0 0 3px rgba(0,0,0,.7); }
.skill-detail-list { display: grid; gap: 16px; margin-top: 24px; }
.skill-detail strong { color: #e2ffc2; font-size: 14px; }
.skill-detail p { margin: 4px 0 0; color: #e2ffc2; font-size: 13px; line-height: 1.7; }
.project-meta { margin: 10px 0 0; color: #e2ffc2; font-size: 13px; font-weight: 600; }
.project-desc { margin: 18px 0 0; color: #e2ffc2; font-size: 14px; line-height: 2; }
.project-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
.project-tags span { padding: 6px 10px; border-radius: 999px; background: rgb(197 210 183 / .12); color: #e2ffc2; font-size: 12px; font-weight: 600; }

.contact-section { justify-content: center; }
.contact-copy { width: min(680px,94vw); text-align: center; }
.contact-copy h2 { margin: 0; color: #ffffff; font: 400 clamp(56px,8vw,104px)/1.05 "Playfair Display",Georgia,serif; letter-spacing: .02em; text-transform: uppercase; }
.contact-copy h2 em { color: #ffffff; font-weight: 400; }
.section-body { max-width: 480px; margin: 20px auto 0; color: #e2ffc2; font-size: 14px; line-height: 1.9; }
.email-card { position: relative; display: grid; gap: 8px; width: min(430px,100%); margin: 32px auto 0; padding: 18px 20px; color: #e2ffc2; text-decoration: none; background: transparent; text-align: center; transition: background .2s; }
.email-card:hover { background: rgba(255,255,255,.06); }
.email-card span { color: #e2ffc2; font-size: 11px; letter-spacing: .14em; }
.email-card strong { font: 20px "Playfair Display",Georgia,serif; font-weight: 400; }
.email-card b { position: absolute; right: 18px; top: 50%; color: #e2ffc2; font-size: 16px; transform: translateY(-50%); }
.github-link { display: inline-flex; gap: 14px; margin-top: 22px; color: #e2ffc2; text-decoration: none; font-size: 12px; letter-spacing: .12em; }

@media (max-width: 1050px) { .timeline-wrap { width: min(560px,94vw); } }
@media (max-width: 720px) {
  .story-section { padding: 100px 16px 70px; }
  .hero-copy h1 { font-size: clamp(32px,10vw,52px); }
  .hero-intro { font-size: 14px; }
  .hero-stats { gap: 22px; }
  .hero-stats strong { font-size: 28px; }
  .timeline-wrap { width: 100%; }
  .timeline-item { grid-template-columns: 84px 1fr; gap: 10px; min-height: 0; padding: 26px 0; }
  .period { font-size: 11px; }
  .note { font-size: 13px; }
  /* 移动端: 横向改竖排, 符合手机竖滑习惯 */
  .works-section { height: auto !important; }
  .works-sticky { position: static; height: auto; overflow: visible; gap: 22px; padding: 90px 0; }
  .works-head { padding: 0 16px; }
  .works-head h2 { font-size: 40px; }
  .works-track { flex-direction: column; width: 100%; padding: 0 16px; transform: none !important; }
  .work-card { width: 100%; max-width: 100%; height: auto; }
  .contact-copy h2 { font-size: 58px; }
  .email-card strong { font-size: 17px; }
}
@media (max-width: 380px) { .hero-copy h1 { font-size: 32px; } }
@media (prefers-reduced-motion: reduce) { :global(html) { scroll-behavior: auto; } *,*::before,*::after { transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; } }
</style>
