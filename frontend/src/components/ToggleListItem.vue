<script setup lang="ts">
/**
 * ToggleListItem — элемент списка с переключателем.
 *
 * Используется на экране управления картой для разрешённых категорий трат.
 */

const props = defineProps<{
  label: string
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function toggle(): void {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div
    class="flex items-center justify-between py-3 cursor-pointer"
    role="switch"
    :aria-checked="modelValue"
    @click="toggle"
  >
    <span class="text-[15px]" :class="modelValue ? 'text-white' : 'text-white/50'">
      {{ label }}
    </span>
    <button
      type="button"
      class="relative h-7 w-11 rounded-full transition-colors"
      :class="modelValue ? 'bg-[#00A651]' : 'bg-white/[0.12]'"
    >
      <span
        class="absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform"
        :class="modelValue ? 'translate-x-4' : 'translate-x-0'"
      />
    </button>
  </div>
</template>