<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import FlightDetailDialog from './FlightDetailDialog.vue'
import { verifyFare } from '../composables/useFlightStore'
import { CABIN_ORDER } from '../constants/fare'

const props = defineProps({
  flight: {
    type: Object,
    required: true,
  },
  roundtrip: {
    type: Boolean,
    default: false,
  },
})

const CABINS = CABIN_ORDER

const cabinStyles = {
  头等舱: { cell: 'bg-amber-50/70 hover:bg-amber-100/70' },
  公务舱: { cell: 'bg-slate-50 hover:bg-slate-100' },
  超级经济舱: { cell: 'bg-blue-50/60 hover:bg-blue-100/60' },
  经济舱: { cell: 'bg-slate-50/80 hover:bg-slate-100' },
}

const detailVisible = ref(false)
const expandedCabin = ref(null)
const bookingKey = ref('')
const router = useRouter()

const returnLeg = computed(() => props.flight.legs?.[1] || null)
const shortAircraft = computed(
  () => props.flight.aircraftCode || props.flight.aircraft || '—',
)
const availableCabins = computed(() =>
  CABINS.filter((cabin) => cabinItem(cabin) !== null),
)

function cabinItem(cabin) {
  return props.flight.priceList?.find((item) => item.cabin === cabin) || null
}

function priceFor(cabin) {
  return cabinItem(cabin)?.price ?? null
}

function seatsLeft(cabin) {
  const seats = (cabinItem(cabin)?.fares || [])
    .map((fare) => fare.seats)
    .filter((value) => Number.isFinite(value) && value > 0)
  return seats.length ? Math.min(...seats) : null
}

function cellClass(cabin) {
  return cabinStyles[cabin]?.cell || 'bg-slate-50 hover:bg-slate-100'
}

function stopsLabel(target) {
  if ((target?.segments?.length || 0) > 1) return '中转'
  if ((target?.segments?.[0]?.stopQuantity || 0) > 0) return '经停'
  return '直飞'
}

function toggleExpand(cabin) {
  if (priceFor(cabin) === null) return
  expandedCabin.value = expandedCabin.value === cabin ? null : cabin
}

function fareOptions(cabin) {
  return cabinItem(cabin)?.fares || []
}

const expandedFares = computed(() =>
  expandedCabin.value ? fareOptions(expandedCabin.value) : [],
)

function isBooking(fare) {
  return bookingKey.value === fare.itineraryPriceId
}

async function onBook(fare) {
  if (bookingKey.value) return
  bookingKey.value = fare.itineraryPriceId
  try {
    await verifyFare(props.flight, fare)
    router.push({ name: 'booking-info' })
  } catch (error) {
    ElMessage.error(error?.message || '验价失败，请稍后重试')
  } finally {
    bookingKey.value = ''
  }
}
</script>

<template>
  <article class="border-b border-gray-100 last:border-b-0">
    <div class="fare-grid hidden lg:grid">
      <div class="flex items-center gap-2.5 border-r border-gray-100 px-4 py-3.5">
        <svg viewBox="0 0 40 40" class="h-7 w-7 shrink-0" aria-hidden="true">
          <circle cx="20" cy="20" r="19" fill="#C7000B" fill-opacity="0.08" />
          <path
            d="M8 24.5c5.8-.9 9.2-3.9 12-9.4 1.1 5.1 4.2 8.4 12 9.4-6 1.1-9.1 3.4-12 7.2-2.9-3.8-6-6.1-12-7.2Z"
            fill="#C7000B"
          />
        </svg>
        <div class="min-w-0 leading-tight">
          <div class="whitespace-nowrap text-[15px] font-semibold text-ca-navy">
            {{ flight.flightNo }}
          </div>
          <div class="mt-1 text-[11px] text-gray-400">{{ shortAircraft }}</div>
          <div v-if="returnLeg" class="mt-0.5 whitespace-nowrap text-[10px] text-gray-400">
            返 {{ returnLeg.flightNo }}
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center justify-center border-r border-gray-100 px-3 py-3">
        <span class="text-[26px] font-semibold leading-none tracking-tight text-ca-navy">
          {{ flight.depTime }}
        </span>
        <span class="mt-1.5 whitespace-nowrap text-xs text-gray-400">
          {{ flight.depCode }} {{ flight.depTerminal }}
        </span>
      </div>

      <div class="flex flex-col items-center justify-center border-r border-gray-100 px-3 py-3">
        <span class="text-[26px] font-semibold leading-none tracking-tight text-ca-navy">
          {{ flight.arrTime }}
          <span v-if="flight.arrTimeSuffix" class="align-top text-[11px] text-ca-red">
            {{ flight.arrTimeSuffix }}
          </span>
        </span>
        <span class="mt-1.5 whitespace-nowrap text-xs text-gray-400">
          {{ flight.arrCode }} {{ flight.arrTerminal }}
        </span>
      </div>

      <div class="flex flex-col items-center justify-center border-r border-gray-100 px-2 py-2 text-center">
        <span
          v-if="!flight.isDirect"
          class="mb-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] leading-none text-gray-500"
        >
          {{ stopsLabel(flight) }}
        </span>
        <div
          class="flex items-center gap-4 whitespace-nowrap border-b border-gray-300 pb-0.5 text-[11px] text-gray-500"
        >
          <span>{{ flight.duration }}</span>
          <button
            type="button"
            class="plain-button text-ca-navy transition hover:text-ca-red"
            @click="detailVisible = true"
          >
            航班详情
          </button>
        </div>
      </div>

      <div
        v-for="cabin in CABINS"
        :key="cabin"
        class="group relative border-l border-white/80"
      >
        <div
          class="relative flex h-full w-full flex-col items-center justify-center px-2 py-3 transition"
          :class="[cellClass(cabin), priceFor(cabin) === null ? 'cursor-default' : 'cursor-pointer']"
          role="button"
          :tabindex="priceFor(cabin) === null ? -1 : 0"
          :aria-expanded="expandedCabin === cabin"
          @click="toggleExpand(cabin)"
          @keydown.enter="toggleExpand(cabin)"
        >
          <div v-if="priceFor(cabin) !== null" class="flex flex-col items-center">
            <span v-if="roundtrip" class="mb-1 text-[11px] leading-none text-gray-400">
              往返总价
            </span>
            <div class="relative">
              <span class="whitespace-nowrap text-[22px] font-semibold leading-none text-ca-navy">
                ¥{{ priceFor(cabin) }}<span class="ml-0.5 text-xs font-normal text-gray-500">起</span>
              </span>
              <span
                v-if="seatsLeft(cabin) !== null"
                class="absolute -right-3 -top-5 flex h-6 w-6 items-center justify-center"
                :aria-label="`剩余 ${seatsLeft(cabin)} 张`"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="absolute h-6 w-6 text-[#cfd9ea]"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M7 4h10a1.5 1.5 0 0 1 1.5 1.5V13h-13V5.5A1.5 1.5 0 0 1 7 4Z" />
                  <path d="M4.5 13h15a1 1 0 0 1 1 1v3.5h-2.5V15h-12v2.5H3.5V14a1 1 0 0 1 1-1Z" />
                  <path d="M6 17.5h2.5V21H6zM15.5 17.5H18V21h-2.5z" />
                </svg>
                <span class="relative text-[11px] font-semibold leading-none text-ca-blue">
                  {{ seatsLeft(cabin) }}
                </span>
              </span>
            </div>
          </div>
          <span v-else class="text-sm text-gray-300">--</span>
        </div>

        <button
          v-if="priceFor(cabin) !== null"
          type="button"
          class="plain-button absolute bottom-0 left-1/2 z-10 flex h-5 w-5 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-white text-ca-navy shadow ring-1 ring-gray-200 transition hover:text-ca-red"
          :class="expandedCabin === cabin ? 'opacity-100' : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100'"
          :aria-expanded="expandedCabin === cabin"
          :aria-label="expandedCabin === cabin ? '收起舱位价格' : '展开舱位价格'"
          @click="toggleExpand(cabin)"
        >
          <el-icon :size="11">
            <ArrowUp v-if="expandedCabin === cabin" />
            <ArrowDown v-else />
          </el-icon>
        </button>
      </div>

      <div
        v-if="expandedCabin"
        class="col-span-full border-t border-gray-100 bg-white px-6 py-2"
      >
        <div>
          <div
            v-for="fare in expandedFares"
            :key="fare.itineraryPriceId"
            class="flex flex-wrap items-center gap-x-12 gap-y-4 border-b border-gray-100 py-5 last:border-b-0"
          >
            <div class="min-w-[160px] text-[17px] font-semibold text-ca-navy">
              {{ expandedCabin }} · {{ fare.name }}
            </div>

            <div class="text-center">
              <div class="text-xs text-gray-400">退改费</div>
              <div class="mt-1 border-b border-dotted border-gray-300 pb-0.5 text-[17px] text-gray-700">
                {{ fare.refundLabel }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400">行李额</div>
              <div class="mt-1 border-b border-dotted border-gray-300 pb-0.5 text-[17px] text-gray-700">
                {{ fare.baggage || '—' }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400">里程累积</div>
              <div class="mt-1 border-b border-dotted border-gray-300 pb-0.5 text-[17px] text-gray-700">
                {{ fare.mileage || '—' }}
              </div>
            </div>

            <div class="ml-auto flex items-center gap-6">
              <span class="text-[24px] font-semibold text-ca-navy">¥{{ fare.price }}</span>
              <el-button
                type="primary"
                class="!h-11 min-w-[120px] !rounded-lg !text-base"
                :loading="isBooking(fare)"
                @click="onBook(fare)"
              >
                预订
              </el-button>
              <span v-if="fare.seats" class="text-sm text-gray-400">剩余{{ fare.seats }}张</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:hidden">
      <div class="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div class="flex min-w-0 items-center gap-2.5">
          <svg viewBox="0 0 40 40" class="h-7 w-7 shrink-0" aria-hidden="true">
            <circle cx="20" cy="20" r="19" fill="#C7000B" fill-opacity="0.08" />
            <path
              d="M8 24.5c5.8-.9 9.2-3.9 12-9.4 1.1 5.1 4.2 8.4 12 9.4-6 1.1-9.1 3.4-12 7.2-2.9-3.8-6-6.1-12-7.2Z"
              fill="#C7000B"
            />
          </svg>
          <div class="min-w-0 leading-tight">
            <div class="whitespace-nowrap text-[15px] font-semibold text-ca-navy">
              {{ flight.flightNo }}
            </div>
            <div class="mt-0.5 text-[11px] text-gray-400">
              {{ shortAircraft }}
              <span v-if="returnLeg">· 返 {{ returnLeg.flightNo }}</span>
            </div>
          </div>
        </div>

        <span
          v-if="roundtrip || !flight.isDirect"
          class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] leading-none text-gray-500"
        >
          {{ roundtrip ? '往返' : stopsLabel(flight) }}
        </span>
      </div>

      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3">
        <div>
          <div class="text-[26px] font-semibold leading-none tracking-tight text-ca-navy">
            {{ flight.depTime }}
          </div>
          <div class="mt-1.5 text-xs text-gray-400">
            {{ flight.depCode }} {{ flight.depTerminal }}
          </div>
        </div>

        <div class="flex flex-col items-center text-[11px] text-gray-400">
          <div class="flex items-center gap-1.5 whitespace-nowrap border-b border-gray-300 pb-0.5">
            <span>{{ flight.duration }}</span>
            <button
              type="button"
              class="plain-button text-ca-navy transition hover:text-ca-red"
              @click="detailVisible = true"
            >
              航班详情
            </button>
          </div>
        </div>

        <div class="text-right">
          <div class="text-[26px] font-semibold leading-none tracking-tight text-ca-navy">
            {{ flight.arrTime }}
            <span v-if="flight.arrTimeSuffix" class="align-top text-[11px] text-ca-red">
              {{ flight.arrTimeSuffix }}
            </span>
          </div>
          <div class="mt-1.5 text-xs text-gray-400">
            {{ flight.arrCode }} {{ flight.arrTerminal }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2 px-4 pb-4">
        <button
          v-for="cabin in availableCabins"
          :key="cabin"
          type="button"
          class="plain-button relative rounded-md border p-2.5 text-left transition"
          :class="[
            cellClass(cabin),
            expandedCabin === cabin ? 'border-ca-navy' : 'border-transparent',
          ]"
          :aria-expanded="expandedCabin === cabin"
          @click="toggleExpand(cabin)"
        >
          <span class="text-[11px] text-gray-500">{{ cabin }}</span>
          <span v-if="roundtrip" class="mt-0.5 block text-[10px] text-gray-400">往返总价</span>
          <span class="mt-1 block whitespace-nowrap text-base font-semibold text-ca-navy">
            ¥{{ priceFor(cabin) }}<span class="text-[10px] font-normal text-gray-500">起</span>
          </span>
        </button>
      </div>

      <div v-if="expandedCabin" class="border-t border-gray-100 px-4 py-3">
        <div
          v-for="fare in expandedFares"
          :key="fare.itineraryPriceId"
          class="space-y-2 border-b border-gray-100 py-3 last:border-b-0"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-medium text-ca-navy">
              {{ expandedCabin }} · {{ fare.name }}
            </span>
            <span class="text-base font-semibold text-ca-navy">¥{{ fare.price }}</span>
          </div>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>退改 {{ fare.refundLabel }}</span>
            <span>行李 {{ fare.baggage || '—' }}</span>
            <span>里程 {{ fare.mileage || '—' }}</span>
            <span v-if="fare.seats">剩余 {{ fare.seats }} 张</span>
          </div>
          <el-button
            type="primary"
            class="!h-9 w-full !rounded-lg"
            :loading="isBooking(fare)"
            @click="onBook(fare)"
          >
            预订
          </el-button>
        </div>
      </div>
    </div>

    <FlightDetailDialog v-model="detailVisible" :flight="flight" />
  </article>
</template>

<style scoped>
.fare-grid {
  grid-template-columns:
    minmax(140px, 1.1fr) minmax(120px, 1.2fr) minmax(120px, 1.2fr) 130px
    repeat(4, minmax(96px, 1fr));
}
</style>
