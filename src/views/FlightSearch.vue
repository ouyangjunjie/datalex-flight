<script setup>
import { computed, ref } from 'vue'
import { ArrowDown, RefreshRight } from '@element-plus/icons-vue'
import FlightSearchForm from '../components/FlightSearchForm.vue'
import BookingSteps from '../components/BookingSteps.vue'
import NoticeBar from '../components/NoticeBar.vue'
import ResultsDateStrip from '../components/ResultsDateStrip.vue'
import FlightFareTable from '../components/FlightFareTable.vue'
import { notices } from '../constants/notices'
import { cityName } from '../constants/airports'
import { clearSearch, flightStore, runSearch } from '../composables/useFlightStore'
import { searchQuery } from '../composables/useSearchQuery'
import { addDays, formatChineseDate, formatDate, parseDate } from '../utils/date'

const query = ref(null)

const flights = computed(() => flightStore.flights)
const loading = computed(() => flightStore.loading)
const errorMessage = computed(() => flightStore.error)

const isRoundTrip = computed(() => query.value?.tripType === 'roundtrip')

const depLabel = computed(() => {
  if (!query.value) return ''
  return (
    flights.value[0]?.depAirport ||
    `${cityName(query.value.depCity)}(${query.value.depCity})`
  )
})

const arrLabel = computed(() => {
  if (!query.value) return ''
  return (
    flights.value[0]?.arrAirport ||
    `${cityName(query.value.arrCity)}(${query.value.arrCity})`
  )
})

const tripLabel = computed(() => (isRoundTrip.value ? '往返' : '单程'))

const dateLabel = computed(() => formatChineseDate(query.value?.departDate))
const returnDateLabel = computed(() => formatChineseDate(query.value?.returnDate))

const passengerLabel = computed(() => {
  if (!query.value) return ''
  const { adults, children, infants } = query.value
  const parts = [`${adults}成人`]
  if (children) parts.push(`${children}儿童`)
  if (infants) parts.push(`${infants}婴儿`)
  return parts.join('，')
})

function diffDays(from, to) {
  const start = parseDate(from)
  const end = parseDate(to)
  if (!start || !end) return 0
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000))
}

async function loadFlights(params) {
  try {
    await runSearch(params)
  } catch {
    // 错误信息已写入 flightStore.error，由页面提示
  }
}

async function onSearch(params) {
  query.value = params
  await loadFlights(params)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function onDateSelect(date) {
  if (!query.value) return

  const offset = diffDays(query.value.departDate, query.value.returnDate)
  const nextReturn = formatDate(addDays(parseDate(date), offset))

  searchQuery.departDate = date
  if (isRoundTrip.value) searchQuery.returnDate = nextReturn

  const nextQuery = {
    ...query.value,
    departDate: date,
    returnDate: isRoundTrip.value ? nextReturn : query.value.returnDate,
  }
  query.value = nextQuery
  await loadFlights(nextQuery)
}

async function onRetry() {
  if (!query.value) return
  await loadFlights(query.value)
}

function onReroute() {
  clearSearch()
  query.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
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
            <template v-if="isRoundTrip && returnDateLabel">
              <span class="mx-2 text-gray-300">|</span>
              返程 {{ returnDateLabel }}
            </template>
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

      <el-alert
        v-if="errorMessage"
        class="mt-5"
        type="error"
        :closable="false"
        show-icon
        :title="errorMessage"
      >
        <template #default>
          <button
            type="button"
            class="plain-button mt-1 flex items-center gap-1 text-sm text-ca-red"
            @click="onRetry"
          >
            <el-icon :size="14"><RefreshRight /></el-icon>
            重新查询
          </button>
        </template>
      </el-alert>

      <div
        v-loading="loading"
        element-loading-text="正在查询航班..."
        class="mt-5 min-h-[260px]"
      >
        <FlightFareTable :flights="flights" :roundtrip="isRoundTrip" />
      </div>
    </template>
  </section>
</template>
