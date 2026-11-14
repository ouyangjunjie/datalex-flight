export const flights = [
  {
    flightNo: 'CA8357',
    aircraft: '空客A330-300',
    depAirport: '北京首都(PEK)',
    arrAirport: '上海浦东(PVG)',
    depTime: '07:30',
    arrTime: '09:55',
    duration: '2h25m',
    priceList: [
      { cabin: '经济舱', price: 930, baggage: '20kg', refundRule: '退改收费' },
      { cabin: '超级经济舱', price: 2150, baggage: '30kg', refundRule: '退改收费' },
      { cabin: '公务舱', price: 2280, baggage: '30kg', refundRule: '免费退改' },
    ],
    isDirect: true,
  },
  {
    flightNo: 'CA8501',
    aircraft: '空客A350-900',
    depAirport: '北京首都(PEK)',
    arrAirport: '上海浦东(PVG)',
    depTime: '13:00',
    arrTime: '15:20',
    duration: '2h20m',
    priceList: [
      { cabin: '经济舱', price: 710, baggage: '20kg', refundRule: '退改收费' },
      { cabin: '超级经济舱', price: 1980, baggage: '30kg', refundRule: '退改收费' },
      { cabin: '公务舱', price: 2280, baggage: '30kg', refundRule: '免费退改' },
    ],
    isDirect: true,
  },
  {
    flightNo: 'CA1831',
    aircraft: '波音737-800',
    depAirport: '北京首都(PEK)',
    arrAirport: '上海浦东(PVG)',
    depTime: '18:30',
    arrTime: '20:50',
    duration: '2h20m',
    priceList: [
      { cabin: '经济舱', price: 680, baggage: '20kg', refundRule: '退改收费' },
      { cabin: '超级经济舱', price: 1860, baggage: '30kg', refundRule: '退改收费' },
      { cabin: '公务舱', price: 2460, baggage: '30kg', refundRule: '免费退改' },
    ],
    isDirect: true,
  },
  {
    flightNo: 'CA1501',
    aircraft: '空客A321',
    depAirport: '北京首都(PEK)',
    arrAirport: '上海浦东(PVG)',
    depTime: '08:00',
    arrTime: '12:10',
    duration: '4h10m',
    priceList: [
      { cabin: '经济舱', price: 560, baggage: '20kg', refundRule: '退改收费' },
      { cabin: '超级经济舱', price: 1520, baggage: '30kg', refundRule: '退改收费' },
      { cabin: '公务舱', price: 2180, baggage: '30kg', refundRule: '免费退改' },
    ],
    isDirect: false,
  },
  {
    flightNo: 'CA1858',
    aircraft: '空客A330-200',
    depAirport: '北京首都(PEK)',
    arrAirport: '上海浦东(PVG)',
    depTime: '21:10',
    arrTime: '23:35',
    duration: '2h25m',
    priceList: [
      { cabin: '经济舱', price: 620, baggage: '20kg', refundRule: '退改收费' },
      { cabin: '超级经济舱', price: 1740, baggage: '30kg', refundRule: '退改收费' },
      { cabin: '公务舱', price: 2380, baggage: '30kg', refundRule: '免费退改' },
    ],
    isDirect: true,
  },
  {
    flightNo: 'CA1301',
    aircraft: '波音777-300ER',
    depAirport: '北京首都(PEK)',
    arrAirport: '广州白云(CAN)',
    depTime: '09:15',
    arrTime: '12:40',
    duration: '3h25m',
    priceList: [
      { cabin: '经济舱', price: 1080, baggage: '20kg', refundRule: '退改收费' },
      { cabin: '超级经济舱', price: 2360, baggage: '30kg', refundRule: '退改收费' },
      { cabin: '公务舱', price: 3680, baggage: '30kg', refundRule: '免费退改' },
    ],
    isDirect: true,
  },
  {
    flightNo: 'CA1351',
    aircraft: '空客A330-300',
    depAirport: '北京首都(PEK)',
    arrAirport: '广州白云(CAN)',
    depTime: '16:40',
    arrTime: '20:05',
    duration: '3h25m',
    priceList: [
      { cabin: '经济舱', price: 980, baggage: '20kg', refundRule: '退改收费' },
      { cabin: '超级经济舱', price: 2240, baggage: '30kg', refundRule: '退改收费' },
      { cabin: '公务舱', price: 3520, baggage: '30kg', refundRule: '免费退改' },
    ],
    isDirect: true,
  },
  {
    flightNo: 'CA1405',
    aircraft: '空客A320neo',
    depAirport: '北京首都(PEK)',
    arrAirport: '成都天府(CTU)',
    depTime: '10:30',
    arrTime: '13:45',
    duration: '3h15m',
    priceList: [
      { cabin: '经济舱', price: 890, baggage: '20kg', refundRule: '退改收费' },
      { cabin: '超级经济舱', price: 2080, baggage: '30kg', refundRule: '退改收费' },
      { cabin: '公务舱', price: 3280, baggage: '30kg', refundRule: '免费退改' },
    ],
    isDirect: true,
  },
  {
    flightNo: 'CA4102',
    aircraft: '波音737-800',
    depAirport: '北京首都(PEK)',
    arrAirport: '成都天府(CTU)',
    depTime: '19:20',
    arrTime: '22:35',
    duration: '3h15m',
    priceList: [
      { cabin: '经济舱', price: 760, baggage: '20kg', refundRule: '退改收费' },
      { cabin: '超级经济舱', price: 1920, baggage: '30kg', refundRule: '退改收费' },
      { cabin: '公务舱', price: 3160, baggage: '30kg', refundRule: '免费退改' },
    ],
    isDirect: true,
  },
  {
    flightNo: 'CA1883',
    aircraft: '空客A321neo',
    depAirport: '北京首都(PEK)',
    arrAirport: '深圳宝安(SZX)',
    depTime: '11:00',
    arrTime: '14:25',
    duration: '3h25m',
    priceList: [
      { cabin: '经济舱', price: 1120, baggage: '20kg', refundRule: '退改收费' },
      { cabin: '超级经济舱', price: 2460, baggage: '30kg', refundRule: '退改收费' },
      { cabin: '公务舱', price: 3780, baggage: '30kg', refundRule: '免费退改' },
    ],
    isDirect: true,
  },
]

function reverseFlight(flight) {
  const number = Number(flight.flightNo.replace(/\D/g, ''))
  const nextNumber = String((number % 9999) + 1).padStart(4, '0')

  return {
    ...flight,
    flightNo: `CA${nextNumber}`,
    depAirport: flight.arrAirport,
    arrAirport: flight.depAirport,
    depTime: flight.arrTime,
    arrTime: flight.depTime,
    priceList: flight.priceList.map((item) => ({ ...item })),
  }
}

export function getFlightsByRoute(depCity, arrCity) {
  const direct = flights.filter(
    (flight) =>
      flight.depAirport.includes(`(${depCity})`) && flight.arrAirport.includes(`(${arrCity})`),
  )

  if (direct.length) return direct

  const opposite = flights.filter(
    (flight) =>
      flight.depAirport.includes(`(${arrCity})`) && flight.arrAirport.includes(`(${depCity})`),
  )

  return opposite.map(reverseFlight)
}
