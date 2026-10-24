<script setup lang="ts">
/**
 * LimitSelector — блок выбора дневного/недельного лимита.
 *
 * Пресеты в виде кнопок: 0, 50, 100, 200 BYN.
 * Выбранный пресет подсвечен зелёным.
 */

import { DAILY_LIMIT_PRESETS } from '@/types'

defineProps<{
  /** Заголовок блока */
  title: string
  /** Текущее значение лимита */
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function select(value: number): void {
  emit('update:modelValue', value)
}
</script>

<template>
  <div>
    <p class="mb-2 text-[13px] font-medium text-white/60">{{ title }}</p>
    <div class="flex gap-2">
      <button
        v-for="preset in DAILY_LIMIT_PRESETS"
        :key="preset"
        type="button"
        class="flex-1 rounded-lg py-2.5 text-center text-[13px] font-medium transition"
        :class="
          modelValue === preset
            ? 'bg-[#00A651] text-white'
            : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.10]'
        "
        @click="select(preset)"
      >
        {{ preset === 0 ? 'Нет' : preset + ' BYN' }}
      </button>
    </div>
  </div>
</template>