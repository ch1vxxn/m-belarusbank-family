<script setup lang="ts">
/**
 * BankCard — визуальное представление детской банковской карты.
 *
 * Тёмно-зелёный градиент, текстура (сетка точек), логотип VISA,
 * маскированный номер. Стиль строго в духе М-Беларусбанка.
 *
 * Используется на экранах: родительский кабинет, управление картой.
 */

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