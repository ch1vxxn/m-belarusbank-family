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
import { useFamilyStore } from '@/stores/family'

const route = useRoute()
const family = useFamilyStore()

/** Экраны, на которых НЕ показываем таб-бар. */
const hideTabBar = computed(() => {
  const p = route.path
  return ['/child', '/goal', '/card', '/family', '/notifications', '/tasks'].includes(p)
})
<<<<<<< Updated upstream
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
=======

// Логика iOS-анимаций
const direction = ref<'push' | 'pop' | 'fade'>('fade')
const deepPaths = ['/family', '/child', '/card', '/goal', '/notifications', '/tasks']
const tabPaths = ['/', '/payments', '/history', '/finances', '/more']

watch(
  () => route.path,
  (to, from) => {
    const fromPath = from || '';

    if (tabPaths.includes(to) && tabPaths.includes(fromPath)) {
      direction.value = 'fade'
      return
    }

    const childOfFamily = ['/child', '/card', '/goal', '/tasks', '/notifications'];
    
    if (childOfFamily.includes(fromPath) && (to === '/' || to === '/family')) {
      direction.value = 'pop'
      return
    }

    if (to === '/') {
      direction.value = 'pop'
      return
    }

    if (deepPaths.includes(to)) {
      direction.value = 'push'
      return
    }

    direction.value = 'fade'
  },
  { immediate: true }
)

const transitionName = computed(() => `ios-${direction.value}`)

// Градиент для карты (в зависимости от цвета)
const cardBgStyle = computed(() => {
  if (family.cardColor === 'gold') return { background: 'radial-gradient(circle at top, #D4AF37 0%, #8B6914 30%, #0A0A0A 70%)' }
  if (family.cardColor === 'purple') return { background: 'radial-gradient(circle at top, #7C3AED 0%, #2E1065 30%, #0A0A0A 70%)' }
  return { background: 'radial-gradient(circle at top, #1a7a72 0%, #0f524c 30%, #0A0A0A 70%)' }
})

// Проверяем, нужно ли показывать серый фон
// Серый фон, если мы НЕ на главной ИЛИ если на главной свайпнули на "Добавить"
const showGrayBg = computed(() => {
  return route.path !== '/' || family.currentCardIndex === 1
})
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-[#0a0e14] p-0 md:p-4 overflow-hidden">
    <!-- Телефон -->
    <div class="relative flex h-full w-full flex-col overflow-hidden bg-[#0A0A0A] text-white shadow-2xl shadow-black/50 md:h-[844px] md:max-h-[90vh] md:w-[390px] md:rounded-[40px] md:border md:border-white/[0.06]">
      
      <!-- СЛОИ С ФОНОМ -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        
        <!-- Слой 1: Цветной фон карты -->
        <div 
          class="absolute inset-0 transition-opacity duration-500 ease-in-out"
          :class="showGrayBg ? 'opacity-0' : 'opacity-100'"
          :style="cardBgStyle"
        ></div>
        
        <!-- Слой 2: Серый фон (когда свайпнули или ушли с главной) -->
        <div 
          class="absolute inset-0 transition-opacity duration-500 ease-in-out bg-[radial-gradient(circle_at_top,#2C2C2E_0%,#1C1C1E_30%,#0A0A0A_70%)]"
          :class="showGrayBg ? 'opacity-100' : 'opacity-0'"
        ></div>
      </div>

      <!-- Контент -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden relative z-10 pb-24">
        <RouterView v-slot="{ Component, route }">
          <Transition :name="transitionName" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
>>>>>>> Stashed changes
      </main>

      <!-- Нижний таб-бар (скрыт на глубоких экранах) -->
      <BottomTabBar v-if="!hideTabBar" />
    </div>
  </div>
<<<<<<< Updated upstream
</template>
=======
</template>

<style>
/* PUSH */
.ios-push-enter-active, .ios-push-leave-active {
  transition: all 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.ios-push-enter-from { transform: translateX(100%); }
.ios-push-leave-to { transform: translateX(-30%); opacity: 0.6; }
.ios-push-enter-active { z-index: 2; }
.ios-push-leave-active { z-index: 1; }

/* POP */
.ios-pop-enter-active, .ios-pop-leave-active {
  transition: all 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.ios-pop-enter-from { transform: translateX(-30%); opacity: 0.6; }
.ios-pop-leave-to { transform: translateX(100%); }
.ios-pop-enter-active { z-index: 1; }
.ios-pop-leave-active { z-index: 2; }

/* FADE */
.ios-fade-enter-active, .ios-fade-leave-active {
  transition: opacity 0.15s ease;
}
.ios-fade-enter-from, .ios-fade-leave-to { opacity: 0; }
</style>
>>>>>>> Stashed changes
