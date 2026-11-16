import { http } from './client'
import {
  buildPriceRequest,
  buildSearchRequest,
  mapPriceResponse,
  mapSearchResponse,
} from './mappers'

/**
 * 航班查询
 * 无航班时接口返回 404 + NO_FLIGHTS_FOUND，按空结果处理。
 */
export async function searchAir(params, config) {
  try {
    const { data } = await http.post('/search', buildSearchRequest(params), config)
    return mapSearchResponse(data)
  } catch (error) {
    if (error?.code === 'NO_FLIGHTS_FOUND') {
      return mapSearchResponse(null)
    }
    throw error
  }
}

/** 验价（预订前） */
export async function priceAir({ itineraryPriceRef, userSessionId, pricingMode }) {
  const { data } = await http.post(
    '/price',
    buildPriceRequest({ itineraryPriceRef, userSessionId, pricingMode }),
  )
  return mapPriceResponse(data)
}
