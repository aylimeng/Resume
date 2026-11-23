# 3D Resume · 三维交互式个人简历

一个基于 **Vue 3 + Three.js（TresJS）** 的 3D 交互式个人简历网站：程序化生成的 3D 形象悬浮在网格场景中，点击左侧导航，镜头平滑飞行到对应视角并联动展示简历内容。

灵感来自「AI 时代个人介绍不该只是一份 PDF」的想法，用更有记忆点的方式展示自己。

## 功能特性

- **3D 形象**：纯代码程序化生成（球体头部 / 圆柱身体 / Vue 色光环 / 悬浮代码立方体），无需外部模型文件
- **镜头联动**：4 个板块（个人介绍 / 专业技能 / 工作经历 / 项目经验），点击导航相机插值飞行、内容同步切换
- **自动旋转**：模型默认自转，鼠标拖动交互时自动暂停
- **轨道装饰**：4 个发光小球环绕场景，呼应各板块主题色

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 框架 | Vue 3（`<script setup>`）+ Vite |
| 3D | Three.js + TresJS（声明式 Vue 组件）+ @tresjs/cientos（OrbitControls） |
| 交互 | 相机插值动画、requestAnimationFrame 渲染循环、pointer 事件 |

## 本地运行

```bash
npm install
npm run dev     # http://localhost:5173
```

## 构建

```bash
npm run build   # 输出到 dist/
npm run preview # 本地预览构建产物
```

## 目录结构

```
src/
├── App.vue                  # 全局样式与入口
├── main.js
└── components/
    └── Resume3D.vue         # 3D 场景 + 信息面板 + 导航逻辑（核心）
```

## License

MIT
