<script setup>
import { CircleCheckFilled, EditPen, Promotion } from '@element-plus/icons-vue'

const props = defineProps({
  current: {
    type: Number,
    default: 1,
  },
})

const steps = [
  { label: '搜索航班', icon: CircleCheckFilled },
  { label: '选择航班', icon: Promotion },
  { label: '填写信息', icon: EditPen },
]

function stateFor(index) {
  if (index < props.current) return 'done'
  if (index === props.current) return 'active'
  return 'todo'
}
</script>

<template>
  <div class="overflow-x-auto">
    <ol class="flex min-w-[560px] items-stretch gap-1.5" aria-label="购票流程">
      <li
        v-for="(step, index) in steps"
        :key="step.label"
        class="booking-step"
        :class="`booking-step--${stateFor(index)}`"
        :aria-current="stateFor(index) === 'active' ? 'step' : undefined"
      >
        <span class="step-icon">
          <el-icon :size="stateFor(index) === 'done' ? 21 : 14">
            <CircleCheckFilled v-if="stateFor(index) === 'done'" />
            <component :is="step.icon" v-else />
          </el-icon>
        </span>
        <span class="whitespace-nowrap">{{ step.label }}</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.booking-step {
  position: relative;
  display: flex;
  flex: 1 1 0%;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 52px;
  padding: 0 34px 0 30px;
  background: #eef1f6;
  color: #8b94a5;
  font-size: 14px;
  font-weight: 500;
  clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 18px 50%);
}

.booking-step:first-child {
  padding-left: 34px;
  clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%);
}

.booking-step--done {
  color: #6f7787;
}

.booking-step--active {
  background: #e3e9f4;
  color: #1b2b4b;
  font-weight: 600;
}

.step-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 9999px;
  background: #aeb6c4;
  color: #ffffff;
}

.booking-step--done .step-icon {
  background: transparent;
  color: #98a1b2;
}

.booking-step--active .step-icon {
  background: #1b2b4b;
  color: #ffffff;
}
</style>