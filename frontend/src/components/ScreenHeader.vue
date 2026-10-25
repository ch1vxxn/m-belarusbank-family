<script setup lang="ts">
/**
 * ScreenHeader — заголовок экрана с опциональной кнопкой «Назад».
 *
 * Используется на экранах второго уровня (/card, /goal, /child).
 */

import { ArrowLeft } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    title: string
    /** Если true, показываем стрелку «Назад» и вызываем $router.back() */
    showBack?: boolean
  }>(),
  { showBack: false },
)

const emit = defineEmits<{
  back: []
}>()

function handleBack(): void {
  emit('back')
}
</script>

<template>
  <header class="flex items-center gap-3 px-4 pt-6 pb-4">
    <button
      v-if="showBack"
      type="button"
      class="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/60 transition hover:bg-white/[0.12] hover:text-white"
      aria-label="Назад"
      @click="handleBack"
    >
      <ArrowLeft class="size-5" stroke-width="1.5" />
    </button>
    <h1 class="text-[17px] font-semibold leading-none">{{ title }}</h1>
  </header>
</template>