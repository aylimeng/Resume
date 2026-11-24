// 简历文案唯一来源: 与用户提供的简历文档保持一致, 不要在这里虚构学校、年份与项目数量。
export const sections = [
  { id: 'about', label: '关于我', en: 'THE STORY' },
  { id: 'profile', label: '个人介绍', en: 'PROFILE' },
  { id: 'resume', label: '工作履历', en: 'RÉSUMÉ' },
  { id: 'projects', label: '精选作品', en: 'SELECTED WORKS' },
  { id: 'contact', label: '联系我', en: 'SAY HELLO' },
]

export const experiences = [
  { period: '2023.06 — 至今', role: '独立开发者', company: '自主项目', note: '以自主项目为主，独立完成小程序、H5 与站点开发；同步跟进 Vue 3 与 AI 辅助开发。' },
  { period: '2018.12 — 2023.06', role: 'Web 前端工程师', company: '北京海狸先生网络科技', note: '独立负责「海狸洗衣」微信与招商银行小程序，及海尔智家晾衣架、智能鞋柜应用的前端开发与版本发布。' },
  { period: '2016.12 — 2018.12', role: 'Web 前端工程师', company: '格物致诚（北京）信息技术', note: '负责「毒物商店」小程序的开发与维护。' },
  { period: '2015.12 — 2016.12', role: '前端 / Node 开发', company: '蛙族（北京）网络科技', note: '负责娱乐蛙 B2C 商城后台的数据接口开发与维护。' },
]

export const projects = [
  { no: '01', title: '海狸洗衣 · 招商银行小程序', type: '独立开发维护 · 2021.01 — 2023.06', tags: ['Vue 3', 'LBS', '支付'] },
  { no: '02', title: '海狸洗衣 · 微信小程序', type: '独立开发维护 · 2019.12 — 2023.06', tags: ['小程序', 'BLE', '支付'] },
  { no: '03', title: '海尔智家 App · 晾衣架 / 智能鞋柜', type: '独立开发维护 · 2018.12 — 2023.06', tags: ['Vue 2', 'IoT', 'mPaaS'] },
  { no: '04', title: '毒物商店 · 微信小程序', type: '合作开发 · 2016.12 — 2018.12', tags: ['小程序', '电商'] },
  { no: '05', title: '娱乐蛙 B2C 商城后台', type: '合作开发 · 2015.12 — 2016.12', tags: ['Node.js', 'Express', 'API'] },
]

export const skills = ['Vue 3', 'React', '微信小程序', 'Node.js', 'AI 辅助开发', 'Git', 'Webpack']

export const marqueeItems = ['VUE 3', 'WECHAT MINI PROGRAM', 'AI CODING', 'NODE.JS', 'REACT', 'FRONT-END']
