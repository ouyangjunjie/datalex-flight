<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { cities } from '../constants/airports'
import { useLowestPrices } from '../composables/useLowestPrices'

const props = defineProps({
  depCity: {
    type: String,
    default: 'PEK',
  },
  arrCity: {
    type: String,
    default: 'PVG',
  },
  selectedDate: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select'])

const { priceFor, isLoading, loadPrices } = useLowestPrices()

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']
const WINDOW_DAYS = 14

function startOfToday() {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

function startOfWeek(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const offset = (result.getDay() + 6) % 7
  result.setDate(result.getDate() - offset)
  return result
}

function addDays(date, days) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  result.setDate(result.getDate() + days)
  return result
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDate(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function cityName(code) {
  return cities.find((city) => city.code === code)?.name || code
}

const today = startOfToday()
const weekStart = ref(startOfWeek(today))

watch(
  () => props.selectedDate,
  (value) => {
    const selected = parseDate(value)
    if (!selected) return

    const windowEnd = addDays(weekStart.value, WINDOW_DAYS)
    if (selected < weekStart.value || selected >= windowEnd) {
      weekStart.value = startOfWeek(selected)
    }
  },
  { immediate: true },
)

const rangeLabel = computed(() => {
  const end = addDays(weekStart.value, WINDOW_DAYS - 1)
  return `${weekStart.value.getMonth() + 1}月${weekStart.value.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
})

const canGoPrev = computed(
  () => weekStart.value.getTime() > startOfWeek(today).getTime(),
)

const cells = computed(() =>
  Array.from({ length: WINDOW_DAYS }, (_, index) => {
    const date = addDays(weekStart.value, index)
    const key = formatDate(date)
    const disabled = date < today
    const month = date.getMonth() + 1
    const day = date.getDate()
    const fetched = disabled ? null : priceFor(props.depCity, props.arrCity, key)

    return {
      key,
      date,
      day,
      month,
      shortLabel: `${month}/${day}`,
      label: `${month}月${day}日`,
      disabled,
      price: fetched === undefined ? null : fetched,
      loading: !disabled && isLoading(props.depCity, props.arrCity, key),
      selected: props.selectedDate === key,
    }
  }),
)

// 按需拉取 14 天窗口的最低价
watch(
  () => `${props.depCity}-${props.arrCity}-${cells.value.map((cell) => cell.key).join(',')}`,
  () => {
    loadPrices(
      props.depCity,
      props.arrCity,
      cells.value.filter((cell) => !cell.disabled).map((cell) => cell.key),
    )
  },
  { immediate: true },
)

const lowestPrice = computed(() => {
  const prices = cells.value
    .filter((cell) => !cell.disabled && cell.price !== null)
    .map((cell) => cell.price)

  return prices.length ? Math.min(...prices) : null
})

const routeHasPrices = computed(() => cells.value.some((cell) => cell.price !== null))

const selectedInfo = computed(() => {
  const selected = parseDate(props.selectedDate)
  if (!selected) return null
  const fetched = priceFor(
    props.depCity,
    props.arrCity,
    formatDate(selected),
  )

  return {
    label: `${selected.getMonth() + 1}月${selected.getDate()}日`,
    price: fetched === undefined ? null : fetched,
  }
})

function shiftWindow(days) {
  if (days < 0 && !canGoPrev.value) return
  weekStart.value = addDays(weekStart.value, days)
}

function cellClass(cell) {
  if (cell.disabled) return 'border-transparent bg-transparent text-gray-300'
  if (cell.selected) return 'border-ca-red bg-ca-red text-white shadow-sm'
  if (cell.price !== null && cell.price === lowestPrice.value) {
    return 'border-ca-gold/60 bg-ca-gold/5 text-ca-navy hover:border-ca-gold'
  }
  return 'border-gray-100 bg-white text-ca-navy hover:border-ca-red/40 hover:bg-ca-red/5'
}

function pick(cell) {
  if (cell.disabled || cell.price === null) return
  emit('select', cell.key)
}
</script>

<template>
  <section class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="flex items-center gap-2 text-base font-semibold text-ca-navy">
          <span class="h-4 w-1 rounded-full bg-ca-red"></span>
          价格日历
        </h2>
        <p class="mt-1 text-xs text-gray-500">
          {{ cityName(depCity) }} → {{ cityName(arrCity) }} · 经济舱最低含税价
        </p>
      </div>

      <div class="flex items-center gap-2">
        <el-button
          circle
          size="small"
          :disabled="!canGoPrev"
          aria-label="上一组日期"
          @click="shiftWindow(-7)"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="min-w-[108px] text-center text-xs text-gray-500">{{ rangeLabel }}</span>
        <el-button circle size="small" aria-label="下一组日期" @click="shiftWindow(7)">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <template v-if="routeHasPrices">
      <div class="mt-4 grid grid-cols-7 gap-1.5 text-center text-[11px] text-gray-400">
        <span v-for="weekday in WEEKDAYS" :key="weekday">{{ weekday }}</span>
      </div>

      <div class="mt-1 grid grid-cols-7 gap-1.5">
        <button
          v-for="cell in cells"
          :key="cell.key"
          type="button"
          class="plain-button flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-md border px-0.5 py-1.5 transition disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-[68px]"
          :class="cellClass(cell)"
          :disabled="cell.disabled || cell.price === null"
          :aria-pressed="cell.selected"
          :aria-label="
            cell.disabled
              ? undefined
              : `${cell.label} 最低票价 ${cell.price === null ? '暂无' : `${cell.price} 元`}`
          "
          @click="pick(cell)"
        >
          <span class="text-[10px] leading-none opacity-60">{{ cell.shortLabel }}</span>
          <span class="text-[13px] font-semibold leading-none">
            {{ cell.loading ? '…' : cell.price === null ? '—' : `¥${cell.price}` }}
          </span>
          <span
            class="h-[10px] text-[9px] leading-none"
            :class="
              cell.price !== null && cell.price === lowestPrice
                ? cell.selected
                  ? 'text-white/80'
                  : 'text-ca-gold'
                : 'text-transparent'
            "
          >
            最低
          </span>
        </button>
      </div>
    </template>

    <div
      v-else
      class="mt-4 rounded-md bg-ca-bg px-4 py-6 text-center text-sm text-gray-500"
    >
      该航线暂无价格数据，请调整出发或到达城市。
    </div>

    <div
      class="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md bg-ca-bg px-3 py-2 text-xs"
    >
      <span v-if="selectedInfo" class="text-gray-600">
        已选 {{ selectedInfo.label }}，当日最低
        <span class="font-semibold text-ca-red">
          {{ selectedInfo.price === null ? '—' : `¥${selectedInfo.price}` }}
        </span>
        起
      </span>
      <span v-else class="text-gray-600">点击日期查看当日最低票价</span>
      <span class="text-gray-400">含税参考价，实际以查询结果为准</span>
    </div>
  </section>
</template>