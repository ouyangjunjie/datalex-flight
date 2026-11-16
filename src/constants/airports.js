// 机场/城市静态字典：用于搜索表单选项与界面中文名称展示。
// 航班、价格等业务数据全部来自接口，这里仅补充接口未返回的中文名称。
const AIRPORT_NAMES = {
  PEK: '北京首都',
  PKX: '北京大兴',
  PVG: '上海浦东',
  SHA: '上海虹桥',
  CAN: '广州白云',
  SZX: '深圳宝安',
  TFU: '成都天府',
  CTU: '成都双流',
  CKG: '重庆江北',
  HGH: '杭州萧山',
  XIY: '西安咸阳',
  KMG: '昆明长水',
  WUH: '武汉天河',
  NKG: '南京禄口',
  DLC: '大连周水子',
  TSN: '天津滨海',
  TAO: '青岛胶东',
  XMN: '厦门高崎',
  FOC: '福州长乐',
  HAK: '海口美兰',
  SYX: '三亚凤凰',
  URC: '乌鲁木齐地窝堡',
  HRB: '哈尔滨太平',
  SHE: '沈阳桃仙',
  CSX: '长沙黄花',
  FRA: '法兰克福',
  MUC: '慕尼黑',
  LHR: '伦敦希思罗',
  CDG: '巴黎戴高乐',
  JFK: '纽约肯尼迪',
  LAX: '洛杉矶',
  HKG: '香港',
  TPE: '台北桃园',
}

export const cities = [
  { code: 'PEK', name: '北京', airport: '首都国际机场' },
  { code: 'PKX', name: '北京', airport: '大兴国际机场' },
  { code: 'PVG', name: '上海', airport: '浦东国际机场' },
  { code: 'SHA', name: '上海', airport: '虹桥国际机场' },
  { code: 'CAN', name: '广州', airport: '白云国际机场' },
  { code: 'SZX', name: '深圳', airport: '宝安国际机场' },
  { code: 'TFU', name: '成都', airport: '天府国际机场' },
  { code: 'CTU', name: '成都', airport: '双流国际机场' },
  { code: 'CKG', name: '重庆', airport: '江北国际机场' },
  { code: 'HGH', name: '杭州', airport: '萧山国际机场' },
  { code: 'XIY', name: '西安', airport: '咸阳国际机场' },
  { code: 'KMG', name: '昆明', airport: '长水国际机场' },
  { code: 'WUH', name: '武汉', airport: '天河国际机场' },
  { code: 'NKG', name: '南京', airport: '禄口国际机场' },
  { code: 'DLC', name: '大连', airport: '周水子国际机场' },
  { code: 'FRA', name: '法兰克福', airport: '法兰克福国际机场' },
]

const cityByCode = new Map(cities.map((city) => [city.code, city]))

export function cityName(code) {
  return cityByCode.get(code)?.name || code || ''
}

export function airportName(code) {
  return AIRPORT_NAMES[code] || ''
}

/** 生成界面使用的机场文案，如「北京首都(PEK)」 */
export function airportLabel(code, fallbackName = '') {
  if (!code) return ''
  const name = AIRPORT_NAMES[code] || fallbackName || code
  return `${name}(${code})`
}
