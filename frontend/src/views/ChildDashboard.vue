<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, QrCode, HandCoins, Map, Target, MessageSquare, X, Send } from 'lucide-vue-next'
const router = useRouter()
const family = useFamilyStore()

// Определяем, подросток ли это
const isTeen = computed(() => family.child?.ageGroup === '14-17')

// ── Состояние для камеры ──
const isQrModalOpen = ref(false)
const isScanning = ref(false)
const isStreamActive = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
let stream: MediaStream | null = null

async function openQrScanner() {
  isQrModalOpen.value = true
  isScanning.value = false
  
  // Проверяем, мобильное ли это устройство (по User Agent)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (isMobile) {
    try {
      // На мобилке пытаемся включить камеру (сработает только на HTTPS)
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.value) {
        videoRef.value.srcObject = stream
        isStreamActive.value = true
      }
    } catch {
      // Если камера заблокирована браузером — ничего страшного, останется симуляция
      console.log('Камера на мобилке недоступна, включаем симуляцию')
    }
  } else {
    // Если это ноутбук — вообще НЕ включаем камеру, просто показываем симуляцию
    console.log('Запуск на ПК: камера отключена, работает симуляция')
  }
  
  // Включаем анимацию лазера и "сканируем" через 3 секунды
  isScanning.value = true
  setTimeout(() => {
    if (isQrModalOpen.value) {
      family.setNotice('success', 'QR-код успешно распознан! Оплата 5 BYN')
      closeQrScanner()
    }
  }, 3000)
}

function closeQrScanner() {
  isQrModalOpen.value = false
  isStreamActive.value = false
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
}

// Страховка: если ушли с экрана, выключаем камеру
onUnmounted(() => {
  closeQrScanner()
})

// ── Состояние для запроса денег ──
const isRequestModalOpen = ref(false)
const requestAmount = ref(10)
const requestReason = ref('')


function sendRequest() {
  if (requestAmount.value <= 0) return
  
  // Формируем красивый текст
  const reason = requestReason.value.trim() ? ` на ${requestReason.value.trim()}` : ''
  
  family.notifications.unshift({
    id: `req-${Date.now()}`,
    title: `Запрос от ${family.child?.name}`,
    message: `Можно мне ${requestAmount.value} BYN${reason}?`,
    time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    isRead: false,
    type: 'request',
    payload: { kind: 'money', amount: requestAmount.value }
  })
  
  family.setNotice('success', 'Запрос отправлен родителю!')
  isRequestModalOpen.value = false
  requestAmount.value = 10
  requestReason.value = ''
}

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
          ? 'bg-gradient-to-br from-[#265f4b] to-[#3b9858] text-white' 
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
        <button @click="openQrScanner" class="rounded-2xl p-4 flex flex-col items-start gap-2 bg-[#1C1C1E] hover:bg-[#2C2C2E] transition-colors">
          <QrCode class="w-6 h-6 text-[#00A651]" />
          <span class="text-[14px] font-medium">Оплатить по QR</span>
        </button>
        <button @click="isRequestModalOpen = true" class="rounded-2xl p-4 flex flex-col items-start gap-2 bg-[#1C1C1E] hover:bg-[#2C2C2E] transition-colors">
          <HandCoins class="w-6 h-6 text-[#00A651]" />
          <span class="text-[14px] font-medium">Запросить деньги</span>
        </button>
      </div>

      <!-- Специальный блок для подростков (Финпуть) -->
      <div v-if="isTeen" @click="family.setNotice('error', 'Раздел в разработке')" class="bg-[#1C1C1E] rounded-2xl p-4 flex items-center justify-between mb-6 cursor-pointer hover:bg-[#2C2C2E] transition-colors">
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
      <div @click="router.push('/goal')" class="bg-[#1C1C1E] rounded-3xl p-5 cursor-pointer hover:bg-[#2C2C2E] transition-colors">
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

    <!-- ═══════════════════════════════════════════════════ -->
    <!-- МОДАЛКА QR-СКАНЕРА                                -->
    <!-- ═══════════════════════════════════════════════════ -->
    <div v-if="isQrModalOpen" class="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div class="relative w-full max-w-[390px] aspect-square bg-gray-900 rounded-3xl overflow-hidden mx-5">
                <!-- Если камера есть — показываем видео, иначе черный фон -->
        <video v-show="isStreamActive" ref="videoRef" autoplay playsinline class="w-full h-full object-cover"></video>
        <div v-if="!isStreamActive" class="absolute inset-0 flex items-center justify-center bg-[#1C1C1E]">
           <p class="text-white/40 text-sm">Сканирование QR-кода...</p>
        </div>
        
        <!-- Прицел для сканирования -->
        <div class="absolute inset-0 border-[40px] border-black/60 flex items-center justify-center">
          <div class="w-48 h-48 border-2 border-[#00A651] rounded-2xl relative">
            <!-- Уголки -->
            <div class="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#00A651] rounded-tl-lg"></div>
            <div class="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#00A651] rounded-tr-lg"></div>
            <div class="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#00A651] rounded-bl-lg"></div>
            <div class="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#00A651] rounded-br-lg"></div>
          </div>
        </div>
      </div>
      
      <p class="text-white text-sm mt-6 mb-8 text-center px-5">
        Наведите камеру на QR-код<br>для оплаты
      </p>
      
      <button @click="closeQrScanner" class="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform">
        <X class="w-6 h-6" />
      </button>
    </div>

        <!-- ═══════════════════════════════════════════════════ -->
    <!-- МОДАЛКА ЗАПРОСА ДЕНЕГ                             -->
    <!-- ═══════════════════════════════════════════════════ -->
    <div 
      v-if="isRequestModalOpen" 
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center" 
      @click.self="isRequestModalOpen = false"
    >
      <div class="bg-[#F2F2F7] dark:bg-[#1C1C1E] w-full max-w-[390px] rounded-t-[32px] p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-slide-up">

        <!-- Шапка модалки -->
        <div class="flex items-center justify-between mb-6">
          <button 
            @click="isRequestModalOpen = false"
            class="text-[#00A651] text-[15px] font-medium"
          >
            Отмена
          </button>
          <h3 class="text-[17px] font-semibold text-black dark:text-white">Попросить деньги</h3>
          <div class="w-12"></div> <!-- Пустышка для центровки -->
        </div>

        <!-- Блок с инпутом (сумма + цель) -->
        <div class="bg-black/5 dark:bg-[#2C2C2E] rounded-2xl p-4 mb-4">
          <div class="flex items-center justify-between mb-2">
            <input 
              v-model.number="requestAmount" 
              type="number" 
              inputmode="numeric"
              class="bg-transparent text-[40px] font-bold text-black dark:text-white outline-none w-32" 
            />
            <span class="text-[18px] font-medium text-black/40 dark:text-white/40">BYN</span>
          </div>
          
          <div class="h-px w-full bg-black/10 dark:bg-white/10 mb-3"></div>
          
          <input 
            v-model="requestReason"
            type="text"
            placeholder="На что нужны деньги"
            class="w-full bg-transparent text-[15px] text-black dark:text-white outline-none placeholder:text-black/30 dark:placeholder:text-white/30"
          />
        </div>

        <!-- Подсказка -->
        <p class="text-[13px] text-black/50 dark:text-white/50 mb-6 px-1 leading-relaxed">
          Родитель увидит запрос и сможет ответить в один тап.
        </p>

        <!-- Кнопка отправки -->
        <button 
          @click="sendRequest" 
          :disabled="requestAmount <= 0"
          class="w-full bg-black/5 dark:bg-[#2C2C2E] text-[#00A651] py-4 rounded-xl font-semibold text-[16px] flex items-center justify-between px-5 hover:bg-black/10 dark:hover:bg-[#3C3C3E] transition-colors disabled:opacity-50"
        >
          <span>Попросить</span>
          <Send class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Анимация выезда шторки снизу */
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>