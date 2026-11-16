<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  flight: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const legs = computed(() => props.flight?.legs || [])

const fareRows = computed(() =>
  (props.flight?.priceList || []).flatMap((item) =>
    (item.fares || []).map((fare) => ({ ...fare, cabin: item.cabin })),
  ),
)

function refundTagClass(tag = '') {
  return tag.includes('免费')
    ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
    : 'border border-amber-100 bg-amber-50 text-amber-600'
}

function arrivalDate(segment) {
  if (!segment?.arrDate) return ''
  return segment.arrDate.slice(5).replace('-', '/')
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="航班详情"
    width="min(820px, 94vw)"
    align-center
    destroy-on-close
    body-class="flight-detail-dialog-body"
  >
    <div v-if="flight" class="space-y-6">
      <div class="rounded-lg bg-ca-bg p-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-semibold text-ca-navy">{{ flight.flightNo }}</span>
              <el-tag :type="flight.isDirect ? 'success' : 'info'" size="small">
                {{ flight.isDirect ? '直飞' : flight.segments.length > 1 ? '中转' : '经停' }}
              </el-tag>
            </div>
            <div class="mt-1 text-xs text-gray-500">
              爱达航 · {{ flight.aircraft || '机型待定' }}
            </div>
          </div>
          <div v-if="legs.length > 1" class="text-xs text-gray-500">
            共 {{ legs.length }} 段行程
          </div>
        </div>

        <div class="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div>
            <div class="text-2xl font-semibold text-ca-navy">{{ flight.depTime }}</div>
            <div class="mt-1 text-xs text-gray-500">
              {{ flight.depAirport }}
            </div>
            <div class="mt-0.5 text-[11px] text-gray-400">{{ flight.depTerminal }}</div>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-[11px] text-gray-400">{{ flight.duration }}</span>
            <div class="my-1 flex w-16 items-center gap-1">
              <span class="h-px flex-1 bg-gray-300"></span>
              <span class="text-gray-300">›</span>
              <span class="h-px flex-1 bg-gray-300"></span>
            </div>
            <span class="text-[11px] text-gray-400">
              {{ flight.isDirect ? '直飞' : '中转 / 经停' }}
            </span>
          </div>
          <div class="text-right">
            <div class="text-2xl font-semibold text-ca-navy">
              {{ flight.arrTime }}
              <span v-if="flight.arrTimeSuffix" class="align-top text-xs text-ca-red">
                {{ flight.arrTimeSuffix }}
              </span>
            </div>
            <div class="mt-1 text-xs text-gray-500">
              {{ flight.arrAirport }}
            </div>
            <div class="mt-0.5 text-[11px] text-gray-400">{{ flight.arrTerminal }}</div>
          </div>
        </div>
      </div>

      <section>
        <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-ca-navy">
          <span class="h-3.5 w-1 rounded-full bg-ca-red"></span>
          航段信息
        </h3>
        <div class="space-y-3">
          <div
            v-for="leg in legs"
            :key="`${leg.label}-${leg.flightNo}`"
            class="rounded-lg border border-gray-100 p-4"
          >
            <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span class="font-medium text-ca-navy">
                {{ leg.label }} · {{ leg.depDate }}
              </span>
              <span class="text-xs text-gray-400">总时长 {{ leg.duration }}</span>
            </div>

            <div class="mt-3 space-y-3">
              <div
                v-for="(segment, index) in leg.segments"
                :key="segment.id || index"
                class="grid gap-2 sm:grid-cols-[auto_1fr_auto_1fr] sm:items-center"
              >
                <div class="text-sm font-semibold text-ca-navy">
                  {{ segment.flightNo }}
                </div>
                <div class="text-xs text-gray-600">
                  {{ segment.depTime }} {{ segment.depCode }}
                  <span class="text-gray-400">{{ segment.depTerminal }}</span>
                  <span class="mx-1.5 text-gray-300">→</span>
                  {{ segment.arrTime }} {{ segment.arrCode }}
                  <span class="text-gray-400">{{ segment.arrTerminal }}</span>
                </div>
                <div class="text-xs text-gray-500">{{ segment.aircraft }}</div>
                <div class="text-xs text-gray-400 sm:text-right">
                  {{ segment.duration }}
                  <span v-if="segment.dayOffset">· 次日到达</span>
                </div>
              </div>

              <div
                v-if="leg.segments.length > 1"
                class="rounded bg-gray-50 px-3 py-2 text-xs text-gray-500"
              >
                中转停留
                <span class="font-medium text-gray-700">
                  {{ leg.segments[0].layover || '—' }}
                </span>
                ，请预留充足时间办理中转手续。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-ca-navy">
          <span class="h-3.5 w-1 rounded-full bg-ca-red"></span>
          行李细则
        </h3>
        <div class="hidden overflow-x-auto rounded-lg border border-gray-100 sm:block">
          <table class="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead class="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th class="px-3 py-2.5 font-medium">舱位 / 票价类型</th>
                <th class="px-3 py-2.5 font-medium">随身行李</th>
                <th class="px-3 py-2.5 font-medium">免费托运行李</th>
                <th class="px-3 py-2.5 font-medium">超限说明</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="row in fareRows" :key="row.itineraryPriceId">
                <td class="whitespace-nowrap px-3 py-3 font-medium text-ca-navy">
                  {{ row.cabin }} · {{ row.name }}
                </td>
                <td class="px-3 py-3 text-gray-600">{{ row.baggageCarryOn }}</td>
                <td class="px-3 py-3 text-gray-600">{{ row.baggageChecked }}</td>
                <td class="px-3 py-3 text-gray-500">{{ row.baggageNote }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="space-y-3 sm:hidden">
          <div
            v-for="row in fareRows"
            :key="row.itineraryPriceId"
            class="rounded-lg border border-gray-100 p-4"
          >
            <div class="font-medium text-ca-navy">{{ row.cabin }} · {{ row.name }}</div>
            <dl class="mt-3 space-y-2 text-sm">
              <div class="flex gap-3">
                <dt class="w-24 shrink-0 text-xs leading-6 text-gray-400">随身行李</dt>
                <dd class="flex-1 text-gray-600">{{ row.baggageCarryOn }}</dd>
              </div>
              <div class="flex gap-3">
                <dt class="w-24 shrink-0 text-xs leading-6 text-gray-400">免费托运</dt>
                <dd class="flex-1 text-gray-600">{{ row.baggageChecked }}</dd>
              </div>
              <div class="flex gap-3">
                <dt class="w-24 shrink-0 text-xs leading-6 text-gray-400">超限说明</dt>
                <dd class="flex-1 text-gray-500">{{ row.baggageNote }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section>
        <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-ca-navy">
          <span class="h-3.5 w-1 rounded-full bg-ca-red"></span>
          退改完整条款
        </h3>
        <div class="space-y-3">
          <div
            v-for="row in fareRows"
            :key="row.itineraryPriceId"
            class="rounded-lg border border-gray-100 p-4"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-medium text-ca-navy">
                  {{ row.cabin }} · {{ row.name }}
                </span>
                <span
                  class="rounded-md px-1.5 py-0.5 text-[11px] leading-none"
                  :class="refundTagClass(row.refundTag)"
                >
                  {{ row.refundTag }}
                </span>
                <span class="text-xs text-gray-400">行李 {{ row.baggage || '按舱位标准' }}</span>
              </div>
              <span class="text-base font-semibold text-ca-red">¥{{ row.price }}<span class="text-xs font-normal text-gray-400"> 起</span></span>
            </div>

            <div class="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div class="rounded-md bg-gray-50 p-3">
                <div class="text-xs text-gray-400">退票</div>
                <p class="mt-1 leading-6 text-gray-600">{{ row.refundText }}</p>
              </div>
              <div class="rounded-md bg-gray-50 p-3">
                <div class="text-xs text-gray-400">改期</div>
                <p class="mt-1 leading-6 text-gray-600">{{ row.changeText }}</p>
              </div>
            </div>
            <p v-if="row.ruleInfo" class="mt-2 text-[11px] text-gray-400">
              规则代码：{{ row.ruleInfo }}
            </p>
          </div>
        </div>
        <p class="mt-3 text-xs leading-5 text-gray-400">
          以上退改、行李规则来自查询接口返回，最终以出票时展示为准。
        </p>
      </section>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style>
.flight-detail-dialog-body {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
