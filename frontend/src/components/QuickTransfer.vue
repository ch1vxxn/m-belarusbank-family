<script setup lang="ts">
/**
 * QuickTransfer — блок быстрого перевода карманных денег.
 *
 * Степпер −/+ для выбора суммы и кнопка «Перевести».
 * Используется в родительском кабинете.
 */

import { computed, ref } from 'vue'
import { ArrowDownToLine, Minus, Plus } from 'lucide-vue-next'

const props = defineProps<{
  /** Максимальная сумма (баланс родителя) */
  max: number
  /** Заблокирована ли кнопка (идёт загрузка) */
  disabled?: boolean
}>()

const emit = defineEmits<{
  transfer: [amount: number]
}>()

const STEP = 10
const MIN = 10

const amount = ref(10)

const canGoDown = computed(() => amount.value > MIN)
const canGoUp = computed(() => amount.value < props.max)
const canTransfer = computed(() => !props.disabled && amount.value >= MIN && amount.value <= props.max)

function down(): void {
  amount.value = Math.max(MIN, amount.value - STEP)
}
function up(): void {
  amount.value = Math.min(props.max, amount.value + STEP)
}
function handleTransfer(): void {
  emit('transfer', amount.value)
}
</script>

<template>
  <div class="rounded-2xl bg-[#2C2C2E] p-4">
    <h2 class="flex items-center gap-2 text-[15px] font-semibold">
      <ArrowDownToLine class="size-4 text-[#00A651]" stroke-width="1.5" />
      Перевести карманные деньги
    </h2>

    <!-- Степпер -->
    <div class="mt-4 flex items-center justify-between">
      <button
        type="button"
        class="flex size-10 items-center justify-center rounded-full bg-white/[0.06] transition hover:bg-white/[0.12] disabled:opacity-30"
        :disabled="!canGoDown || disabled"
        aria-label="Уменьшить сумму"
        @click="down"
      >
        <Minus class="size-5" stroke-width="1.5" />
      </button>

      <div class="text-center">
        <input
          v-model.number="amount"
          type="number"
          :min="MIN"
          :max="max"
          inputmode="numeric"
          class="w-24 bg-transparent text-center text-[28px] font-bold outline-none"
          :disabled="disabled"
        />
        <p class="text-[11px] text-white/40">BYN</p>
      </div>

      <button
        type="button"
        class="flex size-10 items-center justify-center rounded-full bg-white/[0.06] transition hover:bg-white/[0.12] disabled:opacity-30"
        :disabled="!canGoUp || disabled"
        aria-label="Увеличить сумму"
        @click="up"
      >
        <Plus class="size-5" stroke-width="1.5" />
      </button>
    </div>

    <button
      type="button"
      class="mt-4 w-full rounded-xl bg-[#00A651] py-3 text-[15px] font-semibold text-white transition hover:bg-[#009448] disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="!canTransfer"
      @click="handleTransfer"
    >
      {{ disabled ? 'Отправляем…' : 'Перевести' }}
    </button>
  </div>
</template>