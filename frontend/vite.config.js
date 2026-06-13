import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// API Key 由用户在前端输入，存 localStorage，直连 DeepSeek。
// 无需后端代理，可部署到任意静态托管。
export default defineConfig({
  plugins: [vue(), tailwindcss()],
})
