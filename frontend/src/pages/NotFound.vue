<!--
  半山项目 - NotFound.vue
  功能简述：404 页面
  版本: 0.1.0
  最后修改: 2026-06-13
  修改说明: 初始创建
-->
<script setup>
import { onMounted } from 'vue'
onMounted(() => {
  document.title = '半山 - 页面未找到'
})
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-20 text-center">
    <p class="text-6xl text-gray-300 dark:text-gray-700 mb-4">404</p>
    <p class="text-gray-500 dark:text-gray-400 mb-6">页面未找到</p>
    <RouterLink
      to="/"
      class="text-green-600 hover:text-green-800 dark:text-green-400 underline"
    >
      返回首页
    </RouterLink>
  </div>
</template>
