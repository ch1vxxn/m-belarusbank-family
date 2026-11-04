/**
 * Типы данных «М-Беларусбанк Family».
 */

// ─── Семья и ребёнок ──────────────────────────────────────────

/** Возрастная группа ребёнка (влияет на права и лимиты) */
export type AgeGroup = '7-13' | '14-17'

/** Профиль ребёнка (отображается в родительском кабинете и в детском интерфейсе). */
export interface ChildProfile {
  id: string
  name: string
  age: number
  /** Инициалы для аватара, например «МП» */
  initials: string
  /** Возрастная группа для правил безопасности */
  ageGroup: AgeGroup
}

// ─── Карта и финансы ──────────────────────────────────────────

/** Детская банковская карта. */
export interface ChildCard {
  /** Маскированный номер, например «2200 **** **** 1234» */
  maskedNumber: string
  /** Баланс в BYN */
  balance: number
  /** Валюта, по умолчанию «BYN» */
  currency: string
  /** Тип платёжной системы */
  paymentSystem: 'VISA' | 'Mastercard'
  /** Активна ли карта */
  isActive: boolean
}

/** Одна транзакция (покупка или пополнение). */
export interface Transaction {
  id: string
  /** Название магазина/категории */
  merchant: string
  /** Категория: Еда, Одежда, Кафе, Транспорт, Развлечения, Пополнение */
  category: TransactionCategory
  /** Сумма: отрицательная для покупки, положительная для пополнения */
  amount: number
  /** ISO-дата, например «2026-10-24» */
  date: string
  /** Время в формате «ЧЧ:ММ», например «14:22» */
  time: string
}

export type TransactionCategory =
  | 'food'
  | 'clothes'
  | 'cafe'
  | 'transport'
  | 'entertainment'
  | 'topup'

/** Человеческое название категории. */
export const categoryLabels: Record<TransactionCategory, string> = {
  food: 'Еда',
  clothes: 'Одежда',
  cafe: 'Кафе',
  transport: 'Транспорт',
  entertainment: 'Развлечения',
  topup: 'Пополнение',
}

// ─── Лимиты ────────────────────────────────────────────────────

/** Настройки лимитов детской карты. */
export interface CardLimits {
  /** Дневной лимит (BYN), 0 = без ограничений */
  dailyLimit: number
  /** Недельный лимит (BYN), 0 = без ограничений */
  weeklyLimit: number
}

/** Предустановленные значения дневного лимита. */
export const DAILY_LIMIT_PRESETS = [0, 50, 100, 200] as const

/** Категория разрешённых трат (можно включать/выключать). */
export interface SpendingCategory {
  id: TransactionCategory
  label: string
  isAllowed: boolean
}

// ─── Цели накоплений ──────────────────────────────────────────

/** Финансовая цель ребёнка. */
export interface SavingsGoal {
  id: string
  title: string
  /** Эмодзи или иконка цели (для детского интерфейса — допустимо) */
  icon: string
  /** Текущая сумма накоплений */
  current: number
  /** Целевая сумма */
  target: number
  /** Дата создания цели */
  createdAt: string
}

/** История пополнения цели. */
export interface GoalContribution {
  id: string
  date: string
  amount: number
  /** Откуда пришли деньги: parent = родитель, child = из карманных, chore = выполнил задание */
  source: 'parent' | 'child' | 'chore'
  sourceLabel: string
}

// ─── Задания (для детского интерфейса) ────────────────────────

/** Задание ребёнка с денежной наградой. */
export interface Chore {
  id: string
  title: string
  /** Сумма награды */
  reward: number
  /** Выполнено ли */
  completed: boolean
}

/** Достижение (бейдж). */
export interface Achievement {
  id: string
  title: string
  /** Иконка из lucide */
  icon: string
  /** Цвет бейджа */
  color: string
}

// ─── Запросы/ответы API ────────────────────────────────────────

/** Карта родителя, которая приходит с Go-сервера */
export interface ParentCard {
  id: number
  title: string
  subtitle: string
  balance: number
  design: string
  maskedNumber: string
  isActive: boolean
  paymentSystem: 'VISA' | 'Mastercard'
}

/** Ребёнок, который приходит с Go-сервера */
export interface ServerChild {
  id: string
  name: string
  age: number
  initials: string
  ageGroup: AgeGroup
  balance: number
  /** Детская карта (может отсутствовать, если ещё не создана) */
  card?: Partial<ChildCard>
}

export interface FamilyState {
  parentBalance: number
  childBalance: number
  tasks: string[]
  cards: ParentCard[]
  children: ServerChild[]
}

export interface TransferRequest {
  amount: number
}

export interface TransferResponse {
  parentBalance: number
  childBalance: number
  message: string
}

export interface ApiErrorBody {
  error: string
}