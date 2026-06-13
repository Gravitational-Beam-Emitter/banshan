<!--
  半山项目 - History.vue
  功能简述：历史记录页，展示过去的分析结果
  版本: 0.1.0
  最后修改: 2026-06-13
  修改说明: 实现列表展示、点击展开详情、清空功能
-->
<script setup>
import { ref, onMounted } from 'vue'
import ResultCard from '../components/ResultCard.vue'

const HISTORY_KEY = 'banshan_history'
const records = ref([])
const expandedId = ref(null)

onMounted(() => {
  records.value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
})

function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('zh-CN')
}

function remove(id, e) {
  e.stopPropagation()
  records.value = records.value.filter(r => r.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records.value))
  if (expandedId.value === id) expandedId.value = null
}

function clearAll() {
  if (!window.confirm('确定要清空所有历史记录吗？')) return
  localStorage.removeItem(HISTORY_KEY)
  records.value = []
  expandedId.value = null
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">历史记录</h1>
      <button
        v-if="records.length"
        class="text-sm text-red-500 hover:text-red-700"
        @click="clearAll"
      >
        清空记录
      </button>
    </div>

    <!-- Empty -->
    <p v-if="!records.length" class="text-gray-500">还没有分析记录</p>

    <!-- List -->
    <div v-else class="space-y-3">
      <div
        v-for="record in records"
        :key="record.id"
        class="bg-white rounded-lg border p-4 cursor-pointer hover:shadow transition"
        @click="toggle(record.id)"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium truncate flex-1 mr-4">
            {{ record.symptom }}
          </span>
          <div class="flex items-center gap-3 shrink-0">
            <span class="flex gap-1" title="绿/黄/红分析结果">
              <span class="w-2 h-2 rounded-full bg-green-400"></span>
              <span class="w-2 h-2 rounded-full bg-yellow-400"></span>
              <span class="w-2 h-2 rounded-full bg-red-400"></span>
            </span>
            <span class="text-sm text-gray-400">
              {{ formatTime(record.createdAt) }}
            </span>
            <button
              class="text-gray-300 hover:text-red-500 transition text-lg leading-none"
              @click="remove(record.id, $event)"
              title="删除此条"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Expanded detail -->
        <ResultCard v-if="expandedId === record.id" :result="record.result" />
      </div>
    </div>
  </div>
</template>
