<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import * as THREE from 'three'
import { TresCanvas } from '@tresjs/core'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const sections = [
  { id: 'about', label: '动机', en: 'THE STORY' },
  { id: 'profile', label: '写实风', en: 'PROFILE' },
  { id: 'resume', label: '寻找灵感', en: 'RÉSUMÉ' },
  { id: 'projects', label: '小白也能玩', en: 'SELECTED WORKS' },
  { id: 'contact', label: '结语', en: 'SAY HELLO' },
]

const activeSection = ref('about')
const avatar = shallowRef(null)
const loading = ref(true)
const loadProgress = ref(0)
const loadError = ref(false)
const targetPose = { x: 1.3, y: 0, scale: 0.61, yaw: -0.04 }

let avatarRoot = null
let animationFrame = 0
let pointerYaw = 0
let pointerPitch = 0
let resizeFrame = 0

const poses = [
  { x: 1.3, y: 0, scale: 0.61, yaw: -0.04 },
  { x: -1.9, y: 0.02, scale: 0.82, yaw: 0.12 },
  { x: -1.95, y: 0, scale: 1.02, yaw: -0.08 },
  { x: -1.8, y: -0.02, scale: 0.76, yaw: 0.08 },
  { x: 1.3, y: -0.02, scale: 0.61, yaw: -0.05 },
]

const experiences = [
  { period: '2023 — 至今', role: '独立开发者', company: '自主项目', note: '用 AI 辅助开发，把创意快速打磨成可用的产品。' },
  { period: '2018 — 2023', role: '前端工程师', company: '北京海狸先生网络科技', note: '负责洗衣服务平台、小程序和移动端体验。' },
  { period: '2016 — 2018', role: '前端工程师', company: '格物致诚（北京）信息技术', note: '参与企业级 Web 产品与前端工程化建设。' },
  { period: '2015 — 2016', role: '前端工程师', company: '蛙族（北京）网络科技', note: '开启前端开发旅程，参与 B2C 产品交付。' },
]

const projects = [
  { no: '01', title: '海狸洗衣', type: '微信小程序 · 独立开发', tags: ['Vue', '小程序', '支付'] },
  { no: '02', title: '海尔智家', type: '智能家居 App · 独立开发', tags: ['App', 'BLE', 'IoT'] },
  { no: '03', title: '毒物商店', type: 'B2C 电商后台 · 合作开发', tags: ['Vue', '后台', '工程化'] },
]

const skills = ['Vue 3', 'React', 'Three.js', 'TypeScript', 'Node.js', '微信小程序', 'AI Coding']

function goToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  let startIndex = 0
  while (startIndex < sectionCenters.length - 2 && scrollCenter > sectionCenters[startIndex + 1]) startIndex += 1
  const start = sectionCenters[startIndex]
  const end = sectionCenters[startIndex + 1]
  const rawProgress = THREE.MathUtils.clamp((scrollCenter - start) / Math.max(1, end - start), 0, 1)
  const progress = rawProgress * rawProgress * (3 - 2 * rawProgress)
  const nextPose = poses[startIndex + 1] ?? poses[startIndex]
  const pose = poses[startIndex]
  const mobile = window.innerWidth <= 720

  targetPose.x = THREE.MathUtils.lerp(pose.x, nextPose.x, progress) * (mobile ? 0.29 : 1)
  targetPose.y = THREE.MathUtils.lerp(pose.y, nextPose.y, progress)
  targetPose.scale = THREE.MathUtils.lerp(pose.scale, nextPose.scale, progress) * (mobile ? 0.86 : 1)
  targetPose.yaw = THREE.MathUtils.lerp(pose.yaw, nextPose.yaw, progress)
}

function onPointerMove(event) {
  pointerYaw = ((event.clientX / window.innerWidth) - 0.5) * 0.34
  pointerPitch = ((event.clientY / window.innerHeight) - 0.5) * 0.08
}

function onResize() {
  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(updateTargetPose)
}

function animateAvatar() {
  if (avatarRoot) {
    const easing = 0.035
    avatarRoot.position.x += (targetPose.x - avatarRoot.position.x) * easing
    avatarRoot.position.y += (targetPose.y - avatarRoot.position.y) * easing
    avatarRoot.rotation.y += (targetPose.yaw + pointerYaw - avatarRoot.rotation.y) * easing
    avatarRoot.rotation.x += (pointerPitch - avatarRoot.rotation.x) * easing
    const nextScale = avatarRoot.scale.x + (targetPose.scale - avatarRoot.scale.x) * easing
    avatarRoot.scale.setScalar(nextScale)
  }
  animationFrame = requestAnimationFrame(animateAvatar)
}

function loadAvatar() {
  const loader = new GLTFLoader()
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
          if (object.material) object.material.needsUpdate = true
        }
      })

      avatarRoot = new THREE.Group()
      avatarRoot.name = 'Li Meng character from supplied GLB'
      avatarRoot.add(model)
      avatarRoot.position.set(targetPose.x, targetPose.y, 0)
      avatarRoot.scale.setScalar(targetPose.scale)
      avatar.value = avatarRoot
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

onMounted(() => {
  loadAvatar()
  updateTargetPose()
  window.addEventListener('scroll', updateTargetPose, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  animationFrame = requestAnimationFrame(animateAvatar)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  cancelAnimationFrame(resizeFrame)
  window.removeEventListener('scroll', updateTargetPose)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('pointermove', onPointerMove)
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

const skills = ['Vue 3', 'React', 'Three.js', 'TypeScript', 'Node.js', '微信小程序', 'AI Coding']
const experiences = [
  { period: '2023 — 至今', role: '独立开发者', company: '自主项目', note: '探索 AI 辅助开发，持续把创意打磨成能落地的产品。' },
  { period: '2018 — 2023', role: '前端工程师', company: '北京海狸先生网络科技', note: '负责洗衣服务平台、小程序与移动端体验。' },
  { period: '2016 — 2018', role: '前端工程师', company: '格物致诚（北京）信息技术', note: '参与企业级 Web 产品和前端工程化建设。' },
  { period: '2015 — 2016', role: '前端工程师', company: '蛙族（北京）网络科技', note: '开启前端开发职业旅程，参与 B2C 产品交付。' },
]
const projects = [
  { no: '01', title: '海狸洗衣', type: '微信小程序 · 独立开发', color: 'mint', tags: ['Vue', '小程序', '支付'] },
  { no: '02', title: '海尔智家', type: '智能家居 App · 独立开发', color: 'blue', tags: ['App', 'BLE', 'IoT'] },
  { no: '03', title: '毒物商店', type: 'B2C 电商后台 · 合作开发', color: 'orange', tags: ['Vue', '后台', '工程化'] },
]
</script>

<template>
  <div class="portfolio">
    <div class="scene-bg" aria-hidden="true">
      <div class="scene-grain"></div>
      <TresCanvas
        class="avatar-canvas"
        :alpha="true"
        :clear-alpha="0"
        :clear-color="'#b9b9a0'"
        :antialias="true"
        :shadows="true"
        :dpr="[1, 1.5]"
      >
        <TresPerspectiveCamera :position="[0, 0.12, 9.1]" :fov="35" />
        <TresAmbientLight :intensity="2.1" />
        <TresDirectionalLight :position="[4, 7, 5]" :intensity="3.3" cast-shadow />
        <TresDirectionalLight :position="[-5, 3, -3]" :intensity="1.45" color="#f1d7b2" />
        <TresPointLight :position="[2, -0.2, 4]" :intensity="19" color="#f3c59f" :distance="9" />
        <TresMesh :position="[0, -2.7, -0.1]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
          <TresCircleGeometry :args="[2.2, 64]" />
          <TresMeshBasicMaterial color="#373b31" :transparent="true" :opacity="0.13" />
        </TresMesh>
        <primitive v-if="avatar" :object="avatar" />
      </TresCanvas>
      <div v-if="loading" class="loading-card" role="status" aria-live="polite">
        <span class="loading-mark">LM</span>
        <span>正在加载 3D 形象</span>
        <div class="loading-track"><i :style="{ width: `${loadProgress}%` }"></i></div>
        <small>{{ loadProgress ? `${loadProgress}%` : '首次加载需要一点时间' }}</small>
      </div>
      <div v-else-if="loadError" class="loading-card load-error" role="status">3D 形象暂时没有加载成功，请刷新页面再试。</div>
      <div class="scene-note"><span></span> MOVE YOUR CURSOR TO MEET ME</div>
    </div>

    <header class="topbar">
      <a class="wordmark" href="#about" aria-label="回到李萌主页" @click.prevent="goToSection('about')">
        <span class="wordmark-icon">LM</span>
        <span><strong>LI MENG</strong><small>AN INTERACTIVE RÉSUMÉ</small></span>
      </a>
      <nav class="topnav" aria-label="简历章节">
        <button
          v-for="(section, index) in sections"
          :key="section.id"
          type="button"
          class="nav-item"
          :class="{ selected: activeSection === section.id }"
          :aria-current="activeSection === section.id ? 'location' : undefined"
          @click="goToSection(section.id)"
        >
          <span class="nav-number">0{{ index + 1 }}</span>{{ section.label }}
        </button>
      </nav>
      <a class="top-contact" href="mailto:pijiaso@126.com">和我聊聊 <span>↗</span></a>
    </header>

    <main class="story">
      <section id="about" class="story-section hero-section">
        <div class="section-copy hero-copy">
          <p class="eyebrow"><i></i> FRONT-END DEVELOPER <span>·</span> BEIJING, CHINA</p>
          <h1>About <em>Li Meng</em><b>.</b></h1>
          <p class="hero-role">一个把想法做成体验的前端工程师。</p>
          <p class="hero-summary">你好，我是李萌。我喜欢把代码、设计和好奇心放在一起，让网页不只好看，也好用、好玩、值得记住。</p>
          <div class="hero-stats">
            <div><strong>10<span>+</span></strong><small>年开发经验</small></div>
            <i></i>
            <div><strong>20<span>+</span></strong><small>参与项目</small></div>
            <i></i>
            <div><strong>∞</strong><small>持续保持好奇</small></div>
          </div>
          <button class="scroll-link" type="button" @click="goToSection('profile')"><span>往下认识我</span><b>↓</b></button>
        </div>
        <div class="chapter-note"><span>01</span> THE STORY BEGINS HERE</div>
        <p class="hero-script">About Meng</p>
      </section>

      <section id="profile" class="story-section profile-section">
        <div class="section-copy dark-card">
          <p class="eyebrow light"><i></i> {{ sections[1].en }} <span>·</span> 02 / 05</p>
          <p class="section-label">把复杂的技术，做成自然的体验。</p>
          <h2>让每个想法<br />都能被认真实现<span>.</span></h2>
          <p class="section-body">从网页到移动端，从产品细节到 3D 交互，我喜欢让技术退到幕后，让好的体验留在眼前。专注前端工程，也持续探索 AI 和创意编程的新可能。</p>
          <div class="profile-tags"><span>WEB & MOBILE</span><span>CREATIVE CODE</span><span>AI BUILDER</span></div>
          <div class="card-signature"><span>MY WAY OF BUILDING</span><span>DESIGN × CODE × CURIOSITY</span></div>
        </div>
        <div class="chapter-note"><span>02</span> A LITTLE ABOUT HOW I WORK</div>
      </section>

      <section id="resume" class="story-section resume-section">
        <div class="section-copy resume-copy">
          <div class="section-heading-row">
            <div><p class="eyebrow"><i></i> {{ sections[2].en }} <span>·</span> 03 / 05</p><h2>Résumé<span>.</span></h2></div>
            <span class="resume-stamp">EXPERIENCE<br />& EDUCATION</span>
          </div>
          <div class="education-row"><span class="period">2011 — 2015</span><div><strong>北京化工大学</strong><small>软件工程 · 本科</small></div></div>
          <div class="experience-list">
            <article v-for="item in experiences" :key="item.period" class="experience-item">
              <span class="period">{{ item.period }}</span>
              <div><h3>{{ item.role }}</h3><p class="company">{{ item.company }}</p><p class="note">{{ item.note }}</p></div>
            </article>
          </div>
          <div class="chapter-inline"><span>03</span> EVERY EXPERIENCE LEAVES A TRACE</div>
        </div>
        <div class="chapter-note"><span>03</span> A TIMELINE, STILL IN MOTION</div>
      </section>

      <section id="projects" class="story-section projects-section">
        <div class="section-copy dark-card projects-copy">
          <p class="eyebrow light"><i></i> {{ sections[3].en }} <span>·</span> 04 / 05</p>
          <h2>认真做过的<br />一些作品<span>.</span></h2>
          <div class="project-list">
            <article v-for="project in projects" :key="project.no" class="project-item">
              <span class="project-number">{{ project.no }}</span>
              <div class="project-info"><h3>{{ project.title }}</h3><p>{{ project.type }}</p><div class="project-tags"><span v-for="tag in project.tags" :key="tag">{{ tag }}</span></div></div>
              <span class="project-arrow">↗</span>
            </article>
          </div>
          <div class="skills-strip"><span>TOOLS I USE</span><div><b v-for="skill in skills" :key="skill">{{ skill }}</b></div></div>
          <div class="card-signature"><span>SMALL DETAILS, REAL IMPACT</span><span>04 — SELECTED WORKS</span></div>
        </div>
        <div class="chapter-note"><span>04</span> BUILT TO BE USED, MADE TO BE FELT</div>
      </section>

      <section id="contact" class="story-section contact-section">
        <div class="section-copy contact-copy">
          <p class="eyebrow"><i></i> {{ sections[4].en }} <span>·</span> 05 / 05</p>
          <p class="contact-overline">GOOD THINGS START WITH A HELLO</p>
          <h2>下一段故事，<br /><em>一起写。</em></h2>
          <p class="section-body">如果你也在做有意思的事，欢迎来聊聊。</p>
          <a class="email-card" href="mailto:pijiaso@126.com"><span>EMAIL ME</span><strong>pijiaso@126.com</strong><b>↗</b></a>
          <a class="github-link" href="https://github.com/aylimeng" target="_blank" rel="noreferrer">GITHUB ↗ <span>BEIJING, CHINA</span></a>
        </div>
        <footer class="page-footer"><span>LI MENG <i>·</i> INTERACTIVE RÉSUMÉ</span><span>DESIGNED WITH CURIOSITY, BUILT WITH CODE</span><span>© 2025</span></footer>
        <div class="chapter-note"><span>05</span> THANK YOU FOR STAYING A LITTLE</div>
      </section>
    </main>
  </div>
</template>

<style scoped>
:global(html) { scroll-behavior: smooth; background: #e8e1d0; }
:global(body) { min-width: 320px; background: #e8e1d0; color: #24251f; font-family: "Segoe UI", "Microsoft YaHei", sans-serif; }
:global(body) { scrollbar-color: #81816e #d5d1c0; }

.portfolio { --paper: #e8e1d0; --ink: #24251f; --sage: #b9b9a0; --olive: #747964; --line: rgba(39,39,34,.18); position: relative; min-height: 100vh; overflow: clip; background: linear-gradient(133deg,#e8e1d0 0%,#c7c7b0 52%,#e7e0cf 100%); }
.scene-bg { position: fixed; z-index: 0; inset: 0; overflow: hidden; pointer-events: none; background: radial-gradient(ellipse at 72% 42%,rgba(243,229,195,.52),transparent 36%),linear-gradient(125deg,#e7dfcc 0%,#b7b9a0 55%,#ddd5c1 100%); }
.scene-bg::before { content: ""; position: absolute; inset: 0; opacity: .16; background-image: radial-gradient(rgba(53,55,42,.45) .45px,transparent .55px); background-size: 5px 5px; mask-image: linear-gradient(transparent,black 14%,black 86%,transparent); }
.scene-bg::after { content: ""; position: absolute; width: 48vw; height: 48vw; right: 5%; top: 48%; transform: translateY(-50%); border-radius: 50%; background: radial-gradient(circle,rgba(246,234,205,.36),rgba(246,234,205,.07) 42%,transparent 72%); }
.scene-grain { position: absolute; inset: 0; z-index: 2; pointer-events: none; background: linear-gradient(90deg,rgba(233,226,211,.42),transparent 30%,transparent 73%,rgba(233,226,211,.12)); }
.avatar-canvas { position: absolute; z-index: 1; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.loading-card { position: absolute; z-index: 3; right: 5vw; bottom: 9vh; width: 230px; display: grid; gap: 11px; padding: 16px; border: 1px solid rgba(47,48,42,.13); background: rgba(239,233,218,.78); color: #44463d; font-size: 10px; box-shadow: 0 10px 38px rgba(40,39,32,.08); backdrop-filter: blur(8px); }.loading-mark { display: grid; place-items: center; width: 28px; height: 28px; border: 1px solid #777b66; border-radius: 50%; font: 9px Georgia,serif; }.loading-track { height: 2px; overflow: hidden; background: rgba(45,47,39,.15); }.loading-track i { display: block; height: 100%; background: #777b66; transition: width .2s; }.loading-card small { color: #858476; font-size: 8px; }.load-error { width: auto; max-width: 290px; line-height: 1.7; }
.scene-note { position: absolute; z-index: 3; right: 27px; top: 50%; display: flex; align-items: center; gap: 9px; transform: translateY(-50%); writing-mode: vertical-rl; color: rgba(45,47,39,.6); font-size: 7px; letter-spacing: .18em; }.scene-note span { width: 4px; height: 4px; background: #68705c; border-radius: 50%; }

.topbar { position: fixed; z-index: 10; top: 0; left: 0; right: 0; height: 76px; padding: 0 clamp(18px,4.6vw,72px); display: grid; grid-template-columns: minmax(190px,1fr) auto minmax(130px,1fr); align-items: center; border-bottom: 1px solid rgba(45,46,39,.16); background: rgba(232,225,208,.8); backdrop-filter: blur(16px); }
.wordmark { display: flex; align-items: center; gap: 10px; color: var(--ink); text-decoration: none; }.wordmark-icon { width: 35px; height: 35px; display: grid; place-items: center; border: 1px solid #32332d; border-radius: 50%; font: 10px Georgia,serif; letter-spacing: -.08em; }.wordmark strong,.wordmark small { display: block; }.wordmark strong { font-size: 10px; letter-spacing: .17em; }.wordmark small { margin-top: 4px; color: #8d887b; font-size: 7px; letter-spacing: .15em; }
.topnav { height: 100%; display: flex; align-items: stretch; justify-content: center; gap: clamp(6px,1.65vw,25px); }.nav-item { position: relative; display: flex; align-items: center; gap: 7px; padding: 0 5px; border: 0; background: transparent; color: #7d786d; cursor: pointer; font: inherit; font-size: 11px; white-space: nowrap; transition: color .2s; }.nav-item::after { content: ""; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #6d705b; transform: scaleX(0); transition: transform .24s; }.nav-item:hover,.nav-item.selected { color: var(--ink); }.nav-item.selected::after { transform: scaleX(1); }.nav-number { color: #aaa494; font: 8px Georgia,serif; }
.top-contact { justify-self: end; color: var(--ink); text-decoration: none; font-size: 10px; }.top-contact span { display: inline-grid; place-items: center; width: 26px; height: 26px; margin-left: 8px; border: 1px solid var(--line); border-radius: 50%; font-size: 13px; }

.story { position: relative; z-index: 2; }.story-section { position: relative; min-height: 100svh; display: flex; align-items: center; padding: 112px clamp(22px,8.3vw,128px) 70px; scroll-margin-top: 0; isolation: isolate; }.story-section::before { content: ""; position: absolute; z-index: -1; inset: 0; pointer-events: none; background: linear-gradient(90deg,rgba(237,231,218,.9) 0%,rgba(237,231,218,.76) 33%,rgba(237,231,218,.12) 59%,transparent 82%); }.story-section:nth-child(even)::before { background: linear-gradient(270deg,rgba(34,36,32,.28) 0%,rgba(34,36,32,.12) 37%,transparent 68%); }.story-section:nth-child(even) { justify-content: flex-end; }
.section-copy { position: relative; z-index: 2; width: min(510px,47vw); }.hero-copy { width: min(560px,49vw); padding: 20px 0 30px; }.eyebrow { display: flex; align-items: center; gap: 9px; margin: 0 0 25px; color: #76786a; font-size: 8px; letter-spacing: .16em; }.eyebrow i { width: 17px; height: 1px; background: #777b66; }.eyebrow span { color: #aaa694; }.eyebrow.light { color: #a5a594; }.eyebrow.light i { background: #b6b494; }
.hero-copy h1 { margin: 0; color: #272821; font: 400 clamp(58px,7vw,102px)/.98 Georgia,"Times New Roman",serif; letter-spacing: -.075em; }.hero-copy h1 em { color: #6d715b; font-weight: 400; }.hero-copy h1 b { color: #a5a68b; font-weight: 400; }.hero-role { margin: 24px 0 0; color: #3e4037; font-size: clamp(14px,1.4vw,19px); letter-spacing: .025em; }.hero-summary { max-width: 390px; margin: 12px 0 0; color: #6b6a60; font-size: 11px; line-height: 2; letter-spacing: .03em; }
.hero-stats { display: flex; align-items: center; gap: 24px; margin-top: 37px; }.hero-stats div { display: grid; gap: 7px; }.hero-stats strong { color: #383a31; font: 29px/.9 Georgia,serif; }.hero-stats strong span { color: #85876f; font-size: 17px; }.hero-stats small { color: #858274; font-size: 8px; }.hero-stats i { width: 1px; height: 33px; background: rgba(49,50,43,.2); }.scroll-link { display: flex; align-items: center; gap: 15px; margin-top: 42px; padding: 0; border: 0; background: transparent; color: #4c4e41; font: inherit; font-size: 9px; cursor: pointer; }.scroll-link b { display: grid; place-items: center; width: 31px; height: 31px; border: 1px solid rgba(50,50,42,.25); border-radius: 50%; font-size: 14px; font-weight: 400; transition: transform .2s; }.scroll-link:hover b { transform: translateY(4px); }.chapter-note { position: absolute; left: clamp(22px,8.3vw,128px); bottom: 34px; display: flex; align-items: center; gap: 10px; color: #7b796d; font-size: 7px; letter-spacing: .13em; }.chapter-note span,.chapter-inline span { color: #747861; font: 11px Georgia,serif; }.hero-script { position: absolute; right: 11vw; bottom: 12%; margin: 0; color: rgba(247,241,223,.9); font: italic 40px "Segoe Script","Brush Script MT",cursive; text-shadow: 0 2px 18px rgba(51,50,40,.12); }
.profile-section::before { background: linear-gradient(270deg,rgba(34,36,32,.31) 0%,rgba(34,36,32,.17) 40%,transparent 72%) !important; }.dark-card { width: min(510px,47vw); padding: clamp(29px,4vw,56px); color: #efecdf; background: rgba(31,33,30,.93); border: 1px solid rgba(237,232,216,.12); box-shadow: 0 25px 70px rgba(34,35,29,.13); }.profile-section .dark-card { margin-left: auto; }.section-label { margin: 0 0 14px; color: #b8b69e; font-size: 10px; letter-spacing: .04em; }.dark-card h2 { margin: 0; color: #f1ede2; font-size: clamp(32px,4vw,54px); line-height: 1.3; font-weight: 400; letter-spacing: -.065em; }.dark-card h2 span { color: #c7c5a0; }.section-body { max-width: 410px; margin: 19px 0 0; color: #9d9d91; font-size: 10px; line-height: 2; letter-spacing: .02em; }.profile-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 27px; }.profile-tags span { padding: 7px 9px; border: 1px solid rgba(237,232,216,.17); color: #c6c3af; font-size: 7px; letter-spacing: .11em; }.card-signature { display: flex; justify-content: space-between; gap: 10px; margin-top: 34px; padding-top: 13px; border-top: 1px solid rgba(237,232,216,.13); color: #77796d; font-size: 7px; letter-spacing: .12em; }
.resume-section { justify-content: flex-end; }.resume-section::before { background: linear-gradient(270deg,rgba(237,231,218,.72) 0%,rgba(237,231,218,.84) 40%,rgba(237,231,218,.24) 71%,transparent 90%) !important; }.resume-copy { margin-left: auto; padding: clamp(24px,3vw,42px); background: rgba(239,233,219,.84); border: 1px solid rgba(47,47,39,.13); box-shadow: 0 22px 65px rgba(47,44,35,.08); backdrop-filter: blur(14px); }.section-heading-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; }.section-heading-row .eyebrow { margin-bottom: 13px; }.section-heading-row h2 { margin: 0; color: #282922; font: 400 clamp(43px,5vw,68px)/.95 Georgia,serif; letter-spacing: -.055em; }.section-heading-row h2 span { color: #8c8e73; }.resume-stamp { padding: 9px; border: 1px solid rgba(65,67,55,.32); color: #787965; font: 7px/1.5 Georgia,serif; letter-spacing: .1em; text-align: center; transform: rotate(4deg); }.education-row { display: grid; grid-template-columns: 93px 1fr; gap: 13px; margin-top: 27px; padding: 13px 0; border-top: 1px solid rgba(46,47,39,.15); border-bottom: 1px solid rgba(46,47,39,.15); }.period { color: #7e8068; font-size: 8px; white-space: nowrap; }.education-row strong,.education-row small { display: block; }.education-row strong { color: #37382f; font-size: 10px; font-weight: 600; }.education-row small { margin-top: 4px; color: #858274; font-size: 8px; }.experience-list { display: grid; gap: 14px; margin-top: 18px; max-height: 45vh; overflow: auto; scrollbar-width: thin; scrollbar-color: #9b9b83 transparent; }.experience-item { display: grid; grid-template-columns: 93px 1fr; gap: 13px; padding-bottom: 12px; border-bottom: 1px solid rgba(46,47,39,.12); }.experience-item h3 { margin: 0; color: #35362e; font-size: 10px; font-weight: 600; }.company { margin: 4px 0 0; color: #5d5e52; font-size: 8px; }.note { margin: 5px 0 0; color: #858375; font-size: 8px; line-height: 1.65; }.chapter-inline { display: flex; align-items: center; gap: 9px; margin-top: 17px; color: #898778; font-size: 7px; letter-spacing: .12em; }
.projects-section::before { background: linear-gradient(270deg,rgba(34,36,32,.28) 0%,rgba(34,36,32,.12) 42%,transparent 73%) !important; }.projects-copy { margin-left: auto; }.projects-copy h2 { margin: 0; font-size: clamp(34px,4vw,50px); line-height: 1.25; }.project-list { display: grid; gap: 9px; margin-top: 23px; }.project-item { display: grid; grid-template-columns: 29px 1fr 20px; gap: 10px; align-items: start; padding: 12px; border: 1px solid rgba(237,232,216,.13); background: rgba(255,255,255,.025); transition: transform .2s,background .2s,border-color .2s; }.project-item:hover { transform: translateX(3px); border-color: rgba(200,199,162,.43); background: rgba(255,255,255,.06); }.project-number { color: #a5a28f; font: 10px Georgia,serif; }.project-info h3 { margin: 0; color: #eeeae0; font-size: 10px; font-weight: 500; }.project-info p { margin: 4px 0 0; color: #98978b; font-size: 8px; }.project-tags { display: flex; gap: 5px; margin-top: 8px; }.project-tags span { padding: 4px 6px; background: rgba(199,197,157,.1); color: #c5c3a3; font-size: 7px; }.project-arrow { color: #c9c7a2; font-size: 13px; }.skills-strip { display: flex; align-items: start; gap: 11px; margin-top: 16px; }.skills-strip > span { flex: 0 0 auto; padding-top: 4px; color: #77786e; font-size: 7px; letter-spacing: .11em; }.skills-strip div { display: flex; flex-wrap: wrap; gap: 5px; }.skills-strip b { padding: 4px 6px; border: 1px solid rgba(237,232,216,.12); color: #aaa99c; font-size: 7px; font-weight: 400; }
.contact-section::before { background: linear-gradient(90deg,rgba(237,231,218,.89) 0%,rgba(237,231,218,.78) 38%,rgba(237,231,218,.19) 67%,transparent 88%) !important; }.contact-copy h2 { margin: 0; color: #292a23; font-size: clamp(51px,6vw,80px); line-height: 1.23; font-weight: 400; letter-spacing: -.07em; }.contact-overline { margin: 25px 0 13px; color: #8b8c76; font-size: 8px; letter-spacing: .17em; }.contact-copy .section-body { color: #6f6d62; }.contact-copy h2 em { color: #737760; font: italic 1em Georgia,serif; }.email-card { position: relative; display: grid; gap: 8px; width: min(410px,100%); margin-top: 29px; padding: 16px 19px; border: 1px solid rgba(47,47,39,.2); color: #2c2d26; text-decoration: none; background: rgba(239,233,219,.42); transition: background .2s; }.email-card:hover { background: rgba(239,233,219,.8); }.email-card span { color: #868474; font-size: 7px; letter-spacing: .14em; }.email-card strong { font: 16px Georgia,serif; font-weight: 400; }.email-card b { position: absolute; right: 17px; top: 50%; color: #72745f; font-size: 16px; transform: translateY(-50%); }.github-link { display: flex; justify-content: space-between; width: min(410px,100%); margin-top: 17px; color: #5c5e50; text-decoration: none; font-size: 7px; letter-spacing: .12em; }.github-link span { color: #858375; }.page-footer { position: absolute; left: clamp(22px,8.3vw,128px); right: clamp(22px,8.3vw,128px); bottom: 20px; display: flex; justify-content: space-between; gap: 10px; color: #858274; font-size: 7px; letter-spacing: .11em; }.page-footer i { margin: 0 4px; color: #aaa694; font-style: normal; }

@media (min-width: 1500px) { .hero-copy { padding-left: 2.7vw; }.story-section { padding-right: 10vw; padding-left: 10vw; } }
@media (max-width: 1050px) { .topbar { padding: 0 24px; grid-template-columns: 160px 1fr 100px; }.topnav { gap: 10px; }.nav-item { gap: 5px; font-size: 10px; }.nav-number { display: none; }.story-section { padding-left: 6vw; padding-right: 6vw; }.section-copy,.dark-card { width: min(490px,51vw); }.hero-copy { width: min(540px,54vw); }.chapter-note { left: 6vw; }.page-footer { left: 6vw; right: 6vw; } }
@media (max-width: 720px) {
  .topbar { height: auto; min-height: 67px; padding: 0 14px; grid-template-columns: 1fr auto; grid-template-rows: 62px 42px; }.wordmark-icon { width: 31px; height: 31px; }.topnav { grid-column: 1 / -1; grid-row: 2; justify-content: space-between; gap: 3px; overflow-x: auto; scrollbar-width: none; }.topnav::-webkit-scrollbar { display: none; }.nav-item { gap: 4px; padding: 0 5px; font-size: 8px; }.nav-number { display: inline; font-size: 6px; }.top-contact { font-size: 9px; }.top-contact span { width: 23px; height: 23px; }.scene-bg::after { width: 85vw; height: 85vw; right: -23vw; top: 45%; }.scene-note { display: none; }.loading-card { width: 180px; right: 13px; bottom: 15px; gap: 8px; padding: 11px; font-size: 8px; }
  .story-section { min-height: 100svh; padding: 132px 17px 69px; align-items: center; }.story-section::before { background: linear-gradient(90deg,rgba(237,231,218,.83),rgba(237,231,218,.62) 65%,rgba(237,231,218,.17)) !important; }.story-section:nth-child(even) { justify-content: flex-start; }.section-copy,.hero-copy,.dark-card { width: min(100%,480px); }.hero-copy { padding: 15px 8px; }.hero-copy h1 { font-size: clamp(49px,13vw,75px); }.hero-copy .eyebrow { flex-wrap: wrap; font-size: 7px; gap: 7px; }.hero-role { max-width: 295px; font-size: 14px; }.hero-summary { max-width: 300px; font-size: 10px; }.hero-stats { gap: 16px; margin-top: 28px; }.hero-stats strong { font-size: 25px; }.hero-stats small { font-size: 7px; }.scroll-link { margin-top: 30px; }.hero-script { right: 12vw; bottom: 15%; font-size: 30px; }.chapter-note { left: 18px; bottom: 22px; font-size: 6px; }.profile-section .dark-card,.projects-copy { margin-left: 0; }.dark-card { padding: 26px 22px; }.dark-card h2 { font-size: 34px; }.section-body { font-size: 9px; }.profile-tags { gap: 5px; }.profile-tags span { font-size: 6px; padding: 6px 7px; }.card-signature { margin-top: 25px; font-size: 6px; }.resume-copy { padding: 22px 17px; }.section-heading-row h2 { font-size: 51px; }.resume-stamp { font-size: 6px; }.education-row,.experience-item { grid-template-columns: 73px 1fr; gap: 8px; }.experience-list { max-height: 40vh; gap: 10px; }.note { font-size: 7px; }.period { font-size: 7px; }.chapter-inline { font-size: 6px; }.projects-copy h2 { font-size: 37px; }.project-list { margin-top: 17px; }.project-item { padding: 10px; }.contact-section { align-items: center; }.contact-copy h2 { font-size: 55px; }.contact-overline { font-size: 7px; }.email-card strong { font-size: 14px; }.page-footer { left: 18px; right: 18px; bottom: 18px; font-size: 6px; }.page-footer span:nth-child(2) { display: none; }
}
@media (max-width: 380px) { .nav-item { gap: 3px; padding: 0 3px; font-size: 7px; }.nav-number { font-size: 5px; }.wordmark small { font-size: 6px; }.hero-stats { gap: 11px; }.hero-stats strong { font-size: 22px; }.hero-stats small { font-size: 6px; }.hero-copy h1 { font-size: 46px; }.section-heading-row h2 { font-size: 44px; }.dark-card { padding: 21px 18px; } }
@media (prefers-reduced-motion: reduce) { :global(html) { scroll-behavior: auto; } *,*::before,*::after { transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; } }
</style>

