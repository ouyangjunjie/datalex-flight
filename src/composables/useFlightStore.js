import { reactive } from 'vue'
import { priceAir, searchAir } from '../api/flight'
import { pricingModeFor } from '../api/mappers'
import { pauseLowestPrices, resumeLowestPrices } from './useLowestPrices'

const DRAFT_KEY = 'datalex-flight-booking'

/** 全局查询状态（查询页与结果列表共享） */
export const flightStore = reactive({
  sessionId: '',
  searchId: '',
  searchType: '',
  currency: 'CNY',
  query: null,
  flights: [],
  loading: false,
  searched: false,
  error: '',
})

export async function runSearch(params) {
  flightStore.loading = true
  flightStore.error = ''
  pauseLowestPrices()
  try {
    const result = await searchAir(params)
    flightStore.sessionId = result.sessionId || ''
    flightStore.searchId = result.searchId
    flightStore.searchType = result.searchType
    flightStore.currency = result.currency || 'CNY'
    flightStore.query = params
    flightStore.flights = result.flights
    flightStore.searched = true
    return result
  } catch (error) {
    flightStore.flights = []
    flightStore.searched = true
    flightStore.error = error?.message || '航班查询失败，请稍后重试'
    throw error
  } finally {
    flightStore.loading = false
    resumeLowestPrices()
  }
}

export function clearSearch() {
  flightStore.sessionId = ''
  flightStore.searchId = ''
  flightStore.searchType = ''
  flightStore.query = null
  flightStore.flights = []
  flightStore.searched = false
  flightStore.error = ''
}

/**
 * 调用验价接口，成功后把结果写入 sessionStorage 供预订页使用。
 */
export async function verifyFare(flight, fare) {
  if (!flightStore.sessionId) {
    throw new Error('查询会话已失效，请重新查询航班')
  }
  if (!fare?.itineraryPriceUri) {
    throw new Error('该票价不支持验价，请重新查询')
  }

  const price = await priceAir({
    itineraryPriceRef: fare.itineraryPriceUri,
    userSessionId: flightStore.sessionId,
    pricingMode: pricingModeFor(flightStore.searchType),
  })

  const draft = {
    sessionId: flightStore.sessionId,
    searchType: flightStore.searchType,
    query: flightStore.query,
    flight,
    fare,
    price,
    savedAt: Date.now(),
  }
  saveBookingDraft(draft)
  return draft
}

export function saveBookingDraft(draft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // 忽略隐私模式下的存储失败，页面仍可通过返回值使用数据
  }
}

export function readBookingDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearBookingDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // ignore
  }
}
