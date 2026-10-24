/**
 * Pinia-store «Семья» — полное демо-состояние для прототипа.
 *
 * Содержит: балансы, профиль ребёнка, карту, лимиты, транзакции,
 * цель накопления, задания и достижения.
 *
 * Экшены: перевод денег, изменение лимитов, пополнение цели,
 * выполнение заданий. Все мутации локальны (in-memory).
 */

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
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
  const goalProgress = computed(() => {
    const g = savingsGoal.value
    if (g.target <= 0) return 0
    return Math.min(100, Math.round((g.current / g.target) * 100))
  })

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
  function toggleSpendingCategory(id: string): void {
    const cat = spendingCategories.value.find((c) => c.id === id)
    if (cat) cat.isAllowed = !cat.isAllowed
  }

  /** Переключить активность карты. */
  function toggleCardActive(): void {
    card.value.isActive = !card.value.isActive
    card.value = { ...card.value }
  }

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
  }

  return {
    // состояние
    parentBalance, childBalance, child, card,
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
  }
})