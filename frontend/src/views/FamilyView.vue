<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, Plus, ShieldCheck } from 'lucide-vue-next'

const router = useRouter()
const family = useFamilyStore()

// Активный таб
const activeTab = ref('children')

// Шторка перевода
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
      <button @click="router.push('/')" class="text-white/80 hover:text-white">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      <h1 class="text-[17px] font-semibold">Моя семья</h1>
      <div class="w-7"></div>
    </header>

    <main class="px-5">
      <!-- Табы -->
      <div class="flex bg-[#1C1C1E] p-1 rounded-2xl mb-6 mt-2">
        <button 
          @click="activeTab = 'children'"
          class="flex-1 py-2 text-[13px] font-semibold rounded-xl transition-all"
          :class="activeTab === 'children' ? 'bg-[#2C2C2E] text-white shadow-sm' : 'text-white/50'"
        >
          Дети
        </button>
        <button 
          @click="activeTab = 'requests'"
          class="flex-1 py-2 text-[13px] font-semibold rounded-xl transition-all"
          :class="activeTab === 'requests' ? 'bg-[#2C2C2E] text-white shadow-sm' : 'text-white/50'"
        >
          Запросы
        </button>
        <button 
          @click="activeTab = 'settings'"
          class="flex-1 py-2 text-[13px] font-semibold rounded-xl transition-all"
          :class="activeTab === 'settings' ? 'bg-[#2C2C2E] text-white shadow-sm' : 'text-white/50'"
        >
          Настройки
        </button>
      </div>

      <!-- ТАБ: ДЕТИ -->
      <div v-if="activeTab === 'children'" class="space-y-4">
        <!-- Карточка Миши (компактная) -->
        <div @click="router.push('/child')" class="relative overflow-hidden rounded-2xl p-4 text-white shadow-lg cursor-pointer bg-gradient-to-br from-[#006837] via-[#00A651] to-[#005226]">
          <div class="flex justify-between items-start mb-4">
            <p class="text-[11px] font-medium text-white/70">M-Belarusbank Family</p>
            <div class="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
            </div>
          </div>

          <h2 class="text-lg font-bold mb-2">Миша</h2>
          <div class="mb-4">
            <p class="text-[11px] text-white/70">На карте</p>
            <p class="text-2xl font-bold mt-0.5">{{ family.childBalanceFormatted }}</p>
          </div>

          <div class="flex justify-between items-end">
            <p class="text-[12px] text-white/70 font-mono">•• {{ family.card.maskedNumber.slice(-4) }}</p>
            <p class="text-[10px] text-white/60">10 лет • 7–13 лет • уровень 2</p>
          </div>
        </div>

        <button class="w-full mt-4 bg-[#1C1C1E] text-[#00A651] font-semibold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 border border-white/5 text-[14px]">
          <Plus class="w-4 h-4" /> Добавить ребёнка
        </button>
      </div> <!-- ЗДЕСЬ БЫЛ ПРОПУЩЕН ЗАКРЫВАЮЩИЙ ТЕГ -->

      <!-- ТАБ: ЗАПРОСЫ -->
      <div v-if="activeTab === 'requests'" class="flex flex-col items-center justify-center pt-24">
        <!-- Иконка щита -->
        <div class="w-20 h-20 bg-[#00A651]/10 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck class="w-10 h-10 text-[#00A651]" stroke-width="1.5" />
        </div>
        
        <!-- Текст -->
        <h3 class="text-[22px] font-bold text-white mb-2">Всё решено</h3>
        <p class="text-[15px] text-white/50 text-center max-w-[280px] leading-relaxed">
          Новые просьбы и важные события появятся здесь
        </p>
      </div>

      <!-- ТАБ: НАСТРОЙКИ -->
      <div v-if="activeTab === 'settings'" class="space-y-4">
        <div class="bg-[#1C1C1E] rounded-2xl p-4 shadow-sm space-y-4">
          <h2 class="text-[15px] font-bold flex items-center gap-2 text-white">
            Лимиты Миши
          </h2>
          <div class="grid grid-cols-2 gap-2">
            <button class="bg-[#2C2C2E] text-white/60 py-2 rounded-lg text-sm">Нет</button>
            <button class="bg-[#00A651] text-white py-2 rounded-lg text-sm font-semibold">50 BYN</button>
            <button class="bg-[#2C2C2E] text-white/60 py-2 rounded-lg text-sm">100 BYN</button>
            <button class="bg-[#2C2C2E] text-white/60 py-2 rounded-lg text-sm">200 BYN</button>
          </div>
        </div>
        
        <button @click="openTransferModal" class="w-full bg-[#00A651] text-white font-semibold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 text-[14px]">
          Перевести деньги
        </button>
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
        <button @click="executeTransfer" class="w-full bg-[#00A651] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2">
          Перевести {{ transferAmount }} BYN
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>