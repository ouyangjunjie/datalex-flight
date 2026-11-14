<script setup>
import { computed } from 'vue'
import { getCabinPolicy } from '../mock/policy'

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

const depAirport = computed(() => parseAirport(props.flight?.depAirport))
const arrAirport = computed(() => parseAirport(props.flight?.arrAirport))

const cabinRows = computed(() =>
  (props.flight?.priceList || []).map((item) => ({
    ...item,
    ...getCabinPolicy(item.cabin, item.refundRule),
  })),
)

function parseAirport(value) {
  const match = /^(.+?)\(([A-Z0-9]+)\)$/.exec(value || '')
  return match ? { name: match[1], code: match[2] } : { name: value || '', code: '' }
}

function refundTagClass(rule = '') {
  return rule.includes('免费')
    ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
    : 'border border-amber-100 bg-amber-50 text-amber-600'
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="航班详情"
    width="min(760px, 92vw)"
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
                {{ flight.isDirect ? '直飞' : '经停' }}
              </el-tag>
            </div>
            <div class="mt-1 text-xs text-gray-500">
              爱达航 · {{ flight.aircraft || '机型待定' }}
            </div>
          </div>
        </div>

        <div class="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div>
            <div class="text-2xl font-semibold text-ca-navy">{{ flight.depTime }}</div>
            <div class="mt-1 text-xs text-gray-500">
              {{ depAirport.name }}
              <span class="ml-0.5 font-medium text-gray-400">{{ depAirport.code }}</span>
            </div>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-[11px] text-gray-400">{{ flight.duration }}</span>
            <div class="my-1 flex w-16 items-center gap-1">
              <span class="h-px flex-1 bg-gray-300"></span>
              <span class="text-gray-300">›</span>
              <span class="h-px flex-1 bg-gray-300"></span>
            </div>
            <span class="text-[11px] text-gray-400">{{ flight.isDirect ? '直飞' : '经停' }}</span>
          </div>
          <div class="text-right">
            <div class="text-2xl font-semibold text-ca-navy">{{ flight.arrTime }}</div>
            <div class="mt-1 text-xs text-gray-500">
              {{ arrAirport.name }}
              <span class="ml-0.5 font-medium text-gray-400">{{ arrAirport.code }}</span>
            </div>
          </div>
        </div>
      </div>

      <section>
        <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-ca-navy">
          <span class="h-3.5 w-1 rounded-full bg-ca-red"></span>
          机型信息
        </h3>
        <div class="grid grid-cols-2 gap-3 rounded-lg border border-gray-100 p-4 text-sm sm:grid-cols-4">
          <div>
            <div class="text-xs text-gray-400">机型</div>
            <div class="mt-1 font-medium text-gray-700">{{ flight.aircraft || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-400">航班号</div>
            <div class="mt-1 font-medium text-gray-700">{{ flight.flightNo }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-400">飞行时长</div>
            <div class="mt-1 font-medium text-gray-700">{{ flight.duration }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-400">航班类型</div>
            <div class="mt-1 font-medium text-gray-700">
              {{ flight.isDirect ? '直飞' : '经停' }}
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
                <th class="px-3 py-2.5 font-medium">舱位</th>
                <th class="px-3 py-2.5 font-medium">随身行李</th>
                <th class="px-3 py-2.5 font-medium">免费托运行李</th>
                <th class="px-3 py-2.5 font-medium">超限说明</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="row in cabinRows" :key="row.cabin">
                <td class="whitespace-nowrap px-3 py-3 font-medium text-ca-navy">
                  {{ row.cabin }}
                </td>
                <td class="px-3 py-3 text-gray-600">{{ row.carryOn }}</td>
                <td class="px-3 py-3 text-gray-600">{{ row.checked }}</td>
                <td class="px-3 py-3 text-gray-500">{{ row.baggageNote }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="space-y-3 sm:hidden">
          <div
            v-for="row in cabinRows"
            :key="row.cabin"
            class="rounded-lg border border-gray-100 p-4"
          >
            <div class="font-medium text-ca-navy">{{ row.cabin }}</div>
            <dl class="mt-3 space-y-2 text-sm">
              <div class="flex gap-3">
                <dt class="w-24 shrink-0 text-xs leading-6 text-gray-400">随身行李</dt>
                <dd class="flex-1 text-gray-600">{{ row.carryOn }}</dd>
              </div>
              <div class="flex gap-3">
                <dt class="w-24 shrink-0 text-xs leading-6 text-gray-400">免费托运</dt>
                <dd class="flex-1 text-gray-600">{{ row.checked }}</dd>
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
            v-for="row in cabinRows"
            :key="row.cabin"
            class="rounded-lg border border-gray-100 p-4"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-medium text-ca-navy">{{ row.cabin }}</span>
                <span
                  class="rounded-md px-1.5 py-0.5 text-[11px] leading-none"
                  :class="refundTagClass(row.refundRule)"
                >
                  {{ row.refundRule }}
                </span>
                <span class="text-xs text-gray-400">行李 {{ row.baggage }}</span>
              </div>
              <span class="text-base font-semibold text-ca-red">¥{{ row.price }}</span>
            </div>

            <div class="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div class="rounded-md bg-gray-50 p-3">
                <div class="text-xs text-gray-400">退票</div>
                <p class="mt-1 leading-6 text-gray-600">{{ row.refund }}</p>
              </div>
              <div class="rounded-md bg-gray-50 p-3">
                <div class="text-xs text-gray-400">改期</div>
                <p class="mt-1 leading-6 text-gray-600">{{ row.change }}</p>
              </div>
            </div>
          </div>
        </div>
        <p class="mt-3 text-xs leading-5 text-gray-400">
          以上为演示条款，实际退改及行李规则以购票时展示为准。
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