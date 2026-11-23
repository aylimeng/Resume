<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { createAvatar } from './createAvatar'

const sections = [
  { id: 'intro', label: '关于我', en: 'ABOUT' },
  { id: 'experience', label: '经历', en: 'EXPERIENCE' },
  { id: 'projects', label: '项目', en: 'PROJECTS' },
  { id: 'skills', label: '技能', en: 'SKILLS' },
]

const activeSection = ref('intro')
const active = computed(() => sections.find((item) => item.id === activeSection.value))
const avatar = createAvatar()
let animationFrame = 0
let pointerX = 0
let pointerY = 0

function selectSection(id) {
  activeSection.value = id
  const index = sections.findIndex((item) => item.id === id)
  avatar.userData.targetY = [-0.1, -0.52, 0.42, 0][index] ?? 0
}

function onPointerMove(event) {
  const bounds = event.currentTarget.getBoundingClientRect()
  pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.24
  pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.12
}

function onPointerLeave() {
  pointerX = 0
  pointerY = 0
}

function updateAvatarLayout() {
  avatar.position.y = window.innerWidth <= 700 ? -0.34 : 0
}

function animateAvatar() {
  const targetY = avatar.userData.targetY ?? 0
  avatar.rotation.y += (targetY + pointerX - avatar.rotation.y) * 0.025
  avatar.rotation.x += (-pointerY - avatar.rotation.x) * 0.025
  if (activeSection.value === 'intro') avatar.rotation.y += 0.0014
  animationFrame = requestAnimationFrame(animateAvatar)
}

onMounted(() => {
  avatar.userData.targetY = -0.1
  updateAvatarLayout()
  window.addEventListener('resize', updateAvatarLayout)
  animationFrame = requestAnimationFrame(animateAvatar)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', updateAvatarLayout)
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
    <header class="topbar">
      <a class="brand" href="#top" aria-label="回到首页">
        <span class="brand-mark">LM</span>
        <span class="brand-copy"><strong>LI MENG</strong><small>CREATIVE DEVELOPER</small></span>
      </a>

      <nav class="topnav" aria-label="简历板块">
        <button
          v-for="section in sections"
          :key="section.id"
          type="button"
          class="topnav-link"
          :class="{ selected: activeSection === section.id }"
          @click="selectSection(section.id)"
        >
          {{ section.label }}
        </button>
      </nav>

      <a class="contact-link" href="mailto:pijiaso@126.com">
        <span>联系我</span><span class="contact-arrow">↗</span>
      </a>
    </header>

    <main id="top" class="main-layout">
      <section class="intro-panel" aria-live="polite">
        <div class="eyebrow"><span class="live-dot"></span> AVAILABLE FOR THE NEXT BIG IDEA</div>

        <template v-if="activeSection === 'intro'">
          <div class="intro-copy">
            <p class="hello">你好，我是</p>
            <h1>李萌<span class="name-dot">.</span></h1>
            <p class="role">Web 前端工程师 <span>＋</span> 独立开发者</p>
            <p class="summary">
              用代码搭建体验，用好奇心发现可能。<br />
              专注 Web、移动端与 AI 辅助开发，<br class="desktop-break" />
              让每个想法都能被认真实现。
            </p>
          </div>

          <div class="quick-stats">
            <div><strong>10<span>+</span></strong><small>年开发经验</small></div>
            <i></i>
            <div><strong>20<span>+</span></strong><small>参与项目</small></div>
            <i></i>
            <div><strong>∞</strong><small>持续好奇</small></div>
          </div>

          <div class="focus-block">
            <span class="small-label">CURRENTLY INTO</span>
            <p>AI × Creative Coding <span class="sparkle">✳</span></p>
          </div>
        </template>

        <template v-else-if="activeSection === 'experience'">
          <p class="section-kicker">{{ active.en }} / 01</p>
          <h2 class="section-heading">一步一步，<br />把经验变成能力<span class="name-dot">.</span></h2>
          <div class="experience-list">
            <article v-for="item in experiences" :key="item.period" class="experience-item">
              <span class="experience-period">{{ item.period }}</span>
              <div><h3>{{ item.role }}</h3><p class="experience-company">{{ item.company }}</p><p class="experience-note">{{ item.note }}</p></div>
            </article>
          </div>
        </template>

        <template v-else-if="activeSection === 'projects'">
          <p class="section-kicker">{{ active.en }} / 02</p>
          <h2 class="section-heading">一些认真做过的<br />小事与大事<span class="name-dot">.</span></h2>
          <div class="project-list">
            <article v-for="project in projects" :key="project.no" class="project-card" :class="project.color">
              <span class="project-no">{{ project.no }}</span>
              <div class="project-main"><h3>{{ project.title }}</h3><p>{{ project.type }}</p><div class="project-tags"><span v-for="tag in project.tags" :key="tag">{{ tag }}</span></div></div>
              <span class="project-arrow">↗</span>
            </article>
          </div>
        </template>

        <template v-else>
          <p class="section-kicker">{{ active.en }} / 03</p>
          <h2 class="section-heading">工具会变化，<br />解决问题的心不变<span class="name-dot">.</span></h2>
          <p class="section-lede">从需求拆解到页面交付，选择合适的工具，把产品体验和工程质量一起做好。</p>
          <div class="skill-cloud"><span v-for="(skill, index) in skills" :key="skill" :class="`skill-${index % 4}`">{{ skill }}</span></div>
          <div class="skill-note"><span>✳</span> 最近：用 AI 加速原型验证与创意实现</div>
        </template>

        <div class="panel-bottom">
          <a href="mailto:pijiaso@126.com" class="email-link">pijiaso@126.com <span>↗</span></a>
          <span class="location">BEIJING · CHINA</span>
        </div>
      </section>

      <section class="scene-panel" aria-label="3D 个人形象，可用鼠标拖动旋转">
        <div class="scene-glow"></div>
        <div class="scene-orbit orbit-one"></div>
        <div class="scene-orbit orbit-two"></div>
        <div class="scene-label scene-label-top"><span class="status-bars"><i></i><i></i><i></i></span> INTERACTIVE CHARACTER <span class="label-live">LIVE</span></div>

        <div class="float-chip chip-vue"><span class="chip-icon">V</span> Vue 3 <span class="chip-check">✓</span></div>
        <div class="float-chip chip-webgl"><span class="chip-icon">◈</span> Three.js</div>
        <div class="float-chip chip-ai"><span class="chip-icon">✳</span> AI builder</div>

        <TresCanvas
          class="avatar-canvas"
          :alpha="true"
          :clear-alpha="0"
          :clear-color="'#000000'"
          :antialias="true"
          :shadows="true"
          :dpr="[1, 1.6]"
          @pointermove="onPointerMove"
          @pointerleave="onPointerLeave"
        >
          <TresPerspectiveCamera :position="[0, 0.18, 10.6]" :fov="37" />
          <TresAmbientLight :intensity="1.6" />
          <TresDirectionalLight :position="[3.5, 7, 5]" :intensity="3.2" cast-shadow />
          <TresDirectionalLight :position="[-5, 3, -3]" :intensity="2.2" color="#a6c8ff" />
          <TresPointLight :position="[2, -1, 4]" :intensity="32" color="#ffca9b" :distance="9" />
          <TresMesh :position="[0, -2.82, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
            <TresCircleGeometry :args="[2.5, 64]" />
            <TresMeshBasicMaterial color="#7b9887" :transparent="true" :opacity="0.14" />
          </TresMesh>
          <TresGridHelper :position="[0, -2.8, 0]" :args="[18, 36, '#4c716e', '#314c4b']" />
          <TresMesh :position="[0, 0.12, -0.48]" :rotation="[0.95, 0.15, 0.1]">
            <TresTorusGeometry :args="[2.35, 0.009, 8, 180]" />
            <TresMeshBasicMaterial color="#9bc9bd" :transparent="true" :opacity="0.46" />
          </TresMesh>
          <primitive :object="avatar" />
          <OrbitControls :enable-damping="true" :damping-factor="0.08" :enable-pan="false" :min-distance="9.3" :max-distance="12" :target="[0, 0.15, 0]" />
        </TresCanvas>

        <div class="character-caption"><span class="caption-line"></span><span>ME, IN 3D</span><small>made with curiosity &amp; code</small></div>
        <div class="scene-footer"><span><kbd>DRAG</kbd> 旋转视角</span><span class="scene-footer-center">DESIGNED TO BE DIFFERENT</span><span>SCROLL TO EXPLORE <b>↓</b></span></div>
        <div class="side-note"><span>35°</span><i></i><small>MODEL VIEW</small></div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.portfolio {
  --ink: #f0f0e9;
  --muted: #a3aaa8;
  --lime: #c8f169;
  min-height: 100svh;
  height: 100svh;
  color: var(--ink);
  overflow: hidden;
  background: #111715;
  font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
  letter-spacing: 0;
}

.topbar {
  height: 84px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 5.2vw;
  border-bottom: 1px solid rgba(223, 236, 226, 0.09);
  position: relative;
  z-index: 5;
}

.brand { display: inline-flex; gap: 11px; align-items: center; width: fit-content; color: inherit; text-decoration: none; }
.brand-mark { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px; background: var(--lime); color: #172018; font-size: 13px; font-weight: 850; letter-spacing: -0.08em; }
.brand-copy { display: grid; gap: 3px; }
.brand-copy strong { font-size: 12px; letter-spacing: 0.14em; }
.brand-copy small { font-size: 8px; color: #78827e; letter-spacing: 0.18em; }
.topnav { display: flex; align-items: center; gap: 9px; padding: 5px; border: 1px solid rgba(225, 236, 226, .08); border-radius: 999px; background: rgba(255,255,255,.025); }
.topnav-link { border: 0; background: transparent; border-radius: 999px; padding: 10px 17px; color: #9ba49e; font: inherit; font-size: 12px; cursor: pointer; transition: color .2s, background .2s; }
.topnav-link:hover { color: #fff; }
.topnav-link.selected { color: #172018; background: var(--lime); font-weight: 700; }
.contact-link { justify-self: end; display: inline-flex; align-items: center; gap: 14px; color: var(--ink); text-decoration: none; font-size: 12px; }
.contact-arrow { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(238,245,238,.22); font-size: 16px; transition: background .2s, color .2s; }
.contact-link:hover .contact-arrow { color: #131a15; background: var(--lime); border-color: var(--lime); }

.main-layout { height: calc(100svh - 84px); display: grid; grid-template-columns: minmax(375px, 0.82fr) minmax(0, 1.38fr); }
.intro-panel { position: relative; display: flex; flex-direction: column; justify-content: center; padding: 6.2vh 5vw 7.5vh 9.1vw; background: radial-gradient(ellipse at 11% 4%, rgba(61,88,64,.23), transparent 45%), #111715; }
.eyebrow,.section-kicker,.small-label { font-size: 9px; color: #9ca9a0; letter-spacing: .17em; font-weight: 650; }
.eyebrow { display: flex; align-items: center; gap: 9px; margin-bottom: 35px; white-space: nowrap; }
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--lime); box-shadow: 0 0 14px #c8f169a0; }
.hello { margin-bottom: 3px; color: #d0d6cc; font-size: 19px; }
.intro-copy h1 { font-size: clamp(72px, 8vw, 112px); line-height: .98; letter-spacing: -.085em; font-weight: 750; }
.name-dot { color: var(--lime); }
.role { margin-top: 22px; color: #d4d9d0; font-size: clamp(15px, 1.4vw, 18px); }
.role span { color: var(--lime); padding: 0 3px; }
.summary { margin-top: 25px; color: #9ca59e; font-size: 13px; line-height: 1.95; letter-spacing: .015em; }
.quick-stats { display: flex; align-items: center; gap: clamp(15px, 2vw, 30px); margin-top: 47px; }
.quick-stats div { display: grid; gap: 3px; }
.quick-stats strong { color: #f0f0e9; font-size: 27px; letter-spacing: -.055em; }
.quick-stats strong span { color: var(--lime); font-size: 18px; }
.quick-stats small { color: #86918b; font-size: 10px; white-space: nowrap; }
.quick-stats i { width: 1px; height: 33px; background: rgba(224,235,226,.15); }
.focus-block { margin-top: 39px; padding-top: 19px; border-top: 1px solid rgba(224,235,226,.12); }
.focus-block p { margin-top: 9px; color: #dce1d9; font-size: 14px; }
.sparkle { color: var(--lime); margin-left: 5px; }
.panel-bottom { position: absolute; bottom: 28px; left: 9.1vw; right: 5vw; display: flex; justify-content: space-between; align-items: center; }
.email-link { color: #c7d1c8; text-decoration: none; font-size: 11px; }
.email-link span { color: var(--lime); margin-left: 5px; }
.location { color: #6e7973; font-size: 8px; letter-spacing: .16em; }

.scene-panel { position: relative; overflow: hidden; background: radial-gradient(ellipse at 54% 42%, #293934 0%, #1b2926 26%, #131d1a 58%, #121917 100%); }
.scene-panel::before { content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 1; opacity: .17; background-image: radial-gradient(rgba(205,225,207,.45) .55px, transparent .55px); background-size: 9px 9px; mask-image: linear-gradient(transparent 2%, black 23%, black 76%, transparent); }
.scene-glow { position: absolute; width: 46vw; height: 46vw; left: 50%; top: 49%; transform: translate(-50%,-50%); border-radius: 50%; background: radial-gradient(circle, rgba(201,242,167,.17), rgba(129,177,150,.06) 37%, transparent 70%); filter: blur(8px); }
.scene-orbit { position: absolute; left: 52%; top: 50%; width: min(39vw, 610px); aspect-ratio: 1; border: 1px solid rgba(190,222,195,.12); border-radius: 50%; transform: translate(-50%,-50%) rotate(-23deg) scaleY(.46); pointer-events: none; }
.orbit-two { width: min(31vw, 490px); transform: translate(-50%,-50%) rotate(54deg) scaleY(.45); border-color: rgba(194,235,157,.12); }
.scene-label { position: absolute; z-index: 3; top: 30px; right: 37px; display: flex; align-items: center; gap: 9px; color: #9ca9a0; font-size: 8px; letter-spacing: .16em; }
.label-live { color: var(--lime); font-size: 8px; border: 1px solid rgba(200,241,105,.35); border-radius: 99px; padding: 4px 7px; }
.status-bars { display: flex; gap: 2px; align-items: end; height: 10px; }
.status-bars i { display: block; width: 2px; height: 5px; background: var(--lime); opacity: .75; }
.status-bars i:nth-child(2) { height: 8px; }.status-bars i:nth-child(3) { height: 6px; }
.avatar-canvas { position: absolute; z-index: 2; inset: 0; width: 100%; height: 100%; }
.float-chip { position: absolute; z-index: 3; display: flex; align-items: center; gap: 8px; padding: 10px 13px; border: 1px solid rgba(228,239,228,.12); border-radius: 10px; background: rgba(30,43,38,.78); color: #dce4dc; font-size: 10px; backdrop-filter: blur(14px); box-shadow: 0 12px 30px rgba(0,0,0,.12); animation: float 5s ease-in-out infinite; }
.chip-vue { left: 11%; top: 24%; }.chip-webgl { right: 11%; top: 37%; animation-delay: -1.6s; }.chip-ai { right: 17%; bottom: 24%; animation-delay: -3s; }
.chip-icon { color: var(--lime); font-size: 13px; font-weight: 800; }.chip-check { color: var(--lime); opacity: .75; }
.character-caption { position: absolute; z-index: 3; left: 7%; bottom: 15%; display: grid; grid-template-columns: 22px auto; column-gap: 10px; align-items: center; }
.caption-line { width: 22px; height: 1px; background: var(--lime); grid-row: span 2; }
.character-caption span:nth-child(2) { color: #e4e9e2; font-size: 9px; letter-spacing: .19em; }
.character-caption small { margin-top: 4px; color: #89968e; font-size: 9px; }
.scene-footer { position: absolute; z-index: 3; left: 6.3%; right: 6.3%; bottom: 27px; display: flex; justify-content: space-between; color: #7f8d84; font-size: 8px; letter-spacing: .11em; }
.scene-footer kbd { padding: 5px 7px; margin-right: 5px; border: 1px solid rgba(218,233,219,.14); border-radius: 4px; color: #c1ccc2; font: inherit; font-size: 7px; }
.scene-footer-center { color: #5e6e64; }.scene-footer b { margin-left: 5px; color: var(--lime); font-size: 12px; }
.side-note { position: absolute; z-index: 3; right: 23px; top: 50%; display: grid; justify-items: center; gap: 8px; transform: translateY(-50%); color: #77867c; }
.side-note span { color: var(--lime); font-size: 10px; }.side-note i { height: 46px; width: 1px; background: linear-gradient(var(--lime), transparent); }.side-note small { writing-mode: vertical-rl; font-size: 7px; letter-spacing: .14em; }

.section-kicker { color: var(--lime); margin-bottom: 22px; }
.section-heading { color: #f0f0e9; font-size: clamp(32px, 4.3vw, 54px); line-height: 1.22; letter-spacing: -.065em; font-weight: 670; }
.experience-list { margin-top: 32px; display: grid; gap: 20px; max-height: 48vh; overflow-y: auto; padding-right: 7px; scrollbar-width: thin; scrollbar-color: #465649 transparent; }
.experience-item { display: grid; grid-template-columns: 82px 1fr; gap: 12px; padding-bottom: 17px; border-bottom: 1px solid rgba(226,236,228,.1); }
.experience-period { padding-top: 3px; color: var(--lime); font-size: 9px; white-space: nowrap; }
.experience-item h3,.project-main h3 { color: #e9ede7; font-size: 14px; font-weight: 620; }
.experience-company { margin-top: 4px; color: #bec9c0; font-size: 11px; }
.experience-note { margin-top: 7px; color: #839087; font-size: 10px; line-height: 1.7; }
.project-list { display: grid; gap: 12px; margin-top: 34px; }
.project-card { display: grid; grid-template-columns: 36px 1fr 25px; gap: 14px; align-items: start; padding: 16px; border: 1px solid rgba(225,238,228,.11); border-radius: 13px; background: rgba(255,255,255,.025); transition: transform .25s, background .25s, border-color .25s; }
.project-card:hover { transform: translateX(4px); background: rgba(255,255,255,.055); border-color: rgba(200,241,105,.3); }
.project-no { color: #68776d; font-size: 10px; }.project-main p { margin-top: 5px; color: #929e95; font-size: 10px; }
.project-tags { display: flex; gap: 6px; margin-top: 10px; }.project-tags span { padding: 4px 7px; border-radius: 5px; background: rgba(200,241,105,.08); color: #b9d38b; font-size: 8px; }
.project-arrow { color: var(--lime); font-size: 14px; }
.section-lede { max-width: 340px; margin-top: 22px; color: #9ba69e; font-size: 12px; line-height: 1.9; }
.skill-cloud { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 32px; max-width: 380px; }.skill-cloud span { padding: 10px 13px; border: 1px solid rgba(219,237,220,.13); border-radius: 9px; color: #dce3db; background: rgba(255,255,255,.025); font-size: 10px; }.skill-cloud .skill-0 { border-color: rgba(200,241,105,.44); color: var(--lime); background: rgba(200,241,105,.06); }.skill-cloud .skill-1 { transform: translateY(4px); }.skill-cloud .skill-2 { color: #b6d8d0; }.skill-note { display: flex; align-items: center; gap: 9px; margin-top: 36px; padding-top: 20px; border-top: 1px solid rgba(224,235,226,.12); color: #97a29a; font-size: 10px; }.skill-note span { color: var(--lime); font-size: 16px; }

@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }

@media (max-width: 1100px) {
  .section-heading { font-size: clamp(30px, 3.6vw, 40px); }
}

@media (max-width: 980px) {
  .topbar { padding: 0 4vw; }.main-layout { grid-template-columns: minmax(330px, .9fr) minmax(0, 1fr); }.intro-panel { padding-left: 7vw; padding-right: 4vw; }.panel-bottom { left: 7vw; right: 4vw; }
  .intro-copy h1 { font-size: clamp(68px, 9vw, 92px); }.section-heading { font-size: clamp(30px, 3.6vw, 40px); }.scene-footer-center { display: none; }.float-chip { padding: 8px 10px; }
}

@media (max-width: 700px) {
  .portfolio { height: auto; min-height: 100svh; overflow: visible; }
  .topbar { height: 70px; grid-template-columns: 1fr auto; padding: 0 18px; }
  .brand-mark { width: 34px; height: 34px; }.brand-copy small { font-size: 7px; }
  .topnav { position: absolute; top: 70px; left: 14px; right: 14px; justify-content: space-between; gap: 0; padding: 4px; background: rgba(24,33,29,.95); z-index: 6; }
  .topnav-link { flex: 1; padding: 10px 4px; font-size: 10px; }
  .contact-link { font-size: 10px; gap: 8px; }.contact-arrow { width: 30px; height: 30px; }
  .main-layout { height: auto; min-height: calc(100svh - 70px); display: flex; flex-direction: column; }
  .scene-panel { height: min(72svh, 560px); min-height: 450px; order: 0; }
  .intro-panel { min-height: 520px; padding: 68px 24px 82px; order: 1; }
  .eyebrow { margin-bottom: 27px; font-size: 8px; }.intro-copy h1 { font-size: 82px; }.summary { font-size: 12px; }.quick-stats { margin-top: 34px; }.focus-block { margin-top: 29px; }
  .panel-bottom { left: 24px; right: 24px; bottom: 24px; }
  .scene-label { top: 104px; right: 20px; font-size: 7px; }.scene-footer { bottom: 18px; left: 20px; right: 20px; font-size: 7px; }.scene-footer > span:last-child { font-size: 6px; }
  .avatar-canvas { top: 50px; height: calc(100% - 50px); }.scene-label { display: none; }
  .scene-orbit { width: min(82vw, 430px); }.orbit-two { width: min(66vw, 350px); }.scene-glow { width: 90vw; height: 90vw; }
  .chip-vue { left: 5%; top: 27%; }.chip-webgl { right: 4%; top: 40%; }.chip-ai { right: 8%; bottom: 19%; }.float-chip { font-size: 9px; }
  .character-caption { left: 5%; bottom: 17%; }.side-note { right: 12px; top: 56%; }
  .section-heading { font-size: 38px; }.experience-list { max-height: none; gap: 16px; }.project-list { margin-top: 25px; }
  .desktop-break { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; }
}
</style>
