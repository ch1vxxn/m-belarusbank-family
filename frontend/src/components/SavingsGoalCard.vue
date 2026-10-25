<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, Bike, CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()
const family = useFamilyStore()

const amount = ref(50)
const isModalOpen = ref(false)
const isProcessing = ref(false)
const isSuccess = ref(false)

const openModal = () => {
  amount.value = 50
  isSuccess.value = false
  isModalOpen.value = true
}

const handleDeposit = async () => {
  if (amount.value <= 0) return
  if ((family.childBalance ?? 0)< amount.value) {
    alert('Недостаточно средств на карте!')
    return
  }

  isProcessing.value = true
  await new Promise(r => setTimeout(r, 800))
  
  if (family.depositToGoal(amount.value)) {
    isSuccess.value = true
    setTimeout(() => { isModalOpen.value = false }, 1500)
  }
  isProcessing.value = false
}
</script>

<template>
  <div class="min-h-screen bg-[#0A0A0A] text-white font-sans pb-10">
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="router.push('/child')" class="text-white/80 hover:text-white">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      <h1 class="text-[17px] font-semibold">Моя копилка</h1>
      <div class="w-7"></div>
    </header>

    <main class="px-5 mt-4 space-y-6">
      <div class="bg-[#1C1C1E] rounded-3xl p-6 text-center">
        <div class="mx-auto w-20 h-20 bg-[#00A651]/10 rounded-full flex items-center justify-center mb-4 animate-float">
          <Bike class="w-10 h-10 text-[#00A651]" stroke-width="1.5" />
        </div>
        <h2 class="text-2xl font-bold mb-1">{{ family.savingsGoal.title }}</h2>
        <p class="text-white/50 text-sm">Накоплено {{ family.savingsGoal.current }} из {{ family.savingsGoal.target }} BYN</p>
        
        <div class="mt-6 w-full bg-white/10 rounded-full h-4 overflow-hidden">
          <div class="bg-[#00A651] h-4 rounded-full transition-all duration-1000 ease-out" :style="{ width: family.goalProgress + '%' }"></div>
        </div>
        <p class="text-[#00A651] font-bold mt-2 text-lg">{{ family.goalProgress }}%</p>
      </div>

      <button @click="openModal" class="w-full bg-[#00A651] py-4 rounded-xl font-semibold text-lg hover:bg-[#009448] transition-colors">
        Пополнить копилку
      </button>
    </main>

    <!-- Модалка -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center">
      <div class="bg-[#1C1C1E] w-full max-w-[390px] rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-slide-up">
        <div v-if="isSuccess" class="flex flex-col items-center justify-center py-6">
          <CheckCircle2 class="w-16 h-16 text-[#00A651] mb-4 animate-bounce" />
          <h3 class="text-xl font-bold">Успешно!</h3>
          <p class="text-white/60 mt-2">{{ amount }} BYN добавлено в копилку</p>
        </div>
        <div v-else>
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold">Пополнить копилку</h3>
            <button @click="isModalOpen = false" class="text-white/50 text-sm">Отмена</button>
          </div>
          <div class="flex items-center justify-center gap-2 mb-8">
            <input v-model.number="amount" type="number" class="bg-transparent text-center text-5xl font-bold text-white outline-none w-32 border-b border-[#00A651] pb-2" />
            <span class="text-2xl text-white/50 font-medium">BYN</span>
          </div>
          <button @click="handleDeposit" :disabled="isProcessing" class="w-full bg-[#00A651] py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
            <span v-if="isProcessing" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            <span v-else>Пополнить на {{ amount }} BYN</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-float { animation: float 3s ease-in-out infinite; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>