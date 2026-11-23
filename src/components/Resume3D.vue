<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'

// ============ 简历数据 ============
const sections = [
  {
    id: 'intro',
    label: '个人介绍',
    color: '#4a90e2',
    camera: [0, 0.6, 8],
    title: '李萌 · Web 前端工程师',
    lines: ['10 年以上前端开发经验', '小程序 / 单页应用 / 移动端 H5', 'AI 辅助开发实践者', '邮箱：pijiaso@126.com'],
  },
  {
    id: 'skill',
    label: '专业技能',
    color: '#2ecc71',
    camera: [5.5, 1.2, 5.5],
    title: '专业技能',
    lines: [
      'Vue 2 / Vue 3（Vue Router、Vuex）与 React',
      '微信小程序原生 API：登录 / 支付 / BLE / 广告',
      'Node.js + Express / Webpack 工程化',
      'AI 编程助手：Cursor / Copilot / Claude',
      'Git / SVN / Gerrit 代码评审',
    ],
  },
  {
    id: 'work',
    label: '工作经历',
    color: '#e67e22',
    camera: [-5.5, 1.2, 5.5],
    title: '工作经历',
    lines: [
      '独立开发（自主项目） 2023.06 — 至今',
      '北京海狸先生网络科技 2018.12 — 2023.06',
      '格物致诚（北京）信息技术 2016.12 — 2018.12',
      '蛙族（北京）网络科技 2015.12 — 2016.12',
    ],
  },
  {
    id: 'project',
    label: '项目经验',
    color: '#9b59b6',
    camera: [5.5, -0.8, -5.5],
    title: '代表项目',
    lines: [
      '海狸洗衣 · 招商银行小程序（独立开发）',
      '海狸洗衣 · 微信小程序（独立开发）',
      '海尔智家 App · 智能家电应用（独立开发）',
      '毒物商店 / 娱乐蛙 B2C 后台（合作开发）',
    ],
  },
]

const activeIndex = ref(0)
const isRotating = ref(true)

// ============ 相机切换 ============
const cameraRef = ref(null)
const targetCamPos = ref([0, 0.6, 8])

function switchSection(index) {
  activeIndex.value = index
  targetCamPos.value = sections[index].camera
  isRotating.value = false
}

// 平滑插值移动相机
let animFrame = 0
function animateCamera() {
  const cam = cameraRef.value
  if (cam) {
    const [tx, ty, tz] = targetCamPos.value
    cam.position.x += (tx - cam.position.x) * 0.06
    cam.position.y += (ty - cam.position.y) * 0.06
    cam.position.z += (tz - cam.position.z) * 0.06
  }
  animFrame = requestAnimationFrame(animateCamera)
}

// ============ 模型自动旋转（交互时暂停） ============
const headGroupRef = ref(null)
const rotationSpeed = 0.006

function tickRotation() {
  if (headGroupRef.value && isRotating.value) {
    headGroupRef.value.rotation.y += rotationSpeed
  }
  requestAnimationFrame(tickRotation)
}

let rotFrame = 0

// 拖动画布时暂停自动旋转
function onCanvasPointerDown() {
  isRotating.value = false
}

onMounted(() => {
  animateCamera()
  rotFrame = requestAnimationFrame(tickRotation)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrame)
  cancelAnimationFrame(rotFrame)
})
</script>

<template>
  <div class="stage">
    <!-- 左侧信息面板 -->
    <aside class="panel">
      <div class="brand">3D·RESUME</div>

      <!-- 导航按钮 -->
      <nav class="nav">
        <button
          v-for="(s, i) in sections"
          :key="s.id"
          class="nav-btn"
          :class="{ active: activeIndex === i }"
          :style="activeIndex === i ? { borderColor: s.color, color: s.color } : {}"
          @click="switchSection(i)"
        >
          <span class="dot" :style="{ background: s.color }"></span>
          {{ s.label }}
        </button>
      </nav>

      <!-- 当前板块内容 -->
      <div class="content" :key="sections[activeIndex].id">
        <h2 :style="{ color: sections[activeIndex].color }">
          {{ sections[activeIndex].title }}
        </h2>
        <ul>
          <li v-for="(line, i) in sections[activeIndex].lines" :key="i">
            {{ line }}
          </li>
        </ul>
      </div>

      <div class="hint">鼠标拖动可旋转模型 · 点击左侧按钮切换视角</div>
    </aside>

    <!-- 3D 画布 -->
    <main class="canvas-wrap" @pointerdown="onCanvasPointerDown">
      <TresCanvas :antialias="true" :alpha="true" :dpr="[1, 2]">
        <TresPerspectiveCamera ref="cameraRef" :position="[0, 0.6, 8]" :fov="45" />

        <!-- 灯光 -->
        <TresAmbientLight :intensity="0.7" />
        <TresDirectionalLight :position="[6, 8, 6]" :intensity="1.4" />
        <TresDirectionalLight :position="[-6, -4, -6]" :intensity="0.4" color="#8899ff" />

        <!-- 地面网格 -->
        <TresGridHelper :args="[20, 20, '#334', '#223']" />

        <!-- ===== 程序化生成的 3D 头像 ===== -->
        <TresGroup ref="headGroupRef">
          <!-- 头部 -->
          <TresMesh :position="[0, 1.4, 0]">
            <TresSphereGeometry :args="[1.15, 48, 48]" />
            <TresMeshStandardMaterial color="#ffcf9e" :roughness="0.55" />
          </TresMesh>

          <!-- 左眼 -->
          <TresMesh :position="[-0.38, 1.55, 1.08]">
            <TresSphereGeometry :args="[0.13, 24, 24]" />
            <TresMeshStandardMaterial color="#1c1c1c" :roughness="0.2" />
          </TresMesh>
          <!-- 右眼 -->
          <TresMesh :position="[0.38, 1.55, 1.08]">
            <TresSphereGeometry :args="[0.13, 24, 24]" />
            <TresMeshStandardMaterial color="#1c1c1c" :roughness="0.2" />
          </TresMesh>

          <!-- 嘴（微笑） -->
          <TresMesh :position="[0, 1.02, 1.1]" :rotation="[0, 0, Math.PI]">
            <TresTorusGeometry :args="[0.2, 0.04, 16, 32, Math.PI]" />
            <TresMeshStandardMaterial color="#b25b3a" />
          </TresMesh>

          <!-- 头顶代码符号：悬浮的 </> 立方体 -->
          <TresMesh :position="[1.4, 2.6, 0]" :rotation="[0.4, 0.6, 0.2]">
            <TresBoxGeometry :args="[0.5, 0.5, 0.5]" />
            <TresMeshStandardMaterial color="#42b883" :roughness="0.3" :metalness="0.4" />
          </TresMesh>

          <!-- 身体 -->
          <TresMesh :position="[0, -0.9, 0]">
            <TresCylinderGeometry :args="[0.85, 1.15, 2.6, 40]" />
            <TresMeshStandardMaterial color="#4a90e2" :roughness="0.5" />
          </TresMesh>

          <!-- 身体上的 Vue 标志色环 -->
          <TresMesh :position="[0, -0.35, 0]" :rotation="[Math.PI / 2, 0, 0]">
            <TresTorusGeometry :args="[1.0, 0.07, 16, 60]" />
            <TresMeshStandardMaterial color="#42b883" :emissive="'#42b883'" :emissiveIntensity="0.35" />
          </TresMesh>
        </TresGroup>

        <!-- 环绕的四个技能轨道小球（错开角度，避免遮挡主体） -->
        <TresGroup :rotation="[0.35, 0, 0]">
          <TresMesh v-for="(s, i) in sections" :key="s.id"
            :position="[Math.cos((i / 4) * Math.PI * 2 + Math.PI / 4) * 3.6, 1.5, Math.sin((i / 4) * Math.PI * 2 + Math.PI / 4) * 3.6]">
            <TresSphereGeometry :args="[0.22, 24, 24]" />
            <TresMeshStandardMaterial :color="s.color" :emissive="s.color" :emissiveIntensity="0.45" />
          </TresMesh>
        </TresGroup>

        <OrbitControls :enable-damping="true" :damping-factor="0.08" :enable-pan="false"
          :min-distance="4" :max-distance="14" :target="[0, 0.6, 0]" />
      </TresCanvas>
    </main>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0d1226 0%, #101a33 55%, #0a0f20 100%);
}

/* ---- 左侧面板 ---- */
.panel {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 28px 26px;
  background: rgba(13, 18, 38, 0.82);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  color: #dfe6f3;
  z-index: 10;
}

.brand {
  font-size: 13px;
  letter-spacing: 5px;
  color: #6ea8ff;
  margin-bottom: 26px;
  font-weight: 700;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 30px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 13px;
  font-size: 13px;
  color: #9fb0cc;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-btn.active {
  background: rgba(255, 255, 255, 0.12);
  font-weight: 700;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* ---- 内容区 ---- */
.content {
  flex: 1;
  animation: fadeUp 0.45s ease forwards;
}

.content h2 {
  font-size: 21px;
  margin-bottom: 16px;
}

.content ul {
  list-style: none;
}

.content li {
  position: relative;
  padding-left: 16px;
  margin-bottom: 11px;
  font-size: 14px;
  line-height: 1.55;
  color: #c3cfe4;
  text-align: left;
}

.content li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.55;
}

.hint {
  font-size: 12px;
  color: #5c6b8a;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 14px;
}

/* ---- 画布 ---- */
.canvas-wrap {
  flex: 1;
  position: relative;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
