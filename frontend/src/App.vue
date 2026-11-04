<script setup lang="ts">
import { onMounted } from 'vue'
import AppShell from '@/components/AppShell.vue'
import { useFamilyStore } from '@/stores/family'

const family = useFamilyStore()

onMounted(() => {
  // Как только приложение загрузилось — стучимся в Go и забираем данные
  family.initFamilyData()
})
</script>

<template>
  <AppShell />
</template>