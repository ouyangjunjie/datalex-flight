<script setup>
import { ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowDown, Close, Menu } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()

const navItems = [
  { label: '机票预订', to: '/flight-search' },
  { label: '航班动态' },
  { label: '服务中心' },
]

const drawerOpen = ref(false)
const language = ref('zh')

function switchLanguage(value) {
  language.value = value
  drawerOpen.value = false
}

function onPlaceholder(label) {
  drawerOpen.value = false
  ElMessage.info(`${label}功能开发中`)
}

function onLogin(type) {
  ElMessage.info(`${type}功能演示，暂未接入账号系统`)
  drawerOpen.value = false
}

function isActive(item) {
  return item.to && route.path === item.to
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-ca-red text-white shadow-sm">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
      <div class="flex min-w-0 items-center gap-8">
        <RouterLink to="/flight-search" class="flex shrink-0 items-center gap-2.5 text-white no-underline">
          <svg viewBox="0 0 40 40" class="h-9 w-9" aria-hidden="true">
            <circle cx="20" cy="20" r="19" fill="white" fill-opacity="0.12" stroke="white" stroke-opacity="0.55" />
            <path
              d="M8 24.5c5.8-.9 9.2-3.9 12-9.4 1.1 5.1 4.2 8.4 12 9.4-6 1.1-9.1 3.4-12 7.2-2.9-3.8-6-6.1-12-7.2Z"
              fill="white"
            />
          </svg>
          <span class="hidden leading-tight sm:block">
            <span class="block text-base font-semibold tracking-wide">爱达航</span>
            <span class="block text-[10px] tracking-[0.22em] text-white/75">DATALEX</span>
          </span>
        </RouterLink>

        <nav class="hidden items-center gap-1 md:flex" aria-label="主导航">
          <template v-for="item in navItems" :key="item.label">
            <RouterLink
              v-if="item.to"
              :to="item.to"
              class="relative rounded px-4 py-2 text-sm font-medium no-underline transition"
              :class="
                isActive(item)
                  ? 'text-white after:absolute after:inset-x-4 after:-bottom-0.5 after:h-0.5 after:bg-white'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              "
            >
              {{ item.label }}
            </RouterLink>
            <button
              v-else
              type="button"
              class="plain-button rounded px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
              @click="onPlaceholder(item.label)"
            >
              {{ item.label }}
            </button>
          </template>
        </nav>
      </div>

      <div class="hidden items-center gap-4 md:flex">
        <button type="button" class="plain-button text-sm text-white/90 transition hover:text-white" @click="onLogin('登录')">
          登录
        </button>
        <span class="h-4 w-px bg-white/30" aria-hidden="true"></span>
        <button type="button" class="plain-button text-sm text-white/90 transition hover:text-white" @click="onLogin('注册')">
          注册
        </button>
        <el-dropdown trigger="click" @command="switchLanguage">
          <button
            type="button"
            class="plain-button flex items-center gap-1 rounded px-2 py-1.5 text-sm text-white/90 transition hover:bg-white/10 hover:text-white"
          >
            {{ language === 'zh' ? '中文' : 'EN' }}
            <el-icon class="text-xs"><ArrowDown /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh" :class="{ 'text-ca-red': language === 'zh' }">中文</el-dropdown-item>
              <el-dropdown-item command="en" :class="{ 'text-ca-red': language === 'en' }">English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <button
        type="button"
        class="plain-button rounded p-2 transition hover:bg-white/10 md:hidden"
        aria-label="打开导航菜单"
        @click="drawerOpen = true"
      >
        <el-icon :size="22"><Menu /></el-icon>
      </button>
    </div>
  </header>

  <el-drawer v-model="drawerOpen" class="ca-mobile-drawer" direction="rtl" size="78%" :with-header="false">
    <div class="flex h-full flex-col bg-white">
      <div class="flex items-center justify-between bg-ca-red px-5 py-4 text-white">
        <span class="text-base font-semibold">爱达航</span>
        <button type="button" class="plain-button rounded p-1 hover:bg-white/10" aria-label="关闭菜单" @click="drawerOpen = false">
          <el-icon :size="20"><Close /></el-icon>
        </button>
      </div>

      <nav class="flex flex-col gap-1 p-4" aria-label="移动端导航">
        <template v-for="item in navItems" :key="item.label">
          <RouterLink
            v-if="item.to"
            :to="item.to"
            class="rounded px-4 py-3 text-base no-underline"
            :class="isActive(item) ? 'bg-ca-red/5 font-semibold text-ca-red' : 'text-gray-700 hover:bg-gray-50'"
            @click="drawerOpen = false"
          >
            {{ item.label }}
          </RouterLink>
          <button
            v-else
            type="button"
            class="plain-button rounded px-4 py-3 text-left text-base text-gray-700 hover:bg-gray-50"
            @click="onPlaceholder(item.label)"
          >
            {{ item.label }}
          </button>
        </template>
      </nav>

      <div class="mt-auto border-t border-gray-100 p-4">
        <div class="mb-4 flex items-center gap-3">
          <el-button type="primary" class="flex-1" @click="onLogin('登录')">登录</el-button>
          <el-button class="flex-1" @click="onLogin('注册')">注册</el-button>
        </div>
        <div class="flex items-center justify-between text-sm text-gray-500">
          <span>语言 / Language</span>
          <div class="flex items-center gap-1 rounded bg-gray-100 p-0.5">
            <button
              type="button"
              class="plain-button rounded px-3 py-1 transition"
              :class="language === 'zh' ? 'bg-white text-ca-red shadow-sm' : 'text-gray-600'"
              @click="switchLanguage('zh')"
            >
              中文
            </button>
            <button
              type="button"
              class="plain-button rounded px-3 py-1 transition"
              :class="language === 'en' ? 'bg-white text-ca-red shadow-sm' : 'text-gray-600'"
              @click="switchLanguage('en')"
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>
<style>
.ca-mobile-drawer .el-drawer__body {
  padding: 0;
}
</style>
