<script setup lang="ts">
<<<<<<< Updated upstream
/**
 * BankCard — визуальное представление детской банковской карты.
 *
 * Тёмно-зелёный градиент, текстура (сетка точек), логотип VISA,
 * маскированный номер. Стиль строго в духе М-Беларусбанка.
 *
 * Используется на экранах: родительский кабинет, управление картой.
 */
=======
import { computed } from 'vue'

defineProps<{
  maskedNumber: string
  balance: string
  paymentSystem: 'VISA' | 'Mastercard'
  isActive: boolean
  title?: string
  subtitle?: string
  isBalanceHidden?: boolean
  isRefreshing?: boolean
}>()
>>>>>>> Stashed changes

defineProps<{
  /** Маскированный номер, например «2200 •••• •••• 4567» */
  maskedNumber: string
  /** Баланс в BYN (уже отформатированный) */
  balance: string
  /** Платёжная система */
  paymentSystem: 'VISA' | 'Mastercard'
  /** Активна ли карта */
  isActive: boolean
}>()

// Функция для получения текущего времени
const currentTime = computed(() => {
  const now = new Date()
  
  // Форматируем дату: ДД.ММ.ГГГГ
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  
  // Форматируем время: ЧЧ:ММ
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  return `на ${day}.${month}.${year} ${hours}:${minutes}`
})
</script>

<template>
  <div
    class="relative overflow-hidden rounded-3xl p-5"
    :class="
      isActive
        ? 'bg-gradient-to-br from-[#006837] via-[#008a42] to-[#005226]'
        : 'bg-[#2C2C2E] opacity-60 grayscale'
    "
  >
    <!-- Текстура: сетка точек (как на реальных картах) -->
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.06]"
      style="background-image: radial-gradient(circle, #fff 0.5px, transparent 0.5px); background-size: 8px 8px"
    />

    <!-- Верхняя строка: лейбл + VISA -->
    <div class="flex items-start justify-between">
      <span class="text-[11px] font-medium uppercase tracking-wider text-white/50">
        {{ isActive ? 'Детская карта' : 'Заблокировано' }}
      </span>
      <span
        class="text-xs font-bold italic tracking-widest"
        :class="isActive ? 'text-white/80' : 'text-white/40'"
      >
        {{ paymentSystem }}
      </span>
    </div>

<<<<<<< Updated upstream
    <!-- Номер карты -->
    <p class="mt-4 font-mono text-[17px] tracking-[0.15em]" :class="isActive ? 'text-white/90' : 'text-white/50'">
      {{ maskedNumber }}
    </p>

    <!-- Баланс -->
    <div class="mt-4 flex items-end justify-between">
      <span class="text-[26px] font-bold leading-none tracking-tight" :class="isActive ? 'text-white' : 'text-white/50'">
        {{ balance }}
      </span>
      <!-- Чип (декоративный) -->
      <div class="flex size-7 items-center justify-center rounded-md bg-[#C4A265]/20">
        <div class="size-4 rounded-[2px] border border-[#C4A265]/30" />
      </div>
    </div>
  </div>
</template>
=======
    <div class="content">
      <div class="top">
        <div>
          <div class="name">{{ title || 'Карта 1' }}</div>
          <div class="tariff">{{ subtitle || 'Экономный по 22.11.2026' }}</div>
        </div>
                <div class="icons">
          <!-- Иконка глаза -->
          <button @click="emit('toggle-balance')" class="opacity-80 hover:opacity-100 transition-opacity">
            <svg v-if="!isBalanceHidden" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2.2 12S5.6 6.2 12 6.2 21.8 12 21.8 12 18.4 17.8 12 17.8 2.2 12 2.2 12Z" /><circle cx="12" cy="12" r="2.6" /></svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
          </button>
          
          <!-- Иконка обновления (добавили @click и уменьшили размер) -->
          <button @click="emit('refresh')" class="opacity-80 hover:opacity-100 transition-opacity" :disabled="isRefreshing">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'animate-spin': isRefreshing }">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M8 16H3v5"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="balance">
        <div class="amount">
          <span>{{ isBalanceHidden ? '****' : balance }}</span>
        </div>
        <div class="updated">{{ currentTime }}</div>
      </div>

      <div class="foot">
        <div class="pan">
          <div>{{ maskedNumber }}</div>
          <div>02/28</div>
        </div>
        <svg class="visa" width="58" height="20" viewBox="0 0 78 24" aria-label="VISA">
          <text x="0" y="19" fill="white" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="22" letter-spacing="1.2" font-style="italic">VISA</text>
        </svg>
      </div>
    </div>
  </article>
</template>

<style scoped>
.bank-card { position: relative; overflow: hidden; min-height: 196px; border-radius: 18px; color: #fff; box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28); background: radial-gradient(120% 140% at 78% 62%, #1a7a72 0%, #0f524c 28%, #0b3d39 52%, #082e2c 100%); font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif; }
.honey, .glow { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.glow { background: radial-gradient(70% 80% at 82% 70%, rgba(90, 210, 190, 0.22), transparent 60%); }
.content { position: relative; display: flex; min-height: 196px; flex-direction: column; padding: 14px 18px; }
.top, .foot { display: flex; justify-content: space-between; }
.top { align-items: flex-start; }
.name { font-size: 17px; font-weight: 500; line-height: 1; }
.tariff { margin-top: 5px; font-size: 13px; line-height: 1; color: rgba(255, 255, 255, 0.75); }
.icons { display: flex; gap: 14px; color: rgba(255, 255, 255, 0.9); }
.balance { margin-top: 22px; text-align: center; }
.amount { display: flex; align-items: flex-end; justify-content: center; gap: 6px; line-height: 1; }
.amount span { font-size: 34px; font-weight: 600; letter-spacing: -0.02em; }
.updated { margin-top: 7px; font-size: 13px; color: rgba(255, 255, 255, 0.7); }
.foot { align-items: flex-end; justify-content: flex-end; gap: 10px; margin-top: auto; padding-top: 16px; }
.pan { text-align: right; font-size: 13.5px; font-weight: 500; line-height: 1.15; }
</style>
>>>>>>> Stashed changes
