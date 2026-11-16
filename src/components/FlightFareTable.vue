<script setup>
import { computed, ref } from 'vue'
import { CaretBottom, CaretTop } from '@element-plus/icons-vue'
import FlightItem from './FlightItem.vue'

const props = defineProps({
  flights: {
    type: Array,
    default: () => [],
  },
  roundtrip: {
    type: Boolean,
    default: false,
  },
})

const CABINS = ['头等舱', '公务舱', '超级经济舱', '经济舱']

const cabinHeaderClass = {
  头等舱: 'bg-ca-gold hover:bg-[#bd9455]',
  公务舱: 'bg-ca-navy hover:bg-[#243a63]',
  超级经济舱: 'bg-[#34517d] hover:bg-[#2a456e]',
  经济舱: 'bg-[#6b7f9e] hover:bg-[#5d7292]',
}

const directOnly = ref(false)
const carrierOnly = ref(false)
const sortKey = ref('')
const sortDir = ref('asc')

function priceFor(flight, cabin) {
  return flight.priceList.find((item) => item.cabin === cabin)?.price ?? null
}

function durationMinutes(value) {
  const hours = Number(/(\d+)h/.exec(value)?.[1] || 0)
  const minutes = Number(/(\d+)m/.exec(value)?.[1] || 0)
  return hours * 60 + minutes
}

function sortValue(flight, key) {
  if (key === 'depTime') return flight.depTime
  if (key === 'arrTime') return flight.arrTime
  if (key === 'duration') return durationMinutes(flight.duration)
  return priceFor(flight, key) ?? Infinity
}

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function isActive(key, direction) {
  return sortKey.value === key && sortDir.value === direction
}

const rows = computed(() => {
  let list = props.flights.filter((flight) => !directOnly.value || flight.isDirect)

  if (carrierOnly.value) {
    list = list.filter((flight) => flight.isAirChinaOperated)
  }

  if (sortKey.value) {
    const direction = sortDir.value === 'asc' ? 1 : -1
    list = [...list].sort((a, b) => {
      const left = sortValue(a, sortKey.value)
      const right = sortValue(b, sortKey.value)
      if (left < right) return -1 * direction
      if (left > right) return 1 * direction
      return 0
    })
  }

  return list
})
</script>

<template>
  <section class="rounded-lg border border-gray-200 bg-white shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
      <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
        <el-checkbox v-model="directOnly">直飞航班</el-checkbox>
        <el-checkbox v-model="carrierOnly">国航实际承运航班</el-checkbox>
      </div>
      <span class="text-xs text-gray-400">以下价格为每位成人旅客不含税票价</span>
    </div>

    <div class="fare-grid sticky top-16 z-40 hidden items-stretch border-b border-gray-100 bg-[#f8f9fb] shadow-sm lg:grid">
      <div class="border-r border-gray-100 px-4 py-3 text-sm text-gray-500">航班/机型</div>

      <button
        type="button"
        class="plain-button flex items-center justify-center gap-1 border-r border-gray-100 py-3 text-sm text-gray-500 transition hover:text-ca-navy"
        @click="toggleSort('depTime')"
      >
        出发时间
        <span class="flex flex-col">
          <el-icon :size="8" :class="isActive('depTime', 'asc') ? 'text-ca-navy' : 'text-gray-400'">
            <CaretTop />
          </el-icon>
          <el-icon :size="8" :class="isActive('depTime', 'desc') ? 'text-ca-navy' : 'text-gray-400'">
            <CaretBottom />
          </el-icon>
        </span>
      </button>

      <button
        type="button"
        class="plain-button flex items-center justify-center gap-1 border-r border-gray-100 py-3 text-sm text-gray-500 transition hover:text-ca-navy"
        @click="toggleSort('arrTime')"
      >
        到达时间
        <span class="flex flex-col">
          <el-icon :size="8" :class="isActive('arrTime', 'asc') ? 'text-ca-navy' : 'text-gray-400'">
            <CaretTop />
          </el-icon>
          <el-icon :size="8" :class="isActive('arrTime', 'desc') ? 'text-ca-navy' : 'text-gray-400'">
            <CaretBottom />
          </el-icon>
        </span>
      </button>

      <button
        type="button"
        class="plain-button flex items-center justify-center gap-1 border-r border-gray-100 py-3 text-sm text-gray-500 transition hover:text-ca-navy"
        @click="toggleSort('duration')"
      >
        总时长
        <span class="flex flex-col">
          <el-icon :size="8" :class="isActive('duration', 'asc') ? 'text-ca-navy' : 'text-gray-400'">
            <CaretTop />
          </el-icon>
          <el-icon :size="8" :class="isActive('duration', 'desc') ? 'text-ca-navy' : 'text-gray-400'">
            <CaretBottom />
          </el-icon>
        </span>
      </button>

      <button
        v-for="(cabin, index) in CABINS"
        :key="cabin"
        type="button"
        class="plain-button flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-white transition"
        :class="[
          cabinHeaderClass[cabin],
          index === 0 ? 'rounded-tl-lg' : '',
          index === CABINS.length - 1 ? 'rounded-tr-lg' : '',
        ]"
        @click="toggleSort(cabin)"
      >
        {{ cabin }}
        <span class="flex flex-col">
          <el-icon :size="8" :class="isActive(cabin, 'asc') ? 'text-white' : 'text-white/45'">
            <CaretTop />
          </el-icon>
          <el-icon :size="8" :class="isActive(cabin, 'desc') ? 'text-white' : 'text-white/45'">
            <CaretBottom />
          </el-icon>
        </span>
      </button>
    </div>

    <template v-if="rows.length">
      <FlightItem
        v-for="flight in rows"
        :key="flight.key"
        :flight="flight"
        :roundtrip="roundtrip"
      />
    </template>

    <div v-else class="px-4 py-10">
      <el-empty description="暂无符合条件的航班" />
    </div>
  </section>
</template>

<style scoped>
.fare-grid {
  grid-template-columns:
    minmax(140px, 1.1fr) minmax(120px, 1.2fr) minmax(120px, 1.2fr) 130px
    repeat(4, minmax(96px, 1fr));
}
</style>