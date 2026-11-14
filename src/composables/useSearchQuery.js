import { reactive } from 'vue'

export const searchQuery = reactive({
  tripType: 'oneway',
  depCity: 'PEK',
  arrCity: 'PVG',
  departDate: '',
  returnDate: '',
  adults: 1,
  children: 0,
  infants: 0,
  disabledMilitary: 0,
  cabin: '经济舱',
})