<script setup lang="ts">
/**
 * BalanceSummary — крупный баланс с подписью.
 *
 * Минималистичный: сумма крупно, подпись снизу мелким шрифтом.
 */

defineProps<{
  /** Отформатированная сумма, например «85.50 BYN» */
  amount: string
  /** Подпись под суммой, например «Мои деньги» или «Баланс карты» */
  label: string
}>()
</script>

<template>
  <div class="text-center">
    <p class="text-[32px] font-bold leading-none tracking-tight">{{ amount }}</p>
    <p class="mt-1.5 text-[13px] text-white/40">{{ label }}</p>
  </div>
</template>