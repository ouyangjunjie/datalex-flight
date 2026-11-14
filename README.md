# 爱达航机票查询 Demo

仿爱达航（DATALEX）机票查询与航班列表前端 Demo，基于 Vue 3 + Vite + Element Plus + TailwindCSS。
项目为纯静态页面，全部航班与城市数据来自本地 mock，**不包含真实订票、支付或后端接口**。

## 功能

- 顶部爱达航风格导航、语言切换、登录/注册入口（仅 UI）
- 机票查询：单程/往返、国内城市、出发/返程日期、成人/儿童数量、舱位
- 表单校验：起降城市不能相同、日期不能早于今天、返程不早于去程
- 价格日历：按航线展示未来两周每日经济舱最低含税价，点击日期同步日期并查询
- 查询结果页：购票进度、航线摘要、提示条、日期低价条、筛选与舱位价格表
- 排序：按出发/到达/总时长或各舱位价格排序；支持直飞/实际承运筛选
- 点击舱位价格或“航班详情”打开详情弹窗：机型、行李细则、退改完整条款
- 重新查询返回搜索页；结果页日期条可切换日期并刷新查询
- 搜索 loading、无结果空状态
- 响应式布局：PC 优先，移动端导航抽屉、可横向滑动的进度/日期条与纵向航班卡片

## 启动

```bash
npm install
npm run dev
```

默认访问地址：<http://localhost:5173/>

- `/` 会自动重定向到 `/flight-search`
- 未知路径也会重定向到 `/flight-search`
- 端口被占用时 Vite 会自动切换端口，请以终端输出为准

## 打包

```bash
npm run build     # 输出到 dist/
npm run preview   # 本地预览打包结果
```

说明：

- `dist/` 为纯静态资源，可部署到任意静态服务器。
- 路由使用 HTML5 History 模式，静态托管时需要配置 fallback 到 `index.html`。
- 全量引入 Element Plus 会使主包超过 500 kB，构建时的 chunk-size 警告属于预期。

## 目录结构

```
src/
├── App.vue                 # Header + RouterView + Footer
├── main.js                 # Element Plus 全局注册、中文 locale、路由
├── router/index.js         # /flight-search 路由与重定向
├── views/FlightSearch.vue  # 搜索页/结果页切换，航线摘要与提示条
├── utils/date.js           # 日期解析、格式化与星期文案
├── composables/
│   └── useSearchQuery.js   # 查询表单与价格日历共享的响应式查询状态
├── components/
│   ├── Header.vue          # 顶部导航
│   ├── Footer.vue          # 页脚
│   ├── FlightSearchForm.vue# 查询表单，emit search
│   ├── PriceCalendar.vue   # 未来两周每日最低价日历
│   ├── BookingSteps.vue    # 购票进度条
│   ├── NoticeBar.vue       # 可展开的提示条
│   ├── ResultsDateStrip.vue# 结果页日期低价条
│   ├── FlightFareTable.vue # 筛选、排序与舱位价格表
│   ├── FlightItem.vue      # 价格表中的单条航班（含详情弹窗）
│   └── FlightDetailDialog.vue # 航班详情弹窗
├── mock/
│   ├── flight.js           # 10 条 CA 航班
│   ├── city.js             # 国内城市/机场
│   ├── price.js            # 按航线/日期生成稳定的最低价
│   └── policy.js           # 行李与退改条款
└── style.css               # Tailwind 与全局基础样式
```

## Mock 字段

### `src/mock/flight.js`

`flights` 为航班数组，每位航班包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `flightNo` | string | 航班号，如 `CA8357` |
| `aircraft` | string | 机型，如 `空客A330-300` |
| `depAirport` | string | 出发机场，格式 `城市机场(三字码)` |
| `arrAirport` | string | 到达机场，格式同上 |
| `depTime` | string | 起飞时间 `HH:mm` |
| `arrTime` | string | 到达时间 `HH:mm` |
| `duration` | string | 飞行时长，如 `2h25m` |
| `priceList` | array | 舱位价格列表 |
| `isDirect` | boolean | 是否直飞 |

`priceList` 每项字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `cabin` | string | `经济舱` / `超级经济舱` / `公务舱` |
| `price` | number | 票价（元） |
| `baggage` | string | 免费行李额，如 `20kg` |
| `refundRule` | string | 退改规则，如 `退改收费` / `免费退改` |

### `src/mock/city.js`

`cities` 每项字段：`code`（三字码）、`name`（城市名）、`airport`（机场名）。

`src/mock/policy.js` 提供 `cabinPolicies`（按舱位的随身行李、托运行李、超限说明、退票与改期条款），详情弹窗按航班的 `priceList` 组合展示。

`src/mock/price.js` 的 `getLowestPrice(depCity, arrCity, date)` 以航线经济舱最低价为基准，结合日期与航线生成稳定的每日最低价，用于价格日历和结果页日期条，无真实报价含义。价格日历默认展示今天所在周起的两周，可前后翻周；点击日期会同步查询表单并触发单程查询。

结果页日期条默认以所选日期为中心展示 7 天，可前后翻周，并通过“更多日期”打开日期选择器；点击日期会刷新航线摘要与价格表。

> 注意：mock 航班主要覆盖北京 `PEK` 往返上海 `PVG`，以及北京至广州 `CAN`、成都 `CTU`、深圳 `SZX`。其他城市组合会展示空状态，价格日历也会提示暂无价格数据。