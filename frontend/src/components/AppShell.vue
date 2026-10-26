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
  return ['/child', '/goal', '/card', '/family', '/notifications', '/tasks', '/add-child', '/child-dashboard'].includes(p)
})

const direction = ref<'push' | 'pop' | 'fade'>('fade')

watch(
  () => route.path,
  (to, from) => {
    const fromPath = from || '';

    // 1. Переходы между табами (Главная -> Платежи и тд) — просто fade
    const tabPaths = ['/', '/payments', '/history', '/finances', '/more']
    if (tabPaths.includes(to) && tabPaths.includes(fromPath)) {
      direction.value = 'fade'
      return
    }

    // 2. Определяем "глубину" экранов (чем больше число, тем глубже мы зашли)
    const getDepth = (path: string) => {
      if (path === '/') return 0
      if (path === '/family' || path === '/notifications') return 1
      if (path === '/child' || path === '/child-dashboard') return 2
      if (path === '/card' || path === '/goal' || path === '/tasks' || path === '/add-child') return 3
      return 0
    }

    const depthTo = getDepth(to)
    const depthFrom = getDepth(fromPath)

    // 3. Если мы идем ГЛУБЖЕ (например, с Главной на Семью, или с Семьи на Профиль) — это Push (влево)
    if (depthTo > depthFrom) {
      direction.value = 'push'
      return
    }

    // 4. Если мы возвращаемся НАЗАД (например, с Профиля на Семью) — это Pop (вправо)
    if (depthTo < depthFrom) {
      direction.value = 'pop'
      return
    }

    // 5. Если мы переходим на тот же уровень (например, внутри табов) — Fade
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

const prevCardDesign = ref(activeCardDesign.value)
watch(activeCardDesign, (newVal, oldVal) => {
  prevCardDesign.value = oldVal // Когда карта меняется, сохраняем старую
})

// Функция для генерации стиля
const getGradient = (design: string) => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const endColor = isDark ? '#0A0A0A' : '#F2F2F7'
  
  switch (design) {
    case 'sunset': return { background: `radial-gradient(circle at top, #DD2476 0%, ${endColor} 70%)` }
    case 'sky': return { background: `radial-gradient(circle at top, #2193b0 0%, ${endColor} 70%)` }
    case 'glass': return { background: `radial-gradient(circle at top, #8e9eab 0%, ${endColor} 70%)` }
    case 'silver': return { background: `radial-gradient(circle at top, #bdc3c7 0%, ${endColor} 70%)` }
    default: return { background: `radial-gradient(circle at top, #1a7a72 0%, ${endColor} 70%)` }
  }
}

// Стиль для текущего градиента
const currentBgStyle = computed(() => getGradient(activeCardDesign.value))
// Стиль для предыдущего градиента
const prevBgStyle = computed(() => getGradient(prevCardDesign.value))

// Показывать серый фон (когда свайпнули на "Добавить")
const showGrayBg = computed(() => {
  return route.path !== '/' || family.currentCardIndex >= family.cards.length 
})
</script>

<template>
  <!-- Вокруг телефона: светло-серый днем, темный ночью -->
  <div class="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-[#0a0e14] p-0 md:p-4 overflow-hidden transition-colors duration-300">
    
    <!-- Сам телефон: белый днем, черный ночью -->
    <div class="relative flex h-full w-full flex-col overflow-hidden bg-white dark:bg-[#0A0A0A] text-black dark:text-white shadow-2xl shadow-black/10 dark:shadow-black/50 md:h-[844px] md:max-h-[90vh] md:w-[390px] md:rounded-[40px] md:border md:border-black/5 dark:md:border-white/[0.06] transition-colors duration-300">
      
      <!-- ФОНОВЫЕ СЛОИ -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        
        <!-- СЛОЙ 1: Предыдущий градиент (плавно исчезает) -->
        <div 
          class="absolute inset-0 transition-opacity duration-700 ease-in-out"
          :class="showGrayBg ? 'opacity-0' : 'opacity-100'"
          :style="prevBgStyle"
        ></div>

        <!-- СЛОЙ 2: Текущий градиент (плавно появляется поверх предыдущего) -->
        <div 
          class="absolute inset-0 transition-opacity duration-700 ease-in-out"
          :class="showGrayBg ? 'opacity-0' : 'opacity-100'"
          :style="currentBgStyle"
        ></div>
        
        <!-- СЛОЙ 3: Серый фон для "Добавить карту" -->
        <div 
          class="absolute inset-0 transition-opacity duration-700 ease-in-out bg-[radial-gradient(circle_at_top,#F2F2F7_0%,#E5E5EA_30%,#FFFFFF_70%)] dark:bg-[radial-gradient(circle_at_top,#2C2C2E_0%,#1C1C1E_30%,#0A0A0A_70%)]"
          :class="showGrayBg ? 'opacity-100' : 'opacity-0'"
        ></div>
      </div>

      <!-- Контент -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden relative z-10 pb-24" :class="{ 'overflow-hidden': family.isAnyModalOpen }">
        <RouterView v-slot="{ Component, route }">
  <Transition :name="transitionName">
    <component 
      :is="Component" 
      :key="route.path" 
      class="absolute inset-0 w-full h-full overflow-y-auto pb-24 transition-colors duration-300" 
      :class="route.path !== '/' ? 'bg-gray-50 dark:bg-[#0A0A0A]' : 'bg-transparent'"
    />
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
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
.ios-push-enter-from { transform: translateX(100%); }
.ios-push-leave-to { transform: translateX(-30%); opacity: 0.6; }
.ios-push-enter-active { z-index: 2; }
.ios-push-leave-active { z-index: 1; }

/* POP */
.ios-pop-enter-active, .ios-pop-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
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