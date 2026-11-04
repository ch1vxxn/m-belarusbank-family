<script setup lang="ts">
import { useRouter } from 'vue-router'

// Подключаем роутер
const router = useRouter()

// Функция перехода на экран добавления карты
const goToAddCard = () => {
  router.push('/add-card')
}
</script>

<template>
  <!-- При клике вызываем goToAddCard -->
  <div 
    @click="goToAddCard" 
    class="relative overflow-hidden rounded-[18px] min-h-[196px] flex flex-col items-center justify-center border-2 border-dashed border-black/20 dark:border-white/20 bg-white dark:bg-[#2C2C2E] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#3C3C3E] transition-colors shadow-sm dark:shadow-none"
  >
    <div class="flex items-center justify-center w-12 h-12 rounded-full bg-[#00A651] mb-3">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
      </svg>
    </div>
    <p class="text-white font-medium text-[15px]">Добавить карту</p>
    <p class="text-white/50 text-[12px] mt-1">Выпустить новую карту</p>
  </div>
</template>