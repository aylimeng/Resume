# 3D Resume · 三维交互式个人简历

一个基于 Vue 3、Three.js 和 TresJS 的滚动式 3D 个人简历。人物场景固定在页面背景中，向下滚动时，人物会跟随章节改变位置、朝向和景别；简历与作品内容以独立的 HTML 页面层呈现。

视觉参考来自 [sen-3d-resume](https://github.com/dayinji/sen-3d-resume)：借鉴固定 3D 场景与滚动叙事的结构，并按本项目的页面视频重新设计布局与配色。

## 功能

- 使用 `public/models/limeng.glb` 渲染个人 3D 形象；滚动章节驱动人物变换，鼠标位置带动人物轻微转向
- 五个章节：关于我、个人介绍、工作履历、精选作品和联系我
- 页面文案以简历文档为准：4 段工作经历、5 个项目、技能清单均来自简历原文，不虚构学校、年份与项目数量
- 桌面与窄屏自适应排版，导航可平滑跳转到对应章节
- GitHub Pages 部署路径配置为 `/Resume/`

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 目录结构

```text
public/models/limeng.glb      # 提供的 3D 人物模型（已缩小贴图）
src/App.vue                   # 应用入口
src/components/Resume3D.vue  # 3D 场景、滚动章节与响应式样式
```

模型贴图从 4K 缩至 2K，以减小页面下载体积。模型未包含相机动画，因此页面使用滚动位置驱动人物的平移、缩放和朝向。

优化记录（2026-11-23）：删除了 `public/draco/` 的 752KB 解码器副本，Three.js r187 的 DRACOLoader 已自带打包进 bundle 的解码器；加载失败时可点“重新加载”重试；切到后台标签页时暂停逐帧插值。

重构记录（2026-11-23 v2）：文案抽到 `src/data/resume.js` 单独维护；背景层加入白狗图（`public/images/white-dog.webp`，multiply 混合融入纸色背景，滚动视差）；滚动时相机推近 / 拉远、人物转身幅度加大、待机浮动；新增顶部滚动进度条、章节入场动画与技能跑马灯；详情文字整体放大（正文 10px→14px，注释 8px→12px），移动端同步放大。
