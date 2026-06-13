/**
 * 半山项目 - healthBridge.js
 * 功能简述：检测并调用原生 HealthKit bridge
 * 版本: 0.1.0
 * 最后修改: 2026-06-13
 * 修改说明: 初始创建，iOS WKWebView bridge 封装
 */

/** Whether we're running inside the iOS app with HealthKit access */
export function hasHealthBridge() {
  return typeof window !== 'undefined' && window.banshan?.fetchHealthData
}

/**
 * Fetch health data from native HealthKit via JS bridge.
 * Returns null if bridge is not available.
 */
export async function fetchHealthData() {
  if (!hasHealthBridge()) return null
  try {
    return await window.banshan.fetchHealthData()
  } catch (e) {
    console.warn('HealthKit bridge call failed:', e)
    return null
  }
}

/**
 * Format health data into a human-readable string for the AI prompt.
 */
export function formatHealthContext(data) {
  if (!data || !Object.keys(data).length) return ''

  const lines = ['\n[可穿戴设备数据（近7日）]']

  if (data.sleep?.avgHoursPerNight) {
    lines.push(`- 平均睡眠: ${data.sleep.avgHoursPerNight} 小时/晚（共 ${data.sleep.totalNights || '?'} 晚）`)
  }
  if (data.heartRate?.avg) {
    const rhr = Math.round(data.heartRate.avg)
    const range = data.heartRate.min && data.heartRate.max
      ? `（范围 ${Math.round(data.heartRate.min)}-${Math.round(data.heartRate.max)}）`
      : ''
    lines.push(`- 静息心率: ${rhr} bpm${range}`)
  }
  if (data.steps != null) {
    lines.push(`- 今日步数: ${data.steps}`)
  }
  if (data.weight) {
    lines.push(`- 最近体重: ${data.weight} kg`)
  }

  return lines.join('\n')
}

/**
 * Format a short summary for UI display.
 */
export function formatHealthSummary(data) {
  if (!data || !Object.keys(data).length) return ''
  const parts = []
  if (data.sleep?.avgHoursPerNight) {
    parts.push(`睡眠 ${data.sleep.avgHoursPerNight}h`)
  }
  if (data.heartRate?.avg) {
    parts.push(`心率 ${Math.round(data.heartRate.avg)}`)
  }
  if (data.steps != null) {
    parts.push(`${data.steps}步`)
  }
  return parts.join(' · ')
}
