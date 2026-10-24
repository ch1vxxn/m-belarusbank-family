<script setup lang="ts">
/**
 * GoalProgressBar — прогресс-бар цели накопления.
 *
 * Используется на экране цели для наглядного отображения
 * текущего прогресса относительно целевой суммы.
 */

import { computed } from 'vue'

const props = defineProps<{
  current: number
  target: number
}>()

const percent = computed(() => {
  if (props.target <= 0) return 0
  return Math.min(100, Math.round((props.current / props.target) * 100))
})

const isComplete = computed(() => props.current >= props.target)
</script>

<template>
  <div>
    <div class="flex items-end justify-between">
      <div>
        <p class="text-[32px] font-bold leading-none tracking-tight">{{ current }} BYN</p>
        <p class="mt-1 text-[13px] text-white/40">из {{ target }} BYN</p>
      </div>
      <span
        class="rounded-full px-3 py-1 text-[13px] font-semibold"
        :class="isComplete ? 'bg-[#00A651]/20 text-[#00A651]' : 'bg-white/[0.06] text-white/60'"
      >
        {{ percent }}%
      </span>
    </div>

    <div class="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
      <div
        class="h-full rounded-full transition-all duration-700 ease-out"
        :class="isComplete ? 'bg-[#00A651]' : 'bg-gradient-to-r from-[#00A651] to-[#00b35a]'"
        :style="{ width: percent + '%' }"
      />
    </div>

    <p v-if="!isComplete" class="mt-2 text-[13px] text-white/40">
      Осталось накопить {{ target - current }} BYN
    </p>
    <p v-else class="mt-2 text-[13px] font-medium text-[#00A651]">
      Цель достигнута! 🎉
    </p>
  </div>
</template>