import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  ChildProfile, ChildCard, Transaction, CardLimits, SpendingCategory,
  SavingsGoal, GoalContribution, Chore
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
  const cardColor = ref<'emerald' | 'gold' | 'purple'>('emerald')
  const currentCardIndex = ref(0)

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

  const goalProgress = computed(() => {
    if (savingsGoal.value.target <= 0) return 0
    return Math.min(100, Math.round((savingsGoal.value.current / savingsGoal.value.target) * 100))
  })

  // ── экшены ──

  function transfer(amount: number): boolean {
    if (amount <= 0 || amount > parentBalance.value) return false
    parentBalance.value -= amount
    childBalance.value += amount
    card.value.balance = childBalance.value
    transactions.value.unshift({
      id: `t${Date.now()}`, merchant: 'Карманные деньги', category: 'topup', amount,
      date: new Date().toISOString().slice(0, 10), time: new Date().toTimeString().slice(0, 5),
    })
    notice.value = { kind: 'success', text: `Переведено ${formatMoney(amount)}` }
    setTimeout(() => { notice.value = null }, 3000)
    return true
  }

  function depositToGoal(amount: number): boolean {
    if (amount <= 0 || amount > parentBalance.value) return false
    parentBalance.value -= amount
    savingsGoal.value.current += amount
    savingsGoal.value = { ...savingsGoal.value }
    goalHistory.value.unshift({
      id: `gc${Date.now()}`, date: new Date().toISOString().slice(0, 10), amount,
      source: 'parent', sourceLabel: 'Пополнение',
    })
    notice.value = { kind: 'success', text: `В копилку добавлено ${formatMoney(amount)}` }
    setTimeout(() => { notice.value = null }, 3000)
    return true
  }

  function completeChore(id: string): void {
    const chore = chores.value.find((c) => c.id === id)
    if (!chore || chore.completed) return
    chore.completed = true
    childBalance.value += chore.reward
    card.value.balance = childBalance.value
    savingsGoal.value.current += chore.reward
    savingsGoal.value = { ...savingsGoal.value }
    goalHistory.value.unshift({
      id: `gc${Date.now()}`, date: new Date().toISOString().slice(0, 10), amount: chore.reward,
      source: 'chore', sourceLabel: `Задание: ${chore.title}`,
    })
  }

  function setDailyLimit(value: number): void { limits.value.dailyLimit = value }
  function setWeeklyLimit(value: number): void { limits.value.weeklyLimit = value }
  
  function toggleSpendingCategory(id: string): void {
    const cat = spendingCategories.value.find((c) => c.id === id)
    if (cat) cat.isAllowed = !cat.isAllowed
  }

  function toggleCardActive(): void {
    card.value.isActive = !card.value.isActive
    card.value = { ...card.value }
  }

  function markNotificationRead(id: string): void {
    const n = notifications.value.find((item) => item.id === id)
    if (n) n.isRead = true
  }

  function deleteNotification(id: string): void {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  function clearNotice(): void { notice.value = null }
  function setCardColor(color: 'emerald' | 'gold' | 'purple') { cardColor.value = color }
  function setCurrentCardIndex(index: number) { currentCardIndex.value = index }

  // ── return ──
  return {
    parentBalance, childBalance, child, card, limits, transactions, spendingCategories,
    savingsGoal, goalHistory, chores, notifications, notice, cardColor, currentCardIndex,
    parentBalanceFormatted, childBalanceFormatted, cardBalanceFormatted, goalProgress,
    transfer, depositToGoal, completeChore,
    setDailyLimit, setWeeklyLimit, toggleSpendingCategory, toggleCardActive,
    markNotificationRead, deleteNotification, clearNotice,
    setCardColor, setCurrentCardIndex
  }
})