<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft } from 'lucide-vue-next'

const router = useRouter()
const family = useFamilyStore()

const goBack = () => router.push('/child')
</script>

<template>
  <div class="min-h-screen bg-[#0A0A0A] text-white font-sans pb-24">
    <!-- Шапка -->
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="goBack" class="flex items-center gap-1 text-white/80 hover:text-white">
        <ChevronLeft class="w-6 h-6" stroke-width="1.5" />
        <span class="text-[13px] font-medium">Назад</span>
      </button>
      <h1 class="text-[17px] font-semibold">Лимиты и запреты</h1>
      <div class="w-16"></div>
    </header>

    <main class="px-5 space-y-4">
      <!-- Блок Лимитов -->
      <section class="bg-[#1C1C1E] rounded-2xl p-5 space-y-6">
        <h2 class="text-[15px] font-semibold text-white">Настройка лимитов</h2>
        
        <div>
          <p class="text-[13px] text-white/50 mb-3">Дневной лимит</p>
          <div class="flex gap-2">
            <button 
              v-for="preset in [0, 50, 100, 200]" :key="preset"
              @click="family.setDailyLimit(preset)"
              class="flex-1 py-3 rounded-xl text-[14px] transition-colors"
              :class="family.limits.dailyLimit === preset ? 'bg-[#00A651] text-white font-medium' : 'bg-[#2C2C2E] text-white/60'"
            >
              {{ preset === 0 ? 'Нет' : preset + ' BYN' }}
            </button>
          </div>
        </div>

        <div>
          <p class="text-[13px] text-white/50 mb-3">Недельный лимит</p>
          <div class="flex gap-2">
            <button 
              v-for="preset in [0, 50, 100, 200]" :key="preset"
              @click="family.setWeeklyLimit(preset)"
              class="flex-1 py-3 rounded-xl text-[14px] transition-colors"
              :class="family.limits.weeklyLimit === preset ? 'bg-[#00A651] text-white font-medium' : 'bg-[#2C2C2E] text-white/60'"
            >
              {{ preset === 0 ? 'Нет' : preset + ' BYN' }}
            </button>
          </div>
        </div>
      </section>

      <!-- Блок Запретов -->
      <section class="bg-[#1C1C1E] rounded-2xl p-5 space-y-2">
        <h2 class="text-[15px] font-semibold text-white mb-4">Разрешённые категории</h2>
        <div class="divide-y divide-white/5">
          <div v-for="cat in family.spendingCategories" :key="cat.id" class="flex items-center justify-between py-3">
            <span class="text-[15px]" :class="cat.isAllowed ? 'text-white' : 'text-white/40'">{{ cat.label }}</span>
            <div @click="family.toggleSpendingCategory(cat.id)" class="w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300" :class="cat.isAllowed ? 'bg-[#00A651]' : 'bg-white/10'">
              <div class="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-300" :class="cat.isAllowed ? 'right-0.5' : 'left-0.5'"></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>