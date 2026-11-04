/**
 * API-слой для запросов к Go-бэкенду.
 *
 * Когда фронтенд запущен локально (http://localhost:5173) — ходит на Go-сервер :8080.
 * Когда открыт на GitHub Pages (https://...github.io) — fetch к localhost заблокирован
 * браузером (private network access), поэтому включается ДЕМО-РЕЖИМ:
 * все методы возвращают встроенные данные, UI остаётся полностью интерактивным.
 */

import type { FamilyState, TransferRequest, TransferResponse, AgeGroup } from '@/types'

/** Демо-режим: сайт работает не на localhost (GitHub Pages и т.п.). */
const IS_DEMO = !window.location.hostname.includes('localhost')

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  status: number | null

  constructor(message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// ─── ТИПЫ ДЛЯ ОТВЕТОВ ОТ GO ───
export interface ApiCard {
  id: number
  title: string
  subtitle: string
  balance: number
  design: string
  maskedNumber: string
  isActive: boolean
  paymentSystem: 'VISA' | 'Mastercard'
}

export interface ApiChild {
  id: string
  name: string
  age: number
  initials: string
  ageGroup: AgeGroup
  balance: number
}

export interface ApiRequest {
  id: string
  amount: number
  reason: string
  status: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init)
  } catch {
    throw new ApiError(
      'Не удалось связаться с сервером. Проверьте, запущен ли бэкенд на :8080',
    )
  }

  if (!response.ok) {
    let message = `Сервер вернул ошибку (${response.status})`
    try {
      const body = (await response.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      // ignore
    }
    throw new ApiError(message, response.status)
  }

  return (await response.json()) as T
}

// ─── СУЩЕСТВУЮЩИЕ МЕТОДЫ ───

export function fetchFamilyState(): Promise<FamilyState> {
  if (IS_DEMO) {
    return Promise.resolve({
      parentBalance: 2000,
      childBalance: 30,
      tasks: ['Помыть посуду', 'Сделать уроки'],
      cards: [
        {
          id: 1,
          title: 'Карта 1',
          subtitle: 'Экономный по 22.11.2026',
          balance: 2000,
          design: 'default',
          maskedNumber: '**** **** **** 9883',
          isActive: true,
          paymentSystem: 'VISA',
        },
      ],
      children: [
        {
          id: 'child-1',
          name: 'Миша',
          age: 10,
          initials: 'МП',
          ageGroup: '7-13',
          balance: 30,
        },
      ],
    })
  }
  return request<FamilyState>('/api/family/state')
}

export function transferMoney(amount: number): Promise<TransferResponse> {
  if (IS_DEMO) {
    return Promise.resolve({
      parentBalance: 2000 - amount,
      childBalance: 30 + amount,
      message: 'Перевод выполнен успешно',
    })
  }
  const body: TransferRequest = { amount }
  return request<TransferResponse>('/api/family/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ─── НОВЫЕ МЕТОДЫ (ДЛЯ ИНТЕГРАЦИИ С GO) ───

export function addCardApi(design: string): Promise<ApiCard> {
  if (IS_DEMO) {
    return Promise.resolve({
      id: Date.now(),
      title: 'Детская карта',
      subtitle: 'Экономный',
      balance: 0,
      design,
      maskedNumber: '2200 •••• •••• 0000',
      isActive: true,
      paymentSystem: 'VISA',
    })
  }
  return request<ApiCard>('/api/family/card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ design }),
  })
}

export function addChildApi(data: { name: string; age: number; ageGroup: AgeGroup; initials: string }): Promise<ApiChild> {
  if (IS_DEMO) {
    return Promise.resolve({
      id: `child-${Date.now()}`,
      name: data.name,
      age: data.age,
      initials: data.initials,
      ageGroup: data.ageGroup,
      balance: 0,
    })
  }
  return request<ApiChild>('/api/family/child', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function sendMoneyRequestApi(amount: number, reason: string): Promise<ApiRequest> {
  if (IS_DEMO) {
    return Promise.resolve({
      id: `req-${Date.now()}`,
      amount,
      reason,
      status: 'pending',
    })
  }
  return request<ApiRequest>('/api/family/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer child-token', // Доступ ребенка
    },
    body: JSON.stringify({ amount, reason }),
  })
}

export function approveRequestApi(): Promise<ApiRequest> {
  if (IS_DEMO) {
    return Promise.resolve({
      id: `req-${Date.now()}`,
      amount: 0,
      reason: '',
      status: 'approved',
    })
  }
  return request<ApiRequest>('/api/family/request/approve', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer parent-token', // Доступ родителя
    },
  })
}