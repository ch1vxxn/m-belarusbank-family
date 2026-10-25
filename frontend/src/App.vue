<script setup lang="ts">
/**
 * Корень приложения.
 *
 * Использует AppShell — обёртку «телефона» — который уже содержит
 * RouterView и BottomTabBar. Здесь только монтирование AppShell.
 */

import AppShell from '@/components/AppShell.vue'
</script>

<template>
  <AppShell />
</template>