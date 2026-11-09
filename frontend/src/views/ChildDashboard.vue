<script setup lang="ts">
import { computed, ref, onUnmounted, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import {
  ChevronLeft, QrCode, HandCoins, Map, Target, MessageSquare, X,
  Clock, BarChart, Briefcase, Star, Plus, Heart, CircleHelp,
  Sparkles, Home, PiggyBank, CheckSquare, User,
  ChevronRight, BookOpen, ShieldCheck, Wallet,
  TrendingUp, Lightbulb, Shield, Layers
} from 'lucide-vue-next'
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'

// ── ТИПЫ ──
interface QuizOption {
  text: string
}

interface QuizQuestion {
  text: string
  options: QuizOption[]
  correct: number
}

interface FinLevel {
  id: number
  title: string
  icon: string
  /** 0-3 правильных ответов */
  stars: number
  unlocked: boolean
  questions: QuizQuestion[]
}

const router = useRouter()
const family = useFamilyStore()

// ── ТАБЫ ──
const activeTab = ref('home')

// ── КАМЕРА QR ──
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
      (res) => { if (res) handleQrResult(res.getText()) },
    )
  } catch {
    isScanError.value = true
    family.setNotice('error', 'Нет доступа к камере.')
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
onUnmounted(() => { closeQrScanner() })

// ── ЗАПРОС ДЕНЕГ ──
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

// ── МОИ ЗАПРОСЫ (ШТОРКА) ──
const isRequestsSheetOpen = ref(false)
const pendingRequests = computed(() => family.notifications.filter(n => n.type === 'request'))

// ── SOS ──
const isSosModalOpen = ref(false)

function handleSosLostCard() {
  family.toggleCardActive()
  isSosModalOpen.value = false
  family.setNotice('success', 'Карта заблокирована')
}

// ── ДИЗАЙН КАРТЫ ──
const isDesignModalOpen = ref(false)
const selectedDesign = ref('emerald')
const cardDesigns = [
  { id: 'emerald', label: 'Изумруд', gradient: 'linear-gradient(135deg, #006837, #00A651)' },
  { id: 'sunset', label: 'Закат', gradient: 'linear-gradient(135deg, #FF512F, #DD2476)' },
  { id: 'sky', label: 'Небо', gradient: 'linear-gradient(135deg, #2193b0, #6dd5ed)' },
  { id: 'glass', label: 'Стекло', gradient: 'linear-gradient(135deg, #8E9EAB, #EEF2F3)' },
]

function sendDesignRequest() {
  family.notifications.unshift({
    id: `req-${Date.now()}`,
    title: `Запрос от ${family.child?.name}`,
    message: `Хочу дизайн карты: ${selectedDesign.value}`,
    type: 'request',
    isRead: false,
    time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    payload: { kind: 'permission', key: 'design' },
  })
  isDesignModalOpen.value = false
  selectedDesign.value = 'emerald'
  family.setNotice('success', 'Запрос на дизайн отправлен!')
}

// ── ТРАТЫ ──
const monthlyExpenses = computed(() => {
  let expenses = 0
  let topups = 0
  for (const t of family.transactions) {
    if (t.amount < 0) expenses += Math.abs(t.amount)
    else topups += t.amount
  }
  return { expenses, topups, total: expenses + topups }
})

// ══════════════════════════════════════════════════════════
//  ИГРА «ФИНПУТЬ» — 10 УРОВНЕЙ С ВОПРОСАМИ
// ══════════════════════════════════════════════════════════

const levels = ref<FinLevel[]>([
  {
    id: 1, title: 'Бюджет 50/30/20', icon: 'BarChart', stars: 0, unlocked: true,
    questions: [
      { text: 'Что такое бюджет?', options: [{ text: 'План доходов и расходов' }, { text: 'Тип карты' }, { text: 'Название банка' }], correct: 0 },
      { text: 'Сколько процентов дохода рекомендуется откладывать?', options: [{ text: '5%' }, { text: '10-20%' }, { text: '50%' }], correct: 1 },
      { text: 'Что такое "подушка безопасности"?', options: [{ text: 'Мягкая игрушка' }, { text: 'Запас денег на непредвиденные траты' }, { text: 'Страховка на авто' }], correct: 1 },
    ],
  },
  {
    id: 2, title: 'Первый заработок', icon: 'Briefcase', stars: 0, unlocked: false,
    questions: [
      { text: 'С какого возраста можно официально работать?', options: [{ text: 'С 14 лет' }, { text: 'С 16 лет' }, { text: 'С 18 лет' }], correct: 0 },
      { text: 'Что такое НДФЛ?', options: [{ text: 'Налог на доходы физлиц' }, { text: 'Номер договора' }, { text: 'Накопления' }], correct: 0 },
      { text: 'Какая ставка НДФЛ в Беларуси?', options: [{ text: '10%' }, { text: '13%' }, { text: '20%' }], correct: 1 },
    ],
  },
  {
    id: 3, title: 'Финансовая цель', icon: 'Target', stars: 0, unlocked: false,
    questions: [
      { text: 'Что такое SMART-цель?', options: [{ text: 'Умная цель по критериям' }, { text: 'Быстрая цель' }, { text: 'Цель на день' }], correct: 0 },
      { text: 'Как лучше копить на цель?', options: [{ text: 'Откладывать каждый месяц' }, { text: 'Копить раз в год' }, { text: 'Попросить у родителей' }], correct: 0 },
      { text: 'Что важнее при постановке цели?', options: [{ text: 'Срок и сумма' }, { text: 'Только сумма' }, { text: 'Только срок' }], correct: 0 },
    ],
  },
  {
    id: 4, title: 'Кредиты и долги', icon: 'BookOpen', stars: 0, unlocked: false,
    questions: [
      { text: 'Что такое кредит?', options: [{ text: 'Деньги взаймы под проценты' }, { text: 'Подарок от банка' }, { text: 'Скидка в магазине' }], correct: 0 },
      { text: 'Что такое переплата по кредиту?', options: [{ text: 'Сумма, которую вернули' }, { text: 'Проценты сверх суммы кредита' }, { text: 'Штраф' }], correct: 1 },
      { text: 'Что будет, если не платить кредит?', options: [{ text: 'Ничего' }, { text: 'Пени и испорченная кредитная история' }, { text: 'Заберут телефон' }], correct: 1 },
    ],
  },
  {
    id: 5, title: 'Инвестиции', icon: 'TrendingUp', stars: 0, unlocked: false,
    questions: [
      { text: 'Что такое инвестиция?', options: [{ text: 'Вложение денег для получения дохода' }, { text: 'Трата на развлечения' }, { text: 'Накопление под матрасом' }], correct: 0 },
      { text: 'Что рискованнее?', options: [{ text: 'Вклад в банке' }, { text: 'Акции' }, { text: 'Облигации' }], correct: 1 },
      { text: 'Что такое диверсификация?', options: [{ text: 'Распределение рисков' }, { text: 'Увеличение дохода' }, { text: 'Уменьшение расходов' }], correct: 0 },
    ],
  },
  {
    id: 6, title: 'Банковские продукты', icon: 'Wallet', stars: 0, unlocked: false,
    questions: [
      { text: 'Что такое дебетовая карта?', options: [{ text: 'Карта для своих денег' }, { text: 'Карта в кредит' }, { text: 'Карта лояльности' }], correct: 0 },
      { text: 'Что означает Cashback?', options: [{ text: 'Возврат части стоимости покупки' }, { text: 'Скидка' }, { text: 'Подарок' }], correct: 0 },
      { text: 'Какой лимит обычно у детской карты?', options: [{ text: 'Безлимит' }, { text: 'Ограничен родителем' }, { text: 'До 1000 BYN' }], correct: 1 },
    ],
  },
  {
    id: 7, title: 'Финансовая безопасность', icon: 'Shield', stars: 0, unlocked: false,
    questions: [
      { text: 'Кому можно сообщать PIN-код?', options: [{ text: 'Никому' }, { text: 'Друзьям' }, { text: 'Оператору банка' }], correct: 0 },
      { text: 'Что такое фишинг?', options: [{ text: 'Вид рыбалки' }, { text: 'Мошенническая ссылка' }, { text: 'Банковская услуга' }], correct: 1 },
      { text: 'Как защитить карту?', options: [{ text: 'Не носить с собой' }, { text: 'Не сообщать данные и подключить 3D-Secure' }, { text: 'Держать в сейфе' }], correct: 1 },
    ],
  },
  {
    id: 8, title: 'Налоги', icon: 'Layers', stars: 0, unlocked: false,
    questions: [
      { text: 'Зачем платить налоги?', options: [{ text: 'Для работы государства' }, { text: 'Для банка' }, { text: 'По желанию' }], correct: 0 },
      { text: 'Что такое налоговая декларация?', options: [{ text: 'Заявление о доходах' }, { text: 'Квитанция об оплате' }, { text: 'Паспорт' }], correct: 0 },
      { text: 'Какие налоги платят с зарплаты?', options: [{ text: 'Только НДФЛ' }, { text: 'НДФЛ и взносы в ФСЗН' }, { text: 'Никаких' }], correct: 1 },
    ],
  },
  {
    id: 9, title: 'Предпринимательство', icon: 'Lightbulb', stars: 0, unlocked: false,
    questions: [
      { text: 'Кто такой предприниматель?', options: [{ text: 'Человек, создающий бизнес' }, { text: 'Работник банка' }, { text: 'Продавец' }], correct: 0 },
      { text: 'Что такое "бизнес-план"?', options: [{ text: 'План развития бизнеса' }, { text: 'Отчёт о прибылях' }, { text: 'План на день' }], correct: 0 },
      { text: 'Самый важный навык предпринимателя?', options: [{ text: 'Упорство' }, { text: 'Быстро считать' }, { text: 'Красиво говорить' }], correct: 0 },
    ],
  },
  {
    id: 10, title: 'Выпускной экзамен', icon: 'ShieldCheck', stars: 0, unlocked: false,
    questions: [
      { text: 'Какое правило бюджета самое популярное?', options: [{ text: '50/30/20' }, { text: '70/20/10' }, { text: '40/40/20' }], correct: 0 },
      { text: 'Что лучше всего защищает от мошенников?', options: [{ text: 'Сложный пароль и бдительность' }, { text: 'Дорогой телефон' }, { text: 'Премьер-карта' }], correct: 0 },
      { text: 'Главный секрет финансового успеха?', options: [{ text: 'Тратить меньше, чем зарабатываешь' }, { text: 'Иметь много карт' }, { text: 'Работать без выходных' }], correct: 0 },
    ],
  },
])

/** Сумма всех звёзд по всем уровням */
const totalStars = computed(() => levels.value.reduce((s, l) => s + l.stars, 0))

/** Количество пройденных уровней */
const completedLevels = computed(() => levels.value.filter(l => l.stars === 3).length)

/** XP: 10 за каждую звезду */
const xp = computed(() => totalStars.value * 10)

/** Манички: 10 за каждую звезду */
const manichki = computed(() => totalStars.value * 10)

// ── МОДАЛКА ВИКТОРИНЫ ──
const isQuizOpen = ref(false)
const currentLevelIndex = ref(0)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref<number | null>(null)
const answerResult = ref<'correct' | 'wrong' | null>(null)
const questionTransitioning = ref(false)

const quizLevel = computed(() => levels.value[currentLevelIndex.value])
const quizQuestion = computed(() => quizLevel.value?.questions[currentQuestionIndex.value] ?? null)

function openLevelQuiz(index: number) {
  if (!levels.value[index]?.unlocked) return
  currentLevelIndex.value = index
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  answerResult.value = null
  isQuizOpen.value = true
}

function selectAnswer(index: number) {
  if (selectedAnswer.value !== null || questionTransitioning.value) return
  selectedAnswer.value = index
  const correct = quizQuestion.value?.correct
  if (index === correct) {
    answerResult.value = 'correct'
  } else {
    answerResult.value = 'wrong'
  }
  questionTransitioning.value = true
  setTimeout(() => {
    if (answerResult.value === 'correct') {
      // Добавляем звезду, если ответ правильный
      const level = levels.value[currentLevelIndex.value]
      if (level && level.stars < 3) {
        level.stars = Math.min(level.stars + 1, 3)
        // Если набрали 3 звезды — открываем следующий уровень
        if (level.stars === 3) {
          const nextLevel = levels.value[currentLevelIndex.value + 1]
          if (nextLevel) nextLevel.unlocked = true
        }
      }
    }
    // Следующий вопрос или закрываем
    if (currentQuestionIndex.value + 1 >= (quizLevel.value?.questions.length ?? 0)) {
      isQuizOpen.value = false
    } else {
      currentQuestionIndex.value++
      selectedAnswer.value = null
      answerResult.value = null
    }
    questionTransitioning.value = false
  }, 800)
}

// ── КОПИЛКИ (Список целей) ──
interface GoalItem {
  title: string
  icon: string
  current: number
  target: number
  createdAt: string
}

const savingsGoals = ref<GoalItem[]>([])

function initGoals() {
  savingsGoals.value = [
    {
      title: family.savingsGoal.title,
      icon: family.savingsGoal.icon,
      current: family.savingsGoal.current,
      target: family.savingsGoal.target,
      createdAt: family.savingsGoal.createdAt,
    },
  ]
}

initGoals()

const isNewGoalModalOpen = ref(false)
const newGoalTitle = ref('')
const newGoalTarget = ref(100)

const isSavingsDepositOpen = ref(false)
const savingsDepositGoalIndex = ref(0)
const depositAmount = ref(10)

function createGoal() {
  if (!newGoalTitle.value.trim()) return
  savingsGoals.value.push({
    title: newGoalTitle.value.trim(),
    icon: '🎯',
    current: 0,
    target: newGoalTarget.value,
    createdAt: new Date().toISOString().slice(0, 10),
  })
  newGoalTitle.value = ''
  newGoalTarget.value = 100
  isNewGoalModalOpen.value = false
}

function openSavingsDeposit(index: number) {
  savingsDepositGoalIndex.value = index
  depositAmount.value = 10
  isSavingsDepositOpen.value = true
}

function depositToGoal() {
  if (depositAmount.value <= 0 || depositAmount.value > family.childBalance) return
  const goal = savingsGoals.value[savingsDepositGoalIndex.value]
  if (!goal) return
  family.childBalance -= depositAmount.value
  goal.current += depositAmount.value
  depositAmount.value = 10
  isSavingsDepositOpen.value = false
}

// ── НАВИГАЦИЯ ──
function goBack() {
  router.push('/family')
}

// Иконка по имени
function iconByName(name: string) {
  const icons: Record<string, Component> = {
    BarChart, Briefcase, Target, BookOpen, TrendingUp,
    Wallet, Shield, Layers, Lightbulb, ShieldCheck
  }
  return icons[name] || Target
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#0A0A0A] text-black dark:text-white font-sans transition-colors duration-300">
    <!-- ШАПКА -->
    <header class="flex items-center justify-between px-5 pt-8 pb-2">
      <button @click="goBack" class="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#1C1C1E] hover:bg-gray-200 dark:hover:bg-[#2C2C2E] transition-colors">
        <ChevronLeft class="w-6 h-6" />
      </button>
      <button class="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#1C1C1E] hover:bg-gray-200 dark:hover:bg-[#2C2C2E] transition-colors relative">
        <MessageSquare class="w-5 h-5" />
        <span v-if="pendingRequests.length > 0" class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
      </button>
    </header>

    <!-- ОСНОВНОЙ КОНТЕНТ -->
    <main class="px-5 pb-24 overflow-y-auto">
      <!-- ═══════════════ ВКЛАДКА: ГЛАВНАЯ ═══════════════ -->
      <div v-if="activeTab === 'home'" class="space-y-5 pt-2">
        <div class="relative overflow-hidden rounded-3xl p-6 shadow-lg bg-gradient-to-br from-[#006837] to-[#00A651] text-white">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-6">
              <p class="text-[13px] font-medium text-white/80">M-Belarusbank</p>
              <svg class="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
            </div>
            <p class="text-[28px] font-bold mb-1">{{ family.childBalanceFormatted }}</p>
            <div class="flex justify-between items-end mt-4">
              <p class="text-[14px] font-medium text-white/90">{{ family.child?.name || 'Ребёнок' }}</p>
              <p class="text-[13px] font-mono text-white/70">•••• {{ family.card?.maskedNumber.slice(-4) }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button @click="openQrScanner" class="rounded-2xl p-4 flex flex-col items-start gap-2 bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors">
            <QrCode class="w-6 h-6 text-[#00A651]" />
            <span class="text-[14px] font-medium">Оплатить по QR</span>
          </button>
          <button @click="isRequestModalOpen = true" class="rounded-2xl p-4 flex flex-col items-start gap-2 bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors">
            <HandCoins class="w-6 h-6 text-[#00A651]" />
            <span class="text-[14px] font-medium">Запросить деньги</span>
          </button>
        </div>

        <button @click="activeTab = 'finpath'" class="w-full rounded-2xl p-4 flex items-center justify-between bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors text-left">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#00A651]/10 flex items-center justify-center shrink-0">
              <Map class="w-5 h-5 text-[#00A651]" />
            </div>
            <div>
              <p class="text-[15px] font-semibold">Финпуть</p>
              <p class="text-[12px] text-gray-500 dark:text-gray-400">Маленький шаг к большим планам</p>
            </div>
          </div>
          <ChevronRight class="w-5 h-5 text-gray-400 shrink-0" />
        </button>

        <div v-if="pendingRequests.length > 0">
          <button @click="isRequestsSheetOpen = true" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors text-sm font-medium">
            <Clock class="w-4 h-4 text-[#00A651]" />
            Ждут ответа: {{ pendingRequests.length }}
          </button>
        </div>

        <div class="rounded-2xl p-5 bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/5">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="text-[18px] font-bold">{{ monthlyExpenses.expenses.toFixed(2) }} BYN</p>
              <p class="text-[13px] text-gray-500 dark:text-gray-400">Траты за октябрь</p>
            </div>
            <svg width="48" height="48" viewBox="0 0 48 48" class="shrink-0">
              <circle cx="24" cy="24" r="20" fill="none" stroke="#E5E7EB" stroke-width="4" />
              <circle cx="24" cy="24" r="20" fill="none" stroke="#00A651" stroke-width="4"
                stroke-dasharray="125.6" stroke-dashoffset="50"
                transform="rotate(-90 24 24)" />
              <circle cx="24" cy="24" r="20" fill="none" stroke="#EF4444" stroke-width="4"
                stroke-dasharray="125.6" stroke-dashoffset="100"
                transform="rotate(-90 24 24)" />
            </svg>
          </div>
          <div class="grid grid-cols-2 gap-3 mt-4">
            <div class="rounded-xl p-3 bg-gray-50 dark:bg-[#2C2C2E]">
              <p class="text-[16px] font-bold">{{ monthlyExpenses.expenses.toFixed(2) }} BYN</p>
              <p class="text-[12px] text-gray-500 dark:text-gray-400">Расходы</p>
            </div>
            <div class="rounded-xl p-3 bg-gray-50 dark:bg-[#2C2C2E]">
              <p class="text-[16px] font-bold text-[#00A651]">{{ monthlyExpenses.topups.toFixed(2) }} BYN</p>
              <p class="text-[12px] text-gray-500 dark:text-gray-400">Пополнения</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════ ВКЛАДКА: ФИНПУТЬ ═══════════════ -->
      <div v-if="activeTab === 'finpath'" class="space-y-5 pt-2">
        <!-- Верхняя карточка прогресса (динамическая) -->
        <div class="rounded-2xl p-5 bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/5">
          <h2 class="text-[17px] font-bold mb-1">Деньги — это навык</h2>
          <p class="text-[13px] text-gray-500 dark:text-gray-400 mb-4">Учись управлять финансами играючи</p>
          <div class="flex items-center justify-between mb-2">
            <span class="text-[13px] font-medium">Пройдено: {{ completedLevels }}</span>
            <span class="flex items-center gap-1 text-[13px] font-medium text-orange-500">
              <Star class="w-4 h-4 fill-orange-500" /> {{ totalStars }}
            </span>
          </div>
          <div class="w-full rounded-full h-2.5 bg-gray-100 dark:bg-[#2C2C2E]">
            <div class="bg-[#00A651] h-2.5 rounded-full transition-all duration-500" :style="{ width: (totalStars / 30 * 100) + '%' }"></div>
          </div>
        </div>

        <!-- Вертикальный путь -->
        <div class="relative flex flex-col items-center py-4">
          <div class="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-gray-300 dark:border-gray-700"></div>

          <div v-for="(level, index) in levels" :key="level.id"
            class="relative flex items-center w-full mb-8 cursor-pointer"
            :class="{ 'opacity-60': !level.unlocked }"
            @click="openLevelQuiz(index)">

            <!-- Чередование: чётные слева, нечётные справа -->
            <template v-if="index % 2 === 0">
              <div class="w-1/2 flex justify-end pr-4">
                <div class="w-20 h-20 rounded-full bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-center"
                  :class="{ 'bg-gray-200 dark:bg-[#2C2C2E]': !level.unlocked, 'cursor-pointer hover:shadow-md transition-shadow': level.unlocked }">
                  <component :is="iconByName(level.icon)" class="w-8 h-8"
                    :class="level.unlocked ? 'text-[#00A651]' : 'text-gray-400'" />
                </div>
              </div>
              <div class="w-1/2 pl-4">
                <p class="text-[14px] font-bold" :class="level.unlocked ? '' : 'text-gray-400'">{{ level.id }}. {{ level.title }}</p>
                <div class="flex gap-0.5 mt-1">
                  <Star v-for="s in 3" :key="s" class="w-4 h-4"
                    :class="s <= level.stars ? 'fill-orange-500 text-orange-500' : 'text-gray-300 dark:text-gray-600'" />
                </div>
              </div>
            </template>
            <template v-else>
              <div class="w-1/2 pr-4 text-right">
                <p class="text-[14px] font-bold" :class="level.unlocked ? '' : 'text-gray-400'">{{ level.id }}. {{ level.title }}</p>
                <div class="flex gap-0.5 mt-1 justify-end">
                  <Star v-for="s in 3" :key="s" class="w-4 h-4"
                    :class="s <= level.stars ? 'fill-orange-500 text-orange-500' : 'text-gray-300 dark:text-gray-600'" />
                </div>
              </div>
              <div class="w-1/2 flex justify-start pl-4">
                <div class="w-20 h-20 rounded-full bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-center"
                  :class="{ 'bg-gray-200 dark:bg-[#2C2C2E]': !level.unlocked, 'cursor-pointer hover:shadow-md transition-shadow': level.unlocked }">
                  <component :is="iconByName(level.icon)" class="w-8 h-8"
                    :class="level.unlocked ? 'text-[#00A651]' : 'text-gray-400'" />
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- ═══════════════ ВКЛАДКА: КОПИЛКИ ═══════════════ -->
      <div v-if="activeTab === 'savings'" class="space-y-5 pt-2">
        <div class="flex items-center justify-between">
          <h2 class="text-[17px] font-bold">Большие мечты</h2>
          <button @click="isNewGoalModalOpen = true" class="w-9 h-9 rounded-full bg-[#00A651] text-white flex items-center justify-center hover:bg-[#009448] transition-colors">
            <Plus class="w-5 h-5" />
          </button>
        </div>

        <div v-for="(goal, gi) in savingsGoals" :key="goal.createdAt"
          class="rounded-2xl p-5 bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-[#00A651]/10 flex items-center justify-center text-2xl">{{ goal.icon }}</div>
              <div>
                <p class="text-[15px] font-bold">{{ goal.title }}</p>
                <p class="text-[13px] text-gray-500 dark:text-gray-400">{{ goal.current.toFixed(2) }} BYN из {{ goal.target.toFixed(2) }} BYN</p>
              </div>
            </div>
          </div>
          <div class="w-full rounded-full h-2.5 bg-gray-100 dark:bg-[#2C2C2E] mb-3">
            <div class="bg-[#00A651] h-2.5 rounded-full transition-all duration-500"
              :style="{ width: Math.min(100, (goal.current / goal.target) * 100) + '%' }"></div>
          </div>
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span class="flex items-center gap-1 text-[13px] text-red-500"><Heart class="w-4 h-4 fill-red-500" /> Родитель +30%</span>
            <button @click="openSavingsDeposit(gi)" class="text-[13px] text-[#00A651] font-medium hover:underline">Сдача сюда</button>
          </div>
        </div>
      </div>

      <!-- ═══════════════ ВКЛАДКА: ЗАДАНИЯ ═══════════════ -->
      <div v-if="activeTab === 'tasks'" class="space-y-5 pt-2">
        <h2 class="text-[17px] font-bold">От родителей</h2>
        <div class="rounded-2xl p-5 bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/5">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 rounded-full bg-[#00A651]/10 flex items-center justify-center shrink-0">
              <span class="text-[#00A651] text-lg font-bold">60%</span>
            </div>
            <div>
              <p class="text-[15px] font-bold">Неделя без фастфуда</p>
              <p class="text-[12px] text-gray-500 dark:text-gray-400">Банк проверит выполнение автоматически</p>
            </div>
          </div>
          <div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span class="flex items-center gap-1 text-[14px] font-bold text-orange-500">+5,00 BYN</span>
            <span class="flex items-center gap-1 text-[14px] font-bold text-[#00A651]">+40 XP</span>
          </div>
        </div>
      </div>

      <!-- ═══════════════ ВКЛАДКА: ПРОФИЛЬ (динамический) ═══════════════ -->
      <div v-if="activeTab === 'profile'" class="space-y-5 pt-2">
        <div class="flex flex-col items-center pt-4">
          <div class="w-20 h-20 rounded-full bg-[#00A651] flex items-center justify-center mb-3">
            <span class="text-white text-2xl font-bold">{{ family.child?.initials || '?' }}</span>
          </div>
          <h2 class="text-[20px] font-bold">{{ family.child?.name || 'Ребёнок' }}</h2>
          <p class="text-[13px] text-gray-500 dark:text-gray-400">Моя самостоятельность</p>
        </div>

        <!-- Блок уровня динамический -->
        <div class="rounded-2xl p-5 bg-gradient-to-br from-[#006837] to-[#00A651] text-white">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">{{ totalStars }}</div>
            <div>
              <p class="text-[13px] font-medium text-white/80">Уровень самостоятельности</p>
              <p class="text-[15px] font-bold">{{ totalStars >= 24 ? 'Финансовый гуру' : totalStars >= 18 ? 'Уверенный пользователь' : totalStars >= 9 ? 'Умный покупатель' : 'Новичок' }}</p>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex justify-between text-[12px] text-white/80 mb-1">
              <span>{{ xp }} XP</span>
              <span>300 XP</span>
            </div>
            <div class="w-full rounded-full h-2 bg-white/20">
              <div class="bg-white h-2 rounded-full transition-all duration-500" :style="{ width: Math.min(100, (xp / 300) * 100) + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Два квадрата -->
        <div class="grid grid-cols-2 gap-3">
          <button class="rounded-2xl p-5 flex flex-col items-center gap-2 bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors">
            <Sparkles class="w-8 h-8 text-[#00A651]" />
            <span class="text-[13px] font-semibold">Манички</span>
            <span class="text-[18px] font-bold">{{ manichki }}</span>
          </button>
          <button @click="isSosModalOpen = true" class="rounded-2xl p-5 flex flex-col items-center gap-2 bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors">
            <CircleHelp class="w-8 h-8 text-red-500" />
            <span class="text-[13px] font-semibold">SOS</span>
            <span class="text-[12px] text-center text-gray-500 dark:text-gray-400">Мне нужна помощь</span>
          </button>
        </div>

        <!-- Карта (привязана к isActive) -->
        <div class="relative overflow-hidden rounded-3xl p-6 shadow-lg transition-all duration-500"
          :class="family.card?.isActive
            ? 'bg-gradient-to-br from-[#006837] to-[#00A651] text-white'
            : 'bg-gray-400 dark:bg-gray-600 text-white grayscale opacity-50'">
          <div v-if="!family.card?.isActive"
            class="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
            Заблокирована
          </div>
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-6">
              <p class="text-[13px] font-medium text-white/80">M-Belarusbank</p>
              <svg class="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            <p class="text-[28px] font-bold mb-1">{{ family.childBalanceFormatted }}</p>
            <div class="flex justify-between items-end mt-4">
              <p class="text-[14px] font-medium text-white/90">{{ family.child?.name || 'Ребёнок' }}</p>
              <p class="text-[13px] font-mono text-white/70">•••• {{ family.card?.maskedNumber.slice(-4) }}</p>
            </div>
          </div>
        </div>

        <button @click="isDesignModalOpen = true" class="w-full rounded-xl py-3.5 text-center text-[14px] font-semibold bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors">
          Дизайн моей карты
        </button>
        <button class="w-full rounded-xl py-3.5 text-center text-[14px] font-semibold bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors">
          Выпускной в 14 и 18
        </button>
      </div>
    </main>

    <!-- ═══════════════ НИЖНИЙ ТАБ-БАР ═══════════════ -->
    <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#1C1C1E] border-t border-gray-100 dark:border-gray-800 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <div class="max-w-md mx-auto flex items-center justify-around py-2">
        <button @click="activeTab = 'home'" class="flex flex-col items-center gap-0.5 px-3 py-1 transition-colors">
          <Home class="w-5 h-5" :class="activeTab === 'home' ? 'text-[#00A651]' : 'text-gray-400 dark:text-gray-500'" />
          <span class="text-[10px] font-medium" :class="activeTab === 'home' ? 'text-[#00A651]' : 'text-gray-400 dark:text-gray-500'">Главная</span>
        </button>
        <button @click="activeTab = 'finpath'" class="flex flex-col items-center gap-0.5 px-3 py-1 transition-colors">
          <Map class="w-5 h-5" :class="activeTab === 'finpath' ? 'text-[#00A651]' : 'text-gray-400 dark:text-gray-500'" />
          <span class="text-[10px] font-medium" :class="activeTab === 'finpath' ? 'text-[#00A651]' : 'text-gray-400 dark:text-gray-500'">Финпуть</span>
        </button>
        <button @click="activeTab = 'savings'" class="flex flex-col items-center gap-0.5 px-3 py-1 transition-colors">
          <PiggyBank class="w-5 h-5" :class="activeTab === 'savings' ? 'text-[#00A651]' : 'text-gray-400 dark:text-gray-500'" />
          <span class="text-[10px] font-medium" :class="activeTab === 'savings' ? 'text-[#00A651]' : 'text-gray-400 dark:text-gray-500'">Копилки</span>
        </button>
        <button @click="activeTab = 'tasks'" class="flex flex-col items-center gap-0.5 px-3 py-1 transition-colors">
          <CheckSquare class="w-5 h-5" :class="activeTab === 'tasks' ? 'text-[#00A651]' : 'text-gray-400 dark:text-gray-500'" />
          <span class="text-[10px] font-medium" :class="activeTab === 'tasks' ? 'text-[#00A651]' : 'text-gray-400 dark:text-gray-500'">Задания</span>
        </button>
        <button @click="activeTab = 'profile'" class="flex flex-col items-center gap-0.5 px-3 py-1 transition-colors">
          <User class="w-5 h-5" :class="activeTab === 'profile' ? 'text-[#00A651]' : 'text-gray-400 dark:text-gray-500'" />
          <span class="text-[10px] font-medium" :class="activeTab === 'profile' ? 'text-[#00A651]' : 'text-gray-400 dark:text-gray-500'">Я</span>
        </button>
      </div>
    </nav>

    <!-- ═══════════════ МОДАЛКА QR ═══════════════ -->
    <div v-if="isQrModalOpen" class="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div class="relative w-full max-w-[390px] aspect-square bg-gray-900 rounded-3xl overflow-hidden mx-5">
        <video ref="videoRef" autoplay playsinline muted class="w-full h-full object-cover"></video>
        <div v-if="isScanError" class="absolute inset-0 flex flex-col items-center justify-center bg-[#1C1C1E] px-6 text-center">
          <p class="text-white/80 text-sm leading-relaxed">Нет доступа к камере.<br />Включите HTTPS и разрешите камеру.</p>
        </div>
        <div v-if="!isScanError" class="absolute inset-0 flex items-center justify-center pointer-events-none">
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

    <!-- ═══════════════ МОДАЛКА ЗАПРОСА ДЕНЕГ ═══════════════ -->
    <div v-if="isRequestModalOpen" class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="isRequestModalOpen = false">
      <div class="bg-white dark:bg-[#1C1C1E] w-full max-w-[390px] rounded-t-3xl p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div class="flex items-center justify-between mb-6">
          <button @click="isRequestModalOpen = false" class="text-[#00A651] text-[15px] font-medium">Отмена</button>
          <h3 class="text-[17px] font-semibold">Попросить деньги</h3>
          <div class="w-12"></div>
        </div>
        <div class="bg-gray-50 dark:bg-[#2C2C2E] rounded-2xl p-4 mb-4">
          <div class="flex items-center justify-between mb-2">
            <input v-model.number="requestAmount" type="number" inputmode="numeric" class="bg-transparent text-[40px] font-bold text-black dark:text-white outline-none w-32" />
            <span class="text-[18px] font-medium text-gray-500">BYN</span>
          </div>
          <div class="h-px w-full bg-gray-200 dark:bg-gray-700 mb-3"></div>
          <input v-model="requestReason" type="text" placeholder="На что нужны деньги" class="w-full bg-transparent text-[15px] text-black dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </div>
        <p class="text-[13px] text-gray-500 dark:text-gray-400 mb-6 px-1">Родитель увидит запрос и сможет ответить.</p>
        <button @click="sendRequest" :disabled="requestAmount <= 0" class="w-full bg-[#00A651] text-white py-4 rounded-xl font-semibold disabled:opacity-50 hover:bg-[#009448] transition-colors">
          Попросить {{ requestAmount }} BYN
        </button>
      </div>
    </div>

    <!-- ═══════════════ ШТОРКА «МОИ ЗАПРОСЫ» ═══════════════ -->
    <div v-if="isRequestsSheetOpen" class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="isRequestsSheetOpen = false">
      <div class="bg-white dark:bg-[#1C1C1E] w-full max-w-[390px] rounded-t-3xl p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-h-[80dvh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-[17px] font-bold">Мои запросы</h3>
          <button @click="isRequestsSheetOpen = false" class="text-[#00A651] text-[15px] font-medium">Готово</button>
        </div>
        <div v-if="pendingRequests.length === 0" class="text-center py-10">
          <p class="text-[15px] text-gray-400">Нет активных запросов</p>
        </div>
        <div v-for="req in pendingRequests" :key="req.id" class="rounded-2xl p-4 mb-3 bg-gray-50 dark:bg-[#2C2C2E]">
          <div class="flex items-center justify-between">
            <p class="text-[14px] font-medium">{{ req.title }}</p>
            <span class="text-[14px] font-bold">{{ req.payload?.amount?.toFixed(2) || '0.00' }} BYN</span>
          </div>
          <p class="text-[12px] text-[#00A651] mt-1 font-medium">Ждём ответа</p>
        </div>
      </div>
    </div>

    <!-- ═══════════════ МОДАЛКА SOS ═══════════════ -->
    <div v-if="isSosModalOpen" class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="isSosModalOpen = false">
      <div class="bg-white dark:bg-[#1C1C1E] w-full max-w-[390px] rounded-t-3xl p-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <h3 class="text-[20px] font-bold mb-1">Что случилось?</h3>
        <p class="text-[13px] text-gray-500 dark:text-gray-400 mb-6">Выберите ситуацию</p>
        <div class="space-y-3">
          <button @click="handleSosLostCard" class="w-full rounded-2xl p-4 text-left text-[15px] font-medium bg-gray-50 dark:bg-[#2C2C2E] hover:bg-gray-100 dark:hover:bg-[#3C3C3E] transition-colors border border-gray-100 dark:border-gray-700">
            Потерял карту
          </button>
          <button class="w-full rounded-2xl p-4 text-left text-[15px] font-medium bg-gray-50 dark:bg-[#2C2C2E] hover:bg-gray-100 dark:hover:bg-[#3C3C3E] transition-colors border border-gray-100 dark:border-gray-700">
            Просят деньги
          </button>
          <button class="w-full rounded-2xl p-4 text-left text-[15px] font-medium bg-gray-50 dark:bg-[#2C2C2E] hover:bg-gray-100 dark:hover:bg-[#3C3C3E] transition-colors border border-gray-100 dark:border-gray-700">
            Странная оплата
          </button>
        </div>
        <button @click="isSosModalOpen = false" class="w-full mt-6 py-3 rounded-xl text-[15px] font-semibold bg-gray-50 dark:bg-[#2C2C2E] hover:bg-gray-100 dark:hover:bg-[#3C3C3E] transition-colors">
          Закрыть
        </button>
      </div>
    </div>

    <!-- ═══════════════ МОДАЛКА ДИЗАЙН КАРТЫ ═══════════════ -->
    <div v-if="isDesignModalOpen" class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="isDesignModalOpen = false">
      <div class="bg-white dark:bg-[#1C1C1E] w-full max-w-[390px] rounded-t-3xl p-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-[17px] font-bold">Дизайн карты</h3>
          <button @click="isDesignModalOpen = false" class="text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">✕</button>
        </div>
        <div class="grid grid-cols-2 gap-3 mb-6">
          <button v-for="d in cardDesigns" :key="d.id"
            @click="selectedDesign = d.id"
            class="rounded-2xl h-24 flex items-center justify-center text-white text-[13px] font-semibold shadow-sm hover:scale-[1.02] transition-transform"
            :class="selectedDesign === d.id ? 'ring-4 ring-[#00A651] ring-offset-2 dark:ring-offset-[#1C1C1E]' : ''"
            :style="{ background: d.gradient }">
            {{ d.label }}
          </button>
        </div>
        <button @click="sendDesignRequest" class="w-full bg-[#00A651] text-white py-4 rounded-xl font-semibold hover:bg-[#009448] transition-colors">
          Отправить маме
        </button>
      </div>
    </div>

    <!-- ═══════════════ МОДАЛКА НОВОЙ ЦЕЛИ ═══════════════ -->
    <div v-if="isNewGoalModalOpen" class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="isNewGoalModalOpen = false">
      <div class="bg-white dark:bg-[#1C1C1E] w-full max-w-[390px] rounded-t-3xl p-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-[17px] font-bold">Новая цель</h3>
          <button @click="isNewGoalModalOpen = false" class="text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">✕</button>
        </div>
        <input v-model="newGoalTitle" type="text" placeholder="Название (Наушники, Велосипед...)"
          class="w-full rounded-xl p-3.5 mb-3 text-[15px] bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-700 text-black dark:text-white outline-none focus:border-[#00A651] transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        <input v-model.number="newGoalTarget" type="number" inputmode="numeric" placeholder="Сумма"
          class="w-full rounded-xl p-3.5 mb-4 text-[15px] bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-700 text-black dark:text-white outline-none focus:border-[#00A651] transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        <button @click="createGoal" :disabled="!newGoalTitle.trim() || newGoalTarget <= 0"
          class="w-full bg-[#00A651] text-white py-4 rounded-xl font-semibold disabled:opacity-50 hover:bg-[#009448] transition-colors">
          Сохранить цель
        </button>
      </div>
    </div>

    <!-- ═══════════════ МОДАЛКА ПОПОЛНЕНИЯ КОПИЛКИ ═══════════════ -->
    <div v-if="isSavingsDepositOpen" class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="isSavingsDepositOpen = false">
      <div class="bg-white dark:bg-[#1C1C1E] w-full max-w-[390px] rounded-t-3xl p-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-[17px] font-bold">Пополнить копилку</h3>
          <button @click="isSavingsDepositOpen = false" class="text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">✕</button>
        </div>
        <input v-model.number="depositAmount" type="number" inputmode="numeric" placeholder="Сумма"
          class="w-full rounded-xl p-3.5 mb-3 text-[30px] font-bold bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-700 text-black dark:text-white outline-none focus:border-[#00A651] transition-colors" />
        <p class="text-[13px] text-gray-500 dark:text-gray-400 mb-4">Доступно: {{ family.childBalanceFormatted }}</p>
        <button @click="depositToGoal" :disabled="depositAmount <= 0 || depositAmount > family.childBalance"
          class="w-full bg-[#00A651] text-white py-4 rounded-xl font-semibold disabled:opacity-50 hover:bg-[#009448] transition-colors">
          Пополнить на {{ depositAmount }} BYN
        </button>
      </div>
    </div>

    <!-- ═══════════════ МОДАЛКА ВИКТОРИНЫ (УРОВЕНЬ) ═══════════════ -->
    <div v-if="isQuizOpen && quizLevel" class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center sm:items-center" @click.self="isQuizOpen = false">
      <div class="bg-white dark:bg-[#1C1C1E] w-full max-w-[390px] rounded-t-3xl sm:rounded-3xl p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] max-h-[85dvh] overflow-y-auto">
        <!-- Прогресс-бары вопросов -->
        <div class="flex gap-1.5 mb-6">
          <div v-for="(q, qi) in quizLevel.questions" :key="qi"
            class="h-1.5 flex-1 rounded-full transition-colors duration-300"
            :class="qi < currentQuestionIndex ? 'bg-[#00A651]' : qi === currentQuestionIndex ? 'bg-[#00A651]' : 'bg-gray-200 dark:bg-gray-700'">
          </div>
        </div>

        <p class="text-[22px] font-bold mb-6">{{ quizQuestion?.text }}</p>

        <div class="space-y-3 mb-6">
          <button v-for="(opt, oi) in quizQuestion?.options" :key="oi"
            @click="selectAnswer(oi)"
            :disabled="selectedAnswer !== null"
            class="w-full rounded-2xl p-4 text-left text-[15px] font-medium transition-all duration-300 border"
            :class="{
              'bg-[#00A651]/10 border-[#00A651] text-[#00A651]': selectedAnswer === oi && answerResult === 'correct',
              'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-600': selectedAnswer === oi && answerResult === 'wrong',
              'bg-gray-50 dark:bg-[#2C2C2E] border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#3C3C3E]': selectedAnswer === null,
              'opacity-50': selectedAnswer !== null && selectedAnswer !== oi,
            }">
            {{ opt.text }}
          </button>
        </div>

        <div v-if="answerResult === 'correct'" class="text-center text-[#00A651] font-semibold text-[15px]">
          ✅ Правильно! +1 звезда
        </div>
        <div v-if="answerResult === 'wrong'" class="text-center text-red-500 font-semibold text-[15px]">
          ❌ Неправильно. Попробуй следующий вопрос
        </div>
      </div>
    </div>
  </div>
</template>
