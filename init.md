# 爱达航机票 Demo 需求汇总（合并版）

本文档合并整理本项目历次需求，作为后续开发、重构和接口接入的统一依据。

## 1. 项目定位与技术约束

- 项目为爱达航（DATALEX）风格的机票查询与结果展示前端 Demo。
- 技术栈：Vue 3 + Vite + Element Plus + TailwindCSS。
- 当前数据全部为仓库内 mock；接入后端后改为接口获取与价格校验。
- 不新增登录、鉴权、支付等未要求的能力。
- UI 文案统一使用中文。
- Element Plus 已在 `src/main.js` 全量注册（中文 locale + 全量 CSS），组件直接使用 `<el-*>`，不要逐组件引入。
- `@element-plus/icons-vue` 图标未全局注册，使用处必须显式 import。
- Tailwind Preflight 关闭（`preflight: false`），不要开启。
- 自定义按钮使用 `.plain-button`；链接使用 `no-underline` 并显式设置文字颜色。
- 主题色使用 `ca` 系列：`ca-red`（主色 `#C7000B`）、`ca-navy`、`ca-gold`、`ca-blue`、`ca-blue-light`、`ca-bg`。
- 日期框等自定义容器需显式 `box-sizing: border-box`，避免 Preflight 关闭导致的宽度错位。
- 无 lint / formatter / typecheck / test 脚本；每轮修改后用 `npm run build` 验证。
- 全量 Element Plus 导致产物体积 >500 kB 的警告为预期，不要处理。

## 2. 页面与路由

- `/flight-search`：机票查询页；有查询参数后切换为结果页。
- `/booking-info`：填写信息页（`name: 'booking-info'`）。
- `/` 与未知路径重定向到 `/flight-search`。
- 视图懒加载，使用 HTML5 history 模式。
- 全局布局：`Header`（sticky，高 64px）+ `RouterView` + `Footer`。

## 3. 机票查询页

### 3.1 页面结构

- 移除原价格日历组件（`PriceCalendar` 的 import、模板与选择逻辑一并删除）。
- 页面标题“机票查询”，下方为查询表单。

### 3.2 查询表单字段

- 行程类型：单程 / 往返切换。
- 出发/到达机场：
  - 合并为一个机场框，展示图标、城市名、机场三字码。
  - 中间为圆形互换按钮，点击交换出发与到达城市。
  - 往返切换时机场框宽度保持固定，不因布局变化跳动。
- 日期：
  - 出发日期框展示日期与星期。
  - 往返时出现返程日期，与出发日期水平并排，中间用竖线分隔。
  - 日期选择器 `flex-1` 自适应，字号 15px。
  - 单程时日期框内提供“添加返程”入口，点击切换为往返。
- 乘客：
  - 使用“乘客类型”字段 + Popover，支持成人 / 儿童 / 婴儿数量选择。
  - 使用“伤残军警乘客”字段 + Popover。
  - 乘客字段整块区域可点击。
- 删除“舱位”选择框及相关 emit 字段与选项。
- 查询按钮：
  - 大号圆角主色按钮。
  - 与日期框同一行，宽度为 `lg:w-[calc(33.333%+30px)]`，与日期框左右边缘对齐。
  - 使用 flex 布局替代 grid，并通过 `border-box` 保证对齐。

### 3.3 表单样式

- 字段容器 `.field-box`：圆角、细边框、hover 显示红色边框。
- 通过 scoped `:deep` 去除 `el-select`、`el-date-picker` 的默认边框，使其融入字段容器。
- 图标标签 + 主值 + 辅助值的层级清晰。

## 4. 查询结果页

### 4.1 顶部区域

- 购买进度步骤：搜索航班 → 选择航班 → 填写信息（3 步）。
  - `BookingSteps` 支持 `current` prop。
  - 已完成步骤统一显示 `CircleCheckFilled`。
  - 最小宽度 `min-w-[560px]`。
- 航线摘要：出发机场 — 到达机场、行程类型标签、日期、乘客信息。
- “重新查询”按钮：清空查询状态并回到查询表单。
- 通知栏：复用 `NoticeBar`，数据来自共享 `src/mock/notice.js`。

### 4.2 日期价格条

- 7 天最低价横向条，支持左右翻周与“更多日期”选择。
- 单程：显示日期 + 星期 + 最低价。
- 往返：每个日期格显示两行日期 + 金额：
  - 第一行：去程日期 + 星期。
  - 第二行：返程日期 + 星期。
  - 下方：最低价（保留“低”标签与选中态）。
- 选中日期有深色边框与底部高亮条。
- 横向滚动，禁止选择过去日期。

### 4.3 往返双页签

- 往返结果页在日期条下方展示两张卡片：
  - “选择去程航班”。
  - “选择返程航班”。
- 状态样式：
  - 未激活：浅灰底、灰色文字。
  - 激活：白底、深色文字、边框。
  - 已选去程：序号变为对勾，标题变为“已选去程航班”，显示去程航线与日期，并提供“详情”和“修改”操作。
- 交互：
  - 点击页签切换当前航段列表。
  - 去程点击“选为去程”后记录选择，并自动切换到返程列表。
  - “修改”回到去程列表重新选择。
  - “详情”打开去程航班详情弹框。
- 航班列表根据当前航段展示：
  - 去程：出发城市 → 到达城市。
  - 返程：到达城市 → 出发城市（mock 中无反向航班时，用反向复制航班补齐）。

### 4.4 航班表格

- 表头 `sticky top-16 z-40`，配合全局 Header 高度。
- 舱位表头首尾分别使用 `rounded-tl-lg` / `rounded-tr-lg`。
- 支持按舱位价格排序。
- 航班行内容：
  - 航班号、机型、起降时间、机场航站楼。
  - 总时长栏：去掉“直飞”，非直飞保留“经停”；“时长”与“航班详情”水平排列，“航班详情”带下划线。
  - 时长列宽度 130px，间距 `gap-4`。
- 舱位价格格：
  - 金额字号 22px，展示“¥价格起”。
  - 余票使用座椅 SVG 图标 + 数字徽标，定位在金额右上角（`-right-3 -top-5`）。
  - hover 时底部出现圆形下箭头。
  - 点击价格格展开该舱位的价格条目，箭头翻转为向上。
  - 点击其他舱位时自动收起已展开项。
  - 无报价的舱位不可点击，显示 `--`。
  - 取消“点击舱位价格打开航班详情弹框”的行为；“航班详情”按钮仍可打开弹框。
- 价格条目（展开区）：
  - 展示退改费、行李额、里程累积、价格、预订按钮、剩余票数。
  - 使用行分隔与虚线下划线数值，字号和间距加大。
  - 预订按钮圆角、高度 44px、最小宽度 120px。
  - 单程与返程：按钮文案“预订”，点击跳转 `/booking-info`。
  - 往返去程：按钮文案“选为去程”，点击触发选为去程逻辑（不跳转）。
  - 往返时价格格上方显示“往返总价”小标签，移动端舱位卡同步显示。
- 移动端：
  - 独立卡片布局，展示航班摘要、时长、“航班详情”和可售舱位。
  - 舱位块点击规则与桌面端一致。

### 4.5 日期切换

- 点击日期价格条中的日期：
  - 更新出发日期。
  - 往返时按原有“去程—返程”间隔同步平移返程日期。
  - 单程不处理返程日期。
  - 触发短暂 loading 模拟刷新。

## 5. 填写信息页（`/booking-info`）

- 步骤条当前步骤为“填写信息”（`current = 2`），共 3 步。
- 通知栏。
- 乘机人：
  - 卡片可展开填写。
  - 支持添加乘机人。
- 联系人：
  - 下划线风格输入表单。
- 右侧行程卡：
  - “重新查询”入口。
  - 日期与航线。
  - 航班摘要。
- 费用：
  - 成人票费用明细，可折叠。
  - 展示含税总价。
- 从航班列表点击“预订”进入，携带 `flightNo`、`cabin`、`fare`、`price` 查询参数。
- 税费 demo 规则：机场费 50 + 燃油 140；含税总价 = 票价 + 190，再乘成人数。

## 6. 数据与状态

- `src/composables/useSearchQuery.js` 共享查询状态：
  - `tripType`、`depCity`、`arrCity`、`departDate`、`returnDate`。
  - `adults`、`children`、`infants`、`disabledMilitary`。
- `src/mock/flight.js`：
  - 10 条 CA 航班，字段：`flightNo`、`aircraft`、`depAirport`、`arrAirport`、`depTime`、`arrTime`、`duration`、`priceList`、`isDirect`。
  - `getFlightsByRoute(depCity, arrCity)`：优先匹配正向航班；无正向时复制反向航班并交换机场与起降时间，航班号使用 `CA{number+1}`。
- `src/mock/price.js`：`getLowestPrice(depCity, arrCity, date)` 生成按航线/日期确定的最低价。
- `src/mock/city.js`：国内城市与机场选项。
- `src/mock/policy.js`：舱位行李额与退改政策。
- `src/utils/date.js`：日期解析、格式化、加减天、星期、中文日期等工具。

## 7. 后端接口接入（待完成）

### 7.1 网络层

- 安装并封装网络库：`axios`。
- 建议新增：
  - `src/api/http.js`：axios 实例、baseURL、超时、错误拦截。
  - `src/api/air.js`：两个业务接口封装与 JSDoc 类型定义。
- baseURL 使用 `import.meta.env.VITE_API_BASE_URL`，缺省为 `/api`。
- 不把 token、密钥写入代码或仓库。

### 7.2 接口一：`POST /air/search`

请求参数（见 `interface/Search_RQ_OW.json`、`interface/Search_RQ_HRT_1.json`）：

```json
{
  "originDestination": [
    {
      "origin": {
        "date": "2026-11-25",
        "locationRef": { "uri": "/geo/locations/A/FRA" }
      },
      "destination": {
        "locationRef": { "uri": "/geo/locations/A/PEK" }
      }
    }
  ],
  "pos": "AIRCHINA_CN",
  "preferredCurrency": "CNY",
  "languageCode": "en",
  "travelerComposition": [
    {
      "count": 1,
      "age": "29",
      "typeRef": { "uri": "/info/traveler-types/AIR/ADT" }
    }
  ],
  "travelPreferences": {
    "searchType": "ONE_WAY",
    "flight": { "flexibleDates": "FALSE" }
  }
}
```

- 单程：1 组 `originDestination`，`searchType` 为 `ONE_WAY`。
- 往返：2 组 `originDestination`（去程、返程各一组），`searchType` 为 `HALF_ROUND_TRIP`。
- 乘客类型 URI：
  - 成人：`/info/traveler-types/AIR/ADT`
  - 儿童：`/info/traveler-types/AIR/CNN`
  - 婴儿：`/info/traveler-types/AIR/INF`

响应结构（见 `interface/Search_RS_OW.json`、`interface/Search_RS_HRT_1.json`、`interface/Search_RS_HRT_2.json`）：

- 顶层：`userSessionId`、`pos`、`languageCode`、`clientToken`、`preferredCurrency`、`expiration`、`error`、`warning`、`search`、`refs`。
- `search`：
  - `uri`、`id`、`fareTripType`、`searchType`。
  - `originDestinationGroup`、`recommendedOffer`。
  - `itinerary`（航班组合，含 `flightSegment`、`departure`、`arrival`、`aircraft`、`bookingClassAvailability` 等）。
  - `itineraryPrice`（含 `totalPrice`、`travelerPrice`、`farePrice` 等）。
  - `fareFamily`、`criteria` 等。
- `refs`：`pointOfSale`、`location`、`airline`、`travelerType` 等。
- 需要将响应映射到现有航班列表模型，或逐步替换 mock 数据。

### 7.3 接口二：`POST /air/price`

请求参数（见 `interface/Price_RQ.json`）：

```json
{
  "itineraryPriceRQ": {
    "itineraryPriceRef": [
      { "uri": "/air/search/6af6a35e8730947437876b34/itinerary-prices/1_1" }
    ],
    "pricingMode": "VALIDATE"
  },
  "languageCode": "en",
  "userSessionId": "6af6d5e58730947437876b50"
}
```

- 用途：下单前校验价格是否仍有效。
- `pricingMode` 使用 `VALIDATE`。
- `itineraryPriceRef.uri` 来自搜索结果中的 `itineraryPrice.uri`。
- `userSessionId` 来自搜索响应顶层字段。

响应结构：

- `interface` 目录目前只有 `Price_RQ.json`，没有 `Price_RS` 示例。
- 暂按搜索响应中的价格子集定义：`itineraryPrice`、`refs`、`error`、`warning`、`userSessionId` 等。
- 拿到正式 `Price_RS` 示例后需补充/校正返回类型与校验逻辑。

### 7.4 接入要求

- 先完成网络包安装与两个接口的函数、请求/响应类型定义。
- 暂不大改现有 UI 数据流；后续再将查询、列表、价格格、预订校验逐步切到接口。
- 接口异常需有友好中文提示，不向用户暴露原始报文。
- 构建必须通过：`npm run build`。

## 8. 验收要点

- 查询页表单在单程/往返、不同宽度下布局稳定，日期框与查询按钮对齐。
- 结果页日期条（含往返双日期）、往返页签、舱位展开、按钮文案与跳转均符合上述规则。
- 填写信息页可正常进入并展示行程与费用。
- 新增 API 层可被调用，类型与 `interface` 下的 RQ/RS 结构一致。
- `npm run build` 成功。
