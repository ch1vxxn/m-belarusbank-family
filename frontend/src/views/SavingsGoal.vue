<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, Bike, CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()
const family = useFamilyStore()

// Баланс родителя (активная карта)
const parentCardBalance = computed(
  () => family.cards[family.currentCardIndex]?.balance ?? 0,
)
const parentCardBalanceFormatted = computed(
  () => `${parentCardBalance.value.toFixed(2)} BYN`,
)

// Состояние модалки
const amount = ref(50)
const lastDeposited = ref(0)
const isModalOpen = ref(false)
const isProcessing = ref(false)
const isSuccess = ref(false)
const errorMsg = ref('')

// ИСПРАВЛЕНИЕ: Умная кнопка "Назад" (возвращает туда, откуда пришли)
function goBack(): void {
  router.back()
}

function openModal(): void {
  amount.value = 50
  errorMsg.value = ''
  isSuccess.value = false
  isModalOpen.value = true
}

async function handleDeposit(): Promise<void> {
  errorMsg.value = ''

  if (amount.value <= 0) {
    errorMsg.value = 'Сумма должна быть больше нуля'
    return
  }

  if (amount.value > parentCardBalance.value) {
    errorMsg.value = `Недостаточно средств. Доступно: ${parentCardBalanceFormatted.value}`
    return
  }

  isProcessing.value = true
  await new Promise((resolve) => setTimeout(resolve, 800))

  const ok = family.depositToGoal(amount.value)
  if (ok) {
    lastDeposited.value = amount.value
    isSuccess.value = true
    setTimeout(() => {
      isModalOpen.value = false
      isSuccess.value = false
    }, 1500)
  } else {
    errorMsg.value = 'Не удалось пополнить копилку'
  }

  isProcessing.value = false
}

function formatDate(dateStr: string): string {
  if (dateStr === 'Сегодня' || dateStr === 'Вчера') return dateStr
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}
</script>

<template>
  <!-- ДОБАВИЛИ: переход цвета фона и поддержку тем -->
  <div class="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-black dark:text-white font-sans pb-10 transition-colors duration-300">
    <!-- Шапка -->
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="goBack" class="text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      <h1 class="text-[17px] font-semibold">Моя копилка</h1>
      <div class="w-7"></div>
    </header>

    <main class="px-5 mt-4 space-y-6">
      <!-- Основной блок цели -->
      <div class="bg-white dark:bg-[#1C1C1E] shadow-sm dark:shadow-none rounded-3xl p-6 text-center relative overflow-hidden border border-black/5 dark:border-transparent transition-colors">
        <div class="mx-auto w-20 h-20 bg-[#00A651]/10 rounded-full flex items-center justify-center mb-4">
          <Bike class="w-10 h-10 text-[#00A651]" stroke-width="1.5" />
        </div>

        <h2 class="text-2xl font-bold">{{ family.savingsGoal.title }}</h2>
        <p class="text-black/50 dark:text-white/50 mt-1 text-sm">
          Накоплено {{ family.savingsGoal.current }} из {{ family.savingsGoal.target }} BYN
        </p>

        <div class="mt-6 relative">
          <div class="w-full bg-black/10 dark:bg-white/10 rounded-full h-4">
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
        <div class="bg-white dark:bg-[#1C1C1E] shadow-sm dark:shadow-none rounded-2xl p-4 space-y-3 border border-black/5 dark:border-transparent transition-colors">
          <div
            v-for="item in family.goalHistory"
            :key="item.id"
            class="flex justify-between items-center border-b border-black/5 dark:border-white/5 last:border-0 pb-3 last:pb-0"
          >
            <div>
              <p class="text-[14px]">{{ item.sourceLabel }}</p>
              <p class="text-[12px] text-black/40 dark:text-white/40">{{ formatDate(item.date) }}</p>
            </div>
            <p class="font-semibold text-[#00A651]">+{{ item.amount }} BYN</p>
          </div>
          <p v-if="family.goalHistory.length === 0" class="text-sm text-black/40 dark:text-white/40 text-center">
            Пока нет пополнений
          </p>
        </div>
      </section>
    </main>

    <!-- МОДАЛКА ПОПОЛНЕНИЯ -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center"
      @click.self="isModalOpen = false"
    >
      <div class="bg-white dark:bg-[#1C1C1E] w-full max-w-[390px] rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-slide-up transition-colors">
        <!-- Успех -->
        <div v-if="isSuccess" class="flex flex-col items-center justify-center py-6">
          <CheckCircle2 class="w-16 h-16 text-[#00A651] mb-4" />
          <h3 class="text-xl font-bold">Успешно!</h3>
          <p class="text-black/60 dark:text-white/60 mt-2">{{ lastDeposited }} BYN добавлено в копилку</p>
        </div>

        <!-- Форма -->
        <div v-else>
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold">Пополнить копилку</h3>
            <button @click="isModalOpen = false" class="text-black/50 dark:text-white/50 text-sm">Отмена</button>
          </div>

          <div class="flex items-center justify-center gap-2 mb-4">
            <input
              v-model.number="amount"
              type="number"
              inputmode="numeric"
              class="bg-transparent text-center text-5xl font-bold text-black dark:text-white outline-none w-32 border-b border-[#00A651] pb-2"
            />
            <span class="text-2xl text-black/50 dark:text-white/50 font-medium">BYN</span>
          </div>

          <p class="text-center text-[13px] text-black/40 dark:text-white/40 mb-2">
            Доступно у родителя: {{ parentCardBalanceFormatted }}
          </p>

          <p v-if="errorMsg" class="text-center text-[13px] text-red-500 mb-4">
            {{ errorMsg }}
          </p>

          <button
            @click="handleDeposit"
            :disabled="isProcessing || amount <= 0"
            class="mt-2 w-full bg-[#00A651] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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