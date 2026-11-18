<script setup>
import { computed } from 'vue'
import { ArrowDown, Calendar, CirclePlus, Flag, Search, Switch, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AirportPicker from './AirportPicker.vue'
import { searchQuery } from '../composables/useSearchQuery'

const emit = defineEmits(['search'])

const trips = [
  { value: 'oneway', label: '单程' },
  { value: 'roundtrip', label: '往返' },
]

const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const form = searchQuery

const isRoundTrip = computed(() => form.tripType === 'roundtrip')

const passengerSummary = computed(
  () => `${form.adults}成人 ${form.children}儿童 ${form.infants}婴儿`,
)

const militarySummary = computed(() => `${form.disabledMilitary}残疾军人/伤残人民警察`)

const departWeekday = computed(() => {
  const date = parseDate(form.departDate)
  return date ? weekdays[date.getDay()] : ''
})

const returnWeekday = computed(() => {
  const date = parseDate(form.returnDate)
  return date ? weekdays[date.getDay()] : ''
})

function parseDate(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function startOfToday() {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

function disableDepartDate(date) {
  return date.getTime() < startOfToday().getTime()
}

function disableReturnDate(date) {
  const minDate = parseDate(form.departDate) || startOfToday()
  return date.getTime() < minDate.getTime()
}

function setTripType(type) {
  form.tripType = type
  if (type === 'oneway') {
    form.returnDate = ''
  }
}

function swapCities() {
  const current = form.depCity
  form.depCity = form.arrCity
  form.arrCity = current
}

function onSubmit() {
  if (form.depCity === form.arrCity) {
    ElMessage.warning('出发城市和到达城市不能相同')
    return
  }

  if (!form.departDate) {
    ElMessage.warning(isRoundTrip.value ? '请选择去程日期' : '请选择出发日期')
    return
  }

  if (parseDate(form.departDate) < startOfToday()) {
    ElMessage.warning('出发日期不能早于今天')
    return
  }

  if (isRoundTrip.value) {
    if (!form.returnDate) {
      ElMessage.warning('请选择返程日期')
      return
    }
    if (parseDate(form.returnDate) < parseDate(form.departDate)) {
      ElMessage.warning('返程日期不能早于去程日期')
      return
    }
  }

  emit('search', {
    tripType: form.tripType,
    depCity: form.depCity,
    arrCity: form.arrCity,
    departDate: form.departDate,
    returnDate: form.returnDate,
    adults: form.adults,
    children: form.children,
    infants: form.infants,
    disabledMilitary: form.disabledMilitary,
  })
}
</script>

<template>
  <el-card shadow="never" class="rounded-lg border border-gray-100">
    <div class="mb-4 flex items-center gap-8">
      <button
        v-for="trip in trips"
        :key="trip.value"
        type="button"
        class="plain-button relative pb-2 text-[15px] transition"
        :class="form.tripType === trip.value ? 'font-semibold text-ca-red' : 'text-gray-600 hover:text-ca-red'"
        @click="setTripType(trip.value)"
      >
        {{ trip.label }}
        <span
          v-if="form.tripType === trip.value"
          class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-ca-red"
        ></span>
      </button>
    </div>

    <div class="flex flex-col gap-3 lg:flex-row">
      <div class="field-box flex items-center gap-2 px-4 py-2.5 lg:min-w-0 lg:flex-1">
        <AirportPicker
          v-model="form.depCity"
          label="出发机场"
          initial-region="domestic"
        />

        <button
          type="button"
          class="plain-button flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ca-navy/60 text-ca-navy transition hover:bg-ca-navy hover:text-white"
          aria-label="互换出发到达城市"
          @click="swapCities"
        >
          <el-icon :size="16"><Switch /></el-icon>
        </button>

        <AirportPicker
          v-model="form.arrCity"
          label="到达机场"
          initial-region="domestic"
        />
      </div>

      <div class="field-box flex items-center gap-3 px-4 py-2.5 lg:w-[calc(33.333%+30px)] lg:shrink-0">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1 text-xs text-gray-400">
            <el-icon :size="13"><Calendar /></el-icon>
            {{ isRoundTrip ? '去程日期' : '出发日期' }}
          </div>
          <div class="mt-px flex items-baseline gap-1.5">
            <el-date-picker
              v-model="form.departDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择日期"
              :disabled-date="disableDepartDate"
              class="date-picker !w-auto min-w-0 flex-1"
            />
            <span
              v-if="departWeekday"
              class="shrink-0 whitespace-nowrap text-[14px] text-gray-500"
            >
              {{ departWeekday }}
            </span>
          </div>
        </div>

        <template v-if="isRoundTrip">
          <div class="h-10 w-px shrink-0 bg-gray-100"></div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1 text-xs text-gray-400">
              <el-icon :size="13"><Calendar /></el-icon>
              返程日期
            </div>
            <div class="mt-px flex items-baseline gap-1.5">
              <el-date-picker
                v-model="form.returnDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择日期"
                :disabled-date="disableReturnDate"
                class="date-picker !w-auto min-w-0 flex-1"
              />
              <span
                v-if="returnWeekday"
                class="shrink-0 whitespace-nowrap text-[14px] text-gray-500"
              >
                {{ returnWeekday }}
              </span>
            </div>
          </div>
        </template>

        <button
          v-else
          type="button"
          class="plain-button ml-auto flex shrink-0 items-center gap-1 text-[15px] text-gray-500 transition hover:text-ca-red"
          @click="setTripType('roundtrip')"
        >
          <el-icon :size="22" class="text-ca-red/40"><CirclePlus /></el-icon>
          添加返程
        </button>
      </div>
    </div>

    <div class="mt-3 flex flex-col gap-3 lg:flex-row">
      <div class="field-box px-4 py-2.5 lg:min-w-0 lg:flex-1">
        <el-popover placement="bottom-start" :width="260" trigger="click">
          <template #reference>
            <button type="button" class="plain-button w-full text-left">
              <span class="flex items-center gap-1 text-xs text-gray-400">
                <el-icon :size="13"><User /></el-icon>
                乘客类型
              </span>
              <span class="mt-px flex items-center justify-between gap-2">
                <span class="truncate text-[18px] leading-7 text-gray-700">
                  {{ passengerSummary }}
                </span>
                <el-icon :size="14" class="shrink-0 text-gray-400"><ArrowDown /></el-icon>
              </span>
            </button>
          </template>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700">成人</span>
              <el-input-number v-model="form.adults" :min="1" :max="9" size="small" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700">儿童</span>
              <el-input-number v-model="form.children" :min="0" :max="9" size="small" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700">婴儿</span>
              <el-input-number
                v-model="form.infants"
                :min="0"
                :max="form.adults"
                size="small"
              />
            </div>
          </div>
        </el-popover>
      </div>

      <div class="field-box px-4 py-2.5 lg:min-w-0 lg:flex-1">
        <el-popover placement="bottom-start" :width="280" trigger="click">
          <template #reference>
            <button type="button" class="plain-button w-full text-left">
              <span class="flex items-center gap-1 text-xs text-gray-400">
                <el-icon :size="13"><Flag /></el-icon>
                伤残军警乘客
              </span>
              <span class="mt-px flex items-center justify-between gap-2">
                <span class="truncate text-[18px] leading-7 text-gray-700">
                  {{ militarySummary }}
                </span>
                <el-icon :size="14" class="shrink-0 text-gray-400"><ArrowDown /></el-icon>
              </span>
            </button>
          </template>
          <div class="flex items-center justify-between gap-3">
            <span class="text-sm text-gray-700">残疾军人/伤残人民警察</span>
            <el-input-number
              v-model="form.disabledMilitary"
              :min="0"
              :max="form.adults"
              size="small"
            />
          </div>
        </el-popover>
      </div>

      <el-button
        type="primary"
        class="!h-full min-h-[64px] w-full rounded-lg text-lg font-medium lg:w-[calc(33.333%+30px)] lg:shrink-0"
        @click="onSubmit"
      >
        <el-icon class="mr-1.5" :size="20"><Search /></el-icon>
        查询
      </el-button>
    </div>
  </el-card>
</template>

<style scoped>
.field-box {
  box-sizing: border-box;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  transition: border-color 0.2s ease;
}

.field-box:hover,
.field-box:focus-within {
  border-color: #c7000b;
}

.date-picker :deep(.el-input__wrapper) {
  padding: 0;
  background: transparent;
  box-shadow: none !important;
}

.date-picker :deep(.el-input__inner) {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}
</style>
