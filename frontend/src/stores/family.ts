import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChildProfile, ChildCard, Transaction, CardLimits, SpendingCategory, SavingsGoal, GoalContribution, Chore } from '@/types'

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  isRead: boolean
  type: 'request' | 'info'
}

export const useFamilyStore = defineStore('family', () => {
  // ── КАРТЫ (для главной) ──
  const cards = ref([
    { 
      id: 1, title: 'Карта 1', subtitle: 'Экономный по 22.11.2026', balance: 200.00, design: 'emerald', maskedNumber: '**** **** **** 9883', isActive: true
    }
  ])
  
  function addCard(design: string) {
    const newId = cards.value.length + 1
    cards.value.push({
      id: newId, title: `Карта ${newId}`, subtitle: 'Новая карта', balance: 0.00, design: design,
      maskedNumber: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`, isActive: true
    })
  }

  // ── ОСТАЛЬНОЕ СОСТОЯНИЕ ──
  const parentBalance = ref<number>(200.00)
  const childBalance = ref<number>(85.50)
  const child = ref<ChildProfile>({ id: 'child-1', name: 'Миша', age: 10, initials: 'МП' })
  
  // Возвращаем card как обычный объект (чтобы ChildHome и FamilyView не ругались)
  const card = ref<ChildCard>({
    maskedNumber: '**** **** **** 9883',
    balance: 200.00,
    currency: 'BYN',
    paymentSystem: 'VISA',
    isActive: true,
  })

  const limits = ref<CardLimits>({ dailyLimit: 50, weeklyLimit: 200 })
  const transactions = ref<Transaction[]>([
    { id: 't1', merchant: 'Школьный буфет', category: 'food', amount: -4.2, date: '2026-10-25', time: '14:22' },
  ])
  const spendingCategories = ref<SpendingCategory[]>([
    { id: 'food', label: 'Еда', isAllowed: true },
    { id: 'clothes', label: 'Одежда', isAllowed: true },
    { id: 'cafe', label: 'Кафе', isAllowed: false },
  ])
  const savingsGoal = ref<SavingsGoal>({ id: 'goal-1', title: 'Новый велосипед', icon: '🚲', current: 120, target: 300, createdAt: '2026-09-01' })
  const goalHistory = ref<GoalContribution[]>([])
  const chores = ref<Chore[]>([
    { id: 'ch1', title: 'Помыть посуду', reward: 5, completed: false },
    { id: 'ch2', title: 'Сделать уроки', reward: 3, completed: true },
  ])
  const notifications = ref<Notification[]>([
    { id: '1', title: 'Запрос от Миши', message: 'Мама, можно я куплю шоколадку за 5 BYN?', time: '10:24', isRead: false, type: 'request' },
  ])
  const notice = ref<{ kind: 'success' | 'error'; text: string } | null>(null)
  const currentCardIndex = ref(0)
  const cardDesign = ref<'emerald' | 'sunset' | 'sky' | 'glass'>('emerald')
  const cardColor = ref<'emerald' | 'gold' | 'purple'>('emerald')

  // ── ГЕТТЕРЫ ──
  const formatMoney = (val: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'BYN', minimumFractionDigits: 2 }).format(val)
  const parentBalanceFormatted = computed(() => formatMoney(parentBalance.value))
  const childBalanceFormatted = computed(() => formatMoney(childBalance.value))
  const cardBalanceFormatted = computed(() => formatMoney(card.value.balance))
  
  const goalProgress = computed(() => Math.min(100, Math.round((savingsGoal.value.current / savingsGoal.value.target) * 100)))
  
  const transactionsGrouped = computed(() => {
    const groups: Record<string, Transaction[]> = {}
    for (const t of transactions.value) {
      if (!groups[t.date]) groups[t.date] = []
      groups[t.date]!.push(t)
    }
    return Object.entries(groups).map(([date, items]) => ({ date, items }))
  })

  // ── ЭКШЕНЫ ──
  function transfer(amount: number) {
    if (amount <= 0 || amount > parentBalance.value) return false
    parentBalance.value -= amount
    childBalance.value += amount
    notice.value = { kind: 'success', text: `Переведено ${formatMoney(amount)}` }
    setTimeout(() => { notice.value = null }, 3000)
    return true
  }

  function depositToGoal(amount: number) {
    if (amount <= 0 || amount > parentBalance.value) return false
    parentBalance.value -= amount
    savingsGoal.value.current += amount
    return true
  }

  function setDailyLimit(val: number) { limits.value.dailyLimit = val }
  function setWeeklyLimit(val: number) { limits.value.weeklyLimit = val }
  function toggleSpendingCategory(id: string) { 
    const cat = spendingCategories.value.find(c => c.id === id)
    if (cat) cat.isAllowed = !cat.isAllowed 
  }
  function toggleCardActive() {
    card.value.isActive = !card.value.isActive
    card.value = { ...card.value }
  }
  function clearNotice() { notice.value = null }
  function setCurrentCardIndex(index: number) { currentCardIndex.value = index }
  function setCardDesign(design: 'emerald' | 'sunset' | 'sky' | 'glass') { cardDesign.value = design }
  function setCardColor(color: 'emerald' | 'gold' | 'purple') { cardColor.value = color }
  function deleteNotification(id: string) { notifications.value = notifications.value.filter(n => n.id !== id) }

  return {
    cards, addCard, card, parentBalance, childBalance, child, limits, transactions, spendingCategories,
    savingsGoal, goalHistory, chores, notifications, notice, currentCardIndex, cardDesign, cardColor,
    parentBalanceFormatted, childBalanceFormatted, cardBalanceFormatted, goalProgress, transactionsGrouped,
    transfer, depositToGoal, setDailyLimit, setWeeklyLimit, toggleSpendingCategory,
    clearNotice, setCurrentCardIndex, deleteNotification, setCardDesign, toggleCardActive, setCardColor
  }
})