<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, Bike, CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()
const family = useFamilyStore()

function goBack() {
  router.push('/child') // Возвращаемся в профиль Миши
}

// Логика пополнения
const isModalOpen = ref(false)
const amount = ref(50)
const isProcessing = ref(false)
const isSuccess = ref(false)

const openModal = () => {
  amount.value = 50
  isSuccess.value = false
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleDeposit = async () => {
  if (amount.value <= 0) return
  
  // Проверка, хватает ли денег на карте Миши
  if (family.childBalance !== null && amount.value > family.childBalance) {
    alert('Недостаточно средств на карте!')
    return
  }

  isProcessing.value = true
  await new Promise(resolve => setTimeout(resolve, 800))

  // Списываем с карты и добавляем в копилку
  if (family.childBalance !== null) family.childBalance -= amount.value
  family.savingsGoal.current += amount.value
  family.savingsGoal = { ...family.savingsGoal }
  
  // Обновляем карту, чтобы баланс на карте тоже изменился
  family.card.balance = family.childBalance ?? 0
  family.card = { ...family.card }

  // Добавляем запись в историю копилки
  family.goalHistory.unshift({
    id: `gc${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    amount: amount.value,
    source: 'parent',
    sourceLabel: 'Пополнение копилки'
  })

  isProcessing.value = false
  isSuccess.value = true

  setTimeout(() => {
    isModalOpen.value = false
  }, 1500)
}
</script>

<template>
  <div class="min-h-screen bg-[#0A0A0A] text-white font-sans pb-10">
    <!-- Шапка -->
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="goBack" class="text-white/80 hover:text-white">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      <h1 class="text-[17px] font-semibold">Моя копилка</h1>
      <div class="w-7"></div>
    </header>

    <main class="px-5 mt-4 space-y-6">
      <!-- Основной блок цели -->
      <div class="bg-[#1C1C1E] rounded-3xl p-6 text-center relative overflow-hidden">
        <!-- Иконка велосипеда -->
        <div class="mx-auto w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Bike class="w-10 h-10 text-[#00A651]" stroke-width="1.5" />
        </div>
        
        <h2 class="text-2xl font-bold">{{ family.savingsGoal.title }}</h2>
        <p class="text-white/50 mt-1 text-sm">Накоплено {{ family.savingsGoal.current }} из {{ family.savingsGoal.target }} BYN</p>

        <!-- Прогресс-бар -->
        <div class="mt-6 relative">
          <div class="w-full bg-white/10 rounded-full h-4">
            <div 
              class="bg-[#00A651] h-4 rounded-full transition-all duration-700" 
              :style="{ width: family.goalProgress + '%' }"
            ></div>
          </div>
          <p class="text-[#00A651] font-bold mt-2 text-lg">{{ family.goalProgress }}%</p>
        </div>
      </div>

      <!-- Кнопка пополнения -->
      <button 
        @click="openModal"
        class="w-full bg-[#00A651] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#009448] transition-colors shadow-lg shadow-[#00A651]/20"
      >
        Пополнить копилку
      </button>

      <!-- История пополнений -->
      <section>
        <h3 class="text-[15px] font-semibold mb-3">История</h3>
        <div class="bg-[#1C1C1E] rounded-2xl p-4 space-y-3">
          <div v-for="item in family.goalHistory" :key="item.id" class="flex justify-between items-center border-b border-white/5 last:border-0 pb-3 last:pb-0">
            <div>
              <p class="text-[14px]">{{ item.sourceLabel }}</p>
              <p class="text-[12px] text-white/40">{{ item.date }}</p>
            </div>
            <p class="font-semibold text-[#00A651]">+{{ item.amount }} BYN</p>
          </div>
          <p v-if="family.goalHistory.length === 0" class="text-sm text-white/40 text-center">Пока нет пополнений</p>
        </div>
      </section>
    </main>

    <!-- МОДАЛКА ПОПОЛНЕНИЯ -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center">
      <div class="bg-[#1C1C1E] w-full max-w-[390px] rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-slide-up">
        
        <!-- Успех -->
        <div v-if="isSuccess" class="flex flex-col items-center justify-center py-6">
          <CheckCircle2 class="w-16 h-16 text-[#00A651] mb-4" />
          <h3 class="text-xl font-bold">Успешно!</h3>
          <p class="text-white/60 mt-2">{{ amount }} BYN добавлено в копилку</p>
        </div>

        <!-- Форма -->
        <div v-else>
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold">Пополнить копилку</h3>
            <button @click="closeModal" class="text-white/50 text-sm">Отмена</button>
          </div>

          <div class="flex items-center justify-center gap-2 mb-8">
            <input 
              v-model.number="amount"
              type="number" 
              class="bg-transparent text-center text-5xl font-bold text-white outline-none w-32 border-b border-[#00A651] pb-2"
            />
            <span class="text-2xl text-white/50 font-medium">BYN</span>
          </div>

          <p class="text-center text-[13px] text-white/40 mb-6">Доступно на карте: {{ family.childBalanceFormatted }}</p>

          <button 
            @click="handleDeposit"
            :disabled="isProcessing || amount <= 0"
            class="w-full bg-[#00A651] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span v-if="isProcessing" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            <span v-else>Пополнить на {{ amount }} BYN</span>
          </button>
        </div>
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