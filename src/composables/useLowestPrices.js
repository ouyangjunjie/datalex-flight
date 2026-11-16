import { reactive } from 'vue'
import { searchAir } from '../api/flight'

// 价格日历/日期条的最低价：按航线+日期调用查询接口，并做缓存与并发限制。
// 后端为本地单实例服务，并发过高会拖慢主查询，因此串行拉取并在查询时暂停。
const MAX_CONCURRENT = 1
const LOOKUP_TIMEOUT = 20000

const prices = reactive({})
const loading = reactive({})
const pending = new Map()
const queue = []
let activeCount = 0
let paused = false

export function pauseLowestPrices() {
  paused = true
}

export function resumeLowestPrices() {
  paused = false
  drain()
}

function cacheKey(depCity, arrCity, date) {
  return `${depCity}-${arrCity}-${date}`
}

function lowestOf(flights) {
  let lowest = null
  ;(flights || []).forEach((flight) => {
    // 日期条与价格日历展示经济舱最低价，没有经济舱时退回全舱位最低价
    const cabinItems = flight.priceList || []
    const economy = cabinItems.find((item) => item.cabin === '经济舱')
    const candidates = economy ? [economy] : cabinItems
    candidates.forEach((item) => {
      if (Number.isFinite(item.price) && (lowest === null || item.price < lowest)) {
        lowest = item.price
      }
    })
  })
  return lowest
}

function drain() {
  while (!paused && activeCount < MAX_CONCURRENT && queue.length) {
    const job = queue.shift()
    activeCount += 1
    const { key, depCity, arrCity, date } = job

    searchAir(
      {
        tripType: 'oneway',
        depCity,
        arrCity,
        departDate: date,
        adults: 1,
        children: 0,
        infants: 0,
      },
      { timeout: LOOKUP_TIMEOUT },
    )
      .then((result) => {
        prices[key] = lowestOf(result.flights)
      })
      .catch(() => {
        // 网络/超时失败不缓存，下次进入该日期窗口时重试
        delete prices[key]
      })
      .finally(() => {
        loading[key] = false
        pending.delete(key)
        activeCount -= 1
        job.resolve(prices[key] ?? null)
        drain()
      })
  }
}

function fetchPrice(depCity, arrCity, date) {
  const key = cacheKey(depCity, arrCity, date)
  if (key in prices) return Promise.resolve(prices[key])
  if (pending.has(key)) return pending.get(key)

  const promise = new Promise((resolve) => {
    queue.push({ key, depCity, arrCity, date, resolve })
  })
  pending.set(key, promise)
  loading[key] = true
  drain()
  return promise
}

export function useLowestPrices() {
  function priceFor(depCity, arrCity, date) {
    if (!depCity || !arrCity || !date) return null
    const key = cacheKey(depCity, arrCity, date)
    return key in prices ? prices[key] : undefined
  }

  function isLoading(depCity, arrCity, date) {
    return Boolean(loading[cacheKey(depCity, arrCity, date)])
  }

  function loadPrices(depCity, arrCity, dates) {
    if (!depCity || !arrCity) return
    dates.filter(Boolean).forEach((date) => {
      fetchPrice(depCity, arrCity, date)
    })
  }

  return { prices, priceFor, isLoading, loadPrices }
}
