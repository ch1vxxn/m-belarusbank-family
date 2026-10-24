<script setup lang="ts">
/**
 * BottomTabBar — нижняя панель навигации приложения.
 *
 * 5 вкладок: Главная, Платежи, Журнал, Финансы, Ещё.
 * Иконки из lucide-vue-next, активная вкладка — зелёный акцент.
 */

import { RouterLink, useRoute } from 'vue-router'
import { Home, ArrowLeftRight, Clock, Wallet, MoreHorizontal } from 'lucide-vue-next'
import type { Component } from 'vue'

interface NavItem {
  label: string
  to: string
  icon: Component
}

const items: NavItem[] = [
  { label: 'Главная', to: '/', icon: Home },
  { label: 'Платежи', to: '/payments', icon: ArrowLeftRight },
  { label: 'Журнал', to: '/history', icon: Clock },
  { label: 'Финансы', to: '/finances', icon: Wallet },
  { label: 'Ещё', to: '/more', icon: MoreHorizontal },
]

const route = useRoute()

function isActive(to: string): boolean {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#1a2a2a]/95 pb-[env(safe-area-inset-bottom,4px)] backdrop-blur"
  >
    <div class="mx-auto flex max-w-[390px] items-stretch justify-around">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex flex-1 flex-col items-center gap-1 py-2 transition-colors"
        :class="isActive(item.to) ? 'text-[#00A651]' : 'text-white/40 hover:text-white/60'"
      >
        <component :is="item.icon" class="size-6" :stroke-width="isActive(item.to) ? 2 : 1.5" />
        <span class="text-[10px] font-medium leading-none">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>