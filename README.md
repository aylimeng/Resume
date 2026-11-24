# 李萌 · 3D 交互式简历

滚动驱动的单页 3D 简历：人物坐在蓝色瑜伽球上，滚轮滚动时镜头推近、人物转身一圈，履历、项目、联系方式依次出现。参考 Sen 的 [about.senbuzy.com](https://about.senbuzy.com/)，按李萌本人的简历文档重做。

```bash
npm install
npm run dev      # 本地开发 http://localhost:5173/Resume/
npm run build    # 构建到 dist/
npm run preview  # 本地预览构建产物
```

部署在 GitHub Pages：`https://aylimeng.github.io/Resume/`，`vite.config.js` 的 `base` 为 `/Resume/`。

## 技术栈

| 依赖             | 版本         | 用途                                                                  |
| ---------------- | ------------ | --------------------------------------------------------------------- |
| Vue              | 3.5.44       | 应用框架（`<script setup>` + Composition API）                        |
| Vite             | 8.3.6        | 构建工具，`@vitejs/plugin-vue` 6                                      |
| Three.js         | 0.187        | 3D 渲染、`GLTFLoader` / `DRACOLoader`（`three/addons`）               |
| @tresjs/core     | 5.12         | Vue 版 Three.js 封装：`TresCanvas`、`TresPerspectiveCamera`、灯光组件 |
| @tresjs/cientos  | 5.12         | 已安装，当前代码未使用                                                |
| Playfair Display | 自托管 woff2 | 标题衬线字体，`public/fonts/`，不依赖 Google Fonts                    |

无路由、无状态库、无 CSS 框架。运行时只依赖 Vue + Three.js。

## 目录结构

```text
index.html                        # 入口：字体 @font-face、OG meta、theme-color
vite.config.js                    # base: '/Resume/'（GitHub Pages 子路径）
public/
  models/limeng.glb               # 3D 人物模型（Draco 压缩，1.7 MB）
  images/white-dog.webp           # 透明底白狗背景（104 KB）
  fonts/playfair-400.woff2        # Playfair Display 400（38 KB，latin 子集）
  fonts/playfair-400-italic.woff2 # Playfair Display 400 italic（22 KB）
  preview.png                     # OG 分享图（v8 首页截图）
src/
  main.js                         # createApp(App).mount('#app')
  App.vue                         # 只挂载 Resume3D
  data/resume.js                  # 文案唯一来源：章节、4 段履历、5 个项目、7 组技能
  components/Resume3D.vue         # 全部实现：3D 场景 + 4 个章节 + 全部样式（525 行）
```

`src/data/resume.js` 是文案的唯一来源，与用户提供的简历文档保持一致，不虚构学校、年份与项目数量。改文案只改这个文件。

## 实现方式

### 页面结构

单页 4 个章节（`sections`）：About（首页）→ Résumé（纵向时间线）→ 主要项目（横向滚动区）→ Say Hello（联系）。`App.vue` 只挂载 `Resume3D.vue`，3D 场景与全部章节、样式都在这一个组件里。

### 3D 场景

- `TresCanvas` 透明画布固定铺满视口，背景层是透明底白狗图（`public/images/white-dog.webp`），人物 GLB 坐在蓝色球上。
- 相机：`TresPerspectiveCamera`，`fov: 35`，`cameraZ` 由滚动位置驱动（9.5 → 4.6 → 7.0 → 9.5）。
- 灯光（`Resume3D.vue` 模板内声明）：环境光 `2.1`；主方向光 `(4, 7, 5)` 强度 `3.3`，开 `cast-shadow`；暖色补光 `(-5, 3, -3)` 强度 `1.45`；暖色点光 `(2, -0.2, 4)` 强度 `19`、`distance: 9`。模型开启投射与接收阴影。
- 人物待机动画：`animateAvatar` 里按 `sin(now * 0.0011)` 做小幅上下浮动；鼠标移动时人物朝向微转（yaw ±0.3、pitch ±0.06）。

### 滚动驱动镜头（核心机制）

4 个镜头关键帧（`poses`），按章节中心切换：

| 章节      | x    | scale | yaw  | camZ | 效果                      |
| --------- | ---- | ----- | ---- | ---- | ------------------------- |
| About     | 0    | 0.88  | -0.1 | 9.5  | 人物居中正面              |
| Résumé    | -1.7 | 0.9   | 1.5  | 4.6  | 推近到面部特写            |
| 主要项目  | -1.9 | 0.85  | 3.1  | 7.0  | 转身约 180°，露出球后文字 |
| Say Hello | -2.2 | 0.62  | 6.18 | 9.5  | 转满一圈回到正面          |

`updateTargetPose()` 在每次滚动时执行：取视口中心（`scrollY + 52% 视口高`）最近的章节中心定当前章节，再在相邻两个关键帧之间用 smoothstep（`t*t*(3-2t)`）插值出目标位姿。`animateAvatar()` 用帧率无关的阻尼 `1 - exp(-dt * 3.2)` 向目标位姿靠拢（`dt` 钳制在 0.05 内），低帧率设备上也能在约 1.5 秒内转到位；切到后台标签页时暂停插值。

移动端（≤720px）姿态系数：`x × 0.25`、`scale × 0.85`、`camZ + 1.2`；标题用 `clamp()` 缩放。

### 横向 Works 区

竖向滚轮驱动横向平移：`measureWorks()` 算出横向溢出量 `worksOverflow = track.scrollWidth - innerWidth`，把章节高度设为 `视口高 + worksOverflow`；滚动时按章节内的滚动进度把轨道 `translate3d(-progress * worksOverflow)`，滚到底正好播完最后一张卡片。轨道共 6 张：5 个项目卡 + 末尾 1 张技能卡。移动端取消 sticky，轨道改竖排。

顶部有一条滚动进度条（`scrollY / (scrollHeight - innerHeight)`），章节内容用 `IntersectionObserver` 做入场动画。

### 白狗淡出

作品区与联系区的文字是浅色，压在白狗上会看不清：`updateTargetPose()` 按视口中心实际所在的章节判断，当前章节是 `projects` 或 `contact` 时白狗层 `opacity` 淡到 `0.15`（0.6s 过渡），其他章节恢复 `1`；卡片与时间线文字另有深色光晕（`text-shadow`）兜底。

### 球后 HELLO WORLD

不改 GLB，运行时在球后加字：`addBallText()` 用 Canvas 2D 逐字画 Playfair 粗体（等 `document.fonts.load` 字体就绪后再画，否则回退到 Georgia），每个字母生成 `CanvasTexture`，贴在 `0.56 × 0.56` 的 plane 上。10 个字母沿球后水平圆弧排布：球心约 `y = -1.2`、球半径约 `1.45`（实测），文字半径 `1.95`（约 0.5 间隙），步进 `8°`（跨度 80°），整体再右移 `8°`（球在画面左侧，避免首字母 H 出画）。字母挂在 `avatarRoot` 下，跟人物一起平移 / 缩放 / 转身；首页正面看不见，滚到作品区转身约 180° 后才可见。字母 `castShadow` + `alphaTest: 0.4` 镂空，前向主光源把字母形状的阴影投在球面上。

### 加载与容错

- `GLTFLoader` 的 `onProgress` 驱动加载进度条；加载失败显示重试按钮（`retryLoad()`）。
- 模型加载成功后才挂 `avatarRoot` 并开始动画循环；卸载时遍历释放几何体、材质与贴图。
- 字体：Playfair Display 以 woff2 自托管在 `public/fonts/`，无外部字体请求；页面无外部依赖，离线可开。

## GLB 优化

### 体积：48 MB → 1.7 MB

- 用户电脑上的原始文件 `limeng.glb` 约 48 MB；当前 `public/models/limeng.glb` 是经 glTF-Transform + Draco 压缩的版本，**1.7 MB**。
- 模型结构：1 个 mesh、1 个 material、3 张贴图（均为 1024×1024，无动画）：
  - 底色贴图（base color，JPEG）
  - 法线贴图（normal，PNG，780 KB）
  - 粗糙度 / 金属度贴图（metallic-roughness，JPEG）
- 解码器：`public/draco/` 下曾有一份 752 KB 的 Draco 解码器副本，已删除——Three.js r187 的 `DRACOLoader` 默认使用打包进 bundle 的解码器，不需要副本。删除后构建产物 `dist` 从 4.6 MB 降到 3.9 MB。

### 材质去木纹（v8）

问题：模型表面（皮肤、短裤、球）有一层像木头刻痕的细密纹路。三组对照实验证明根因：

| 实验           | 结果     | 结论             |
| -------------- | -------- | ---------------- |
| 纯白无贴图材质 | 无纹路   | 排除几何本身     |
| 去掉底色贴图   | 纹路还在 | 排除底色贴图     |
| 去掉法线贴图   | 纹路还在 | 法线贴图不是主因 |

真正原因是**粗糙度贴图的明暗起伏 + GLB 自带的 2 倍高光**（`KHR_materials_specular`，`specularColorFactor: [2, 2, 2]`），在强光（主光 3.3 + 点光 19）下被放大成木纹。修复在 `loadAvatar()` 的 traverse 里做，不改 GLB 文件：

```js
object.material.normalMap = null
object.material.metallicRoughnessTexture = null
object.material.roughness = 0.9
object.material.metalness = 0
object.material.specularIntensity = 0
```

修复后皮肤与短裤恢复平滑。残留：球面还有极淡的同心弧线，是底色渐变在 8-bit 下的色带（color banding），不是木纹，属球体自身质感；彻底消除需离线给底色贴图加噪点抖动并重建 GLB，未做。
