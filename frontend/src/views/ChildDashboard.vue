<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, QrCode, HandCoins, Map, Target, MessageSquare } from 'lucide-vue-next'

const router = useRouter()
const family = useFamilyStore()

// Определяем, подросток ли это
const isTeen = computed(() => family.child?.ageGroup === '14-17')

function goBack() {
  router.push('/family')
}
</script>

<template>
  <!-- Всегда темная тема bg-[#0A0A0A] -->
  <div class="min-h-screen bg-[#0A0A0A] text-white font-sans pb-24">
    
    <!-- Шапка -->
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="goBack" class="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
        <ChevronLeft class="w-6 h-6" />
      </button>
      
      <!-- Уведомления -->
      <button class="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors relative">
        <MessageSquare class="w-5 h-5" />
        <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
    </header>

    <main class="px-5">
      <!-- Приветствие -->
      <h1 class="text-[26px] font-bold mb-6">
        Добрый день, {{ family.child?.name }}!
      </h1>

      <!-- БАНКОВСКАЯ КАРТА РЕБЁНКА -->
      <div 
        class="relative overflow-hidden rounded-[24px] p-6 shadow-xl mb-6 transition-all duration-500"
        :class="isTeen 
          ? 'bg-gradient-to-br from-[#1A1B41] to-[#3B3B98] text-white' 
          : 'bg-gradient-to-br from-[#FF512F] to-[#DD2476] text-white'"
      >
        <div class="relative z-10">
          <div class="flex justify-between items-start mb-8">
            <p class="text-[14px] font-medium opacity-90">M-Belarusbank Family</p>
            <svg class="w-6 h-6 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
          </div>
          <p class="text-[28px] font-bold mb-1">{{ family.childBalanceFormatted }}</p>
          <div class="flex justify-between items-end mt-4">
            <p class="text-[14px] font-medium opacity-90">{{ family.child?.name }}</p>
            <p class="text-[13px] font-mono opacity-80">•••• {{ family.card?.maskedNumber.slice(-4) }}</p>
          </div>
        </div>
        <!-- Декор для детской карты -->
        <div v-if="!isTeen" class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
      </div>

      <!-- Кнопки быстрых действий -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <button class="rounded-2xl p-4 flex flex-col items-start gap-2 bg-[#1C1C1E] hover:bg-[#2C2C2E] transition-colors">
          <QrCode class="w-6 h-6 text-[#00A651]" />
          <span class="text-[14px] font-medium">Оплатить по QR</span>
        </button>
        <button class="rounded-2xl p-4 flex flex-col items-start gap-2 bg-[#1C1C1E] hover:bg-[#2C2C2E] transition-colors">
          <HandCoins class="w-6 h-6 text-[#00A651]" />
          <span class="text-[14px] font-medium">Запросить деньги</span>
        </button>
      </div>

      <!-- Специальный блок для подростков (Финпуть) -->
      <div v-if="isTeen" class="bg-[#1C1C1E] rounded-2xl p-4 flex items-center justify-between mb-6 cursor-pointer hover:bg-[#2C2C2E] transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#00A651]/10 flex items-center justify-center">
            <Map class="w-5 h-5 text-[#00A651]" />
          </div>
          <div>
            <p class="text-[15px] font-semibold">Финпуть</p>
            <p class="text-[12px] text-white/50">Маленький шаг к большим планам</p>
          </div>
        </div>
        <ChevronLeft class="w-5 h-5 rotate-180 text-white/40" />
      </div>

      <!-- Блок с целями -->
      <div class="bg-[#1C1C1E] rounded-3xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[16px] font-bold">Мои цели</h2>
          <Target class="w-5 h-5 text-[#00A651]" />
        </div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-[14px]">{{ family.savingsGoal.title }}</span>
          <span class="text-[14px] font-semibold text-[#00A651]">{{ family.goalProgress }}%</span>
        </div>
        <div class="w-full rounded-full h-2.5 bg-white/10">
          <div class="bg-[#00A651] h-2.5 rounded-full" :style="{ width: family.goalProgress + '%' }"></div>
        </div>
      </div>
    </main>
  </div>
</template>