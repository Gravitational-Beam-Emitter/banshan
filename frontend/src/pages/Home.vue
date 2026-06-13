<!--
  半山项目 - Home.vue
  功能简述：首页，症状输入 + 分析结果展示
  版本: 0.4.0
  最后修改: 2026-06-13
  修改说明: 话题卡片引导、字号对比度升级
-->
<script setup>
import { ref, watch, onMounted, onActivated, onDeactivated, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { analyzeSymptomStream, hasApiKey } from '../utils/api.js'
import { fetchHealthData, formatHealthContext } from '../utils/healthBridge.js'
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
const showInput = ref(false)
const healthData = ref(null)

const topics = [
  {
    label: '这个年纪，身体在发生哪些变化？',
    prompt: '我想了解，在我这个年龄段，身体通常会发生哪些正常的退行性变化？哪些是需要特别留意的信号？',
  },
  {
    label: '睡眠变浅了，正常吗？',
    prompt: '我最近睡眠质量下降，入睡困难/容易醒/醒得早。这个年纪睡眠变差是正常的吗？怎么改善？',
  },
  {
    label: '精力不如以前了，怎么办？',
    prompt: '感觉精力明显下降，容易疲劳，恢复得慢。这个年纪应该怎么调整生活方式来保持精力？',
  },
  {
    label: '饮食和运动要怎么调整？',
    prompt: '到了这个年纪，饮食结构和运动方式应该做什么调整？有哪些需要特别注意的？',
  },
  {
    label: '该开始做哪些体检项目？',
    prompt: '以我的年龄和性别，应该开始定期做哪些体检项目？频率是怎样的？',
  },
]

function selectTopic(topic) {
  symptom.value = topic.prompt
  showInput.value = false
  submit()
}

const PROFILE_KEY = 'banshan_profile'
const DRAFT_KEY = 'banshan_draft'

const age = ref('')
const gender = ref('')

function loadProfile() {
  const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
  age.value = saved.age || ''
  gender.value = saved.gender || ''
}
function saveProfile() {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({
    age: age.value, gender: gender.value,
  }))
}
loadProfile()
watch([age, gender], saveProfile)

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
  // 恢复草稿或 reanalyze 时展开输入框
  if (!route.query.symptom) {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      symptom.value = draft
      showInput.value = true
    }
  }
  if (route.query.symptom) {
    showInput.value = true
  }
  checkReanalyze()
  startPlaceholderRotation()
  loadHealthData()
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

async function loadHealthData() {
  healthData.value = await fetchHealthData()
}

const HISTORY_KEY = 'banshan_history'

function buildUserMessage() {
  const parts = [symptom.value.trim()]
  const meta = []
  if (age.value) meta.push(`${age.value}岁`)
  if (gender.value) meta.push(gender.value)
  if (meta.length) parts.push(`\n[用户信息：${meta.join('，')}]`)
  if (healthData.value) {
    const ctx = formatHealthContext(healthData.value)
    if (ctx) parts.push(ctx)
  }
  return parts.join('\n')
}

function saveToHistory(symptomText, analysisResult) {
  const records = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  records.unshift({
    id: Date.now(),
    symptom: symptomText,
    result: analysisResult,
    profile: { age: age.value, gender: gender.value },
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
    const message = buildUserMessage()
    const data = await analyzeSymptomStream(message, (content) => {
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
    <p class="text-gray-600 dark:text-gray-400 text-center mb-8 text-lg">
      了解身体变化，从容面对初老
    </p>

    <!-- Topic cards -->
    <div v-if="!result && !loading && !error && !showInput" class="space-y-3">
      <button
        v-for="topic in topics"
        :key="topic.label"
        class="w-full text-left p-5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl hover:border-green-400 dark:hover:border-green-500 hover:shadow transition text-lg"
        @click="selectTopic(topic)"
      >
        {{ topic.label }}
      </button>
      <button
        class="w-full text-center p-4 text-gray-600 dark:text-gray-400 border border-dashed dark:border-gray-700 rounded-xl hover:border-green-400 dark:hover:border-green-500 transition text-lg"
        @click="showInput = true"
      >
        自己描述...
      </button>
    </div>

    <!-- Input area -->
    <div v-if="showInput || result || loading">
      <textarea
        v-model="symptom"
        class="w-full h-32 p-4 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
        :placeholder="placeholder"
        @keydown.ctrl.enter="submit"
      ></textarea>
      <p class="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{ symptom.length }} 字 · Ctrl+Enter 提交
      </p>

      <div class="flex items-center gap-3 mt-3">
        <label class="text-sm text-gray-600 dark:text-gray-400 shrink-0">年龄</label>
        <input
          v-model="age"
          type="number"
          min="1"
          max="120"
          placeholder="选填"
          class="w-16 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded px-2 py-1 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <label class="text-sm text-gray-600 dark:text-gray-400 shrink-0 ml-3">性别</label>
        <div class="flex gap-1">
          <button
            v-for="opt in ['男', '女', '不填']"
            :key="opt"
            :class="[
              'text-sm px-3 py-1.5 rounded transition',
              gender === opt || (opt === '不填' && !gender)
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600',
            ]"
            @click="gender = opt === '不填' ? '' : opt"
          >
            {{ opt }}
          </button>
        </div>
      </div>

      <button
        :disabled="loading"
        class="w-full mt-3 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 text-lg"
        @click="submit"
      >
        {{ loading ? '分析中...' : '开始分析' }}
      </button>
      <p class="text-center text-sm text-gray-500 dark:text-gray-600 mt-2">
        AI 辅助评估，不构成医疗诊断，仅供参考
      </p>
    </div>

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
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
          AI 正在思考（{{ streamingText.length }} 字符）...
        </p>
        <pre class="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">{{ streamingText }}</pre>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="text-center mt-6">
      <p class="text-red-500 mb-3">{{ error }}</p>
      <button
        class="text-base text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 underline"
        @click="submit"
      >
        重试
      </button>
    </div>

    <!-- Analysis result -->
    <div v-if="result" ref="resultEl" class="animate-fade-in">
      <p v-if="elapsed" class="text-center text-sm text-gray-500 dark:text-gray-500 mt-2">
        分析耗时 {{ elapsed }} 秒
      </p>
      <ResultCard :result="result" />
    </div>

  </div>
</template>
