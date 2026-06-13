<script setup>
import { ref, onMounted } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { getApiKey, setApiKey, hasApiKey } from './utils/api.js'

const showSettings = ref(false)
const keyInput = ref('')
const keySaved = ref(false)

onMounted(() => {
  keyInput.value = getApiKey()
})

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
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-2xl mx-auto flex items-center gap-4 px-4 py-3">
        <RouterLink to="/" class="text-gray-700 hover:text-green-600 transition" active-class="text-green-600 font-semibold">
          首页
        </RouterLink>
        <RouterLink to="/history" class="text-gray-700 hover:text-green-600 transition" active-class="text-green-600 font-semibold">
          历史记录
        </RouterLink>
        <div class="flex-1"></div>
        <button
          class="text-gray-400 hover:text-gray-600 transition text-sm"
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
    <footer class="text-center text-xs text-gray-400 py-6">
      半山不提供医疗诊断，仅供参考。如有不适请及时就医。
    </footer>

    <!-- Settings Modal -->
    <div v-if="showSettings" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30" @click.self="closeSettings">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <h2 class="text-lg font-semibold mb-1">设置</h2>
        <p class="text-sm text-gray-500 mb-4">
          DeepSeek API Key 仅保存在你的浏览器中，不会上传到任何服务器。
        </p>
        <input
          v-model="keyInput"
          type="password"
          placeholder="sk-..."
          class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <p v-if="keySaved" class="text-green-600 text-sm mt-2">已保存</p>
        <div class="flex gap-2 mt-4">
          <button @click="closeSettings" class="flex-1 py-2 text-sm text-gray-500 border rounded-lg hover:bg-gray-50">取消</button>
          <button @click="saveKey" class="flex-1 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>
