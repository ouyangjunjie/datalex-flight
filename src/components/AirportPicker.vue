<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowDown, Location, Search } from '@element-plus/icons-vue'
import {
  airportByCode,
  alphabetGroups,
  groupForInitial,
  regions,
  searchAirports,
  airports,
} from '../constants/airports'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '输入城市或机场三字码',
  },
  initialRegion: {
    type: String,
    default: 'domestic',
  },
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const keyword = ref('')
const activeRegion = ref(props.initialRegion)
const activeGroup = ref('hot')

const selected = computed(() => airportByCode(props.modelValue))

watch(visible, (open) => {
  if (!open) return
  keyword.value = ''
  activeGroup.value = 'hot'
  activeRegion.value = props.initialRegion || selected.value?.region || 'domestic'
})

const searching = computed(() => Boolean(keyword.value.trim()))

const list = computed(() => {
  if (searching.value) return searchAirports(keyword.value)

  const result = airports.filter(
    (airport) =>
      airport.region === activeRegion.value &&
      (activeGroup.value === 'hot'
        ? airport.hot
        : groupForInitial(airport.initial) === activeGroup.value),
  )
  if (activeGroup.value !== 'hot') {
    result.sort((a, b) => a.pinyin.localeCompare(b.pinyin) || a.code.localeCompare(b.code))
  }
  return result
})

function choose(airport) {
  emit('update:modelValue', airport.code)
  visible.value = false
}

function setRegion(key) {
  activeRegion.value = key
  activeGroup.value = 'hot'
  keyword.value = ''
}

function setGroup(key) {
  activeGroup.value = key
  keyword.value = ''
}
</script>

<template>
  <el-popover
    v-model:visible="visible"
    placement="bottom-start"
    :width="760"
    trigger="click"
    :show-after="0"
    :hide-after="0"
    popper-class="airport-picker-popper"
  >
    <template #reference>
      <button type="button" class="plain-button w-full text-left">
        <span class="flex items-center gap-1 text-xs text-gray-400">
          <el-icon :size="13"><Location /></el-icon>
          {{ label }}
        </span>
        <span class="mt-px flex items-center justify-between gap-2">
          <span
            class="truncate text-[18px] leading-7"
            :class="selected ? 'text-gray-700' : 'text-gray-400'"
          >
            {{ selected ? `${selected.name} ${selected.code}` : placeholder }}
          </span>
          <el-icon :size="14" class="shrink-0 text-gray-400"><ArrowDown /></el-icon>
        </span>
      </button>
    </template>

    <div class="airport-panel">
      <div class="airport-panel__search">
        <el-input v-model="keyword" :prefix-icon="Search" :placeholder="placeholder" clearable />
      </div>

      <div class="airport-panel__body">
        <div class="airport-panel__regions">
          <button
            v-for="region in regions"
            :key="region.key"
            type="button"
            class="plain-button airport-region"
            :class="activeRegion === region.key ? 'airport-region--active' : ''"
            @click="setRegion(region.key)"
          >
            {{ region.label }}
          </button>
        </div>

        <div class="airport-panel__main">
          <div class="airport-panel__groups">
            <button
              v-for="group in alphabetGroups"
              :key="group.key"
              type="button"
              class="plain-button airport-group"
              :class="activeGroup === group.key && !searching ? 'airport-group--active' : ''"
              @click="setGroup(group.key)"
            >
              {{ group.label }}
            </button>
          </div>

          <div class="airport-panel__list">
            <p v-if="searching" class="airport-panel__hint">搜索结果（全部地区）</p>
            <div v-if="list.length" class="airport-grid">
              <button
                v-for="airport in list"
                :key="airport.code"
                type="button"
                class="plain-button airport-item"
                :class="airport.code === modelValue ? 'airport-item--active' : ''"
                :title="`${airport.name} ${airport.code} ${airport.airport}`"
                @click="choose(airport)"
              >
                {{ airport.name }}
              </button>
            </div>
            <p v-else class="airport-panel__empty">未找到相关机场，试试城市名或三字码</p>
          </div>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<style scoped>
.airport-panel {
  font-size: 14px;
}

.airport-panel__search {
  padding: 10px 14px;
  border-bottom: 1px solid #f0f1f4;
}

.airport-panel__body {
  display: flex;
  height: 312px;
}

.airport-panel__regions {
  width: 116px;
  flex-shrink: 0;
  border-right: 1px solid #f0f1f4;
  background: #fafbfc;
  padding-top: 10px;
}

.airport-region {
  display: block;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  line-height: 1.4;
  color: #4b5563;
  transition: background 0.15s ease, color 0.15s ease;
}

.airport-region:hover {
  color: #c7000b;
}

.airport-region--active {
  background: #123a73;
  color: #fff;
  font-weight: 600;
}

.airport-region--active:hover {
  color: #fff;
}

.airport-panel__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.airport-panel__groups {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 14px;
  border-bottom: 1px solid #f0f1f4;
}

.airport-group {
  padding: 4px 8px;
  color: #4b5563;
  border-radius: 3px;
  transition: color 0.15s ease, background 0.15s ease;
}

.airport-group:hover {
  color: #c7000b;
}

.airport-group--active {
  color: #c7000b;
  background: #fdf0f0;
  font-weight: 600;
}

.airport-panel__list {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
}

.airport-panel__hint {
  margin-bottom: 10px;
  color: #9ca3af;
  font-size: 12px;
}

.airport-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px 10px;
}

.airport-item {
  padding: 3px 2px;
  text-align: left;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s ease;
}

.airport-item:hover,
.airport-item--active {
  color: #c7000b;
  font-weight: 600;
}

.airport-panel__empty {
  padding: 48px 0;
  text-align: center;
  color: #9ca3af;
}
</style>
