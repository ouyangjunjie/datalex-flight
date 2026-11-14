<script setup>
import { RouterLink } from 'vue-router'

const linkGroups = [
  {
    title: '机票服务',
    links: ['机票预订', '航班动态', '值机办理', '行李服务', '特殊旅客服务'],
  },
  {
    title: '旅客帮助',
    links: ['常见问题', '退改签说明', '行李规定', '乘机指南', '联系我们'],
  },
  {
    title: '关于爱达航',
    links: ['公司简介', '新闻中心', '招聘信息', '合作伙伴', '隐私政策'],
  },
]
</script>

<template>
  <footer class="mt-12 bg-ca-navy text-white">
    <div class="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div class="grid gap-8 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <div class="flex items-center gap-2.5">
            <svg viewBox="0 0 40 40" class="h-9 w-9" aria-hidden="true">
              <circle cx="20" cy="20" r="19" fill="white" fill-opacity="0.1" stroke="white" stroke-opacity="0.35" />
              <path
                d="M8 24.5c5.8-.9 9.2-3.9 12-9.4 1.1 5.1 4.2 8.4 12 9.4-6 1.1-9.1 3.4-12 7.2-2.9-3.8-6-6.1-12-7.2Z"
                fill="white"
              />
            </svg>
            <div class="leading-tight">
              <div class="text-base font-semibold">爱达航</div>
              <div class="text-[10px] tracking-[0.22em] text-white/50">DATALEX</div>
            </div>
          </div>
          <p class="mt-4 max-w-xs text-sm leading-6 text-white/55">
            爱达航机票查询演示页面，仅用于前端 UI 与交互展示，不提供真实订票及支付服务。
          </p>
          <div class="mt-4 text-sm text-white/70">
            客服热线
            <span class="ml-1 font-medium text-white">95583</span>
            <span class="ml-1 text-xs text-white/40">（示例）</span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-8">
          <div v-for="group in linkGroups" :key="group.title">
            <h3 class="mb-4 text-sm font-semibold text-white">{{ group.title }}</h3>
            <ul class="space-y-2.5">
              <li v-for="link in group.links" :key="link">
                <RouterLink
                  v-if="link === '机票预订'"
                  to="/flight-search"
                  class="text-sm text-white/55 no-underline transition hover:text-white"
                >
                  {{ link }}
                </RouterLink>
                <a
                  v-else
                  href="#"
                  class="text-sm text-white/55 no-underline transition hover:text-white"
                  @click.prevent
                >
                  {{ link }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-white/10">
      <div
        class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/40 lg:flex-row lg:items-center lg:justify-between lg:px-8"
      >
        <p>© 2026 爱达航股份有限公司（Demo 展示） 版权所有</p>
        <p class="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>京ICP备00000000号-1（示例）</span>
          <span>京公网安备 00000000000000号（示例）</span>
        </p>
      </div>
    </div>
  </footer>
</template>