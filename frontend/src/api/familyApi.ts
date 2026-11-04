/**
 * API-слой для запросов к Go-бэкенду.
 */

import type { FamilyState, TransferRequest, TransferResponse, AgeGroup } from '@/types'

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
  return request<FamilyState>('/api/family/state')
}

export function transferMoney(amount: number): Promise<TransferResponse> {
  const body: TransferRequest = { amount }
  return request<TransferResponse>('/api/family/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ─── НОВЫЕ МЕТОДЫ (ДЛЯ ИНТЕГРАЦИИ С GO) ───

export function addCardApi(design: string): Promise<ApiCard> {
  return request<ApiCard>('/api/family/card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ design }),
  })
}

export function addChildApi(data: { name: string; age: number; ageGroup: AgeGroup; initials: string }): Promise<ApiChild> {
  return request<ApiChild>('/api/family/child', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function sendMoneyRequestApi(amount: number, reason: string): Promise<ApiRequest> {
  return request<ApiRequest>('/api/family/request', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer child-token' // Доступ ребенка
    },
    body: JSON.stringify({ amount, reason }),
  })
}

export function approveRequestApi(): Promise<ApiRequest> {
  return request<ApiRequest>('/api/family/request/approve', {
    method: 'POST',
    headers: { 
      'Authorization': 'Bearer parent-token' // Доступ родителя
    },
  })
}