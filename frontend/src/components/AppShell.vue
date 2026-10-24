<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import BottomTabBar from '@/components/BottomTabBar.vue'

const route = useRoute()

// Скрываем меню на внутренних экранах
const hideTabBar = computed(() => {
  const p = route.path
  return p === '/child' || p === '/goal' || p === '/card'
})

// Логика анимации
const transitionName = ref('fade')

watch(
  () => route.path,
  (to, from) => {
    // Переход НА почту (вперед, экран выезжает справа)
    if (to === '/notifications') {
      transitionName.value = 'slide-in'
      return
    }
    
    // Переход С почты на главную (назад, экран выезжает слева)
    if (from === '/notifications' && to === '/') {
      transitionName.value = 'slide-out'
      return
    }

    // Все остальные вкладки - затухание
    transitionName.value = 'fade'
  }
)
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-[#0a0e14] p-0 md:p-4 overflow-hidden">
    <div class="relative flex h-full w-full flex-col overflow-hidden bg-[#0A0A0A] text-white shadow-2xl shadow-black/50 md:h-[844px] md:max-h-[90vh] md:w-[390px] md:rounded-[40px] md:border md:border-white/[0.06]">
      
      <main class="flex-1 overflow-y-auto overflow-x-hidden relative">
        <RouterView v-slot="{ Component, route }">
          <Transition :name="transitionName" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>

      <BottomTabBar v-if="!hideTabBar" />
    </div>
  </div>
</template>

<style>
/* --- FADE (для вкладок) --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- SLIDE-IN (ВПЕРЕД: экран выезжает справа) --- */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.slide-in-enter-from {
  transform: translateX(100%); /* Новый экран стартует справа */
}
.slide-in-leave-to {
  transform: translateX(-100%); /* Старый экран уезжает влево */
}

/* --- SLIDE-OUT (НАЗАД: экран выезжает слева) --- */
.slide-out-enter-active,
.slide-out-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.slide-out-enter-from {
  transform: translateX(-100%); /* Главный экран возвращается слева */
}
.slide-out-leave-to {
  transform: translateX(100%); /* Почта уезжает вправо */
}
</style>