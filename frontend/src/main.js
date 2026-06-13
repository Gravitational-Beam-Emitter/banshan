/**
 * 半山项目 - main.js
 * 功能简述：应用入口，初始化 Vue + Router
 * 版本: 0.1.0
 * 最后修改: 2026-06-13
 * 修改说明: 初始创建，配置 vue-router
 */
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './pages/Home.vue'
import History from './pages/History.vue'
import App from './App.vue'
import './style.css'

const routes = [
  { path: '/', component: Home },
  { path: '/history', component: History },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')
