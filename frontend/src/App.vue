<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { getApiKey, setApiKey, hasApiKey } from './utils/api.js'

const showSettings = ref(false)
const showHelp = ref(false)
const keyInput = ref('')
const keySaved = ref(false)
const dark = ref(localStorage.getItem('banshan_dark') === '1')

watchEffect(() => {
  document.documentElement.classList.toggle('dark', dark.value)
  localStorage.setItem('banshan_dark', dark.value ? '1' : '0')
})

onMounted(() => {
  keyInput.value = getApiKey()
  if (!hasApiKey()) {
    showSettings.value = true
  }
  document.addEventListener('keydown', onKey)
})

function onKey(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
  if (e.key === '?') {
    e.preventDefault()
    showHelp.value = !showHelp.value
  }
  if (e.key === 'Escape') showHelp.value = false
}

function toggleDark() {
  dark.value = !dark.value
}

function saveKey() {
  setApiKey(keyInput.value.trim())
  keySaved.value = true
  setTimeout(() => { keySaved.value = false }, 2000)
}

function closeSettings() {
  showSettings.value = false
  keyInput.value = getApiKey()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors">
      <div class="max-w-2xl mx-auto flex items-center gap-4 px-4 py-3">
        <RouterLink to="/" class="text-lg text-gray-700 dark:text-gray-300 hover:text-green-600 transition" active-class="text-green-600 font-semibold">
          首页
        </RouterLink>
        <RouterLink to="/history" class="text-lg text-gray-700 dark:text-gray-300 hover:text-green-600 transition" active-class="text-green-600 font-semibold">
          历史记录
        </RouterLink>
        <div class="flex-1"></div>
        <button
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition text-sm"
          @click="toggleDark"
          :title="dark ? '浅色模式' : '深色模式'"
        >
          {{ dark ? '☀' : '☾' }}
        </button>
        <button
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition text-sm"
          @click="showSettings = true"
          title="设置 API Key"
        >
          ⚙
        </button>
      </div>
    </nav>

    <!-- Page content -->
    <RouterView v-slot="{ Component }">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </RouterView>

    <!-- Disclaimer -->
    <footer class="text-center text-sm text-gray-500 dark:text-gray-500 py-6">
      半山不提供医疗诊断，仅供参考。如有不适请及时就医。
    </footer>

    <!-- Settings Modal -->
    <div v-if="showSettings" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30" @click.self="closeSettings">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <h2 class="text-xl font-semibold mb-1 dark:text-white">设置</h2>
        <p class="text-base text-gray-600 dark:text-gray-400 mb-4">
          DeepSeek API Key 仅保存在你的浏览器中，不会上传到任何服务器。
        </p>
        <input
          v-model="keyInput"
          type="password"
          placeholder="sk-..."
          class="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <p v-if="keySaved" class="text-green-600 text-base mt-2">已保存</p>
        <div class="flex gap-2 mt-4">
          <button @click="closeSettings" class="flex-1 py-2 text-base text-gray-500 dark:text-gray-400 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">取消</button>
          <button @click="saveKey" class="flex-1 py-2 text-base text-white bg-green-500 rounded-lg hover:bg-green-600">保存</button>
        </div>
      </div>
    </div>

    <!-- Help Modal -->
    <div v-if="showHelp" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30" @click.self="showHelp = false">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
        <h2 class="text-xl font-semibold mb-3 dark:text-white">快捷键</h2>
        <div class="space-y-2 text-base">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">提交分析</span>
            <kbd class="bg-gray-100 dark:bg-gray-700 px-2 rounded text-sm">Ctrl + Enter</kbd>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">帮助面板</span>
            <kbd class="bg-gray-100 dark:bg-gray-700 px-2 rounded text-sm">?</kbd>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">关闭弹窗</span>
            <kbd class="bg-gray-100 dark:bg-gray-700 px-2 rounded text-sm">Esc</kbd>
          </div>
        </div>
        <button @click="showHelp = false" class="mt-4 w-full py-2 text-base text-gray-500 dark:text-gray-400 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">关闭</button>
      </div>
    </div>
  </div>
</template>
