import vue from '@vitejs/plugin-vue'
import { templateCompilerOptions } from '@tresjs/core'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 部署在 aylimeng.github.io/Resume/ 子路径下，必须配置 base
  base: '/Resume/',
  // 允许局域网中的其他设备访问开发服务器
  server: {
    host: '0.0.0.0',
  },
  preview: {
    host: '0.0.0.0',
  },
  plugins: [
    vue({
      // 忽略 TresJS 自定义组件（Tres 开头）的编译警告
      ...templateCompilerOptions,
    }),
  ],
})
