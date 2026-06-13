<!--
  半山项目 - ResultCard.vue
  功能简述：展示 AI 分析结果的三色等级卡片
  版本: 0.1.0
  最后修改: 2026-06-13
  修改说明: 初始创建
-->
<script setup>
import { ref } from 'vue'
import { LEVEL_LABELS } from '../shared/strings.js'

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
})

const levels = [
  { key: 'green', color: 'bg-green-50 border-green-300 text-green-900 dark:bg-green-950 dark:border-green-700 dark:text-green-200' },
  { key: 'yellow', color: 'bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-700 dark:text-yellow-200' },
  { key: 'red', color: 'bg-red-50 border-red-300 text-red-900 dark:bg-red-950 dark:border-red-700 dark:text-red-200' },
]

const copied = ref(false)
const copiedLevel = ref(null)

function copyResult() {
  const lines = levels.map(l => {
    const data = props.result[l.key]
    const actions = data?.actions?.map(a => `  - ${a}`).join('\n') || ''
    return `【${LEVEL_LABELS[l.key]}】\n${data?.explanation || ''}\n${actions}`
  })
  navigator.clipboard.writeText(lines.join('\n\n'))
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function copyLevel(key) {
  const data = props.result[key]
  const actions = data?.actions?.map(a => `  - ${a}`).join('\n') || ''
  const text = `【${LEVEL_LABELS[key]}】\n${data?.explanation || ''}\n${actions}`
  navigator.clipboard.writeText(text)
  copiedLevel.value = key
  setTimeout(() => { copiedLevel.value = null }, 2000)
}
</script>

<template>
  <div class="space-y-4 mt-6">
    <div class="flex justify-end">
      <button
        class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
        @click="copyResult"
      >
        {{ copied ? '已复制' : '复制结果' }}
      </button>
    </div>
    <div
      v-for="level in levels"
      :key="level.key"
      :class="['border rounded-lg p-5 transition-all duration-300 hover:shadow-md', level.color]"
    >
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-xl font-semibold">
          {{ LEVEL_LABELS[level.key] }}
        </h3>
        <button
          class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition shrink-0 ml-2"
          @click.stop="copyLevel(level.key)"
        >
          {{ copiedLevel === level.key ? '已复制' : '复制' }}
        </button>
      </div>
      <p class="text-base mb-3 opacity-90">
        {{ result[level.key]?.explanation }}
      </p>
      <ul class="list-disc list-inside text-base space-y-1">
        <li v-for="(action, i) in result[level.key]?.actions" :key="i">
          {{ action }}
        </li>
      </ul>
    </div>
  </div>
</template>
