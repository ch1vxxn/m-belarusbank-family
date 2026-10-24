<script setup lang="ts">
/**
 * TransactionRow — одна строка операции.
 *
 * Показывает категорию (иконка + название), сумму (красная/зелёная),
 * время. Используется в списках транзакций на всех экранах.
 */

import { computed } from 'vue'
import {
  ShoppingBag,
  Shirt,
  Coffee,
  Bus,
  Gamepad2,
  Banknote,
  type LucideIcon,
} from 'lucide-vue-next'
import { type TransactionCategory, categoryLabels } from '@/types'

const props = defineProps<{
  merchant: string
  category: TransactionCategory
  amount: number
  time: string
}>()

const iconMap: Record<TransactionCategory, LucideIcon> = {
  food: ShoppingBag,
  clothes: Shirt,
  cafe: Coffee,
  transport: Bus,
  entertainment: Gamepad2,
  topup: Banknote,
}

const isNegative = computed(() => props.amount < 0)

const formattedAmount = computed(() => {
  const abs = Math.abs(props.amount)
  return `${isNegative.value ? '−' : '+'}${abs.toFixed(2)} BYN`
})
</script>

<template>
  <div class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
    <!-- Иконка категории -->
    <div
      class="flex size-9 shrink-0 items-center justify-center rounded-full"
      :class="isNegative ? 'bg-white/[0.06]' : 'bg-[#00A651]/10'"
    >
      <component
        :is="iconMap[category]"
        class="size-4"
        :class="isNegative ? 'text-white/50' : 'text-[#00A651]'"
        stroke-width="1.5"
      />
    </div>

    <!-- Описание -->
    <div class="flex-1 min-w-0">
      <p class="text-[15px] leading-snug truncate">{{ merchant }}</p>
      <p class="text-[13px] text-white/40">{{ categoryLabels[category] }} · {{ time }}</p>
    </div>

    <!-- Сумма -->
    <p
      class="text-[15px] font-semibold tabular-nums shrink-0"
      :class="isNegative ? 'text-white/80' : 'text-[#00A651]'"
    >
      {{ formattedAmount }}
    </p>
  </div>
</template>