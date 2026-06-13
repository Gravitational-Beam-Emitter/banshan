/**
 * 半山项目 - strings.js
 * 功能简述：所有用户可见的文本字符串，方便后续国际化
 * 版本: 0.1.0
 * 最后修改: 2026-06-13
 * 修改说明: 初始创建
 */

export const APP_NAME = '半山'

export const UI = {
  homeTitle: '半山 · 健康自检',
  inputPlaceholder: '描述你的身体感受，越具体越好...',
  submitButton: '开始分析',
  analyzing: '分析中...',
  historyTitle: '历史记录',
  noHistory: '还没有分析记录',
  clearHistory: '清空记录',
}

export const LEVEL_LABELS = {
  green: '大概率正常',
  yellow: '需要观察',
  red: '建议就医',
}

export const ERRORS = {
  apiFailed: '分析失败，请稍后重试',
  emptyInput: '请描述你的症状',
  tooShort: '描述太短了，请多写一些细节',
}
