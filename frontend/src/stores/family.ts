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
import type {
  ChildProfile, ChildCard, Transaction, CardLimits, SpendingCategory,
  SavingsGoal, GoalContribution, Chore, Achievement
} from '@/types'

// ─── Типы для уведомлений ──────────────────────────────────────
export interface Notification {
  id: string
  title: string
  message: string
  time: string
  isRead: boolean
  type: 'request' | 'info'
}

// ─── Демо-данные ───────────────────────────────────────────────
const demoChild: ChildProfile = { id: 'child-1', name: 'Миша', age: 12, initials: 'МП' }
const demoCard: ChildCard = { maskedNumber: '2200 •••• •••• 4567', balance: 85.5, currency: 'BYN', paymentSystem: 'VISA', isActive: true }

const demoTransactions: Transaction[] = [
  { id: 't1', merchant: 'Школьный буфет', category: 'food', amount: -4.2, date: '2026-10-24', time: '14:22' },
  { id: 't2', merchant: 'Кофе с другом', category: 'cafe', amount: -6.0, date: '2026-10-23', time: '16:10' },
  { id: 't3', merchant: 'Карманные деньги', category: 'topup', amount: +20.0, date: '2026-10-22', time: '09:00' },
]

const demoLimits: CardLimits = { dailyLimit: 50, weeklyLimit: 200 }
const demoSpendingCategories: SpendingCategory[] = [
  { id: 'food', label: 'Еда', isAllowed: true },
  { id: 'clothes', label: 'Одежда', isAllowed: true },
  { id: 'transport', label: 'Транспорт', isAllowed: true },
  { id: 'cafe', label: 'Кафе', isAllowed: false },
  { id: 'entertainment', label: 'Развлечения', isAllowed: false },
]

const demoSavingsGoal: SavingsGoal = { id: 'goal-1', title: 'Новый велосипед', icon: '🚲', current: 320, target: 500, createdAt: '2026-09-01' }
const demoGoalContributions: GoalContribution[] = [
  { id: 'gc1', date: '2026-10-24', amount: 10, source: 'parent', sourceLabel: 'От родителей' },
]
const demoChores: Chore[] = [
  { id: 'ch1', title: 'Помыть посуду', reward: 5, completed: false },
  { id: 'ch2', title: 'Сделать уроки', reward: 3, completed: true },
]
const demoAchievements: Achievement[] = [
  { id: 'a1', title: 'Первая цель', icon: 'Target', color: '#00A651' },
]

// ─── Хелперы ───────────────────────────────────────────────────
export type Notice = { kind: 'success'; text: string } | { kind: 'error'; text: string }
function money(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'BYN', minimumFractionDigits: 2 }).format(value)
}

export const useFamilyStore = defineStore('family', () => {
  // Состояние
  const parentBalance = ref<number | null>(200)
  const childBalance = ref<number | null>(85.5)
  const child = ref<ChildProfile>({ ...demoChild })
  const card = ref<ChildCard>({ ...demoCard })
  const transactions = ref<Transaction[]>([...demoTransactions])
  const limits = ref<CardLimits>({ ...demoLimits })
  const spendingCategories = ref<SpendingCategory[]>(demoSpendingCategories.map(c => ({ ...c })))
  const savingsGoal = ref<SavingsGoal>({ ...demoSavingsGoal })
  const goalHistory = ref<GoalContribution[]>([...demoGoalContributions])
  const chores = ref<Chore[]>(demoChores.map(c => ({ ...c })))
  const achievements = ref<Achievement[]>([...demoAchievements])
  const isLoading = ref(false)
  const notice = ref<Notice | null>(null)

  // Уведомления
  const notifications = ref<Notification[]>([
    { id: '1', title: 'Запрос от Миши', message: 'Мама, можно я куплю шоколадку за 5 BYN?', time: '10:24', isRead: false, type: 'request' },
    { id: '2', title: 'Задание выполнено', message: 'Миша помыл посуду. Начислить 10 BYN?', time: '09:15', isRead: false, type: 'request' },
    { id: '3', title: 'Безопасность', message: 'Вход в приложение с нового устройства.', time: 'Вчера', isRead: true, type: 'info' },
  ])

  // Геттеры
  const parentBalanceFormatted = computed(() => money(parentBalance.value))
  const childBalanceFormatted = computed(() => money(childBalance.value))
  const cardBalanceFormatted = computed(() => money(card.value.balance))
  const goalProgress = computed(() => {
    const g = savingsGoal.value
    if (g.target <= 0) return 0
    return Math.min(100, Math.round((g.current / g.target) * 100))
  })
  const goalRemaining = computed(() => savingsGoal.value.target - savingsGoal.value.current)
  const recentTransactions = computed(() => transactions.value.slice(0, 4))
  const transactionsGrouped = computed(() => {
    const groups: Record<string, Transaction[]> = {}
    for (const t of transactions.value) {
      if (!groups[t.date]) groups[t.date] = []
      groups[t.date]!.push(t)
    }
    return Object.entries(groups).map(([date, items]) => ({ date, items }))
  })
  const completedChoreCount = computed(() => chores.value.filter(c => c.completed).length)

  // Экшены
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
      notice.value = { kind: 'error', text: 'Ошибка загрузки' }
    } finally {
      isLoading.value = false
    }
  }

  async function transfer(amount: number): Promise<void> {
    notice.value = null
    try {
      const result = await transferMoney(amount)
      parentBalance.value = result.parentBalance
      childBalance.value = result.childBalance
      card.value.balance = result.childBalance
      card.value = { ...card.value }
      const now = new Date()
      transactions.value.unshift({
        id: `t${Date.now()}`, merchant: 'Карманные деньги', category: 'topup', amount: amount,
        date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 5),
      })
      notice.value = { kind: 'success', text: `Переведено ${money(amount)}` }
    } catch (cause) {
      notice.value = { kind: 'error', text: 'Ошибка перевода' }
    }
  }

  function setDailyLimit(value: number): void { limits.value.dailyLimit = value }
  function setWeeklyLimit(value: number): void { limits.value.weeklyLimit = value }
  function toggleSpendingCategory(id: string): void {
    const cat = spendingCategories.value.find(c => c.id === id)
    if (cat) cat.isAllowed = !cat.isAllowed
  }
  function toggleCardActive(): void {
    card.value.isActive = !card.value.isActive
    card.value = { ...card.value }
  }
  function contributeToGoal(amount: number = 10): void {
    savingsGoal.value.current += amount
    savingsGoal.value = { ...savingsGoal.value }
    goalHistory.value.unshift({ id: `gc${Date.now()}`, date: new Date().toISOString().slice(0, 10), amount, source: 'parent', sourceLabel: 'От родителей' })
    notice.value = { kind: 'success', text: `Добавлено ${money(amount)}` }
  }
  function completeChore(choreId: string): void {
    const chore = chores.value.find(c => c.id === choreId)
    if (!chore || chore.completed) return
    chore.completed = true
    savingsGoal.value.current += chore.reward
    savingsGoal.value = { ...savingsGoal.value }
    goalHistory.value.unshift({ id: `gc${Date.now()}`, date: new Date().toISOString().slice(0, 10), amount: chore.reward, source: 'chore', sourceLabel: `Задание: ${chore.title}` })
  }
  function clearNotice(): void { notice.value = null }

  // Функции для уведомлений
  const deleteNotification = (id: string) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }
  const markAsRead = (id: string) => {
    const n = notifications.value.find(item => item.id === id)
    if (n) n.isRead = true
  }

  return {
    parentBalance, childBalance, child, card, transactions, limits, spendingCategories,
    savingsGoal, goalHistory, chores, achievements, isLoading, notice, notifications,
    parentBalanceFormatted, childBalanceFormatted, cardBalanceFormatted, goalProgress, goalRemaining,
    recentTransactions, transactionsGrouped, completedChoreCount,
    loadState, transfer, setDailyLimit, setWeeklyLimit, toggleSpendingCategory, toggleCardActive,
    contributeToGoal, completeChore, clearNotice, deleteNotification, markAsRead
  }
})