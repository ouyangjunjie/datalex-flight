<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, ArrowRight, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import BookingSteps from '../components/BookingSteps.vue'
import NoticeBar from '../components/NoticeBar.vue'
import { flights } from '../mock/flight'
import { notices } from '../mock/notice'
import { searchQuery } from '../composables/useSearchQuery'
import { parseDate, startOfToday, weekdayLabel } from '../utils/date'

const route = useRoute()
const router = useRouter()

const aircraftCodes = {
  '空客A330-300': '33A',
  '空客A350-900': '359',
  '波音737-800': '738',
  '空客A321': '321',
  '空客A330-200': '332',
  '波音777-300ER': '77W',
  '空客A320neo': '32N',
  '空客A321neo': '32Q',
}

const terminalCodes = {
  PEK: 'T3',
  PVG: 'T2',
  SHA: 'T2',
  CAN: 'T1',
  SZX: 'T3',
  CTU: 'T2',
  CKG: 'T3',
  HGH: 'T4',
  XIY: 'T3',
  KMG: 'T1',
  WUH: 'T3',
  NKG: 'T2',
}

function parseAirport(value) {
  const match = /^(.+?)\(([A-Z0-9]+)\)$/.exec(value || '')
  return match ? { name: match[1], code: match[2] } : { name: value || '', code: '' }
}

const flight = computed(() => {
  const byNo = flights.find((item) => item.flightNo === route.query.flightNo)
  if (byNo) return byNo

  const byRoute = flights.find(
    (item) =>
      item.depAirport.includes(`(${searchQuery.depCity})`) &&
      item.arrAirport.includes(`(${searchQuery.arrCity})`),
  )
  return byRoute || flights[0]
})

const depAirport = computed(() => parseAirport(flight.value.depAirport))
const arrAirport = computed(() => parseAirport(flight.value.arrAirport))
const depTerminal = computed(() => terminalCodes[depAirport.value.code] || '')
const arrTerminal = computed(() => terminalCodes[arrAirport.value.code] || '')
const shortAircraft = computed(
  () => aircraftCodes[flight.value.aircraft] || flight.value.aircraft || '—',
)

const tripLabel = computed(() => (searchQuery.tripType === 'roundtrip' ? '往返' : '单程'))

const dateText = computed(() => {
  const date = parseDate(searchQuery.departDate) || parseDate(route.query.date) || startOfToday()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day} ${weekdayLabel(date)}`
})

const routeText = computed(() => `${depAirport.value.name}-${arrAirport.value.name}`)

const adults = computed(() => searchQuery.adults || 1)

const cabin = computed(() => {
  const cabins = flight.value.priceList.map((item) => item.cabin)
  if (route.query.cabin && cabins.includes(route.query.cabin)) return route.query.cabin
  return cabins[0] || '经济舱'
})

const fareItem = computed(
  () => flight.value.priceList.find((item) => item.cabin === cabin.value) || flight.value.priceList[0],
)

const taxAirport = 50
const taxFuel = 140

const basePrice = computed(() => {
  const passed = Number(route.query.price)
  return Number.isFinite(passed) && passed > 0 ? passed : fareItem.value?.price || 0
})

const perPassengerTotal = computed(() => basePrice.value + taxAirport + taxFuel)
const totalPrice = computed(() => perPassengerTotal.value * adults.value)

const fareExpanded = ref(true)

const passengers = ref([
  {
    key: 1,
    type: '成人',
    expanded: false,
    name: '',
    idType: '身份证',
    idNumber: '',
    phone: '',
  },
])
let nextPassengerKey = 2

function addPassenger() {
  passengers.value.push({
    key: nextPassengerKey++,
    type: '成人',
    expanded: true,
    name: '',
    idType: '身份证',
    idNumber: '',
    phone: '',
  })
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
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
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

          <div class="px-4 py-4">
            <div class="rounded-md bg-[#f4f5f8] px-4 py-4">
              <div class="text-center text-sm text-gray-800">
                <span class="font-semibold">{{ flight.flightNo }}</span>
                <span class="ml-2 text-gray-500">{{ shortAircraft }}</span>
                <span class="ml-4 text-ca-navy underline decoration-gray-300 decoration-dotted underline-offset-4">
                  {{ cabin }}
                </span>
              </div>
              <div class="mt-1 text-center text-xs text-gray-500">实际承运：爱达航</div>

              <div class="mt-4 flex items-center justify-between">
                <div class="text-center">
                  <div class="text-[28px] font-semibold leading-none text-gray-800">
                    {{ flight.depTime }}
                  </div>
                  <div class="mt-1.5 text-xs text-gray-500">
                    {{ depAirport.code }} {{ depTerminal }}
                  </div>
                </div>

                <div class="flex min-w-0 flex-1 flex-col items-center px-3">
                  <span class="text-[11px] text-gray-400">{{ flight.duration }}</span>
                  <span class="mt-1 h-px w-full max-w-[96px] bg-gray-300"></span>
                </div>

                <div class="text-center">
                  <div class="text-[28px] font-semibold leading-none text-gray-800">
                    {{ flight.arrTime }}
                  </div>
                  <div class="mt-1.5 text-xs text-gray-500">
                    {{ arrAirport.code }} {{ arrTerminal }}
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
            <span class="text-[15px] font-medium text-gray-800">成人票</span>
            <span class="text-xs text-gray-500 underline decoration-gray-300 decoration-dotted underline-offset-4">退改费</span>
            <span class="text-xs text-gray-500 underline decoration-gray-300 decoration-dotted underline-offset-4">行李额</span>
            <span class="ml-auto flex items-center gap-2">
              <span class="text-[15px] font-semibold text-gray-800">
                ¥{{ perPassengerTotal }} x {{ adults }}
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
              <span>票价</span>
              <span>¥{{ basePrice }} x {{ adults }}</span>
            </div>
            <div class="flex items-center justify-between text-gray-500">
              <span>机场费（国内）</span>
              <span>¥{{ taxAirport }} x {{ adults }}</span>
            </div>
            <div class="flex items-center justify-between text-gray-500">
              <span>燃油附加费</span>
              <span>¥{{ taxFuel }} x {{ adults }}</span>
            </div>
          </div>

          <div class="flex items-end justify-between border-t border-gray-100 px-5 py-4">
            <div>
              <div class="text-base font-semibold text-gray-800">含税总价</div>
              <div class="mt-1 text-xs text-gray-400">{{ adults }}成人</div>
            </div>
            <div class="text-[28px] font-semibold leading-none text-ca-red">¥{{ totalPrice }}</div>
          </div>
        </div>
      </aside>
    </div>
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
