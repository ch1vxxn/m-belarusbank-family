<script setup lang="ts">
/**
 * NoticeBanner — баннер уведомления (успех/ошибка).
 *
 * Всплывает сверху экрана при действиях пользователя.
 */

import { X } from 'lucide-vue-next'
import type { Notice } from '@/stores/family'

defineProps<{
  notice: Notice
}>()

const emit = defineEmits<{
  dismiss: []
}>()
</script>

<template>
  <div
    class="flex items-center justify-between rounded-xl border px-4 py-3 text-[13px]"
    :class="
      notice.kind === 'success'
        ? 'border-[#00A651]/30 bg-[#00A651]/10 text-[#00A651]'
        : 'border-red-400/20 bg-red-400/10 text-red-400'
    "
  >
    <span>{{ notice.text }}</span>
    <button
      type="button"
      class="ml-2 shrink-0 text-white/40 hover:text-white transition"
      aria-label="Закрыть"
      @click="emit('dismiss')"
    >
      <X class="size-4" stroke-width="1.5" />
    </button>
  </div>
</template>