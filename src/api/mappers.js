import { airportLabel } from '../constants/airports'
import { CABIN_ORDER, cabinFromClass, cabinMeta } from '../constants/fare'

export const POS = 'AIRCHINA_CN'
export const PRICING_MODE = 'VERIFY'

/** 单程验价使用 VERIFY，往返使用 VALIDATE（与 /interface/Price_RQ_*.json 保持一致） */
export function pricingModeFor(searchType) {
  return searchType === 'HALF_ROUND_TRIP' ? 'VALIDATE' : 'VERIFY'
}

const FARE_FAMILY_NAMES = {
  DE5: '超值特价',
  DE2: '基础折扣',
  DE1: '经济全价',
  DEA1: '经济',
  DP1: '超经全价',
  DB2: '公务折扣',
  DB1: '公务',
  DBA1: '公务',
  STDECO: '经济标准',
  FLEXECO: '经济灵活',
  LTECO: '经济优惠',
  STDBIZ: '公务标准',
  FLEXBIZ: '公务灵活',
  LTBIZ: '公务优惠',
  STDFIRST: '头等标准',
  FLEXFIRST: '头等灵活',
  LTFIRST: '头等优惠',
}

/** 组装查询接口入参（接口样例见 /interface/Search_RQ_*.json） */
export function buildSearchRequest(params = {}) {
  const {
    tripType = 'oneway',
    depCity = '',
    arrCity = '',
    departDate = '',
    returnDate = '',
    adults = 1,
    children = 0,
    infants = 0,
  } = params

  const isRoundTrip = tripType === 'roundtrip'
  const originDestination = [
    {
      origin: { date: departDate, locationRef: { uri: `/geo/locations/A/${depCity}` } },
      destination: { locationRef: { uri: `/geo/locations/A/${arrCity}` } },
    },
  ]

  if (isRoundTrip) {
    originDestination.push({
      origin: { date: returnDate, locationRef: { uri: `/geo/locations/A/${arrCity}` } },
      destination: { locationRef: { uri: `/geo/locations/A/${depCity}` } },
    })
  }

  return {
    pos: POS,
    preferredCurrency: 'CNY',
    languageCode: 'en',
    originDestination,
    travelerComposition: [
      { count: adults, typeRef: { uri: '/info/traveler-types/AIR/ADT' } },
      { count: children, typeRef: { uri: '/info/traveler-types/AIR/CNN' } },
      { count: infants, typeRef: { uri: '/info/traveler-types/AIR/INF' } },
    ],
    travelPreferences: {
      searchType: isRoundTrip ? 'HALF_ROUND_TRIP' : 'ONE_WAY',
      flight: { flexibleDates: 'FALSE' },
    },
  }
}

/** 组装验价接口入参（接口样例见 /interface/Price_RQ_*.json） */
export function buildPriceRequest({ itineraryPriceRef, userSessionId, pricingMode = PRICING_MODE }) {
  return {
    itineraryPriceRQ: {
      itineraryPriceRef: [{ uri: itineraryPriceRef }],
      pricingMode,
    },
    languageCode: 'en',
    userSessionId,
  }
}

function amountOf(value) {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  return value.money?.amount ?? value.amount ?? null
}

function currencyOf(value) {
  return value?.money?.currency || value?.currency || ''
}

function roundAmount(value) {
  return Number.isFinite(value) ? Math.round(value) : null
}

function localizedName(list, preferred = ['zh_CN', 'en']) {
  if (!Array.isArray(list)) return ''
  for (const lang of preferred) {
    const hit = list.find((item) => item.language === lang)
    if (hit?.name) return hit.name
  }
  return list[0]?.name || ''
}

function codeFromRef(ref) {
  if (!ref) return ''
  if (ref.id) return String(ref.id).split(':').pop()
  const uri = ref.uri || ''
  return uri.split('/').pop() || ''
}

function timeOf(dateValue) {
  return typeof dateValue === 'string' && dateValue.length >= 16 ? dateValue.slice(11, 16) : ''
}

function dayPart(dateValue) {
  return typeof dateValue === 'string' ? dateValue.slice(0, 10) : ''
}

function dayOffset(from, to) {
  if (!from || !to) return 0
  const start = Date.parse(`${from}T00:00:00Z`)
  const end = Date.parse(`${to}T00:00:00Z`)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0
  return Math.max(0, Math.round((end - start) / 86400000))
}

/** ISO8601 duration → 界面格式（PT4H40M → 4h40m） */
export function isoToDuration(value) {
  if (!value) return ''
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/.exec(value)
  if (!match) return value
  const hours = Number(match[1] || 0) * 24 + Number(match[2] || 0)
  const minutes = Number(match[3] || 0)
  if (!hours && !minutes) return '0h'
  return `${hours ? `${hours}h` : ''}${minutes ? `${minutes}m` : ''}`
}

const AIRCRAFT_NAMES = {
  '737': '波音737',
  '738': '波音737-800',
  '73D': '波音737-800',
  '73H': '波音737-800',
  '73W': '波音737-800',
  '32A': '空客A320',
  '320': '空客A320',
  '32N': '空客A320neo',
  '321': '空客A321',
  '32Q': '空客A321neo',
  '330': '空客A330',
  '33A': '空客A330-300',
  '332': '空客A330-200',
  '350': '空客A350',
  '359': '空客A350-900',
  '773': '波音777-300',
  '77W': '波音777-300ER',
  '787': '波音787',
  '789': '波音787-9',
}

function aircraftLabel(aircraft) {
  if (!aircraft) return ''
  const code = aircraft.code || ''
  const local = AIRCRAFT_NAMES[code]
  if (local) return local
  const name = aircraft.name || ''
  // 接口有时直接返回机型三字码
  return name && name !== code ? name : code || '—'
}

function describeBaggage(allowance) {
  if (!Array.isArray(allowance) || !allowance.length) return null
  const pieces = new Set()
  const weights = new Set()
  allowance.forEach((item) => {
    const piece = item?.piece?.amount
    const weight = item?.weight?.amount
    if (Number.isFinite(piece) && piece > 0) pieces.add(piece)
    if (Number.isFinite(weight) && weight > 0) weights.add(weight)
  })
  const parts = []
  if (pieces.size) parts.push(`${Math.max(...pieces)}件`)
  if (weights.size) parts.push(`${Math.max(...weights)}千克`)
  return parts.length ? parts.join(' / ') : null
}

function findPenalty(policies, typePattern, penaltyKeys) {
  const policy = policies.find((item) => typePattern.test(item?.type || ''))
  if (!policy) return null
  for (const key of penaltyKeys) {
    const penalty = policy?.[key]?.penalty
    if (penalty) return penalty
  }
  return policy?.penalty || null
}

function describeFareRules(fareRules) {
  const info = fareRules?.ruleInfo || ''
  const policies = (fareRules?.policy || []).filter(Boolean)
  const changePenalty = findPenalty(policies, /CHANGE/i, ['change'])
  const refundPenalty = findPenalty(policies, /CANCEL|REFUND/i, ['cancel', 'refund'])
  const isFree = /免费|FREE/i.test(info)
  const refundAmount = roundAmount(amountOf(refundPenalty))
  const changeAmount = roundAmount(amountOf(changePenalty))

  let refundLabel = '—'
  if (isFree) refundLabel = '免费'
  else if (refundAmount !== null) refundLabel = `¥${refundAmount}`
  else if (/不得退|NONREF|NON-REF/i.test(info)) refundLabel = '不可退'
  else if (info) refundLabel = '收费'

  const refundText = isFree
    ? '可退票，免退票手续费，按实际票价退还差额。'
    : refundAmount !== null
      ? `退票收取 ¥${refundAmount} 退票手续费。`
      : /不得退|NONREF|NON-REF/i.test(info)
        ? `不可退票。${info}`
        : info
          ? `退票规则：${info}`
          : '以出票时的退改规则为准。'

  const changeText = isFree
    ? '可改期，免改期手续费，需补足票价差额。'
    : changeAmount !== null
      ? `改期收取 ¥${changeAmount} 改期手续费，另需补足票价差额。`
      : info
        ? `改期规则：${info}`
        : '以出票时的退改规则为准。'

  return {
    ruleInfo: info,
    refundLabel,
    refundText,
    changeText,
    tag: isFree ? '免费退改' : '退改收费',
  }
}

function minInventory(associations) {
  const values = (associations || [])
    .map((item) => item?.inventoryQuantity)
    .filter((value) => Number.isFinite(value) && value > 0)
  return values.length ? Math.min(...values) : null
}

function fareFamilyLabel(id, fareFamilies) {
  if (!id) return ''
  const known = fareFamilies.get(id)
  if (known) return known
  const code = id.split('@@@')[0]
  return FARE_FAMILY_NAMES[code] || code || id
}

function normalizeFare(price, fareFamilyId, fareFamilies) {
  if (!price) return null

  const totalPrice = price.totalPrice || {}
  const travelerPrices = price.travelerPrice || []
  const adult = travelerPrices.find((item) => item?.travelerTypeRef?.id === 'ADT') || travelerPrices[0]
  const baseAmount = amountOf(adult?.baseFare) ?? amountOf(totalPrice.baseFare)
  const taxedAmount = amountOf(adult?.totalFare) ?? amountOf(totalPrice.totalFare)
  const farePrice = (price.farePrice || [])[0] || {}
  const associations = farePrice.flightSegmentAssociation || []
  const cabinClass = associations[0]?.cabinClass || 'Y'
  const cabin = cabinFromClass(cabinClass)
  const meta = cabinMeta(cabin)
  const fareRules = farePrice.fareRules || {}
  const rules = describeFareRules(fareRules)
  const priceValue = roundAmount(baseAmount) ?? roundAmount(amountOf(totalPrice.baseFare)) ?? 0
  const taxValue =
    Number.isFinite(baseAmount) && Number.isFinite(taxedAmount)
      ? roundAmount(taxedAmount - baseAmount)
      : null

  return {
    id: price.id || farePrice.id || '',
    itineraryPriceId: price.id || '',
    itineraryPriceUri: price.uri || '',
    fareFamilyId: fareFamilyId || associations[0]?.fareFamilyRef?.id || '',
    name: fareFamilyLabel(fareFamilyId || associations[0]?.fareFamilyRef?.id, fareFamilies),
    fareBasisCode: farePrice.code || '',
    cabin,
    cabinClass,
    bookingClass: associations[0]?.bookingClass || '',
    price: priceValue,
    tax: taxValue,
    total: taxValue === null ? priceValue : priceValue + taxValue,
    currency: currencyOf(adult?.baseFare) || currencyOf(totalPrice.baseFare) || 'CNY',
    seats: minInventory(associations),
    baggage: describeBaggage(fareRules.baggageAllowance),
    baggageCarryOn: meta.carryOn,
    baggageChecked: describeBaggage(fareRules.baggageAllowance) || meta.checked,
    baggageNote: meta.baggageNote,
    mileage: meta.mileage,
    refundLabel: rules.refundLabel,
    refundText: rules.refundText,
    changeText: rules.changeText,
    refundTag: rules.tag,
    ruleInfo: rules.ruleInfo,
  }
}

function mapSegment(segment, locations) {
  const departure = segment?.departure || {}
  const arrival = segment?.arrival || {}
  const depCode = codeFromRef(departure.airportRef)
  const arrCode = codeFromRef(arrival.airportRef)
  const carrier = segment?.marketingAirlineRef?.id || ''
  const depDate = dayPart(departure.date)
  const arrDate = dayPart(arrival.date)

  return {
    id: segment?.id || '',
    carrier,
    flightNo: `${carrier}${segment?.flightNumber || ''}`,
    flightNumber: segment?.flightNumber || '',
    aircraftCode: segment?.aircraft?.code || '',
    aircraft: aircraftLabel(segment?.aircraft),
    depCode,
    arrCode,
    depAirport: airportLabel(depCode, locations.get(depCode)),
    arrAirport: airportLabel(arrCode, locations.get(arrCode)),
    depDate,
    arrDate,
    depTime: timeOf(departure.date),
    arrTime: timeOf(arrival.date),
    depTerminal: departure.terminal || '',
    arrTerminal: arrival.terminal || '',
    dayOffset: dayOffset(depDate, arrDate),
    duration: isoToDuration(segment?.duration),
    layover: isoToDuration(segment?.layover),
    stopQuantity: segment?.stopQuantity || 0,
    mealService: Boolean(segment?.mealService),
  }
}

function elapsedDuration(first, last) {
  if (!first?.depDate || !first?.depTime || !last?.arrDate || !last?.arrTime) return ''
  const start = Date.parse(`${first.depDate}T${first.depTime}:00`)
  const end = Date.parse(`${last.arrDate}T${last.arrTime}:00`)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return ''
  const minutes = Math.round((end - start) / 60000)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${hours}h${rest ? `${rest}m` : ''}`
}

function mapLeg(originDestination, index, locations) {
  const segments = (originDestination?.flightSegment || []).map((segment) =>
    mapSegment(segment, locations),
  )
  if (!segments.length) return null

  const first = segments[0]
  const last = segments[segments.length - 1]
  const offset = dayOffset(first.depDate, last.arrDate)

  return {
    label: index === 0 ? '去程' : '返程',
    segments,
    flightNo: first.flightNo,
    carrier: first.carrier,
    aircraft: first.aircraft,
    aircraftCode: first.aircraftCode,
    depCode: first.depCode,
    arrCode: last.arrCode,
    depAirport: first.depAirport,
    arrAirport: last.arrAirport,
    depTime: first.depTime,
    arrTime: last.arrTime,
    arrTimeSuffix: offset > 0 ? `+${offset}` : '',
    depDate: first.depDate,
    arrDate: last.arrDate,
    depTerminal: first.depTerminal,
    arrTerminal: last.arrTerminal,
    // 接口的 duration 是纯飞行时长；中转行程按起降时间计算总耗时（含经停）
    duration:
      (segments.length > 1 ? elapsedDuration(first, last) : '') ||
      isoToDuration(originDestination?.duration) ||
      first.duration,
  }
}

function priceRefsForOption(option) {
  const refs = new Map()
  ;(option?.fareFamilyOption || []).forEach((item) => {
    const ref = item?.itineraryPriceRef
    if (ref?.uri) refs.set(ref.uri, { uri: ref.uri, id: ref.id, fareFamilyId: item?.fareFamilyRef?.id })
  })
  ;(option?.itineraryPriceRef || []).forEach((ref) => {
    if (ref?.uri && !refs.has(ref.uri)) refs.set(ref.uri, { uri: ref.uri, id: ref.id })
  })
  return [...refs.values()]
}

function buildPriceList(option, priceById, fareFamilies) {
  const fares = priceRefsForOption(option)
    .map((ref) => {
      const price = priceById.get(ref.id) || priceById.get(ref.uri) || null
      return normalizeFare(price, ref.fareFamilyId, fareFamilies)
    })
    .filter(Boolean)

  const byCabin = new Map()
  fares.forEach((fare) => {
    if (!byCabin.has(fare.cabin)) byCabin.set(fare.cabin, [])
    byCabin.get(fare.cabin).push(fare)
  })

  return CABIN_ORDER.filter((cabin) => byCabin.has(cabin)).map((cabin) => {
    const cabinFares = byCabin.get(cabin).sort((a, b) => a.price - b.price)
    const cheapest = cabinFares[0]
    return {
      cabin,
      price: cheapest.price,
      baggage: cheapest.baggage,
      refundRule: cheapest.refundTag,
      seats: cheapest.seats,
      fares: cabinFares,
    }
  })
}

/**
 * 查询响应 → 界面数据模型
 * 接口样例见 /interface/Search_RS_OW.json、Search_RS_HRT_*.json
 */
export function mapSearchResponse(payload) {
  const empty = {
    sessionId: payload?.userSessionId || '',
    searchId: '',
    searchType: '',
    currency: 'CNY',
    flights: [],
  }
  const search = payload?.search
  if (!search) return empty

  const locations = new Map()
  ;(payload?.refs?.location || []).forEach((location) => {
    if (location?.code) locations.set(location.code, localizedName(location.name))
  })

  const fareFamilies = new Map()
  ;(search.fareFamily || []).forEach((family) => {
    if (family?.id) fareFamilies.set(family.id, localizedName(family.name))
  })

  const itineraryById = new Map()
  ;(search.itinerary || []).forEach((itinerary) => itineraryById.set(itinerary.id, itinerary))

  const priceById = new Map()
  ;(search.itineraryPrice || []).forEach((price) => {
    if (price?.id) priceById.set(price.id, price)
    if (price?.uri) priceById.set(price.uri, price)
  })

  const options = (search.originDestinationGroup || []).flatMap(
    (group) => group?.originDestinationOption || [],
  )

  const flights = options
    .map((option) => {
      const itinerary = itineraryById.get(option?.itineraryRef?.id)
      if (!itinerary) return null

      const legs = (itinerary.originDestination || [])
        .map((originDestination, index) => mapLeg(originDestination, index, locations))
        .filter(Boolean)
      if (!legs.length) return null

      const segments = legs.flatMap((leg) => leg.segments)
      const primary = legs[0]
      const isDirect = legs.every(
        (leg) => leg.segments.length === 1 && leg.segments[0].stopQuantity === 0,
      )
      const priceList = buildPriceList(option, priceById, fareFamilies)
      if (!priceList.length) return null

      return {
        key: `${option.id || itinerary.id}-${itinerary.id}`,
        id: option.id || itinerary.id,
        itineraryId: itinerary.id,
        legs,
        segments,
        flightNo: primary.flightNo,
        returnFlightNo: legs[1]?.flightNo || '',
        carrier: primary.carrier,
        aircraft: primary.aircraft,
        aircraftCode: primary.aircraftCode,
        depCode: primary.depCode,
        arrCode: primary.arrCode,
        depAirport: primary.depAirport,
        arrAirport: primary.arrAirport,
        depTime: primary.depTime,
        arrTime: primary.arrTime,
        arrTimeSuffix: primary.arrTimeSuffix,
        depTerminal: primary.depTerminal,
        arrTerminal: primary.arrTerminal,
        duration: primary.duration,
        isDirect,
        isAirChinaOperated: segments.every((segment) => segment.carrier === 'CA'),
        priceList,
        currency: currencyOf(itinerary.originDestination?.[0]?.totalYFare) || 'CNY',
      }
    })
    .filter(Boolean)

  return {
    sessionId: payload?.userSessionId || '',
    searchId: search.id || '',
    searchType: search.searchType || '',
    currency: payload?.preferredCurrency || 'CNY',
    flights,
  }
}

function normalizePriceBreakdown(totalPrice) {
  const baseFare = roundAmount(amountOf(totalPrice?.baseFare)) || 0
  const totalFare = roundAmount(amountOf(totalPrice?.totalFare)) || baseFare
  const taxes = (totalPrice?.tax || []).map((item) => ({
    code: item?.code || '',
    name: localizedName(item?.description) || item?.code || '税费',
    amount: roundAmount(amountOf(item?.value)) || 0,
  }))
  const fees = (totalPrice?.fee || []).map((item) => ({
    code: item?.code || '',
    name: localizedName(item?.description) || item?.code || '附加费',
    amount: roundAmount(amountOf(item?.value)) || 0,
  }))
  const taxTotal = taxes.reduce((sum, item) => sum + item.amount, 0)
  const feeTotal = fees.reduce((sum, item) => sum + item.amount, 0)

  return {
    currency: currencyOf(totalPrice?.totalFare) || currencyOf(totalPrice?.baseFare) || 'CNY',
    baseFare,
    total: totalFare || baseFare + taxTotal + feeTotal,
    taxes,
    fees,
    taxTotal,
    feeTotal,
  }
}

/**
 * 验价响应 → 订单价格模型
 * 接口样例见 /interface/Price_RS_OW.json、Price_RS_HRT.json
 */
export function mapPriceResponse(payload) {
  const offer = (payload?.offer || [])[0] || null
  const totalPrice = offer?.price || payload?.totalPrice || {}
  const breakdown = normalizePriceBreakdown(totalPrice)
  const itineraryPrice = offer?.air?.itineraryPrice || null

  const travelerPrices = (itineraryPrice?.travelerPrice || []).map((item) => ({
    type: item?.travelerTypeRef?.id || '',
    quantity: item?.travelerQuantity || 1,
    baseFare: roundAmount(amountOf(item?.baseFare)) || 0,
    totalFare: roundAmount(amountOf(item?.totalFare)) || 0,
  }))

  return {
    offerId: offer?.id || '',
    offerUri: offer?.uri || '',
    currency: breakdown.currency,
    ...breakdown,
    travelerPrices,
    fareBasisCode: itineraryPrice?.farePrice?.[0]?.code || '',
    expiration: payload?.expiration || null,
    raw: payload,
  }
}
