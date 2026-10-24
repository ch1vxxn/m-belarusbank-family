<script setup lang="ts">
/**
 * AppShell — «телефонная» рамка для прототипа.
 *
 * На десктопе: тёмный фон вокруг, белый телефон 390×844 по центру с тенью.
 * На реальном телефоне: контент на всю ширину и высоту экрана.
 */

import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import BottomTabBar from '@/components/BottomTabBar.vue'

const route = useRoute()

/** Экраны, на которых НЕ показываем таб-бар. */
const hideTabBar = computed(() => {
  const p = route.path
  return p === '/child' || p === '/goal' || p === '/card'
})
</script>

<template>
  <!-- Фон вокруг телефона на десктопе -->
  <div class="flex min-h-dvh items-center justify-center bg-[#0a0e14] p-0 md:p-4">
    <!-- Телефон -->
    <div
      class="relative flex h-dvh w-full flex-col overflow-hidden bg-[#1a2a2a] text-white shadow-2xl shadow-black/50 md:h-[844px] md:max-h-dvh md:w-[390px] md:rounded-[40px] md:border md:border-white/[0.06]"
    >
      <!-- Status Bar -->

      <!-- Контент экранов -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden">
        <RouterView />
      </main>

      <!-- Нижний таб-бар (скрыт на глубоких экранах) -->
      <BottomTabBar v-if="!hideTabBar" />
    </div>
  </div>
</template>