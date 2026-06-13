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

  const lines = ['\n[健康数据（近7日）]']

  if (data.sleep?.avgHoursPerNight) {
    lines.push(`- 平均睡眠: ${data.sleep.avgHoursPerNight} 小时/晚`)
  }
  if (data.heartRate?.avg) {
    lines.push(`- 平均心率: ${Math.round(data.heartRate.avg)} bpm`)
  }
  if (data.steps != null) {
    lines.push(`- 今日步数: ${data.steps}`)
  }
  if (data.weight) {
    lines.push(`- 体重: ${data.weight} kg`)
  }

  return lines.length > 1 ? lines.join('\n') : ''
}
