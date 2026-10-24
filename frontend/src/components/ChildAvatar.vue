<script setup lang="ts">
/**
 * ChildAvatar — аватар ребёнка (кружок с инициалами).
 *
 * Используется в родительском кабинете и детском интерфейсе.
 */

defineProps<{
  initials: string
  /** Размер в пикселях (по умолчанию 48) */
  size?: number
}>()
</script>

<template>
  <div
    class="flex shrink-0 items-center justify-center rounded-full bg-[#00A651]/15 text-[#00A651] font-semibold"
    :style="{ width: (size ?? 48) + 'px', height: (size ?? 48) + 'px', fontSize: ((size ?? 48) * 0.35) + 'px' }"
  >
    {{ initials }}
  </div>
</template>