<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, QrCode, HandCoins, Map, Target, MessageSquare, X, Send } from 'lucide-vue-next'
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'

const router = useRouter()
const family = useFamilyStore()

const isTeen = computed(() => family.child?.ageGroup === '14-17')

// ── ФОН ЭКРАНА (зависит от возраста/карты) ──
const childBgStyle = computed(() => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const endColor = isDark ? '#0A0A0A' : '#F2F2F7'
  
  if (isTeen.value) {
    return { background: `radial-gradient(circle at top, #265f4b 0%, ${endColor} 70%)` }
  }
  return { background: `radial-gradient(circle at top, #FF512F 0%, ${endColor} 70%)` }
})

// ── Состояние для камеры ──
const isQrModalOpen = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const isScanError = ref(false)
let scannerControls: IScannerControls | null = null

async function openQrScanner() {
  isQrModalOpen.value = true
  isScanError.value = false

  if (!navigator.mediaDevices?.getUserMedia) {
    isScanError.value = true
    family.setNotice('error', 'Камера недоступна. Откройте приложение по HTTPS.')
    return
  }

  try {
    const codeReader = new BrowserQRCodeReader()
    const video = videoRef.value
    if (!video) return

    scannerControls = await codeReader.decodeFromConstraints(
      { video: { facingMode: 'environment' } },
      video,
      (res) => {
        if (res) handleQrResult(res.getText())
      },
    )
  } catch {
    isScanError.value = true
    family.setNotice('error', 'Нет доступа к камере. Разрешите её в настройках браузера.')
  }
}

function handleQrResult(qrText: string) {
  const amount = parseQrAmount(qrText) ?? 5
  family.setNotice('success', `QR-код распознан! Оплата ${amount} BYN`)
  closeQrScanner()
}

function parseQrAmount(text: string): number | null {
  const match = text.match(/amount[=:]([\d.]+)/i)
  return match ? Number(match[1]) : null
}

function closeQrScanner() {
  isQrModalOpen.value = false
  scannerControls?.stop()
  scannerControls = null
}

onUnmounted(() => {
  closeQrScanner()
})

// ── Состояние для запроса денег ──
const isRequestModalOpen = ref(false)
const requestAmount = ref(10)
const requestReason = ref('')

function sendRequest() {
  if (requestAmount.value <= 0) return
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
  <!-- Убрали жесткий bg-[#0A0A0A], добавили relative -->
  <div class="min-h-screen text-black dark:text-white font-sans pb-24 relative overflow-hidden transition-colors duration-300">
    
    <!-- ФОНОВЫЙ СЛОЙ (зависит от карты) -->
    <div class="fixed inset-0 z-0 pointer-events-none transition-all duration-700" :style="childBgStyle"></div>

    <!-- КОНТЕНТ -->
    <div class="relative z-10">
      <header class="flex items-center justify-between px-5 pt-8 pb-4">
        <button @click="goBack" class="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <ChevronLeft class="w-6 h-6" />
        </button>
        
        <button class="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors relative">
          <MessageSquare class="w-5 h-5" />
          <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </header>

      <div class="px-5 mt-2 relative z-50">
        <NoticeBanner v-if="family.notice" :notice="family.notice" @dismiss="family.clearNotice()" />
      </div>

      <main class="px-5">
        <h1 class="text-[26px] font-bold mb-6 text-white">Добрый день, {{ family.child?.name }}!</h1>

        <!-- КАРТА -->
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
          <div v-if="!isTeen" class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
        </div>

        <!-- Кнопки быстрых действий -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <button @click="openQrScanner" class="rounded-2xl p-4 flex flex-col items-start gap-2 bg-white dark:bg-[#1C1C1E] shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors">
            <QrCode class="w-6 h-6 text-[#00A651]" />
            <span class="text-[14px] font-medium">Оплатить по QR</span>
          </button>
          <button @click="isRequestModalOpen = true" class="rounded-2xl p-4 flex flex-col items-start gap-2 bg-white dark:bg-[#1C1C1E] shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors">
            <HandCoins class="w-6 h-6 text-[#00A651]" />
            <span class="text-[14px] font-medium">Запросить деньги</span>
          </button>
        </div>

        <!-- Финпуть -->
        <div v-if="isTeen" @click="family.setNotice('error', 'Раздел в разработке')" class="bg-white dark:bg-[#1C1C1E] shadow-sm dark:shadow-none rounded-2xl p-4 flex items-center justify-between mb-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#00A651]/10 flex items-center justify-center">
              <Map class="w-5 h-5 text-[#00A651]" />
            </div>
            <div>
              <p class="text-[15px] font-semibold">Финпуть</p>
              <p class="text-[12px] text-black/50 dark:text-white/50">Маленький шаг к большим планам</p>
            </div>
          </div>
          <ChevronLeft class="w-5 h-5 rotate-180 text-black/40 dark:text-white/40" />
        </div>

        <!-- Копилка -->
        <div @click="router.push('/goal')" class="bg-white dark:bg-[#1C1C1E] shadow-sm dark:shadow-none rounded-3xl p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-[16px] font-bold">Мои цели</h2>
            <Target class="w-5 h-5 text-[#00A651]" />
          </div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-[14px]">{{ family.savingsGoal.title }}</span>
            <span class="text-[14px] font-semibold text-[#00A651]">{{ family.goalProgress }}%</span>
          </div>
          <div class="w-full rounded-full h-2.5 bg-black/10 dark:bg-white/10">
            <div class="bg-[#00A651] h-2.5 rounded-full" :style="{ width: family.goalProgress + '%' }"></div>
          </div>
        </div>
      </main>
    </div>

    <!-- МОДАЛКА QR-СКАНЕРА (без изменений) -->
    <div v-if="isQrModalOpen" class="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div class="relative w-full max-w-[390px] aspect-square bg-gray-900 rounded-3xl overflow-hidden mx-5">
        <video ref="videoRef" autoplay playsinline muted class="w-full h-full object-cover"></video>
        <div v-if="isScanError" class="absolute inset-0 flex flex-col items-center justify-center bg-[#1C1C1E] px-6 text-center">
          <p class="text-white/80 text-sm leading-relaxed">Нет доступа к камере.<br />Включите HTTPS и разрешите камеру.</p>
        </div>
        <div v-if="!isScanError" class="absolute inset-0 border-[40px] border-black/50 flex items-center justify-center pointer-events-none">
          <div class="w-48 h-48 border-2 border-[#00A651] rounded-2xl relative">
            <div class="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#00A651] rounded-tl-lg"></div>
            <div class="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#00A651] rounded-tr-lg"></div>
            <div class="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#00A651] rounded-bl-lg"></div>
            <div class="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#00A651] rounded-br-lg"></div>
          </div>
        </div>
      </div>
      <p v-if="!isScanError" class="text-white text-sm mt-6 mb-8 text-center px-5">Наведите камеру на QR-код<br />для оплаты</p>
      <p v-else class="text-white/50 text-sm mt-6 mb-8 text-center px-5">Откройте приложение через HTTPS</p>
      <button @click="closeQrScanner" class="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform">
        <X class="w-6 h-6" />
      </button>
    </div>

    <!-- МОДАЛКА ЗАПРОСА (без изменений) -->
    <div v-if="isRequestModalOpen" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center" @click.self="isRequestModalOpen = false">
      <div class="bg-[#F2F2F7] dark:bg-[#1C1C1E] w-full max-w-[390px] rounded-t-[32px] p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-slide-up">
        <div class="flex items-center justify-between mb-6">
          <button @click="isRequestModalOpen = false" class="text-[#00A651] text-[15px] font-medium">Отмена</button>
          <h3 class="text-[17px] font-semibold text-black dark:text-white">Попросить деньги</h3>
          <div class="w-12"></div>
        </div>
        <div class="bg-black/5 dark:bg-[#2C2C2E] rounded-2xl p-4 mb-4">
          <div class="flex items-center justify-between mb-2">
            <input v-model.number="requestAmount" type="number" inputmode="numeric" class="bg-transparent text-[40px] font-bold text-black dark:text-white outline-none w-32" />
            <span class="text-[18px] font-medium text-black/40 dark:text-white/40">BYN</span>
          </div>
          <div class="h-px w-full bg-black/10 dark:bg-white/10 mb-3"></div>
          <input v-model="requestReason" type="text" placeholder="На что нужны деньги" class="w-full bg-transparent text-[15px] text-black dark:text-white outline-none placeholder:text-black/30 dark:placeholder:text-white/30" />
        </div>
        <p class="text-[13px] text-black/50 dark:text-white/50 mb-6 px-1 leading-relaxed">Родитель увидит запрос и сможет ответить в один тап.</p>
        <button @click="sendRequest" :disabled="requestAmount <= 0" class="w-full bg-black/5 dark:bg-[#2C2C2E] text-[#00A651] py-4 rounded-xl font-semibold text-[16px] flex items-center justify-between px-5 hover:bg-black/10 dark:hover:bg-[#3C3C3E] transition-colors disabled:opacity-50">
          <span>Попросить</span>
          <Send class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up { animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>