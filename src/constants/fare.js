// 舱位顺序与静态服务标准（随身行李、里程累积等接口未提供的通用规则）。
export const CABIN_ORDER = ['头等舱', '公务舱', '超级经济舱', '经济舱']

const CABIN_META = {
  头等舱: {
    carryOn: '2 件，每件不超过 5kg',
    checked: '2 件，每件不超过 32kg',
    baggageNote: '优先行李提取，超限按头等舱标准收取逾重费',
    mileage: '300%',
  },
  公务舱: {
    carryOn: '2 件，每件不超过 5kg',
    checked: '2 件，每件不超过 32kg',
    baggageNote: '优先行李提取，超限按公务舱标准收取逾重费',
    mileage: '300%',
  },
  超级经济舱: {
    carryOn: '1 件，不超过 5kg，20×40×55cm',
    checked: '1 件，不超过 30kg，40×60×100cm',
    baggageNote: '超重或超件按航段收取逾重行李费',
    mileage: '110%',
  },
  经济舱: {
    carryOn: '1 件，不超过 5kg，20×40×55cm',
    checked: '1 件，不超过 20kg，40×60×100cm',
    baggageNote: '超重或超件按航段收取逾重行李费',
    mileage: '100%',
  },
}

export function cabinMeta(cabin) {
  return CABIN_META[cabin] || CABIN_META['经济舱']
}

const CABIN_BY_CLASS = {
  F: '头等舱',
  A: '头等舱',
  J: '公务舱',
  C: '公务舱',
  D: '公务舱',
  I: '公务舱',
  R: '公务舱',
  W: '超级经济舱',
  E: '超级经济舱',
  G: '超级经济舱',
  Y: '经济舱',
}

/** 将接口的 cabinClass（F/J/W/Y/G）映射到界面舱位名称 */
export function cabinFromClass(cabinClass) {
  return CABIN_BY_CLASS[String(cabinClass || '').toUpperCase()] || '经济舱'
}
