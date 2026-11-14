<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import FlightDetailDialog from './FlightDetailDialog.vue'

const props = defineProps({
  flight: {
    type: Object,
    required: true,
  },
  roundtrip: {
    type: Boolean,
    default: false,
  },
  leg: {
    type: String,
    default: 'outbound',
  },
})

const emit = defineEmits(['select'])

const CABINS = ['头等舱', '公务舱', '超级经济舱', '经济舱']

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

const cabinStyles = {
  头等舱: { cell: 'bg-amber-50/70 hover:bg-amber-100/70' },
  公务舱: { cell: 'bg-slate-50 hover:bg-slate-100' },
  超级经济舱: { cell: 'bg-blue-50/60 hover:bg-blue-100/60' },
  经济舱: { cell: 'bg-slate-50/80 hover:bg-slate-100' },
}

const fareLetters = {
  头等舱: ['F', 'A'],
  公务舱: ['R', 'J'],
  超级经济舱: ['W', 'G'],
  经济舱: ['B', 'Y'],
}

const fareMileage = {
  头等舱: '300%',
  公务舱: '300%',
  超级经济舱: '110%',
  经济舱: '100%',
}

const fareFullMultiplier = {
  头等舱: 1.6,
  公务舱: 3.7,
  超级经济舱: 2.2,
  经济舱: 2.4,
}

const detailVisible = ref(false)
const expandedCabin = ref(null)
const router = useRouter()

const depAirport = computed(() => parseAirport(props.flight.depAirport))
const arrAirport = computed(() => parseAirport(props.flight.arrAirport))
const depTerminal = computed(() => terminalCodes[depAirport.value.code] || '')
const arrTerminal = computed(() => terminalCodes[arrAirport.value.code] || '')
const shortAircraft = computed(
  () => aircraftCodes[props.flight.aircraft] || props.flight.aircraft || '—',
)
const availableCabins = computed(() =>
  CABINS.filter((cabin) => priceFor(cabin) !== null),
)

const bookLabel = computed(() =>
  props.roundtrip && props.leg === 'outbound' ? '选为去程' : '预订',
)

function parseAirport(value) {
  const match = /^(.+?)\(([A-Z0-9]+)\)$/.exec(value || '')
  return match ? { name: match[1], code: match[2] } : { name: value || '', code: '' }
}

function priceFor(cabin) {
  return props.flight.priceList.find((item) => item.cabin === cabin)?.price ?? null
}

function seatsLeft(cabin) {
  const seed = [...`${props.flight.flightNo}${cabin}`].reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  )
  return (seed % 8) + 2
}

function cellClass(cabin) {
  return cabinStyles[cabin]?.cell || 'bg-slate-50 hover:bg-slate-100'
}

function toggleExpand(cabin) {
  if (priceFor(cabin) === null) return
  expandedCabin.value = expandedCabin.value === cabin ? null : cabin
}

function fareOptions(cabin) {
  const item = props.flight.priceList.find((entry) => entry.cabin === cabin)
  if (!item) return []

  const label = cabin.replace(/舱$/, '')
  const letters = fareLetters[cabin] || ['Y', 'B']
  const mileage = fareMileage[cabin] || '100%'
  const discountRefund = item.refundRule.includes('免费') ? '0%起' : '20%起'
  const fullPrice = Math.round((item.price * (fareFullMultiplier[cabin] || 2)) / 10) * 10

  return [
    {
      name: `${label}折扣(${letters[0]}舱)`,
      price: item.price,
      refund: discountRefund,
      baggage: item.baggage,
      mileage,
      seats: seatsLeft(cabin),
    },
    {
      name: `${label}(${letters[1]}舱)`,
      price: fullPrice,
      refund: '0%起',
      baggage: item.baggage,
      mileage,
      seats: seatsLeft(cabin) + 1,
    },
  ]
}

const expandedFares = computed(() =>
  expandedCabin.value ? fareOptions(expandedCabin.value) : [],
)

function onBook(fare) {
  if (props.roundtrip && props.leg === 'outbound') {
    emit('select', {
      flight: props.flight,
      cabin: expandedCabin.value || '',
      fare,
    })
    return
  }

  router.push({
    name: 'booking-info',
    query: {
      flightNo: props.flight.flightNo,
      cabin: expandedCabin.value || '',
      fare: fare.name,
      price: String(fare.price),
    },
  })
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
          <div class="text-[15px] font-semibold text-ca-navy">{{ flight.flightNo }}</div>
          <div class="mt-1 text-[11px] text-gray-400">{{ shortAircraft }}</div>
        </div>
      </div>

      <div class="flex flex-col items-center justify-center border-r border-gray-100 px-3 py-3">
        <span
          class="text-[26px] font-semibold leading-none tracking-tight text-ca-navy"
        >
          {{ flight.depTime }}
        </span>
        <span class="mt-1.5 whitespace-nowrap text-xs text-gray-400">
          {{ depAirport.code }} {{ depTerminal }}
        </span>
      </div>

      <div class="flex flex-col items-center justify-center border-r border-gray-100 px-3 py-3">
        <span
          class="text-[26px] font-semibold leading-none tracking-tight text-ca-navy"
        >
          {{ flight.arrTime }}
        </span>
        <span class="mt-1.5 whitespace-nowrap text-xs text-gray-400">
          {{ arrAirport.code }} {{ arrTerminal }}
        </span>
      </div>

      <div class="flex flex-col items-center justify-center border-r border-gray-100 px-2 py-2 text-center">
        <span
          v-if="!flight.isDirect"
          class="mb-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] leading-none text-gray-500"
        >
          经停
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
            :key="fare.name"
            class="flex flex-wrap items-center gap-x-12 gap-y-4 border-b border-gray-100 py-5 last:border-b-0"
          >
            <div class="min-w-[160px] text-[17px] font-semibold text-ca-navy">
              {{ fare.name }}
            </div>

            <div class="text-center">
              <div class="text-xs text-gray-400">退改费</div>
              <div
                class="mt-1 border-b border-dotted border-gray-300 pb-0.5 text-[17px] text-gray-700"
              >
                {{ fare.refund }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400">行李额</div>
              <div
                class="mt-1 border-b border-dotted border-gray-300 pb-0.5 text-[17px] text-gray-700"
              >
                {{ fare.baggage }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400">里程累积</div>
              <div
                class="mt-1 border-b border-dotted border-gray-300 pb-0.5 text-[17px] text-gray-700"
              >
                {{ fare.mileage }}
              </div>
            </div>

            <div class="ml-auto flex items-center gap-6">
              <span class="text-[24px] font-semibold text-ca-navy">¥{{ fare.price }}</span>
              <el-button
                type="primary"
                class="!h-11 min-w-[120px] !rounded-lg !text-base"
                @click="onBook(fare)"
              >
                {{ bookLabel }}
              </el-button>
              <span class="text-sm text-gray-400">剩余{{ fare.seats }}张</span>
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
            <div class="text-[15px] font-semibold text-ca-navy">{{ flight.flightNo }}</div>
            <div class="mt-0.5 text-[11px] text-gray-400">{{ shortAircraft }}</div>
          </div>
        </div>

        <span
          v-if="!flight.isDirect"
          class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] leading-none text-gray-500"
        >
          经停
        </span>
      </div>

      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3">
        <div>
          <div class="text-[26px] font-semibold leading-none tracking-tight text-ca-navy">
            {{ flight.depTime }}
          </div>
          <div class="mt-1.5 text-xs text-gray-400">
            {{ depAirport.code }} {{ depTerminal }}
          </div>
        </div>

        <div class="flex flex-col items-center text-[11px] text-gray-400">
          <div
            class="flex items-center gap-1.5 whitespace-nowrap border-b border-gray-300 pb-0.5"
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

        <div class="text-right">
          <div class="text-[26px] font-semibold leading-none tracking-tight text-ca-navy">
            {{ flight.arrTime }}
          </div>
          <div class="mt-1.5 text-xs text-gray-400">
            {{ arrAirport.code }} {{ arrTerminal }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2 px-4 pb-4">
        <div
          v-for="cabin in availableCabins"
          :key="cabin"
          class="relative rounded-md border border-transparent p-2.5 text-left transition"
          :class="cellClass(cabin)"
        >
          <span class="text-[11px] text-gray-500">{{ cabin }}</span>
          <span v-if="roundtrip" class="mt-0.5 block text-[10px] text-gray-400">往返总价</span>
          <span class="mt-1 block whitespace-nowrap text-base font-semibold text-ca-navy">
            ¥{{ priceFor(cabin) }}<span class="text-[10px] font-normal text-gray-500">起</span>
          </span>
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