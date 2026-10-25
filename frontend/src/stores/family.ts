import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
<<<<<<< Updated upstream
import { fetchFamilyState, transferMoney } from '@/api/familyApi'
import {
  type ChildProfile,
  type ChildCard,
  type Transaction,
  type CardLimits,
  type SpendingCategory,
  type SavingsGoal,
  type GoalContribution,
  type Chore,
  type Achievement,
  DAILY_LIMIT_PRESETS,
} from '@/types'

// ─── Демо-данные ───────────────────────────────────────────────

const demoChild: ChildProfile = {
  id: 'child-1',
  name: 'Миша',
  age: 12,
  initials: 'МП',
}

const demoCard: ChildCard = {
  maskedNumber: '2200 •••• •••• 4567',
  balance: 85.5,
  currency: 'BYN',
  paymentSystem: 'VISA',
  isActive: true,
}

const demoTransactions: Transaction[] = [
  { id: 't1', merchant: 'Школьный буфет', category: 'food', amount: -4.2, date: '2026-10-24', time: '14:22' },
  { id: 't2', merchant: 'Кофе с другом', category: 'cafe', amount: -6.0, date: '2026-10-23', time: '16:10' },
  { id: 't3', merchant: 'Карманные деньги', category: 'topup', amount: +20.0, date: '2026-10-22', time: '09:00' },
  { id: 't4', merchant: 'Канцтовары', category: 'clothes', amount: -12.5, date: '2026-10-20', time: '11:45' },
  { id: 't5', merchant: 'Проездной', category: 'transport', amount: -15.0, date: '2026-10-18', time: '08:30' },
  { id: 't6', merchant: 'Игровой центр', category: 'entertainment', amount: -8.0, date: '2026-10-15', time: '18:00' },
]

const demoLimits: CardLimits = {
  dailyLimit: 50,
  weeklyLimit: 200,
}

const demoSpendingCategories: SpendingCategory[] = [
  { id: 'food', label: 'Еда', isAllowed: true },
  { id: 'clothes', label: 'Одежда', isAllowed: true },
  { id: 'transport', label: 'Транспорт', isAllowed: true },
  { id: 'cafe', label: 'Кафе', isAllowed: false },
  { id: 'entertainment', label: 'Развлечения', isAllowed: false },
]

const demoSavingsGoal: SavingsGoal = {
  id: 'goal-1',
  title: 'Новый велосипед',
  icon: '🚲',
  current: 320,
  target: 500,
  createdAt: '2026-09-01',
}

const demoGoalContributions: GoalContribution[] = [
  { id: 'gc1', date: '2026-10-24', amount: 10, source: 'parent', sourceLabel: 'От родителей' },
  { id: 'gc2', date: '2026-10-18', amount: 15, source: 'chore', sourceLabel: 'Задание: помыл посуду' },
  { id: 'gc3', date: '2026-10-10', amount: 20, source: 'parent', sourceLabel: 'От родителей' },
  { id: 'gc4', date: '2026-10-02', amount: 25, source: 'parent', sourceLabel: 'День рождения' },
]

const demoChores: Chore[] = [
  { id: 'ch1', title: 'Помыть посуду', reward: 5, completed: false },
  { id: 'ch2', title: 'Сделать уроки', reward: 3, completed: true },
  { id: 'ch3', title: 'Пропылесосить', reward: 7, completed: false },
]

const demoAchievements: Achievement[] = [
  { id: 'a1', title: 'Первая цель', icon: 'Target', color: '#00A651' },
  { id: 'a2', title: '30 дней без импульсивных покупок', icon: 'ShieldCheck', color: '#FF9F0A' },
  { id: 'a3', title: 'Накопил 200 ₽', icon: 'PiggyBank', color: '#0A84FF' },
]

// ─── Хелперы ───────────────────────────────────────────────────

export type Notice =
  | { kind: 'success'; text: string }
  | { kind: 'error'; text: string }

function money(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'BYN',
    minimumFractionDigits: 2,
  }).format(value)
}

function toErrorNotice(cause: unknown): Notice {
  if (cause instanceof Error && cause.message) {
    return { kind: 'error', text: cause.message }
  }
  return { kind: 'error', text: 'Что-то пошло не так' }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

// ─── Store ────────────────────────────────────────────────────

export const useFamilyStore = defineStore('family', () => {
  // ── состояние ──

  // Балансы (могут приходить с бэкенда)
  const parentBalance = ref<number | null>(200)
  const childBalance = ref<number | null>(85.5)

  // Профиль ребёнка
  const child = ref<ChildProfile>({ ...demoChild })

  // Карта
  const card = ref<ChildCard>({ ...demoCard })

  // Транзакции
  const transactions = ref<Transaction[]>([...demoTransactions])

  // Лимиты
  const limits = ref<CardLimits>({ ...demoLimits })

  // Категории трат
  const spendingCategories = ref<SpendingCategory[]>(
    demoSpendingCategories.map((c) => ({ ...c })),
  )

  // Цель накопления
  const savingsGoal = ref<SavingsGoal>({ ...demoSavingsGoal })

  // История пополнений цели
  const goalHistory = ref<GoalContribution[]>([...demoGoalContributions])

  // Задания
  const chores = ref<Chore[]>(demoChores.map((c) => ({ ...c })))

  // Достижения
  const achievements = ref<Achievement[]>([...demoAchievements])

  // UI
  const isLoading = ref(false)
  const notice = ref<Notice | null>(null)

  // ── геттеры ──

  const parentBalanceFormatted = computed(() => money(parentBalance.value))
  const childBalanceFormatted = computed(() => money(childBalance.value))
  const cardBalanceFormatted = computed(() => money(card.value.balance))

  /** Процент выполнения цели. */
=======
import type {
  ChildProfile, ChildCard, Transaction, CardLimits, SpendingCategory,
  SavingsGoal, GoalContribution, Chore, Achievement
} from '@/types'

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  isRead: boolean
  type: 'request' | 'info'
}

export const useFamilyStore = defineStore('family', () => {
  // ── состояние ──
    // Цвет карты (для динамического фона)
  const cardColor = ref<'emerald' | 'gold' | 'purple'>('emerald')

  
  const parentBalance = ref<number>(200.00)
  const childBalance = ref<number>(85.50)

  const child = ref<ChildProfile>({ id: 'child-1', name: 'Миша', age: 10, initials: 'МП' })

  const card = ref<ChildCard>({
    maskedNumber: '2200 •••• •••• 4567',
    balance: 85.50,
    currency: 'BYN',
    paymentSystem: 'VISA',
    isActive: true,
  })

    // Индекс текущей карты (для свайпа и фона)
  const currentCardIndex = ref(0)
  
  function setCurrentCardIndex(index: number) {
    currentCardIndex.value = index
  }

  const limits = ref<CardLimits>({ dailyLimit: 50, weeklyLimit: 200 })

  const transactions = ref<Transaction[]>([
    { id: 't1', merchant: 'Школьный буфет', category: 'food', amount: -4.2, date: '2026-10-25', time: '14:22' },
    { id: 't2', merchant: 'Кофе с другом', category: 'cafe', amount: -6.0, date: '2026-10-24', time: '16:10' },
    { id: 't3', merchant: 'Карманные деньги', category: 'topup', amount: +20.0, date: '2026-10-23', time: '09:00' },
  ])

  const spendingCategories = ref<SpendingCategory[]>([
    { id: 'food', label: 'Еда', isAllowed: true },
    { id: 'clothes', label: 'Одежда', isAllowed: true },
    { id: 'cafe', label: 'Кафе', isAllowed: false },
    { id: 'entertainment', label: 'Развлечения', isAllowed: false },
  ])

  const savingsGoal = ref<SavingsGoal>({
    id: 'goal-1', title: 'Новый велосипед', icon: '🚲',
    current: 120, target: 300, createdAt: '2026-09-01',
  })

  const goalHistory = ref<GoalContribution[]>([
    { id: 'gc1', date: '2026-10-24', amount: 10, source: 'parent', sourceLabel: 'От родителей' },
  ])

  const chores = ref<Chore[]>([
    { id: 'ch1', title: 'Помыть посуду', reward: 5, completed: false },
    { id: 'ch2', title: 'Сделать уроки', reward: 3, completed: true },
  ])

  const notifications = ref<Notification[]>([
    { id: '1', title: 'Запрос от Миши', message: 'Мама, можно я куплю шоколадку за 5 BYN?', time: '10:24', isRead: false, type: 'request' },
    { id: '2', title: 'Безопасность', message: 'Вход в приложение с нового устройства.', time: 'Вчера', isRead: true, type: 'info' },
  ])

  const notice = ref<{ kind: 'success' | 'error'; text: string } | null>(null)

  // ── геттеры ──

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'BYN', minimumFractionDigits: 2 }).format(val)

  const parentBalanceFormatted = computed(() => formatMoney(parentBalance.value))
  const childBalanceFormatted = computed(() => formatMoney(childBalance.value))
  const cardBalanceFormatted = computed(() => formatMoney(card.value.balance))

>>>>>>> Stashed changes
  const goalProgress = computed(() => {
    if (savingsGoal.value.target <= 0) return 0
    return Math.min(100, Math.round((savingsGoal.value.current / savingsGoal.value.target) * 100))
  })
<<<<<<< Updated upstream

  /** Осталось до цели. */
  const goalRemaining = computed(() => savingsGoal.value.target - savingsGoal.value.current)

  /** Последние 4 транзакции. */
  const recentTransactions = computed(() => transactions.value.slice(0, 4))

  /** Транзакции, сгруппированные по датам. */
  const transactionsGrouped = computed(() => {
    const groups: Record<string, Transaction[]> = {}
    for (const t of transactions.value) {
      if (!groups[t.date]) groups[t.date] = []
      groups[t.date]!.push(t)
    }
    return Object.entries(groups).map(([date, items]) => ({ date, items }))
  })

  /** Выполненные задания (прогресс). */
  const completedChoreCount = computed(() => chores.value.filter((c) => c.completed).length)

  // ── экшены ──

  /** Загрузить состояние с бэкенда (MVP: только балансы). */
  async function loadState(): Promise<void> {
    isLoading.value = true
    notice.value = null
    try {
      const state = await fetchFamilyState()
      parentBalance.value = state.parentBalance
      childBalance.value = state.childBalance
      card.value.balance = state.childBalance
      card.value = { ...card.value }
    } catch (cause) {
      notice.value = toErrorNotice(cause)
    } finally {
      isLoading.value = false
    }
  }

  /** Перевести деньги родитель → ребёнок. */
  async function transfer(amount: number): Promise<void> {
    notice.value = null
    try {
      const result = await transferMoney(amount)
      parentBalance.value = result.parentBalance
      childBalance.value = result.childBalance
      card.value.balance = result.childBalance
      card.value = { ...card.value }
      // Добавляем фиктивную транзакцию
      const now = new Date()
      transactions.value.unshift({
        id: `t${Date.now()}`,
        merchant: 'Карманные деньги',
        category: 'topup',
        amount: amount,
        date: todayISO(),
        time: now.toTimeString().slice(0, 5),
      })
      notice.value = { kind: 'success', text: result.message || `Переведено ${money(amount)}` }
    } catch (cause) {
      notice.value = toErrorNotice(cause)
    }
  }

  /** Обновить дневной лимит. */
  function setDailyLimit(value: number): void {
    limits.value.dailyLimit = value
  }

  /** Обновить недельный лимит. */
  function setWeeklyLimit(value: number): void {
    limits.value.weeklyLimit = value
  }

  /** Переключить категорию трат. */
=======

  // ── экшены ──

  /** Перевести карманные деньги: списываем с родителя, зачисляем ребёнку. */
  function transfer(amount: number): boolean {
    if (amount <= 0 || amount > parentBalance.value) return false

    parentBalance.value -= amount
    childBalance.value += amount
    card.value.balance = childBalance.value

    transactions.value.unshift({
      id: `t${Date.now()}`,
      merchant: 'Карманные деньги',
      category: 'topup',
      amount,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
    })

    notice.value = { kind: 'success', text: `Переведено ${formatMoney(amount)}` }
    setTimeout(() => { notice.value = null }, 3000)
    return true
  }

  /**
   * Пополнить копилку: деньги идут ОТ РОДИТЕЛЯ в цель ребёнка.
   * Баланс ребёнка НЕ меняется — ребёнок видит прогресс, но не тратит свои деньги.
   */
  function depositToGoal(amount: number): boolean {
    if (amount <= 0 || amount > parentBalance.value) return false

    parentBalance.value -= amount
    savingsGoal.value.current += amount
    // Триггерим реактивность (ref с объектом)
    savingsGoal.value = { ...savingsGoal.value }

    goalHistory.value.unshift({
      id: `gc${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      amount,
      source: 'parent',
      sourceLabel: 'Пополнение',
    })

    notice.value = { kind: 'success', text: `В копилку добавлено ${formatMoney(amount)}` }
    setTimeout(() => { notice.value = null }, 3000)
    return true
  }

  /** Выполнить задание: награда идёт в цель ребёнка. */
  function completeChore(id: string): void {
    const chore = chores.value.find((c) => c.id === id)
    if (!chore || chore.completed) return

    chore.completed = true
    childBalance.value += chore.reward
    card.value.balance = childBalance.value

    // Награда также идёт в копилку
    savingsGoal.value.current += chore.reward
    savingsGoal.value = { ...savingsGoal.value }

    goalHistory.value.unshift({
      id: `gc${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      amount: chore.reward,
      source: 'chore',
      sourceLabel: `Задание: ${chore.title}`,
    })
  }

  function setCardColor(color: 'emerald' | 'gold' | 'purple') {
    cardColor.value = color
  }
  // ── карта / лимиты / категории ──

  function setDailyLimit(value: number): void {
    limits.value.dailyLimit = value
  }

  function setWeeklyLimit(value: number): void {
    limits.value.weeklyLimit = value
  }

>>>>>>> Stashed changes
  function toggleSpendingCategory(id: string): void {
    const cat = spendingCategories.value.find((c) => c.id === id)
    if (cat) cat.isAllowed = !cat.isAllowed
  }

<<<<<<< Updated upstream
  /** Переключить активность карты. */
=======
>>>>>>> Stashed changes
  function toggleCardActive(): void {
    card.value.isActive = !card.value.isActive
    card.value = { ...card.value }
  }
<<<<<<< Updated upstream

  /** Пополнить цель накопления (демо: +10 BYN). */
  function contributeToGoal(amount: number = 10): void {
    savingsGoal.value.current += amount
    // Триггерим реактивность
    savingsGoal.value = { ...savingsGoal.value }
    goalHistory.value.unshift({
      id: `gc${Date.now()}`,
      date: todayISO(),
      amount,
      source: 'parent',
      sourceLabel: 'От родителей',
    })
    if (savingsGoal.value.current >= savingsGoal.value.target) {
      notice.value = { kind: 'success', text: '🎉 Цель достигнута! Поздравляем!' }
    } else {
      notice.value = { kind: 'success', text: `Добавлено ${money(amount)}. Осталось ${money(goalRemaining.value)}` }
    }
  }

  /** Отметить задание выполненным и начислить награду на цель. */
  function completeChore(choreId: string): void {
    const chore = chores.value.find((c) => c.id === choreId)
    if (!chore || chore.completed) return
    chore.completed = true
    // Начисляем награду в цель
    savingsGoal.value.current += chore.reward
    savingsGoal.value = { ...savingsGoal.value }
    goalHistory.value.unshift({
      id: `gc${Date.now()}`,
      date: todayISO(),
      amount: chore.reward,
      source: 'chore',
      sourceLabel: `Задание: ${chore.title}`,
    })
  }

  function clearNotice(): void {
    notice.value = null
=======

  // ── уведомления ──

  function markNotificationRead(id: string): void {
    const n = notifications.value.find((item) => item.id === id)
    if (n) n.isRead = true
>>>>>>> Stashed changes
  }

  function deleteNotification(id: string): void {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  function clearNotice(): void {
    notice.value = null
  }

  // ── return ──

  return {
    // состояние
    parentBalance, childBalance, child, card,
<<<<<<< Updated upstream
    transactions, limits, spendingCategories,
    savingsGoal, goalHistory, chores, achievements,
    isLoading, notice,
    // геттеры
    parentBalanceFormatted, childBalanceFormatted, cardBalanceFormatted,
    goalProgress, goalRemaining,
    recentTransactions, transactionsGrouped, completedChoreCount,
    // экшены
    loadState, transfer,
    setDailyLimit, setWeeklyLimit,
    toggleSpendingCategory, toggleCardActive,
    contributeToGoal, completeChore,
    clearNotice,
    // константы
    DAILY_LIMIT_PRESETS,
=======
    limits, transactions, spendingCategories,
    savingsGoal, goalHistory, chores, notifications,
    notice, cardColor, setCardColor,
    // геттеры
    parentBalanceFormatted, childBalanceFormatted, cardBalanceFormatted,
    goalProgress,
    // экшены
    transfer, depositToGoal, completeChore,
    setDailyLimit, setWeeklyLimit,
    toggleSpendingCategory, toggleCardActive,
    markNotificationRead, deleteNotification,
    clearNotice,
    currentCardIndex, setCurrentCardIndex,
>>>>>>> Stashed changes
  }
})