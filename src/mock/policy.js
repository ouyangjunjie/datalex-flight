export const cabinPolicies = {
  经济舱: {
    carryOn: '1 件，不超过 5kg，20×40×55cm',
    checked: '1 件，不超过 20kg，40×60×100cm',
    baggageNote: '超重或超件按航段收取逾重行李费',
    refund:
      '可退票。起飞前 7 天（含）以上收取票面价 10%，7 天内至起飞前收取 20%，起飞后收取 30%。',
    change:
      '可改期。起飞前 7 天（含）以上免费，7 天内至起飞前收取 10%，起飞后收取 20%。',
  },
  超级经济舱: {
    carryOn: '1 件，不超过 5kg，20×40×55cm',
    checked: '1 件，不超过 30kg，40×60×100cm',
    baggageNote: '超重或超件按航段收取逾重行李费',
    refund:
      '可退票。起飞前 7 天（含）以上收取票面价 5%，7 天内至起飞前收取 10%，起飞后收取 20%。',
    change:
      '可改期。起飞前 7 天（含）以上免费，7 天内至起飞前收取 5%，起飞后收取 10%。',
  },
  公务舱: {
    carryOn: '2 件，每件不超过 5kg',
    checked: '2 件，每件不超过 32kg',
    baggageNote: '优先行李提取，超限按公务舱标准收取逾重费',
    refund: '可退票，免退票手续费，按实际票价退还差额。',
    change: '可改期，免改期手续费，需补足票价差额。',
  },
}

export function getCabinPolicy(cabin, refundRule = '') {
  const base = cabinPolicies[cabin] || cabinPolicies['经济舱']

  if (refundRule.includes('免费')) {
    return {
      ...base,
      refund: '可退票，免退票手续费，按实际票价退还差额。',
      change: '可改期，免改期手续费，需补足票价差额。',
    }
  }

  return base
}