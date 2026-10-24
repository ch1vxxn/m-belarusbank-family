<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Pause, Play } from 'lucide-vue-next'

const router = useRouter()
const family = useFamilyStore()

const isTransferModalOpen = ref(false)
const transferAmount = ref(10)

const openTransferModal = () => {
  transferAmount.value = 10
  isTransferModalOpen.value = true
}

const executeTransfer = async () => {
  family.transfer(transferAmount.value)
  isTransferModalOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-[#0A0A0A] text-white font-sans pb-24">
    
    <!-- Шапка -->
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="router.push('/family')" class="text-white/80 hover:text-white">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      <h1 class="text-[17px] font-semibold">Профиль Миши</h1>
      <div class="w-7"></div>
    </header>

    <main class="px-5 mt-2">
      <!-- КАСТОМНАЯ КАРТОЧКА С ТЕКСТУРОЙ СОТ -->
      <div class="relative overflow-hidden rounded-[22px] p-5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] bg-gradient-to-br from-[#006837] via-[#00A651] to-[#005226] mb-6">
        
        <!-- Текстура (соты) -->
        <svg class="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hex" width="28" height="48.5" patternUnits="userSpaceOnUse" patternTransform="scale(1.15)">
              <path d="M14 0 L28 8.5 L28 25.5 L14 34 L0 25.5 L0 8.5 Z" fill="none" stroke="#7ec8c0" stroke-width="0.9" />
              <path d="M14 34 L28 42.5 L28 59.5 L14 68 L0 59.5 L0 42.5 Z" fill="none" stroke="#7ec8c0" stroke-width="0.9" transform="translate(14, 0)" />
            </pattern>
            <radialGradient id="hexFade" cx="65%" cy="40%" r="70%">
              <stop offset="0%" stop-color="white" stop-opacity="1" />
              <stop offset="55%" stop-color="white" stop-opacity="0.55" />
              <stop offset="100%" stop-color="white" stop-opacity="0" />
            </radialGradient>
            <mask id="hexMask">
              <rect width="100%" height="100%" fill="url(#hexFade)" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex)" mask="url(#hexMask)" />
        </svg>

        <div class="relative z-10">
          <!-- Верхняя строка -->
          <div class="flex justify-between items-start mb-6">
            <p class="text-[13px] font-medium text-white/90">M-Belarusbank Family</p>
            <!-- Иконка волн -->
            <div class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
            </div>
          </div>

          <!-- Имя и возраст -->
          <h2 class="text-2xl font-bold mb-4">Миша</h2>
          
          <!-- Баланс -->
          <div class="mb-6">
            <p class="text-[12px] text-white/70">На карте</p>
            <p class="text-3xl font-bold mt-0.5">{{ family.childBalanceFormatted }}</p>
          </div>

          <!-- Номер карты и уровень -->
          <div class="flex justify-between items-end">
            <p class="text-[13px] text-white/80 font-mono">•• {{ family.card.maskedNumber.slice(-4) }}</p>
            <p class="text-[11px] text-white/70">10 лет • 7–13 лет • уровень 2</p>
          </div>
        </div>
      </div>

      <!-- Кнопки -->
      <div class="flex gap-3 mb-6">
        <button @click="openTransferModal" class="flex-[2] bg-[#00A651] text-white font-semibold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-[#009448] transition-colors">
          <ArrowUpRight class="w-5 h-5" /> Перевести
        </button>
        <button @click="family.toggleCardActive()" class="flex-1 bg-[#1C1C1E] text-white font-semibold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 border border-white/5 hover:bg-[#2C2C2E] transition-colors">
          <Pause v-if="family.card.isActive" class="w-5 h-5" />
          <Play v-else class="w-5 h-5" />
          {{ family.card.isActive ? 'Пауза' : 'Включить' }}
        </button>
      </div>

      <!-- Табы -->
      <div class="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        <button class="bg-[#00A651] text-white px-5 py-2 rounded-lg text-[14px] font-medium shrink-0">Операции</button>
        <button @click="router.push('/card')" class="bg-[#1C1C1E] text-white/60 px-5 py-2 rounded-lg text-[14px] font-medium shrink-0">Лимиты</button>
        <button @click="router.push('/goal')" class="bg-[#1C1C1E] text-white/60 px-5 py-2 rounded-lg text-[14px] font-medium shrink-0">Копилки</button>
        <button class="bg-[#1C1C1E] text-white/60 px-5 py-2 rounded-lg text-[14px] font-medium shrink-0">Задания</button>
      </div>

      <!-- Блок Траты -->
      <div class="bg-[#1C1C1E] rounded-2xl p-5 shadow-sm mb-6">
        <h2 class="text-[16px] font-bold mb-1">Траты за октябрь</h2>
        <div class="flex justify-between items-center mb-4">
          <p class="text-3xl font-extrabold text-white">63,10 BYN</p>
          <div class="w-16 h-16 rounded-full" style="background: conic-gradient(#006837 0% 40%, #00A651 40% 70%, #E63946 70% 100%);"></div>
        </div>
        <p class="text-[13px] text-white/50 mb-4">Куда уходят деньги</p>
        
        <div class="flex gap-3">
          <div class="flex-1 bg-[#2C2C2E] rounded-xl p-3">
            <div class="flex justify-between items-center text-[#00A651] mb-1">
              <ArrowUpRight class="w-4 h-4" />
              <div class="w-4 h-0.5 bg-white/20"></div>
            </div>
            <p class="text-[16px] font-bold text-white">63,10 BYN</p>
            <p class="text-[12px] text-white/50">Расходы</p>
          </div>
          <div class="flex-1 bg-[#2C2C2E] rounded-xl p-3">
            <div class="flex justify-between items-center text-[#00A651] mb-1">
              <ArrowDownLeft class="w-4 h-4" />
              <div class="w-4 h-0.5 bg-white/20"></div>
            </div>
            <p class="text-[16px] font-bold text-white">63,00 BYN</p>
            <p class="text-[12px] text-white/50">Пополнения</p>
          </div>
        </div>
      </div>
    </main>

    <!-- ШТОРКА ПЕРЕВОДА -->
    <div v-if="isTransferModalOpen" class="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center">
      <div class="bg-[#1C1C1E] w-full max-w-[390px] rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-slide-up">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-white">Перевод Мише</h3>
          <button @click="isTransferModalOpen = false" class="text-white/50 text-sm font-medium">Отмена</button>
        </div>
        <div class="flex items-center justify-center gap-2 mb-8">
          <input v-model.number="transferAmount" type="number" class="bg-transparent text-center text-5xl font-bold text-white outline-none w-32 border-b border-[#00A651] pb-2" />
          <span class="text-2xl text-white/50 font-medium">BYN</span>
        </div>
        <button @click="executeTransfer" class="w-full bg-[#00A651] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
          Перевести {{ transferAmount }} BYN
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.animate-slide-up { animation: slideUp 0.3s ease-out; }
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>