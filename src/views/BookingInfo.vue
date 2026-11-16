<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown, ArrowRight, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import BookingSteps from '../components/BookingSteps.vue'
import NoticeBar from '../components/NoticeBar.vue'
import { notices } from '../constants/notices'
import { cityName } from '../constants/airports'
import { readBookingDraft } from '../composables/useFlightStore'
import { parseDate, weekdayLabel } from '../utils/date'

const router = useRouter()

const draft = ref(readBookingDraft())
const valid = computed(() => Boolean(draft.value?.flight && draft.value?.price))

onMounted(() => {
  // 直达预订页但没有验价结果时（如刷新或直接访问），回到查询页重新选择航班。
  if (!valid.value) router.replace('/flight-search')
})

const query = computed(() => draft.value?.query || {})
const flight = computed(() => draft.value?.flight || {})
const fare = computed(() => draft.value?.fare || {})
const price = computed(() => draft.value?.price || {})

const tripLabel = computed(() => (query.value.tripType === 'roundtrip' ? '往返' : '单程'))

function formatDate(value) {
  const date = parseDate(value)
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day} ${weekdayLabel(date)}`
}

const dateText = computed(() => {
  const depart = formatDate(query.value.departDate)
  const ret = formatDate(query.value.returnDate)
  return query.value.tripType === 'roundtrip' && ret ? `${depart} - ${ret}` : depart
})

const routeText = computed(() => {
  const dep = cityName(query.value.depCity) || flight.value.depCode
  const arr = cityName(query.value.arrCity) || flight.value.arrCode
  return `${dep}-${arr}`
})

const legs = computed(() => flight.value.legs || [])

const currencySymbol = computed(() => (price.value.currency === 'CNY' ? '¥' : `${price.value.currency || ''} `))

/* ---------------- 乘机人 ---------------- */

const TRAVELER_LABELS = {
  ADT: '成人',
  CHD: '儿童',
  CNN: '儿童',
  INF: '婴儿',
}

function travelerLabel(type) {
  return TRAVELER_LABELS[type] || '成人'
}

const travelerEntries = computed(() => {
  const map = new Map()
  ;(price.value.travelerPrices || []).forEach((item) => {
    const type = item.type || 'ADT'
    map.set(type, (map.get(type) || 0) + (item.quantity || 1))
  })

  if (!map.size) {
    const q = query.value
    if (q.adults) map.set('ADT', q.adults)
    if (q.children) map.set('CHD', q.children)
    if (q.infants) map.set('INF', q.infants)
  }

  if (!map.size) map.set('ADT', 1)
  return [...map.entries()].map(([type, quantity]) => ({ type, quantity }))
})

const travelerCount = computed(() =>
  travelerEntries.value.reduce((sum, item) => sum + item.quantity, 0),
)

const travelerSummary = computed(() =>
  travelerEntries.value.map((item) => `${item.quantity}${travelerLabel(item.type)}`).join(' '),
)

function createPassenger(type, index) {
  return {
    key: index,
    type,
    expanded: index === 0,
    name: '',
    idType: type === '婴儿' ? '出生证明' : '身份证',
    idNumber: '',
    phone: '',
  }
}

const passengers = ref([])
let nextPassengerKey = 0

travelerEntries.value.forEach((item) => {
  for (let i = 0; i < item.quantity; i += 1) {
    passengers.value.push(createPassenger(travelerLabel(item.type), nextPassengerKey++))
  }
})

function addPassenger() {
  passengers.value.push(createPassenger('成人', nextPassengerKey++))
}

const contact = ref({
  name: '',
  countryCode: '+86',
  phone: '',
  email: '',
})

function saveContact() {
  ElMessage.success('已保存为常用联系人')
}

function onRequery() {
  router.push('/flight-search')
}

/* ---------------- 价格明细 ---------------- */

const FEE_LABELS = {
  CN: '机场建设费（国内）',
  YQ: '燃油附加费',
}

function surchargeLabel(item) {
  const name = item?.name || ''
  if (/airport fee/i.test(name) && /domestic/i.test(name)) return '机场建设费（国内）'
  if (/airport fee/i.test(name) && /international/i.test(name)) return '国际机场税'
  if (/fuel surcharge/i.test(name)) return '燃油附加费'
  return FEE_LABELS[item?.code] || name || '税费'
}

const surcharges = computed(() => [
  ...(price.value.taxes || []).map((item, index) => ({
    key: `tax-${item.code || index}`,
    label: surchargeLabel(item),
    amount: item.amount || 0,
  })),
  ...(price.value.fees || []).map((item, index) => ({
    key: `fee-${item.code || index}`,
    label: surchargeLabel(item),
    amount: item.amount || 0,
  })),
])

const baseFare = computed(() => price.value.baseFare || 0)
const totalPrice = computed(() => price.value.total || 0)

const fareExpanded = ref(true)

function stopsText(leg) {
  const segments = leg.segments || []
  if (segments.length > 1) return `中转 ${segments.length - 1} 次`
  if (segments[0]?.stopQuantity > 0) return '经停'
  return '直飞'
}
</script>

<template>
  <section v-if="valid" class="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
    <BookingSteps :current="2" />

    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_352px]">
      <div class="min-w-0">
        <div class="space-y-3">
          <NoticeBar
            v-for="notice in notices"
            :key="notice.title"
            :type="notice.type"
            :title="notice.title"
            :content="notice.content"
          />
        </div>

        <div class="mt-7">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-xl font-semibold text-ca-navy">乘机人</h1>
            <span class="flex items-center gap-1 text-xs text-gray-400">
              <el-icon :size="14"><InfoFilled /></el-icon>
              请确保填写的信息与乘机证件完全一致，建议旅行结束时证件有效期不少于6个月。
            </span>
          </div>

          <div class="mt-4 space-y-3">
            <div
              v-for="(passenger, index) in passengers"
              :key="passenger.key"
              class="overflow-hidden rounded-lg bg-white shadow-sm"
            >
              <div class="flex items-center justify-between px-5 py-4">
                <div class="flex items-center gap-2.5">
                  <span class="text-[16px] font-medium text-gray-800">
                    乘机人 {{ index + 1 }}
                  </span>
                  <span class="rounded bg-[#eef1f6] px-2 py-0.5 text-xs text-gray-500">
                    {{ passenger.type }}
                  </span>
                </div>
                <button
                  type="button"
                  class="plain-button flex items-center gap-1 text-sm text-gray-700 transition hover:text-ca-red"
                  @click="passenger.expanded = !passenger.expanded"
                >
                  {{ passenger.expanded ? '收起' : '去填写' }}
                  <el-icon
                    :size="12"
                    class="transition-transform"
                    :class="passenger.expanded ? 'rotate-90' : ''"
                  >
                    <ArrowRight />
                  </el-icon>
                </button>
              </div>

              <div
                v-if="passenger.expanded"
                class="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-gray-100 px-5 py-4 sm:grid-cols-2"
              >
                <input v-model="passenger.name" class="field-line" placeholder="姓名" />
                <div class="relative">
                  <select v-model="passenger.idType" class="field-line appearance-none pr-6">
                    <option>身份证</option>
                    <option>护照</option>
                    <option>军人证</option>
                    <option>港澳通行证</option>
                    <option>出生证明</option>
                  </select>
                  <el-icon
                    :size="12"
                    class="pointer-events-none absolute right-0 top-1 text-gray-400"
                  >
                    <ArrowDown />
                  </el-icon>
                </div>
                <input
                  v-model="passenger.idNumber"
                  class="field-line"
                  placeholder="证件号码"
                />
                <input v-model="passenger.phone" class="field-line" placeholder="手机号码（选填）" />
              </div>
            </div>

            <button
              type="button"
              class="plain-button w-full rounded-lg bg-white py-3.5 text-center text-sm text-ca-navy shadow-sm transition hover:text-ca-red"
              @click="addPassenger"
            >
              + 添加乘机人
            </button>
          </div>
        </div>

        <div class="mt-7">
          <h2 class="text-xl font-semibold text-ca-navy">联系人信息</h2>

          <div class="mt-4 rounded-lg bg-white px-5 py-5 shadow-sm">
            <div class="flex items-center gap-4">
              <input v-model="contact.name" class="field-line" placeholder="联系人姓名" />
              <button
                type="button"
                class="plain-button shrink-0 text-sm text-ca-navy transition hover:text-ca-red"
                @click="saveContact"
              >
                +保存为常用联系人
              </button>
            </div>

            <div class="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-[88px_minmax(0,1fr)_minmax(0,1fr)]">
              <div class="relative">
                <select v-model="contact.countryCode" class="field-line appearance-none pr-6">
                  <option>+86</option>
                  <option>+852</option>
                  <option>+853</option>
                  <option>+886</option>
                </select>
                <el-icon
                  :size="12"
                  class="pointer-events-none absolute right-0 top-1 text-gray-400"
                >
                  <ArrowDown />
                </el-icon>
              </div>
              <input v-model="contact.phone" class="field-line" placeholder="手机号码" />
              <input v-model="contact.email" class="field-line" placeholder="电子邮箱（选填）" />
            </div>
          </div>
        </div>
      </div>

      <aside class="space-y-3 lg:sticky lg:top-24 lg:self-start">
        <div class="overflow-hidden rounded-lg bg-white shadow-sm">
          <div class="flex items-center justify-between bg-ca-red px-5 py-3.5 text-white">
            <h2 class="text-lg font-semibold">行程信息</h2>
            <button
              type="button"
              class="plain-button rounded-full border border-white/80 px-3.5 py-1 text-sm transition hover:bg-white/10"
              @click="onRequery"
            >
              重新查询
            </button>
          </div>

          <div class="border-b border-gray-100 px-5 py-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded bg-ca-red px-1.5 py-0.5 text-[11px] leading-none text-white">
                {{ tripLabel }}
              </span>
              <span class="text-[17px] font-semibold text-gray-800">{{ dateText }}</span>
              <span class="text-[17px] text-gray-700">{{ routeText }}</span>
            </div>
          </div>

          <div class="space-y-3 px-4 py-4">
            <div
              v-for="(leg, index) in legs"
              :key="leg.flightNo + index"
              class="rounded-md bg-[#f4f5f8] px-4 py-4"
            >
              <div class="text-center text-sm text-gray-800">
                <span class="mr-2 rounded bg-white px-1.5 py-0.5 text-[11px] text-gray-500">
                  {{ leg.label }}
                </span>
                <span class="font-semibold">{{ leg.flightNo }}</span>
                <span class="ml-2 text-gray-500">{{ leg.aircraftCode || leg.aircraft }}</span>
                <span class="ml-4 text-ca-navy underline decoration-gray-300 decoration-dotted underline-offset-4">
                  {{ fare.cabin }}
                </span>
              </div>
              <div class="mt-1 text-center text-xs text-gray-500">
                {{ stopsText(leg) }} · 实际承运：爱达航
              </div>

              <div class="mt-4 flex items-center justify-between">
                <div class="text-center">
                  <div class="text-[28px] font-semibold leading-none text-gray-800">
                    {{ leg.depTime }}
                  </div>
                  <div class="mt-1.5 text-xs text-gray-500">
                    {{ leg.depCode }} {{ leg.depTerminal }}
                  </div>
                </div>

                <div class="flex min-w-0 flex-1 flex-col items-center px-3">
                  <span class="text-[11px] text-gray-400">{{ leg.duration }}</span>
                  <span class="mt-1 h-px w-full max-w-[96px] bg-gray-300"></span>
                </div>

                <div class="text-center">
                  <div class="text-[28px] font-semibold leading-none text-gray-800">
                    {{ leg.arrTime }}
                    <span v-if="leg.arrTimeSuffix" class="align-top text-[11px] text-ca-red">
                      {{ leg.arrTimeSuffix }}
                    </span>
                  </div>
                  <div class="mt-1.5 text-xs text-gray-500">
                    {{ leg.arrCode }} {{ leg.arrTerminal }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg bg-white shadow-sm">
          <button
            type="button"
            class="plain-button flex w-full items-center gap-3 px-5 py-4 text-left"
            :aria-expanded="fareExpanded"
            @click="fareExpanded = !fareExpanded"
          >
            <span class="text-[15px] font-medium text-gray-800">{{ fare.name || '成人票' }}</span>
            <span class="text-xs text-gray-500 underline decoration-gray-300 decoration-dotted underline-offset-4">退改费</span>
            <span class="text-xs text-gray-500 underline decoration-gray-300 decoration-dotted underline-offset-4">行李额</span>
            <span class="ml-auto flex items-center gap-2">
              <span class="text-[15px] font-semibold text-gray-800">
                {{ currencySymbol }}{{ totalPrice }}
              </span>
              <el-icon
                :size="14"
                class="text-gray-400 transition-transform"
                :class="fareExpanded ? 'rotate-180' : ''"
              >
                <ArrowDown />
              </el-icon>
            </span>
          </button>

          <div v-if="fareExpanded" class="space-y-3 px-5 pb-4 text-sm">
            <div class="flex items-center justify-between text-gray-500">
              <span>票价（{{ travelerSummary }}）</span>
              <span>{{ currencySymbol }}{{ baseFare }}</span>
            </div>
            <div
              v-for="item in surcharges"
              :key="item.key"
              class="flex items-center justify-between text-gray-500"
            >
              <span>{{ item.label }}</span>
              <span>{{ currencySymbol }}{{ item.amount }}</span>
            </div>
          </div>

          <div class="flex items-end justify-between border-t border-gray-100 px-5 py-4">
            <div>
              <div class="text-base font-semibold text-gray-800">含税总价</div>
              <div class="mt-1 text-xs text-gray-400">{{ travelerSummary }}</div>
            </div>
            <div class="text-[28px] font-semibold leading-none text-ca-red">
              {{ currencySymbol }}{{ totalPrice }}
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>

  <section v-else class="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-gray-400">
    正在返回航班查询页…
  </section>
</template>

<style scoped>
.field-line {
  width: 100%;
  border: 0;
  border-bottom: 1px solid #e5e7eb;
  background: transparent;
  padding: 0 0 8px;
  font-size: 15px;
  color: #374151;
}

.field-line::placeholder {
  color: #9ca3af;
}

.field-line:focus {
  outline: none;
  border-bottom-color: #c7000b;
}
</style>
