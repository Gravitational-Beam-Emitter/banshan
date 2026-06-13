<!--
  半山项目 - ResultCard.vue
  功能简述：展示 AI 分析结果的三色等级卡片
  版本: 0.1.0
  最后修改: 2026-06-13
  修改说明: 初始创建
-->
<script setup>
import { LEVEL_LABELS } from '../shared/strings.js'

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
})

const levels = [
  { key: 'green', color: 'bg-green-50 border-green-300 text-green-900' },
  { key: 'yellow', color: 'bg-yellow-50 border-yellow-300 text-yellow-900' },
  { key: 'red', color: 'bg-red-50 border-red-300 text-red-900' },
]
</script>

<template>
  <div class="space-y-4 mt-6">
    <div
      v-for="level in levels"
      :key="level.key"
      :class="['border rounded-lg p-5 transition-all duration-300 hover:shadow-md', level.color]"
    >
      <h3 class="text-lg font-semibold mb-2">
        {{ LEVEL_LABELS[level.key] }}
      </h3>
      <p class="text-sm mb-3 opacity-90">
        {{ result[level.key]?.explanation }}
      </p>
      <ul class="list-disc list-inside text-sm space-y-1">
        <li v-for="(action, i) in result[level.key]?.actions" :key="i">
          {{ action }}
        </li>
      </ul>
    </div>
  </div>
</template>
