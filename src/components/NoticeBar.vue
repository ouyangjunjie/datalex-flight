<script setup>
import { computed, ref } from 'vue'
import { ArrowDown, InfoFilled, WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  type: {
    type: String,
    default: 'warning',
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
})

const expanded = ref(false)

const isWarning = computed(() => props.type === 'warning')

const barClass = computed(() =>
  isWarning.value ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 bg-slate-50',
)

const iconClass = computed(() =>
  isWarning.value ? 'text-amber-500' : 'text-ca-blue',
)

const textClass = computed(() =>
  isWarning.value ? 'text-amber-800' : 'text-gray-600',
)
</script>

<template>
  <div class="rounded-md border px-3 py-2.5 text-[13px] leading-5" :class="barClass">
    <button
      type="button"
      class="plain-button flex w-full items-start gap-2 text-left"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <el-icon class="mt-0.5 shrink-0" :size="16" :class="iconClass">
        <WarningFilled v-if="isWarning" />
        <InfoFilled v-else />
      </el-icon>

      <span
        class="min-w-0 flex-1"
        :class="[textClass, expanded ? '' : 'line-clamp-1']"
      >
        <span class="font-medium">{{ title }}</span>
        <span>{{ content }}</span>
      </span>

      <el-icon
        class="mt-0.5 shrink-0 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': expanded }"
        :size="14"
      >
        <ArrowDown />
      </el-icon>
    </button>
  </div>
</template>