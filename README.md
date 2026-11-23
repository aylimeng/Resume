# 3D Resume · 三维交互式个人简历

一个基于 **Vue 3 + Three.js（TresJS）** 的 3D 交互式个人简历网站。首页以实时渲染的 3D 角色为视觉中心，结合个人介绍、工作经历、项目经验和专业技能，呈现更有记忆点的个人作品集。

灵感来自「AI 时代个人介绍不该只是一份 PDF」的想法，用更有记忆点的方式展示自己。

## 功能特性

- **定制 3D 角色**：使用 Three.js 几何体组合建模，包含短发、头顶墨镜、双手点赞、背包、T 恤、短裤和运动鞋
- **交互式简历**：关于我、经历、项目和技能四个板块可即时切换
- **3D 场景交互**：角色缓慢转向指针，拖动场景可旋转视角
- **响应式布局**：桌面端双栏展示，移动端切换为角色在前、简介在后的纵向布局
- **GitHub Pages 部署**：已配置 `/Resume/` 子路径，可由仓库工作流自动构建发布

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 框架 | Vue 3（`<script setup>`）+ Vite |
| 3D | Three.js + TresJS（声明式 Vue 组件）+ @tresjs/cientos（OrbitControls） |
| 交互 | OrbitControls、requestAnimationFrame 角色动画、pointer 事件 |

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
    ├── Resume3D.vue         # 3D 场景、作品集面板与响应式样式
    └── createAvatar.js      # 程序化角色模型
```

## License

MIT

