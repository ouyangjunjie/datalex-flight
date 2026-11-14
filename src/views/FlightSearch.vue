<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { ArrowDown, Check } from '@element-plus/icons-vue'
import FlightSearchForm from '../components/FlightSearchForm.vue'
import BookingSteps from '../components/BookingSteps.vue'
import NoticeBar from '../components/NoticeBar.vue'
import ResultsDateStrip from '../components/ResultsDateStrip.vue'
import FlightFareTable from '../components/FlightFareTable.vue'
import FlightDetailDialog from '../components/FlightDetailDialog.vue'
import { getFlightsByRoute } from '../mock/flight'
import { cities } from '../mock/city'
import { notices } from '../mock/notice'
import { searchQuery } from '../composables/useSearchQuery'
import { addDays, formatChineseDate, formatDate, parseDate } from '../utils/date'

const query = ref(null)
const loading = ref(false)
const activeLeg = ref('outbound')
const selectedOutbound = ref(null)
const detailVisible = ref(false)
const detailFlight = ref(null)

let loadingTimer = null

const cityName = (code) => cities.find((city) => city.code === code)?.name || code

const isRoundTrip = computed(() => query.value?.tripType === 'roundtrip')

const outboundFlights = computed(() => {
  if (!query.value) return []
  return getFlightsByRoute(query.value.depCity, query.value.arrCity)
})

const returnFlights = computed(() => {
  if (!query.value) return []
  return getFlightsByRoute(query.value.arrCity, query.value.depCity)
})

const activeFlights = computed(() =>
  isRoundTrip.value && activeLeg.value === 'return' ? returnFlights.value : outboundFlights.value,
)

const depLabel = computed(() => {
  if (!query.value) return ''
  return (
    outboundFlights.value[0]?.depAirport ||
    `${cityName(query.value.depCity)}(${query.value.depCity})`
  )
})

const arrLabel = computed(() => {
  if (!query.value) return ''
  return (
    outboundFlights.value[0]?.arrAirport ||
    `${cityName(query.value.arrCity)}(${query.value.arrCity})`
  )
})

const tripLabel = computed(() => (query.value?.tripType === 'roundtrip' ? '往返' : '单程'))

const dateLabel = computed(() => formatChineseDate(query.value?.departDate))
const returnDateLabel = computed(() => formatChineseDate(query.value?.returnDate))

const passengerLabel = computed(() => {
  if (!query.value) return ''
  const { adults, children } = query.value
  return children ? `${adults}成人，${children}儿童` : `${adults}成人`
})

function diffDays(from, to) {
  const start = parseDate(from)
  const end = parseDate(to)
  if (!start || !end) return 0
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000))
}

function startLoading(duration = 500) {
  loading.value = true
  if (loadingTimer) clearTimeout(loadingTimer)
  loadingTimer = setTimeout(() => {
    loading.value = false
  }, duration)
}

function onSearch(params) {
  query.value = params
  activeLeg.value = 'outbound'
  selectedOutbound.value = null
  startLoading()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onDateSelect(date) {
  if (!query.value) return

  const offset = diffDays(query.value.departDate, query.value.returnDate)
  const nextReturn = formatDate(addDays(parseDate(date), offset))

  searchQuery.departDate = date
  if (isRoundTrip.value) searchQuery.returnDate = nextReturn

  query.value = {
    ...query.value,
    departDate: date,
    returnDate: isRoundTrip.value ? nextReturn : query.value.returnDate,
  }

  startLoading(300)
}

function onLegSelect(selection) {
  selectedOutbound.value = selection
  activeLeg.value = 'return'
  startLoading(200)
}

function openOutboundDetail() {
  if (!selectedOutbound.value) return
  detailFlight.value = selectedOutbound.value.flight
  detailVisible.value = true
}

function onReroute() {
  if (loadingTimer) clearTimeout(loadingTimer)
  loading.value = false
  query.value = null
  activeLeg.value = 'outbound'
  selectedOutbound.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onBeforeUnmount(() => {
  if (loadingTimer) clearTimeout(loadingTimer)
})
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
    <template v-if="!query">
      <h1 class="mb-6 text-[26px] font-semibold text-ca-navy sm:text-[28px]">机票查询</h1>

      <FlightSearchForm @search="onSearch" />
    </template>

    <template v-else>
      <BookingSteps class="mb-6" />

      <div class="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-[23px] font-semibold leading-tight text-ca-navy sm:text-[26px]">
              {{ depLabel }}
              <span class="px-1 font-normal text-gray-300">—</span>
              {{ arrLabel }}
            </h1>
            <span class="rounded bg-[#eef1f6] px-2 py-0.5 text-xs text-ca-navy">
              {{ tripLabel }}
            </span>
          </div>
          <p class="mt-2 text-sm text-gray-600">
            {{ dateLabel }}
            <span class="mx-2 text-gray-300">|</span>
            {{ passengerLabel }}
          </p>
        </div>

        <button
          type="button"
          class="plain-button flex h-12 shrink-0 items-center gap-1.5 rounded-md border border-ca-red px-5 text-base text-ca-red transition hover:bg-ca-red/5"
          @click="onReroute"
        >
          重新查询
          <el-icon :size="14"><ArrowDown /></el-icon>
        </button>
      </div>

      <div class="space-y-3">
        <NoticeBar
          v-for="notice in notices"
          :key="notice.title"
          :type="notice.type"
          :title="notice.title"
          :content="notice.content"
        />
      </div>

      <ResultsDateStrip
        class="mt-5"
        :dep-city="query.depCity"
        :arr-city="query.arrCity"
        :selected-date="query.departDate"
        :return-date="query.returnDate"
        :trip-type="query.tripType"
        @select="onDateSelect"
      />

      <div v-if="isRoundTrip" class="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          class="rounded-lg border p-4 shadow-sm transition"
          :class="activeLeg === 'outbound' ? 'border-gray-200 bg-white' : 'border-transparent bg-[#eef1f6]'"
          role="button"
          tabindex="0"
          @click="activeLeg = 'outbound'"
          @keydown.enter="activeLeg = 'outbound'"
        >
          <div class="flex items-start gap-3">
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-base font-semibold text-white"
              :class="selectedOutbound ? 'bg-[#c3c9d4]' : 'bg-ca-navy'"
            >
              <el-icon v-if="selectedOutbound" :size="19"><Check /></el-icon>
              <template v-else>1</template>
            </span>

            <div class="min-w-0 flex-1">
              <div
                class="text-[17px] font-semibold"
                :class="activeLeg === 'outbound' ? 'text-ca-navy' : 'text-gray-500'"
              >
                {{ selectedOutbound ? '已选去程航班' : '选择去程航班' }}
              </div>
              <div
                class="mt-1 text-sm"
                :class="activeLeg === 'outbound' ? 'text-gray-600' : 'text-gray-400'"
              >
                {{ depLabel }} → {{ arrLabel }}
              </div>
              <div
                class="mt-0.5 text-sm"
                :class="activeLeg === 'outbound' ? 'text-gray-600' : 'text-gray-400'"
              >
                {{ dateLabel }}
                <button
                  v-if="selectedOutbound"
                  type="button"
                  class="plain-button ml-1 underline decoration-gray-300 underline-offset-2 transition hover:text-ca-red"
                  @click.stop="openOutboundDetail"
                >
                  详情
                </button>
              </div>
            </div>

            <button
              v-if="selectedOutbound"
              type="button"
              class="plain-button shrink-0 rounded border border-ca-navy/60 px-3 py-1 text-sm text-ca-navy transition hover:bg-ca-navy/5"
              @click.stop="activeLeg = 'outbound'"
            >
              修改
            </button>
          </div>
        </div>

        <div
          class="rounded-lg border p-4 shadow-sm transition"
          :class="activeLeg === 'return' ? 'border-gray-200 bg-white' : 'border-transparent bg-[#eef1f6]'"
          role="button"
          tabindex="0"
          @click="activeLeg = 'return'"
          @keydown.enter="activeLeg = 'return'"
        >
          <div class="flex items-start gap-3">
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-base font-semibold text-white"
              :class="activeLeg === 'return' ? 'bg-ca-navy' : 'bg-[#c3c9d4]'"
            >
              2
            </span>

            <div class="min-w-0 flex-1">
              <div
                class="text-[17px] font-semibold"
                :class="activeLeg === 'return' ? 'text-ca-navy' : 'text-gray-500'"
              >
                选择返程航班
              </div>
              <div
                class="mt-1 text-sm"
                :class="activeLeg === 'return' ? 'text-gray-600' : 'text-gray-400'"
              >
                {{ arrLabel }} → {{ depLabel }}
              </div>
              <div
                class="mt-0.5 text-sm"
                :class="activeLeg === 'return' ? 'text-gray-600' : 'text-gray-400'"
              >
                {{ returnDateLabel }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-loading="loading"
        element-loading-text="正在加载航班..."
        class="mt-5 min-h-[260px]"
      >
        <FlightFareTable
          :flights="activeFlights"
          :roundtrip="isRoundTrip"
          :leg="activeLeg"
          @select="onLegSelect"
        />
      </div>
    </template>

    <FlightDetailDialog
      v-model="detailVisible"
      :flight="detailFlight || outboundFlights[0]"
    />
  </section>
</template>