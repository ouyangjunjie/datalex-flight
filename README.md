# 爱达航机票查询 Demo

仿爱达航（DATALEX）机票查询、航班列表与预订信息前端 Demo，基于 Vue 3 + Vite + Element Plus + TailwindCSS。
航班与运价数据来自本地查询服务（`/tdprest-2/api/air/search` 与 `/price`），
项目不包含真实支付与登录。

## 功能

- 顶部爱达航风格导航、语言切换、登录/注册入口（仅 UI）
- 机票查询：单程/往返、国内城市、出发/返程日期、成人/儿童数量、舱位
- 表单校验：起降城市不能相同、日期不能早于今天、返程不早于去程
- 价格日历：按航线展示未来两周每日经济舱最低价，点击日期同步日期并查询
- 查询结果页：购票进度、航线摘要、提示条、日期低价条、筛选与舱位价格表
- 往返查询一次返回组合行程，列表中同时展示去程与返程，票价为往返总价
- 排序：按出发/到达/总时长或各舱位价格排序；支持直飞/实际承运筛选
- 点击舱位价格或“航班详情”打开详情弹窗：机型、行李细则、退改完整条款
- 预订前调用验价接口，成功后进入预订信息页展示实时票价、税费与乘机人
- 重新查询返回搜索页；结果页日期条可切换日期并刷新查询
- 搜索 loading、无结果空状态、接口失败提示与重试
- 响应式布局：PC 优先，移动端导航抽屉、可横向滑动的进度/日期条与纵向航班卡片

## 启动

需要先启动本地查询服务（默认 `http://127.0.0.1:9090`），然后：

```bash
npm install
npm run dev
```

默认访问地址：<http://localhost:5173/>

- `/` 会自动重定向到 `/flight-search`
- 未知路径也会重定向到 `/flight-search`
- 端口被占用时 Vite 会自动切换端口，请以终端输出为准
- 开发与预览环境均通过 Vite 代理访问 `/tdprest-2`，避免浏览器跨域

如需指向其他服务地址，可设置环境变量：

```bash
VITE_API_BASE_URL=http://127.0.0.1:9090/tdprest-2/api/air npm run dev
```

## 打包

```bash
npm run build     # 输出到 dist/
npm run preview   # 本地预览打包结果
```

说明：

- `dist/` 为纯静态资源，可部署到任意静态服务器。
- 路由使用 HTML5 History 模式，静态托管时需要配置 fallback 到 `index.html`。
- 生产部署时同样需要把 `/tdprest-2` 反向代理到查询服务。
- 全量引入 Element Plus 会使主包超过 500 kB，构建时的 chunk-size 警告属于预期。

## 目录结构

```
src/
├── App.vue                 # Header + RouterView + Footer
├── main.js                 # Element Plus 全局注册、中文 locale、路由
├── router/index.js         # /flight-search、/booking-info 路由与重定向
├── api/
│   ├── client.js           # axios 实例、JSON Accept 头、ApiError
│   ├── flight.js           # searchAir / priceAir
│   └── mappers.js          # 请求组装与响应映射
├── views/
│   ├── FlightSearch.vue    # 搜索页/结果页切换，航线摘要与提示条
│   └── BookingInfo.vue     # 预订信息与价格明细
├── utils/date.js           # 日期解析、格式化与星期文案
├── composables/
│   ├── useSearchQuery.js   # 查询表单与价格日历共享的响应式查询状态
│   ├── useFlightStore.js   # 查询状态、验价与预订草稿
│   └── useLowestPrices.js  # 日历/日期条的每日最低价查询
├── constants/
│   ├── airports.js         # 城市/机场字典与中文名称
│   ├── fare.js             # 舱位顺序、舱位映射、行李服务标准
│   └── notices.js          # 预订须知文案
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
└── style.css               # Tailwind 与全局基础样式
```

## 数据接口

- 查询：`POST /tdprest-2/api/air/search`
- 验价：`POST /tdprest-2/api/air/price`
- 请求/响应样例位于 `interface/`：`RQ` 为请求、`RS` 为响应、`OW` 为单程、`HRT` 为往返。
- 请求必须携带 `Accept: application/json`，否则服务返回 XML。

查询行为：

- 单程请求 `searchType: ONE_WAY`，往返请求 `searchType: HALF_ROUND_TRIP`，并在一次请求中携带去程、返程两个 `originDestination`。
- 界面票价取成人（`ADT`）单人基础票价；预订页使用验价响应的完整价格（基础票价 + 税费 + 附加费）。
- 无航班时接口返回 `404 NO_FLIGHTS_FOUND`，前端按空结果展示，不作为错误。
- 价格日历与结果页日期条对每个日期分别调用查询接口取最低价，带缓存与并发限制。

核心映射字段（`src/api/mappers.js`）：

| 界面字段 | 来源 |
| --- | --- |
| `flightNo` / `carrier` | `flightSegment.flightNumber` / `marketingAirlineRef` |
| `depAirport` / `arrAirport` | 航段机场三字码 + `refs.location` 名称 |
| `depTime` / `arrTime` | `departure.date` / `arrival.date` |
| `duration` | ISO8601 时长，如 `PT4H40M` → `4h40m` |
| `legs` | `itinerary.originDestination`，去程/返程 |
| `priceList` | `fareFamilyOption[].itineraryPriceRef` 对应的 `itineraryPrice` |
| `cabin` | `farePrice[].flightSegmentAssociation[].cabinClass` |
| `baggage` / 退改 | `fareRules.baggageAllowance` / `fareRules.policy` |
| 验价明细 | `offer.price.baseFare` / `tax` / `fee` / `totalFare` |
