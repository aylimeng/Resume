// 简历文案唯一来源: 与用户提供的简历文档保持一致, 不要在这里虚构学校、年份与项目数量。
// 横向 Works 区不再单设 Skills 章节, 整份简历(履历 + 技能 + 项目)都在横向卡片里再展示一遍。
export const sections = [
  { id: 'about', label: 'About', en: 'ABOUT' },
  { id: 'resume', label: 'Résumé', en: 'RÉSUMÉ' },
  { id: 'projects', label: '主要项目', en: 'SELECTED WORKS' },
  { id: 'contact', label: 'Say Hello', en: 'SAY HELLO' },
]

export const experiences = [
  { period: '2023.06 — 至今', role: '独立开发者', company: '自主项目', note: '以自主项目为主，独立完成小程序、H5 与站点开发；同步跟进 Vue 3 与 AI 辅助开发。' },
  { period: '2018.12 — 2023.06', role: 'Web 前端工程师', company: '北京海狸先生网络科技', note: '独立负责「海狸洗衣」微信与招商银行小程序，及海尔智家晾衣架、智能鞋柜应用的前端开发与版本发布。' },
  { period: '2016.12 — 2018.12', role: 'Web 前端工程师', company: '格物致诚（北京）信息技术', note: '负责「毒物商店」小程序的开发与维护。' },
  { period: '2015.12 — 2016.12', role: '前端 / Node 开发', company: '蛙族（北京）网络科技', note: '负责娱乐蛙 B2C 商城后台的数据接口开发与维护。' },
]

export const projects = [
  { no: '01', title: '海狸洗衣 · 招商银行小程序', type: '独立开发维护', period: '2021.01 — 2023.06', description: '嵌入招商银行 App、基于 LBS 定位的物联网自助洗衣服务小程序。独立承接前端全流程，Vue 3 + Webpack + Vant，封装招行 App JS-SDK（登录授权、GPS 定位、一网通支付）与 Axios 请求拦截器。', tags: ['Vue 3', 'LBS', '支付'] },
  { no: '02', title: '海狸洗衣 · 微信小程序', type: '独立开发维护', period: '2019.12 — 2023.06', description: '面向 C 端用户的物联网自助洗衣小程序，核心链路「定位找店—下单—支付—启动设备」。微信原生 API 实现：登录鉴权、LBS 找店、微信支付、低功耗蓝牙下单、广告变现。', tags: ['小程序', 'BLE', '支付'] },
  { no: '03', title: '海尔智家 App · 晾衣架 / 智能鞋柜', type: '独立开发维护', period: '2018.12 — 2023.06', description: '海尔智慧家庭智能家电应用，覆盖多型号设备的控制与状态展示。Vue 2 + Vant，配置数据驱动 UI 渲染，多型号设备共用一套代码；mPaaS 资源包构建与灰度发布。', tags: ['Vue 2', 'IoT', 'mPaaS'] },
  { no: '04', title: '毒物商店 · 微信小程序', type: '合作开发', period: '2016.12 — 2018.12', description: '面向年轻用户的个性化商品购物小程序。负责部分页面功能开发、调试与测试，按视觉稿还原界面，抽象公用方法。', tags: ['小程序', '电商'] },
  { no: '05', title: '娱乐蛙 B2C 商城后台', type: '合作开发', period: '2015.12 — 2016.12', description: '娱乐类商品的 B2C 购物平台后端服务。Node.js + Express，搜索店铺、绑定店铺、我的余额、收益记录等接口及对应 SQL 增删改查。', tags: ['Node.js', 'Express', 'API'] },
]

export const skills = ['Vue 3', 'React', '微信小程序', 'Node.js', 'AI 辅助开发', 'Git', 'Webpack']

// 技能完整分组(来自简历文档), 用于横向 Works 区的技能卡片
export const skillDetails = [
  { name: '前端基础', detail: 'HTML5 / CSS3 / JavaScript（ES6+），像素级还原设计稿与移动端适配' },
  { name: '数据交互', detail: 'Axios、请求/响应拦截器、错误兜底、API 模块化封装' },
  { name: '框架应用', detail: 'Vue 2 / Vue 3（Vue Router、Vuex）、React，组件化拆分与自定义 Hook' },
  { name: '小程序', detail: '登录鉴权、LBS 定位、微信支付、低功耗蓝牙（BLE）、广告变现' },
  { name: 'AI 辅助开发', detail: 'Cursor / GitHub Copilot / Claude，代码生成、重构、调试与文档整理' },
  { name: '工程化', detail: 'Node.js + Webpack、Express、mPaaS 资源包构建与灰度发布' },
  { name: '版本控制', detail: 'Git / SVN / Gerrit，代码评审流程' },
]
