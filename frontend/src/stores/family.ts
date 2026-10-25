import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  ChildProfile,
  ChildCard,
  Transaction,
  SpendingCategory,
  SavingsGoal,
  GoalContribution,
  Chore,
} from '@/types'

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  isRead: boolean
  type: 'request' | 'info'
  /** Что именно просит ребёнок (для approve/decline) */
  payload?: { kind: 'money' | 'permission'; amount?: number; key?: string }
}

export const useFamilyStore = defineStore('family', () => {
  // ── КАРТЫ ──
  const cards = ref([
    {
      id: 1,
      title: 'Карта 1',
      subtitle: 'Экономный по 22.11.2026',
      balance: 2000.0,
      design: 'emerald',
      maskedNumber: '**** **** **** 9883',
      isActive: true,
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
    })
  }

  // ── ОСТАЛЬНОЕ СОСТОЯНИЕ ──
  const childBalance = ref<number>(30.0)
  const child = ref<ChildProfile>({ id: 'child-1', name: 'Миша', age: 10, initials: 'МП' })

  const card = ref<ChildCard>({
    maskedNumber: '**** **** **** 9883',
    balance: 2000.0,
    currency: 'BYN',
    paymentSystem: 'VISA',
    isActive: true,
  })

  const permissions = ref({
    qrPay: true,
    cardPay: true,
    onlinePay: false,
    friendsTransfer: false,
    cashWithdrawal: false,
  })

  const isAnyModalOpen = ref(false)

  const limits = ref({
    perPurchase: 30,
    dailyLimit: 50,
    monthlyLimit: 250,
    approvalThreshold: 25,
  })

  const allowances = ref({ isActive: true, amount: 10 })

  // ── ТРАНЗАКЦИИ (ISO-даты!) ──
  const transactions = ref<Transaction[]>([
    {
      id: 't1',
      merchant: 'Мама: Молодец!',
      category: 'topup',
      amount: 10.0,
      date: '2026-10-24',
      time: '15:05',
    },
    {
      id: 't2',
      merchant: 'Минский метрополитен',
      category: 'transport',
      amount: -1.6,
      date: '2026-10-24',
      time: '10:05',
    },
    {
      id: 't3',
      merchant: 'Бургерная «Обед»',
      category: 'food',
      amount: -7.9,
      date: '2026-10-23',
      time: '17:05',
    },
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

  // ch2 теперь НЕ выполнено — чтобы показать flow начисления
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
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'BYN',
      minimumFractionDigits: 2,
    }).format(val)

  const childBalanceFormatted = computed(() => formatMoney(childBalance.value))

  // ФИКС №1: баланс родителя = баланс активной карты
  const parentBalance = computed(() => cards.value[currentCardIndex.value]?.balance ?? 0)
  const parentBalanceFormatted = computed(() => formatMoney(parentBalance.value))

  const goalProgress = computed(() =>
    Math.min(100, Math.round((savingsGoal.value.current / savingsGoal.value.target) * 100)),
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

  // ФИКС №3: transfer создаёт транзакцию
  function transfer(amount: number) {
    const activeCard = cards.value[currentCardIndex.value]
    if (!activeCard || amount <= 0 || amount > activeCard.balance) return false

    activeCard.balance -= amount
    childBalance.value += amount
    pushTransaction('Перевод от родителя', amount)
    setNotice('success', `Переведено ${formatMoney(amount)}`)
    return true
  }

  // ФИКС №2: depositToGoal пишет в goalHistory + транзакцию
  function depositToGoal(amount: number) {
    const activeCard = cards.value[currentCardIndex.value]
    if (!activeCard || amount <= 0 || amount > activeCard.balance) return false

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

  // ФИКС №5: начисление награды за задание
  function completeChore(id: string) {
    const chore = chores.value.find((c) => c.id === id)
    if (!chore || chore.completed) return false

    chore.completed = true
    childBalance.value += chore.reward
    pushTransaction(`Задание: ${chore.title}`, chore.reward)
    setNotice('success', `Награда ${formatMoney(chore.reward)} начислена`)
    return true
  }

  // ФИКС №8: реальный approve/decline запроса
  function resolveRequest(id: string, approve: boolean) {
    const n = notifications.value.find((x) => x.id === id)
    if (!n) return false

    if (approve && n.payload) {
      if (n.payload.kind === 'money' && n.payload.amount) {
        childBalance.value += n.payload.amount
        pushTransaction('Одобрен запрос ребёнка', n.payload.amount)
        setNotice('success', 'Запрос одобрен')
      } else if (n.payload.kind === 'permission' && n.payload.key) {
        const key = n.payload.key as keyof typeof permissions.value
        permissions.value[key] = true
        setNotice('success', 'Доступ разрешён')
      }
    } else if (!approve) {
      setNotice('error', 'Запрос отклонён')
    }

    notifications.value = notifications.value.filter((x) => x.id !== id)
    return true
  }

  // ФИКС №14: очистка уведомлений через action
  function clearNotifications() {
    notifications.value = []
  }

  function setDailyLimit(val: number) {
    limits.value.dailyLimit = val
  }
  function setPerPurchase(val: number) {
    limits.value.perPurchase = val
  }
  function setMonthlyLimit(val: number) {
    limits.value.monthlyLimit = val
  }
  function setApprovalThreshold(val: number) {
    limits.value.approvalThreshold = val
  }

  function toggleSpendingCategory(id: string) {
    const cat = spendingCategories.value.find((c) => c.id === id)
    if (cat) cat.isAllowed = !cat.isAllowed
  }
  function togglePermission(key: keyof typeof permissions.value) {
    permissions.value[key] = !permissions.value[key]
  }
  function toggleAllowance() {
    allowances.value.isActive = !allowances.value.isActive
  }
  function setAllowanceAmount(val: number) {
    allowances.value.amount = val
  }

  function toggleCardActive() {
    card.value.isActive = !card.value.isActive
    card.value = { ...card.value }
  }

  function setCurrentCardIndex(index: number) {
    currentCardIndex.value = index
  }
  function setCardDesign(design: 'emerald' | 'sunset' | 'sky' | 'glass') {
    cardDesign.value = design
  }
  function setCardColor(color: 'emerald' | 'gold' | 'purple') {
    cardColor.value = color
  }
  function deleteNotification(id: string) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }
  function setModalState(isOpen: boolean) {
    isAnyModalOpen.value = isOpen
  }

  return {
    cards,
    addCard,
    card,
    childBalance,
    child,
    limits,
    transactions,
    spendingCategories,
    savingsGoal,
    goalHistory,
    chores,
    notifications,
    notice,
    currentCardIndex,
    cardDesign,
    cardColor,
    childBalanceFormatted,
    // ФИКС №1: новые геттеры
    parentBalance,
    parentBalanceFormatted,
    goalProgress,
    transactionsGrouped,
    isAnyModalOpen,
    transfer,
    depositToGoal,
    // ФИКС №5
    completeChore,
    // ФИКС №8
    resolveRequest,
    // ФИКС №14
    clearNotifications,
    // ФИКС №13
    setNotice,
    setDailyLimit,
    toggleSpendingCategory,
    clearNotice,
    setCurrentCardIndex,
    deleteNotification,
    setCardDesign,
    toggleCardActive,
    setCardColor,
    setPerPurchase,
    setMonthlyLimit,
    setApprovalThreshold,
    permissions,
    togglePermission,
    toggleAllowance,
    setAllowanceAmount,
    allowances,
    setModalState,
  }
})