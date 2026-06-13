/**
 * 半山项目 - api.js
 * 功能简述：DeepSeek API 直连调用，API Key 由用户本地管理
 * 版本: 0.2.0
 * 最后修改: 2026-06-13
 * 修改说明: 去掉代理层，直连 DeepSeek，Key 存 localStorage
 */
import { SYSTEM_PROMPT } from '../shared/prompts.js'

const BASE_URL = 'https://api.deepseek.com'

/** Get API key from localStorage */
export function getApiKey() {
  return localStorage.getItem('banshan_api_key') || ''
}

/** Save API key to localStorage */
export function setApiKey(key) {
  localStorage.setItem('banshan_api_key', key)
}

/** Check if API key is configured */
export function hasApiKey() {
  return !!getApiKey()
}

/**
 * Stream symptom analysis from DeepSeek API via SSE.
 * @param {string} symptom
 * @param {(text: string) => void} onChunk
 * @returns {Promise<{green: Object, yellow: Object, red: Object}>}
 */
export async function analyzeSymptomStream(symptom, onChunk) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('API key not configured')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: symptom },
      ],
      temperature: 0.7,
      stream: true,
    }),
    signal: controller.signal,
  })
  clearTimeout(timeout)

  if (!response.ok) {
    if (response.status === 401) throw new Error('API Key 无效，请重新设置')
    throw new Error(`API error: ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let content = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6)
      if (payload === '[DONE]') continue

      try {
        const delta = JSON.parse(payload).choices?.[0]?.delta?.content
        if (delta) {
          content += delta
          onChunk(content)
        }
      } catch {
        // skip unparseable SSE chunks
      }
    }
  }

  const parsed = JSON.parse(content)
  if (!parsed.green || !parsed.yellow || !parsed.red) {
    throw new Error('Invalid response format: missing level keys')
  }
  return parsed
}

/** Non-streaming fallback */
export async function analyzeSymptom(symptom) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('API key not configured')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: symptom },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
    signal: controller.signal,
  })
  clearTimeout(timeout)

  if (!response.ok) {
    if (response.status === 401) throw new Error('API Key 无效，请重新设置')
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  const parsed = JSON.parse(data.choices[0].message.content)

  if (!parsed.green || !parsed.yellow || !parsed.red) {
    throw new Error('Invalid response format: missing level keys')
  }

  return parsed
}
