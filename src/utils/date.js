export function parseDate(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

export function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function startOfToday() {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

export function addDays(date, days) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  result.setDate(result.getDate() + days)
  return result
}

export function weekdayLabel(date) {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
}

export function formatChineseDate(value) {
  const date = parseDate(value)
  if (!date) return ''
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdayLabel(date)}`
}

export function formatMonthDay(date) {
  return `${date.getMonth() + 1}-${date.getDate()}`
}