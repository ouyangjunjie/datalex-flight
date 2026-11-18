// 机场静态字典与查询辅助。业务航班数据全部来自接口，这里只提供机场名称、
// 城市、三字码，以及下拉框需要的分组/搜索能力。
import { airports } from './airportData'

export { airports }

export const regions = [
  { key: 'domestic', label: '国内' },
  { key: 'international', label: '国际及港澳台地区' },
]

export const alphabetGroups = [
  { key: 'hot', label: '热门城市' },
  { key: 'ABCDE', label: 'ABCDE', letters: 'ABCDE' },
  { key: 'FGHIJ', label: 'FGHIJ', letters: 'FGHIJ' },
  { key: 'KLMNO', label: 'KLMNO', letters: 'KLMNO' },
  { key: 'PQRST', label: 'PQRST', letters: 'PQRST' },
  { key: 'UVWXYZ', label: 'UVWXYZ', letters: 'UVWXYZ' },
]

export function groupForInitial(initial) {
  const group = alphabetGroups.find((item) => item.letters?.includes(initial))
  return group?.key || 'hot'
}

export const cities = airports.map(({ code, name, airport }) => ({ code, name, airport }))

const airportByCodeMap = new Map(airports.map((airport) => [airport.code, airport]))

export function airportByCode(code) {
  return code ? airportByCodeMap.get(code) || null : null
}

export function cityName(code) {
  return airportByCode(code)?.city || code || ''
}

export function airportName(code) {
  return airportByCode(code)?.name || ''
}

/** 生成界面使用的机场文案，如「北京首都(PEK)」；未收录的三字码使用接口返回的名称 */
export function airportLabel(code, fallbackName = '') {
  if (!code) return ''
  const name = airportByCode(code)?.name || fallbackName || code
  return `${name}(${code})`
}

/** 按中文名 / 城市 / 拼音 / 三字码 / 机场全名模糊搜索 */
export function searchAirports(keyword) {
  const query = String(keyword || '').trim().toLowerCase()
  if (!query) return []
  return airports.filter((airport) => airport.searchText.includes(query))
}
