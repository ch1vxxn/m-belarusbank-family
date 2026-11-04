import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchFamilyState, addChildApi, transferMoney, addCardApi } from '@/api/familyApi'
import type {
  ChildProfile,
  ChildCard,
  Transaction,
  SpendingCategory,
  SavingsGoal,
  GoalContribution,
  Chore,
  AgeGroup,
  ParentCard,
  ServerChild
} from '@/types'

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
  // ── СОСТОЯНИЕ ──

  /** Карты родителя (активная = currentCardIndex). */
  const cards = ref<ParentCard[]>([])

  /** Профили детей, каждый со своей детской картой. */
  const children = ref<
    (ServerChild & {
      card: ChildCard
      permissions: Record<string, boolean>
      limits: Record<string, number>
    })[]
  >([])

  const activeChildIndex = ref(0)

  // ── ГЕТТЕРЫ АКТИВНОГО РЕБЁНКА ──

  const child = computed(() => {
    const c = children.value[activeChildIndex.value] || children.value[0]
    return c as ChildProfile & {
      balance: number
      card: ChildCard
      permissions: Record<string, boolean>
      limits: Record<string, number>
    }
  })

  /** Баланс активного ребёнка (детская карта). */
  const childBalance = computed({
    get: () => child.value?.balance || 0,
    set: (val) => {
      if (child.value) child.value.balance = val
    },
  })

  const card = computed(() => child.value?.card)
  const permissions = computed(() => child.value?.permissions)
  const limits = computed(() => child.value?.limits)

  // ── ОСТАЛЬНОЕ СОСТОЯНИЕ ──

  const isAnyModalOpen = ref(false)
  const allowances = ref({ isActive: true, amount: 10 })

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
    id: 'goal-1', title: 'Новый велосипед', icon: '🚲', current: 120, target: 300, createdAt: '2026-09-01',
  })

  const goalHistory = ref<GoalContribution[]>([])

  const chores = ref<Chore[]>([
    { id: 'ch1', title: 'Помыть посуду', reward: 5, completed: false },
    { id: 'ch2', title: 'Сделать уроки', reward: 3, completed: false },
  ])

  const notifications = ref<Notification[]>([])

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
    setTimeout(() => { notice.value = null }, 3000)
  }
  function clearNotice() { notice.value = null }

  // ── ИНТЕГРАЦИЯ С GO ──

  /**
   * Загрузка данных при старте (GET /api/family/state).
   *
   * УСТОЙЧИВОСТЬ: если сервер не прислал cards/children (например, старая
   * версия Go-бэкенда отдаёт только parentBalance/childBalance/tasks),
   * подставляем дефолтные — сайт всегда показывает полный интерфейс.
   */
  async function initFamilyData() {
    try {
      const data = await fetchFamilyState()

      // Карты родителя: если сервер их не отдал — дефолтная карта
      cards.value =
        data.cards && data.cards.length > 0
          ? data.cards
          : [{
              id: 1,
              title: 'Карта 1',
              subtitle: 'Экономный по 22.11.2026',
              balance: data.parentBalance ?? 2000,
              design: 'default',
              maskedNumber: '2200 •••• •••• 9883',
              isActive: true,
              paymentSystem: 'VISA',
            }]

      // Родительский баланс синхронизируем с активной картой
      const idx = Math.min(currentCardIndex.value, cards.value.length - 1)
      if (data.parentBalance != null && cards.value[idx]) {
        cards.value[idx]!.balance = data.parentBalance
      }

      // Дети: если сервер их не отдал — дефолтный ребёнок
      const serverChildren =
        data.children && data.children.length > 0
          ? data.children
          : [{
              id: 'child-1',
              name: 'Миша',
              age: 10,
              initials: 'МП',
              ageGroup: '7-13' as AgeGroup,
              balance: data.childBalance ?? 85.5,
            }]

      children.value = serverChildren.map((c: ServerChild) => {
        const isTeen = c.ageGroup === '14-17'
        return {
          ...c,
          card: {
            maskedNumber: c.card?.maskedNumber || '2200 •••• •••• 1111',
            balance: c.card?.balance ?? c.balance ?? 0,
            currency: 'BYN',
            paymentSystem: 'VISA',
            isActive: true,
          },
          permissions: {
            qrPay: true, cardPay: true, onlinePay: isTeen,
            friendsTransfer: isTeen, cashWithdrawal: false,
          },
          limits: {
            perPurchase: isTeen ? 100 : 30, dailyLimit: isTeen ? 150 : 50,
            monthlyLimit: isTeen ? 1000 : 250, approvalThreshold: isTeen ? 100 : 25,
          },
        }
      })

      // Детский баланс синхронизируем с картой ребёнка
      childBalance.value = data.childBalance ?? serverChildren[0]?.balance ?? 0
      if (card.value) {
        card.value.balance = childBalance.value
      }
    } catch (e) {
      console.error('Go-сервер недоступен:', e)
      setNotice('error', 'Сервер не отвечает')
    }
  }

  /** Добавление карты родителя (POST). */
  async function addCard(design: string) {
    try {
      const newCard = await addCardApi(design)
      cards.value.push(newCard)
      setNotice('success', 'Карта добавлена')
    } catch (e) {
      setNotice('error', 'Ошибка при добавлении карты')
    }
  }

  /** Добавление ребёнка (POST). */
  async function addChild(data: { name: string; age: number; ageGroup: AgeGroup; initials: string }) {
    try {
      const newChild = await addChildApi(data)
      const isTeen = data.ageGroup === '14-17'

      children.value.push({
        ...newChild,
        ageGroup: data.ageGroup,
        card: {
          maskedNumber: '**** **** **** 1111',
          balance: newChild.balance || 0,
          currency: 'BYN',
          paymentSystem: 'VISA',
          isActive: true,
        },
        permissions: { qrPay: true, cardPay: true, onlinePay: isTeen, friendsTransfer: isTeen, cashWithdrawal: isTeen },
        limits: { perPurchase: isTeen ? 100 : 30, dailyLimit: isTeen ? 150 : 50, monthlyLimit: isTeen ? 1000 : 250, approvalThreshold: isTeen ? 100 : 25 },
      })
      setNotice('success', `Ребёнок ${data.name} добавлен!`)
      return true
    } catch (e) {
      setNotice('error', 'Ошибка при добавлении ребёнка')
      return false
    }
  }

  /**
   * Перевод карманных денег: родительская карта → детская карта.
   */
  async function transfer(amount: number) {
    const activeCard = cards.value[currentCardIndex.value]
    if (!activeCard || amount <= 0 || amount > activeCard.balance) {
      setNotice('error', 'Недостаточно средств на родительской карте')
      return false
    }

    try {
      const response = await transferMoney(amount)
      activeCard.balance = response.parentBalance
      childBalance.value = response.childBalance
      card.value!.balance = response.childBalance

      pushTransaction('Перевод от родителя', amount)
      setNotice('success', `Переведено ${formatMoney(amount)}`)
      return true
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка перевода'
      setNotice('error', message)
      return false
    }
  }

  /**
   * Оплата по QR: списывает с ДЕТСКОЙ карты (покупка).
   * Проверяет: активность карты, лимит на одну покупку, баланс.
   */
  function payByQr(amount: number) {
    if (!child.value) return false
    if (!child.value.card.isActive) {
      setNotice('error', 'Детская карта заблокирована')
      return false
    }
    if (!permissions.value?.qrPay) {
      setNotice('error', 'Оплата по QR запрещена родителем')
      return false
    }
    if (amount <= 0) {
      setNotice('error', 'Некорректная сумма QR-кода')
      return false
    }
    const perPurchaseLimit = limits.value?.perPurchase ?? 30
    if (amount > perPurchaseLimit) {
      setNotice('error', `Лимит на одну покупку: ${formatMoney(perPurchaseLimit)}`)
      return false
    }
    if (amount > childBalance.value) {
      setNotice('error', `Недостаточно средств. Доступно: ${childBalanceFormatted.value}`)
      return false
    }

    childBalance.value -= amount
    card.value!.balance = childBalance.value
    pushTransaction('Оплата по QR', -amount)
    setNotice('success', `Оплачено ${formatMoney(amount)}`)
    return true
  }

  // ── ЛОКАЛЬНЫЕ ЭКШЕНЫ ──

  /**
   * Пополнение копилки: списывает с ДЕТСКОЙ карты (ребёнок сам
   * откладывает свои деньги на цель), кладёт в savingsGoal.
   */
  function depositToGoal(amount: number) {
    if (!child.value?.card?.isActive) {
      setNotice('error', 'Детская карта заблокирована')
      return false
    }
    if (amount <= 0 || amount > childBalance.value) {
      setNotice('error', `Недостаточно средств. Доступно: ${childBalanceFormatted.value}`)
      return false
    }

    childBalance.value -= amount
    card.value!.balance = childBalance.value
    savingsGoal.value.current += amount
    savingsGoal.value = { ...savingsGoal.value }

    goalHistory.value.unshift({
      id: `gc-${Date.now()}`,
      date: todayISO(),
      amount,
      source: 'child',
      sourceLabel: 'Из карманных денег',
    })
    pushTransaction('Пополнение копилки', -amount)
    setNotice('success', `В копилку добавлено ${formatMoney(amount)}`)
    return true
  }

  /**
   * Выполнение задания: награда идёт на детскую карту + в копилку
   * (ребёнок видит и баланс, и прогресс цели).
   */
  function completeChore(id: string) {
    const chore = chores.value.find((c) => c.id === id)
    if (!chore || chore.completed) return false

    chore.completed = true
    childBalance.value += chore.reward
    card.value!.balance = childBalance.value
    savingsGoal.value.current += chore.reward
    savingsGoal.value = { ...savingsGoal.value }

    goalHistory.value.unshift({
      id: `gc-${Date.now()}`,
      date: todayISO(),
      amount: chore.reward,
      source: 'chore',
      sourceLabel: `Задание: ${chore.title}`,
    })
    pushTransaction(`Задание: ${chore.title}`, chore.reward)
    setNotice('success', `Награда ${formatMoney(chore.reward)} начислена`)
    return true
  }

  /** Одобрить/отклонить запрос ребёнка. */
  function resolveRequest(id: string, approve: boolean) {
    const n = notifications.value.find((x) => x.id === id)
    if (!n) return false

    if (approve && n.payload) {
      if (n.payload.kind === 'money' && n.payload.amount) {
        childBalance.value += n.payload.amount
        card.value!.balance = childBalance.value
        pushTransaction('Одобрен запрос ребёнка', n.payload.amount)
        setNotice('success', 'Запрос одобрен')
      }
    } else if (!approve) {
      setNotice('error', 'Запрос отклонён')
    }
    notifications.value = notifications.value.filter((x) => x.id !== id)
    return true
  }

  function clearNotifications() { notifications.value = [] }
  function setDailyLimit(val: number) { if (child.value) child.value.limits.dailyLimit = val }
  function setPerPurchase(val: number) { if (child.value) child.value.limits.perPurchase = val }
  function setMonthlyLimit(val: number) { if (child.value) child.value.limits.monthlyLimit = val }
  function setApprovalThreshold(val: number) { if (child.value) child.value.limits.approvalThreshold = val }

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
    payByQr,
    resolveRequest, clearNotifications, setNotice, setDailyLimit, toggleSpendingCategory, clearNotice,
    setCurrentCardIndex, deleteNotification, setCardDesign, toggleCardActive, setCardColor,
    setPerPurchase, setMonthlyLimit, setApprovalThreshold, permissions, togglePermission,
    toggleAllowance, setAllowanceAmount, allowances, setModalState, initFamilyData,
  }
})