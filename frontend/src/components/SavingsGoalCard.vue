<script setup lang="ts">
/**
 * SavingsGoalCard — компактная карточка цели для родительского кабинета.
 *
 * Показывает: иконку, название, прогресс-бар, текущая/целевая сумма.
 * Кликабельна — ведёт на экран цели (/goal).
 */

import { computed } from 'vue'

const props = defineProps<{
  title: string
  icon: string
  current: number
  target: number
}>()

const percent = computed(() => {
  if (props.target <= 0) return 0
  return Math.min(100, Math.round((props.current / props.target) * 100))
})
</script>

<template>
  <div class="flex items-center gap-3 rounded-2xl bg-[#2C2C2E] p-4 transition active:scale-[0.98] cursor-pointer">
    <!-- Иконка цели -->
    <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-xl">
      {{ icon }}
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-[15px] font-medium truncate">{{ title }}</p>
      <div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
        <div
          class="h-full rounded-full bg-[#00A651] transition-all duration-500"
          :style="{ width: percent + '%' }"
        />
      </div>
      <p class="mt-1 text-[13px] text-white/40">
        {{ current }} / {{ target }} BYN · {{ percent }}%
      </p>
    </div>
  </div>
</template>