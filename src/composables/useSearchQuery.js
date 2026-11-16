import { reactive } from 'vue'
import { addDays, formatDate, startOfToday } from '../utils/date'

// 默认查询日期：今天之后第 12 天（示例后端在售日期附近）
const defaultDepartDate = formatDate(addDays(startOfToday(), 12))

export const searchQuery = reactive({
  tripType: 'oneway',
  depCity: 'PEK',
  arrCity: 'TFU',
  departDate: defaultDepartDate,
  returnDate: '',
  adults: 1,
  children: 0,
  infants: 0,
  disabledMilitary: 0,
  cabin: '经济舱',
})
