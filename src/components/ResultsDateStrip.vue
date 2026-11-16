<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight, Calendar } from '@element-plus/icons-vue'
import { useLowestPrices } from '../composables/useLowestPrices'
import {
  addDays,
  formatDate,
  formatMonthDay,
  parseDate,
  startOfToday,
  weekdayLabel,
} from '../utils/date'

const props = defineProps({
  depCity: {
    type: String,
    default: '',
  },
  arrCity: {
    type: String,
    default: '',
  },
  selectedDate: {
    type: String,
    default: '',
  },
  returnDate: {
    type: String,
    default: '',
  },
  tripType: {
    type: String,
    default: 'oneway',
  },
})

const emit = defineEmits(['select'])

const { priceFor, isLoading, loadPrices } = useLowestPrices()

const today = startOfToday()
const moreVisible = ref(false)
const moreDate = ref(props.selectedDate)

const isRoundtrip = computed(() => props.tripType === 'roundtrip')

const offsetDays = computed(() => {
  const depart = parseDate(props.selectedDate)
  const ret = parseDate(props.returnDate)
  if (!depart || !ret) return 0
  return Math.max(0, Math.round((ret.getTime() - depart.getTime()) / 86400000))
})

function windowStartFor(value) {
  const selected = parseDate(value) || today
  const start = addDays(selected, -3)
  return start.getTime() < today.getTime() ? today : start
}

const start = ref(windowStartFor(props.selectedDate))

watch(
  () => props.selectedDate,
  (value) => {
    moreDate.value = value
    const selected = parseDate(value)
    if (!selected) return

    const end = addDays(start.value, 6)
    if (selected < start.value || selected > end) {
      start.value = windowStartFor(value)
    }
  },
)

const canGoPrev = computed(() => start.value.getTime() > today.getTime())

const days = computed(() => {
  const list = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start.value, index)
    const returnDate = addDays(date, offsetDays.value)
    const key = formatDate(date)
    const fetched = priceFor(props.depCity, props.arrCity, key)
    return {
      key,
      label: formatMonthDay(date),
      weekday: weekdayLabel(date),
      returnLabel: formatMonthDay(returnDate),
      returnWeekday: weekdayLabel(returnDate),
      price: fetched === undefined ? null : fetched,
      loading: isLoading(props.depCity, props.arrCity, key),
    }
  })

  const prices = list.filter((day) => day.price !== null).map((day) => day.price)
  const lowest = prices.length ? Math.min(...prices) : null

  return list.map((day) => ({
    ...day,
    lowest: day.price !== null && day.price === lowest,
  }))
})

// 日期窗口/航线变化时按需拉取最低价（接口结果按航线+日期缓存）
watch(
  () => `${props.depCity}-${props.arrCity}-${days.value.map((day) => day.key).join(',')}`,
  () => {
    loadPrices(
      props.depCity,
      props.arrCity,
      days.value.map((day) => day.key),
    )
  },
  { immediate: true },
)

function shiftWindow(offset) {
  const next = addDays(start.value, offset)
  start.value = next.getTime() < today.getTime() ? today : next
}

function selectDate(key) {
  emit('select', key)
}

function onMoreDate(value) {
  if (!value) return
  moreVisible.value = false
  emit('select', value)
}

function disablePast(date) {
  return date.getTime() < today.getTime()
}
</script>

<template>
  <div class="flex items-stretch rounded-lg border border-gray-100 bg-white shadow-sm">
    <button
      type="button"
      class="plain-button flex w-9 shrink-0 items-center justify-center border-r border-gray-100 text-gray-400 transition hover:text-ca-navy disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="!canGoPrev"
      aria-label="前一周"
      @click="shiftWindow(-7)"
    >
      <el-icon :size="18"><ArrowLeft /></el-icon>
    </button>

    <div class="flex min-w-0 flex-1 overflow-x-auto">
      <button
        v-for="day in days"
        :key="day.key"
        type="button"
        class="plain-button relative flex min-w-[92px] flex-1 flex-col items-center justify-center gap-1.5 border-r border-gray-100 px-2 py-2.5 transition last:border-r-0 hover:bg-ca-bg"
        :aria-pressed="day.key === selectedDate"
        :aria-label="`${day.label} ${day.weekday}${day.price === null ? ' 暂无价格' : ` 最低票价 ${day.price} 元`}`"
        @click="selectDate(day.key)"
      >
        <template v-if="isRoundtrip">
          <span class="flex flex-col items-center leading-tight">
            <span
              class="whitespace-nowrap text-xs"
              :class="day.key === selectedDate ? 'font-medium text-ca-navy' : 'text-gray-600'"
            >
              {{ day.label }} {{ day.weekday }}
            </span>
            <span
              class="whitespace-nowrap text-xs"
              :class="day.key === selectedDate ? 'font-medium text-ca-navy' : 'text-gray-600'"
            >
              {{ day.returnLabel }} {{ day.returnWeekday }}
            </span>
          </span>
        </template>
        <span
          v-else
          class="whitespace-nowrap text-xs"
          :class="day.key === selectedDate ? 'font-medium text-ca-navy' : 'text-gray-500'"
        >
          {{ day.label }} {{ day.weekday }}
        </span>

        <span class="flex items-baseline gap-1">
          <span v-if="day.lowest" class="text-[10px] font-semibold text-ca-red">低</span>
          <span
            class="text-[15px] font-semibold"
            :class="
              day.key === selectedDate
                ? 'text-ca-navy'
                : day.lowest
                  ? 'text-ca-red'
                  : 'text-ca-navy'
            "
          >
            ¥{{ day.loading ? '…' : day.price === null ? '—' : day.price }}
          </span>
        </span>

        <template v-if="day.key === selectedDate">
          <span class="pointer-events-none absolute inset-0 border border-ca-navy"></span>
          <span class="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-ca-navy"></span>
        </template>
      </button>
    </div>

    <button
      type="button"
      class="plain-button flex w-9 shrink-0 items-center justify-center border-l border-gray-100 text-gray-400 transition hover:text-ca-navy"
      aria-label="后一周"
      @click="shiftWindow(7)"
    >
      <el-icon :size="18"><ArrowRight /></el-icon>
    </button>

    <el-popover
      v-model:visible="moreVisible"
      trigger="click"
      placement="bottom-end"
      :width="300"
    >
      <template #reference>
        <button
          type="button"
          class="plain-button flex shrink-0 items-center gap-1.5 border-l border-gray-100 px-3 text-[13px] text-gray-600 transition hover:text-ca-red"
          aria-label="更多日期"
        >
          <el-icon :size="17"><Calendar /></el-icon>
          <span class="hidden sm:inline">更多日期</span>
        </button>
      </template>

      <el-date-picker
        v-model="moreDate"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="选择日期"
        :disabled-date="disablePast"
        class="!w-full"
        @change="onMoreDate"
      />
    </el-popover>
  </div>
</template>