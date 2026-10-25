<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import BottomTabBar from '@/components/BottomTabBar.vue'
import { useFamilyStore } from '@/stores/family'

const route = useRoute()
const family = useFamilyStore()

// Скрываем меню на внутренних экранах
const hideTabBar = computed(() => {
  const p = route.path
  return ['/child', '/goal', '/card', '/family', '/notifications', '/tasks'].includes(p)
})

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

// Безопасно берем дизайн текущей карты (с проверкой на пустоту)
const activeCardDesign = computed(() => {
  const card = family.cards[family.currentCardIndex]
  return card ? card.design : 'emerald'
})

// Применяем градиент
const cardBgStyle = computed(() => {
  switch (activeCardDesign.value) {
    case 'sunset': return { background: 'radial-gradient(circle at top, #DD2476 0%, #0A0A0A 70%)' }
    case 'sky': return { background: 'radial-gradient(circle at top, #2193b0 0%, #0A0A0A 70%)' }
    case 'glass': return { background: 'radial-gradient(circle at top, #8e9eab 0%, #0A0A0A 70%)' }
    default: return { background: 'radial-gradient(circle at top, #1a7a72 0%, #0A0A0A 70%)' }
  }
})

// Показывать серый фон (когда свайпнули на "Добавить")
const showGrayBg = computed(() => {
  return route.path !== '/' || family.currentCardIndex >= family.cards.length
})
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-[#0a0e14] p-0 md:p-4 overflow-hidden">
    <div class="relative flex h-full w-full flex-col overflow-hidden bg-[#0A0A0A] text-white shadow-2xl shadow-black/50 md:h-[844px] md:max-h-[90vh] md:w-[390px] md:rounded-[40px] md:border md:border-white/[0.06]">
      
      <!-- ФОНОВЫЕ СЛОИ -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <div 
          class="absolute inset-0 transition-all duration-700 ease-in-out"
          :class="showGrayBg ? 'opacity-0' : 'opacity-100'"
          :style="cardBgStyle"
        ></div>
        
        <div 
          class="absolute inset-0 transition-opacity duration-700 ease-in-out bg-[radial-gradient(circle_at_top,#2C2C2E_0%,#1C1C1E_30%,#0A0A0A_70%)]"
          :class="showGrayBg ? 'opacity-100' : 'opacity-0'"
        ></div>
      </div>

      <!-- Контент -->
            <!-- Контент -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden relative z-10 pb-24">
        <RouterView v-slot="{ Component, route }">
          <!-- Убрали mode="out-in", добавили absolute, чтобы не было задержки -->
          <Transition :name="transitionName">
            <component :is="Component" :key="route.path" class="absolute inset-0 w-full h-full overflow-y-auto pb-24" />
          </Transition>
        </RouterView>
      </main>

      <BottomTabBar v-if="!hideTabBar" />
    </div>
  </div>
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