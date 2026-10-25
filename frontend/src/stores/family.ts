import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChildProfile, ChildCard, Transaction, SpendingCategory, SavingsGoal, GoalContribution, Chore, AgeGroup } from '@/types'

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  isRead: boolean
  type: 'request' | 'info'
  payload?: { kind: 'money' | 'permission'; amount?: number; key?: string }
}

export const useFamilyStore = defineStore('family', () => {
  // ── КАРТЫ РОДИТЕЛЯ ──
  const cards = ref([
    {
      id: 1,
      title: 'Карта 1',
      subtitle: 'Экономный по 22.11.2026',
      balance: 2000.0,
      design: 'emerald',
      maskedNumber: '**** **** **** 9883',
      isActive: true,
      paymentSystem: 'VISA' as const,
    },
  ])

  function addCard(design: string) {
    const newId = cards.value.length + 1
    cards.value.push({
      id: newId,
      title: `Карта ${newId}`,
      subtitle: 'Новая карта',
      balance: 0.0,
      design: design,
      maskedNumber: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
      isActive: true,
      paymentSystem: 'VISA' as const,
    })
  }

  // ── ДЕТИ (массив) ──
  const children = ref<(ChildProfile & { balance: number; card: ChildCard; permissions: Record<string, boolean>; limits: Record<string, number> })[]>([
    {
      id: 'child-1',
      name: 'Миша',
      age: 10,
      initials: 'МП',
      ageGroup: '7-13',
      balance: 30.0,
      card: {
        maskedNumber: '**** **** **** 9883',
        balance: 2000.0,
        currency: 'BYN',
        paymentSystem: 'VISA',
        isActive: true,
      },
      permissions: {
        qrPay: true,
        cardPay: true,
        onlinePay: false,
        friendsTransfer: false,
        cashWithdrawal: false,
      },
      limits: {
        perPurchase: 30,
        dailyLimit: 50,
        monthlyLimit: 250,
        approvalThreshold: 25,
      },
    },
  ])

  const activeChildIndex = ref(0)

  // ── ГЕТТЕРЫ АКТИВНОГО РЕБЁНКА (с as, чтобы TS не ругался) ──
  const child = computed(() => {
    const c = children.value[activeChildIndex.value] || children.value[0]
    return c as ChildProfile & { balance: number; card: ChildCard; permissions: Record<string, boolean>; limits: Record<string, number> }
  })
  
  const childBalance = computed({
    get: () => child.value.balance,
    set: (val) => { child.value.balance = val }
  })
  
  const card = computed(() => child.value.card)
  const permissions = computed(() => child.value.permissions)
  const limits = computed(() => child.value.limits)

  // ── ДОБАВЛЕНИЕ РЕБЁНКА ──
  function addChild(data: { name: string; age: number; ageGroup: AgeGroup; initials: string }) {
    const isTeen = data.ageGroup === '14-17'
    const newId = `child-${Date.now()}`

    children.value.push({
      id: newId,
      name: data.name,
      age: data.age,
      initials: data.initials,
      ageGroup: data.ageGroup,
      balance: 0,
      card: {
        maskedNumber: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
        balance: 0,
        currency: 'BYN',
        paymentSystem: 'VISA',
        isActive: true,
      },
      permissions: {
        qrPay: true,
        cardPay: true,
        onlinePay: isTeen,
        friendsTransfer: isTeen,
        cashWithdrawal: isTeen,
      },
      limits: {
        perPurchase: isTeen ? 100 : 30,
        dailyLimit: isTeen ? 150 : 50,
        monthlyLimit: isTeen ? 1000 : 250,
        approvalThreshold: isTeen ? 100 : 25,
      },
    })

    setNotice('success', `Ребёнок ${data.name} успешно добавлен!`)
    return true
  }

  // ── ОСТАЛЬНОЕ СОСТОЯНИЕ ──
  const isAnyModalOpen = ref(false)
  const allowances = ref({ isActive: true, amount: 10 })

  // ── ТРАНЗАКЦИИ ──
  const transactions = ref<Transaction[]>([
    { id: 't1', merchant: 'Мама: Молодец!', category: 'topup', amount: 10.0, date: '2026-10-24', time: '15:05' },
    { id: 't2', merchant: 'Минский метрополитен', category: 'transport', amount: -1.6, date: '2026-10-24', time: '10:05' },
    { id: 't3', merchant: 'Бургерная «Обед»', category: 'food', amount: -7.9, date: '2026-10-23', time: '17:05' },
  ])

  const spendingCategories = ref<SpendingCategory[]>([
    { id: 'food', label: 'Еда', isAllowed: true },
    { id: 'clothes', label: 'Одежда', isAllowed: true },
    { id: 'cafe', label: 'Кафе', isAllowed: false },
  ])

  const savingsGoal = ref<SavingsGoal>({
    id: 'goal-1',
    title: 'Новый велосипед',
    icon: '🚲',
    current: 120,
    target: 300,
    createdAt: '2026-09-01',
  })

  const goalHistory = ref<GoalContribution[]>([])

  const chores = ref<Chore[]>([
    { id: 'ch1', title: 'Помыть посуду', reward: 5, completed: false },
    { id: 'ch2', title: 'Сделать уроки', reward: 3, completed: false },
  ])

  const notifications = ref<Notification[]>([
    {
      id: '1',
      title: 'Запрос от Миши',
      message: 'Мама, можно я куплю шоколадку за 5 BYN?',
      time: '10:24',
      isRead: false,
      type: 'request',
      payload: { kind: 'money', amount: 5 },
    },
  ])

  const notice = ref<{ kind: 'success' | 'error'; text: string } | null>(null)
  const currentCardIndex = ref(0)
  const cardDesign = ref<'emerald' | 'sunset' | 'sky' | 'glass'>('emerald')
  const cardColor = ref<'emerald' | 'gold' | 'purple'>('emerald')

  // ── ГЕТТЕРЫ ──
  const formatMoney = (val: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'BYN', minimumFractionDigits: 2 }).format(val)

  const childBalanceFormatted = computed(() => formatMoney(childBalance.value))
  const parentBalance = computed(() => cards.value[currentCardIndex.value]?.balance ?? 0)
  const parentBalanceFormatted = computed(() => formatMoney(parentBalance.value))

  const goalProgress = computed(() =>
    Math.min(100, Math.round((savingsGoal.value.current / savingsGoal.value.target) * 100))
  )

  const transactionsGrouped = computed(() => {
    const groups: Record<string, Transaction[]> = {}
    for (const t of transactions.value) {
      if (!groups[t.date]) groups[t.date] = []
      groups[t.date]!.push(t)
    }
    return Object.entries(groups).map(([date, items]) => ({ date, items }))
  })

  // ── ХЕЛПЕРЫ ──
  function nowTime(): string {
    return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }
  function todayISO(): string {
    return new Date().toISOString().slice(0, 10)
  }
  function pushTransaction(merchant: string, amount: number) {
    transactions.value.unshift({
      id: `t-${Date.now()}`,
      merchant,
      category: amount >= 0 ? 'topup' : 'food',
      amount,
      date: todayISO(),
      time: nowTime(),
    })
  }
  function setNotice(kind: 'success' | 'error', text: string) {
    notice.value = { kind, text }
    setTimeout(() => {
      notice.value = null
    }, 3000)
  }
  function clearNotice() {
    notice.value = null
  }

  // ── ЭКШЕНЫ ──
  function transfer(amount: number) {
    const activeCard = cards.value[currentCardIndex.value]
    if (!activeCard || !card.value?.isActive || amount <= 0 || amount > activeCard.balance) return false

    activeCard.balance -= amount
    childBalance.value += amount
    pushTransaction('Перевод от родителя', amount)
    setNotice('success', `Переведено ${formatMoney(amount)}`)
    return true
  }

  function depositToGoal(amount: number) {
    const activeCard = cards.value[currentCardIndex.value]
    if (!activeCard || !card.value?.isActive || amount <= 0 || amount > activeCard.balance) return false

    activeCard.balance -= amount
    savingsGoal.value.current += amount

    goalHistory.value.unshift({
      id: `gc-${Date.now()}`,
      date: todayISO(),
      amount,
      source: 'parent',
      sourceLabel: 'Пополнение от родителя',
    })
    pushTransaction('Пополнение копилки', amount)
    return true
  }

  function completeChore(id: string) {
    const chore = chores.value.find((c) => c.id === id)
    if (!chore || chore.completed) return false

    chore.completed = true
    childBalance.value += chore.reward
    pushTransaction(`Задание: ${chore.title}`, chore.reward)
    setNotice('success', `Награда ${formatMoney(chore.reward)} начислена`)
    return true
  }

  function resolveRequest(id: string, approve: boolean) {
    const n = notifications.value.find((x) => x.id === id)
    if (!n) return false

    if (approve && n.payload) {
      if (n.payload.kind === 'money' && n.payload.amount) {
        childBalance.value += n.payload.amount
        pushTransaction('Одобрен запрос ребёнка', n.payload.amount)
        setNotice('success', 'Запрос одобрен')
      } else if (n.payload.kind === 'permission' && n.payload.key) {
        child.value.permissions[n.payload.key] = true
        setNotice('success', 'Доступ разрешён')
      }
    } else if (!approve) {
      setNotice('error', 'Запрос отклонён')
    }

    notifications.value = notifications.value.filter((x) => x.id !== id)
    return true
  }

  function clearNotifications() {
    notifications.value = []
  }

  function setDailyLimit(val: number) { child.value.limits.dailyLimit = val }
  function setPerPurchase(val: number) { child.value.limits.perPurchase = val }
  function setMonthlyLimit(val: number) { child.value.limits.monthlyLimit = val }
  function setApprovalThreshold(val: number) { child.value.limits.approvalThreshold = val }

  function toggleSpendingCategory(id: string) {
    const cat = spendingCategories.value.find((c) => c.id === id)
    if (cat) cat.isAllowed = !cat.isAllowed
  }

  function togglePermission(key: string) {
    if (child.value) child.value.permissions[key] = !child.value.permissions[key]
  }

  function toggleAllowance() { allowances.value.isActive = !allowances.value.isActive }
  function setAllowanceAmount(val: number) { allowances.value.amount = val }

  function toggleCardActive() {
    if (child.value) {
      child.value.card.isActive = !child.value.card.isActive
      children.value = [...children.value]
    }
  }

  function setCurrentCardIndex(index: number) { currentCardIndex.value = index }
  function setCardDesign(design: 'emerald' | 'sunset' | 'sky' | 'glass') { cardDesign.value = design }
  function setCardColor(color: 'emerald' | 'gold' | 'purple') { cardColor.value = color }
  function deleteNotification(id: string) { notifications.value = notifications.value.filter((n) => n.id !== id) }
  function setModalState(isOpen: boolean) { isAnyModalOpen.value = isOpen }

  return {
    cards, addCard, card, childBalance, child, children, activeChildIndex, addChild, limits,
    transactions, spendingCategories, savingsGoal, goalHistory, chores, notifications, notice,
    currentCardIndex, cardDesign, cardColor, childBalanceFormatted, parentBalance, parentBalanceFormatted,
    goalProgress, transactionsGrouped, isAnyModalOpen, transfer, depositToGoal, completeChore,
    resolveRequest, clearNotifications, setNotice, setDailyLimit, toggleSpendingCategory, clearNotice,
    setCurrentCardIndex, deleteNotification, setCardDesign, toggleCardActive, setCardColor,
    setPerPurchase, setMonthlyLimit, setApprovalThreshold, permissions, togglePermission,
    toggleAllowance, setAllowanceAmount, allowances, setModalState,
  }
})