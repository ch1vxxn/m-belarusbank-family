<script setup lang="ts">
/**
 * PlaceholderView — временная заглушка для ещё не готовых вкладок
 * (Платежи, Журнал, Финансы, Ещё). Убирается по мере реализации.
 */

withDefaults(
  defineProps<{
    /** Заголовок вкладки, например «Платежи» */
    title: string
    /** Текст-подсказка под заголовком */
    hint?: string
  }>(),
  { hint: 'Раздел в разработке' },
)
</script>

<template>
  <div class="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
    <p class="text-4xl">🚧</p>
    <h1 class="text-lg font-semibold">{{ title }}</h1>
    <p class="text-sm text-white/50">{{ hint }}</p>
  </div>
</template>