<!--
  半山项目 - Home.vue
  功能简述：首页，症状输入 + 分析结果展示
  版本: 0.2.0
  最后修改: 2026-06-13
  修改说明: 添加示例症状引导、分析耗时显示
-->
<script setup>
import { ref, watch, onMounted, onActivated, onDeactivated, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { analyzeSymptomStream, hasApiKey } from '../utils/api.js'
import { ERRORS } from '../shared/strings.js'
import ResultCard from '../components/ResultCard.vue'

const route = useRoute()
const symptom = ref('')
const loading = ref(false)
const streamingText = ref('')
const result = ref(null)
const error = ref('')
const elapsed = ref(0)
const resultEl = ref(null)

const DRAFT_KEY = 'banshan_draft'
// 草稿自动保存
watch(symptom, (val) => {
  localStorage.setItem(DRAFT_KEY, val)
})

const placeholders = [
  '描述你的身体感受，越具体越好...',
  '比如：头痛了几天？什么感觉？有没有诱因？',
  '比如：什么时候开始的？持续多久？有变化吗？',
  '比如：位置在哪？什么情况下加重？什么情况下缓解？',
]
const placeholder = ref(placeholders[0])
let placeholderTimer = null

onMounted(() => {
  // 恢复草稿
  if (!route.query.symptom) {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) symptom.value = draft
  }
  checkReanalyze()
  startPlaceholderRotation()
  // 页面标题
  document.title = '半山 - 健康自检'
})
onActivated(() => {
  checkReanalyze()
  startPlaceholderRotation()
})
onDeactivated(() => {
  clearInterval(placeholderTimer)
})

function checkReanalyze() {
  const from = route.query.symptom
  if (from) {
    symptom.value = from
    // Clear query so back button doesn't trigger again
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }
}

function startPlaceholderRotation() {
  let i = 1
  clearInterval(placeholderTimer)
  placeholderTimer = setInterval(() => {
    placeholder.value = placeholders[i % placeholders.length]
    i++
  }, 4000)
}

// 结果出现时自动滚动
watch(result, async (val) => {
  if (val) {
    await nextTick()
    resultEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
})

const examples = [
  '最近三天头疼，太阳穴胀痛，睡眠不好',
  '吃完饭后胃胀，偶尔反酸，持续一周',
  '右膝盖上下楼时疼，不肿，两个月了',
]

const HISTORY_KEY = 'banshan_history'

function saveToHistory(symptomText, analysisResult) {
  const records = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  records.unshift({
    id: Date.now(),
    symptom: symptomText,
    result: analysisResult,
    createdAt: new Date().toISOString(),
  })
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records))
}

async function submit() {
  if (!hasApiKey()) {
    error.value = '请先点击右上角 ⚙ 设置 API Key'
    return
  }

  const text = symptom.value.trim()
  if (!text) {
    error.value = ERRORS.emptyInput
    return
  }
  if (text.length < 5) {
    error.value = ERRORS.tooShort
    return
  }

  loading.value = true
  streamingText.value = ''
  error.value = ''
  result.value = null
  elapsed.value = 0
  const startTime = Date.now()

  try {
    const data = await analyzeSymptomStream(text, (content) => {
      streamingText.value = content
      // Try to render early if JSON is complete
      try {
        const partial = JSON.parse(content)
        if (partial.green && partial.yellow && partial.red) {
          result.value = partial
          loading.value = false
        }
      } catch {
        // JSON not yet complete, keep streaming
      }
    })
    if (!result.value) {
      result.value = data
    }
    saveToHistory(text, data)
  } catch (e) {
    if (e.name === 'AbortError') {
      error.value = '请求超时，请检查网络后重试'
    } else if (e.message) {
      error.value = e.message
    } else {
      error.value = ERRORS.apiFailed
    }
    console.error(e)
  } finally {
    loading.value = false
    elapsed.value = ((Date.now() - startTime) / 1000).toFixed(1)
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-2">半山</h1>
    <p class="text-gray-500 text-center mb-8">健康自检 · AI 辅助评估</p>

    <textarea
      v-model="symptom"
      class="w-full h-32 p-4 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
      :placeholder="placeholder"
      @keydown.ctrl.enter="submit"
    ></textarea>
    <p class="text-right text-xs text-gray-400 dark:text-gray-500 mt-1">
      {{ symptom.length }} 字 · Ctrl+Enter 提交
    </p>

    <button
      :disabled="loading"
      class="w-full mt-3 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
      @click="submit"
    >
      {{ loading ? '分析中...' : '开始分析' }}
    </button>
    <p class="text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
      AI 辅助评估，不构成医疗诊断，仅供参考
    </p>

    <!-- Loading skeleton -->
    <div v-if="loading" class="mt-6 space-y-4">
      <div
        v-for="color in ['bg-green-200', 'bg-yellow-200', 'bg-red-200']"
        :key="color"
        class="rounded-lg p-5 animate-pulse"
      >
        <div class="h-5 w-24 rounded mb-3" :class="color"></div>
        <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div class="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div class="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div v-if="streamingText" class="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
          AI 正在思考（{{ streamingText.length }} 字符）...
        </p>
        <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">{{ streamingText }}</pre>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="text-center mt-6">
      <p class="text-red-500 mb-3">{{ error }}</p>
      <button
        class="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 underline"
        @click="submit"
      >
        重试
      </button>
    </div>

    <!-- Analysis result -->
    <div v-if="result" ref="resultEl" class="animate-fade-in">
      <p v-if="elapsed" class="text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
        分析耗时 {{ elapsed }} 秒
      </p>
      <ResultCard :result="result" />
    </div>

    <!-- Empty state hint -->
    <div v-if="!result && !loading && !error" class="text-center mt-8">
      <p class="text-gray-400 dark:text-gray-500 mb-4">
        输入症状后点击「开始分析」，AI 会给出三色评估
      </p>
      <div class="flex flex-wrap justify-center gap-2">
        <button
          v-for="(ex, i) in examples"
          :key="i"
          class="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-full px-4 py-1.5 hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 transition"
          @click="symptom = ex"
        >
          {{ ex }}
        </button>
      </div>
    </div>
  </div>
</template>
