import { flights } from './flight'

function routeSeed(depCity, arrCity) {
  return [...`${depCity}-${arrCity}`].reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function dayNumber(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000)
}

export function getLowestPrice(depCity, arrCity, date) {
  if (!date) return null

  const routeFlights = flights.filter(
    (flight) =>
      flight.depAirport.includes(`(${depCity})`) && flight.arrAirport.includes(`(${arrCity})`),
  )

  if (!routeFlights.length) return null

  const economyPrices = routeFlights.flatMap((flight) =>
    flight.priceList.filter((item) => item.cabin === '经济舱').map((item) => item.price),
  )
  const allPrices = routeFlights.flatMap((flight) =>
    flight.priceList.map((item) => item.price),
  )
  const base = Math.min(...(economyPrices.length ? economyPrices : allPrices))

  const seed = dayNumber(date) + routeSeed(depCity, arrCity)
  const wave = Math.sin(seed * 0.7) * 0.07 + Math.cos(seed * 1.9) * 0.04
  const weekendUplift = [0, 6].includes(date.getDay()) ? 0.05 : 0

  return Math.max(300, Math.round((base * (1 + wave + weekendUplift)) / 10) * 10)
}