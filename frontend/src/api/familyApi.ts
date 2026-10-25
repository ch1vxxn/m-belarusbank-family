/**
 * API-слой для запросов к Go-бэкенду.
 *
 * Один файл с функциями вместо axios — проект маленький, а fetch
 * уже встроен в браузер. Здесь же живёт адрес бэкенда и разбор ошибок,
 * чтобы компоненты и store не знали деталей сети.
 */

import type { FamilyState, TransferRequest, TransferResponse } from '@/types'

/**
 * Адрес Go-сервера. Через env-переменную можно переопределить
 * без правки кода, например: VITE_API_BASE_URL=http://localhost:9000
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/** Понятная человеку ошибка запроса, показывается прямо в интерфейсе. */
export class ApiError extends Error {
  /** HTTP-статус ответа, если сервер ответил (400, 422, 500...). */
  status: number | null

  constructor(message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Базовая обёртка над fetch: превращает любую ошибку сети
 * или HTTP-статус в понятное сообщение (ApiError).
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init)
  } catch {
    // Браузер не дозвонился до сервера (сервер не запущен, CORS и т.п.)
    throw new ApiError(
      'Не удалось связаться с сервером. Проверьте, запущен ли бэкенд на :8080',
    )
  }

  if (!response.ok) {
    // Пытаемся достать текст ошибки из JSON-тела {"error": "..."},
    // иначе показываем стандартное сообщение по статусу.
    let message = `Сервер вернул ошибку (${response.status})`
    try {
      const body = (await response.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      // тело не JSON — оставляем стандартное сообщение
    }
    throw new ApiError(message, response.status)
  }

  return (await response.json()) as T
}

/** Получить текущее состояние семьи (балансы + задачи). */
export function fetchFamilyState(): Promise<FamilyState> {
  return request<FamilyState>('/api/family/state')
}

/** Перевести сумму от родителя к ребёнку. */
export function transferMoney(amount: number): Promise<TransferResponse> {
  const body: TransferRequest = { amount }

  return request<TransferResponse>('/api/family/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
