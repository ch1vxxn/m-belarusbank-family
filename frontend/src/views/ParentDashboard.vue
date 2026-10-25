<script setup lang="ts">
<<<<<<< Updated upstream
/**
 * ParentDashboard — экран 1: Кабинет родителя (Главная).
 *
 * Содержит: заголовок «Семья», профиль ребёнка, банковскую карту,
 * быстрый перевод, лимиты, последние операции, цель накопления.
 */
=======
import { ref } from 'vue'
import { useFamilyStore } from '@/stores/family'
import BankCard from '@/components/BankCard.vue'
import AddCard from '@/components/AddCard.vue'
import NoticeBanner from '@/components/NoticeBanner.vue'
import ChildAvatar from '@/components/ChildAvatar.vue'
import { Star, ChevronRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
>>>>>>> Stashed changes

import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { Settings } from 'lucide-vue-next'
import BankCard from '@/components/BankCard.vue'
import ChildAvatar from '@/components/ChildAvatar.vue'
import QuickTransfer from '@/components/QuickTransfer.vue'
import LimitSelector from '@/components/LimitSelector.vue'
import TransactionRow from '@/components/TransactionRow.vue'
import SavingsGoalCard from '@/components/SavingsGoalCard.vue'
import NoticeBanner from '@/components/NoticeBanner.vue'

const router = useRouter()
const family = useFamilyStore()

<<<<<<< Updated upstream
function formatMoney(v: number | null): string {
  if (v === null) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'BYN',
    minimumFractionDigits: 2,
  }).format(v)
}

function openCard(): void {
  router.push('/card')
}

function openGoal(): void {
  router.push('/goal')
=======
const isBalanceHidden = ref(false)
const toggleBalance = () => { isBalanceHidden.value = !isBalanceHidden.value }

const isRefreshing = ref(false)
const refreshData = async () => {
  isRefreshing.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  isRefreshing.value = false
}

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const index = Math.round(target.scrollLeft / (target.clientWidth + 16))
  family.setCurrentCardIndex(index)
>>>>>>> Stashed changes
}
</script>

<template>
<<<<<<< Updated upstream
  <div class="space-y-6 px-4 pb-24 pt-4">
    <!-- Notice -->
    <NoticeBanner
      v-if="family.notice"
      :notice="family.notice"
      @dismiss="family.clearNotice()"
    />

    <!-- Шапка: профиль ребёнка -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <ChildAvatar :initials="family.child.initials" :size="48" />
        <div>
          <p class="text-[11px] font-medium uppercase tracking-wide text-white/40">
            Семья
          </p>
          <h1 class="text-[22px] font-semibold leading-tight">
            {{ family.child.name }}
          </h1>
          <p class="text-[13px] text-white/40">{{ family.child.age }} лет</p>
        </div>
      </div>
      <button
        type="button"
        class="flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-white/50 transition hover:bg-white/[0.12] hover:text-white"
        aria-label="Настройки"
      >
        <Settings class="size-5" stroke-width="1.5" />
      </button>
    </div>

    <!-- Карта (кликабельная — переход на управление) -->
    <div class="cursor-pointer active:scale-[0.98] transition-transform" @click="openCard">
      <BankCard
        :masked-number="family.card.maskedNumber"
        :balance="family.cardBalanceFormatted"
        :payment-system="family.card.paymentSystem"
        :is-active="family.card.isActive"
      />
    </div>

    <!-- Быстрый перевод -->
    <QuickTransfer
      :max="family.parentBalance ?? 200"
      :disabled="family.isLoading"
      @transfer="family.transfer($event)"
    />

    <!-- Лимиты -->
    <div class="rounded-2xl bg-[#2C2C2E] p-4 space-y-4">
      <h2 class="text-[15px] font-semibold">Лимиты трат</h2>
      <LimitSelector
        title="Дневной лимит"
        :model-value="family.limits.dailyLimit"
        @update:model-value="family.setDailyLimit($event)"
      />
      <LimitSelector
        title="Недельный лимит"
        :model-value="family.limits.weeklyLimit"
        @update:model-value="family.setWeeklyLimit($event)"
      />
    </div>

    <!-- Последние операции -->
    <section>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-[15px] font-semibold">Последние операции</h2>
        <RouterLink to="/history" class="text-[13px] text-[#00A651] font-medium">
          Все
        </RouterLink>
      </div>
      <div class="rounded-2xl bg-[#2C2C2E] px-4 divide-y divide-white/[0.06]">
        <TransactionRow
          v-for="tx in family.recentTransactions"
          :key="tx.id"
          :merchant="tx.merchant"
          :category="tx.category"
          :amount="tx.amount"
          :time="tx.time"
        />
        <p v-if="family.recentTransactions.length === 0" class="py-4 text-[13px] text-white/40 text-center">
          Пока нет операций
        </p>
      </div>
    </section>

    <!-- Цель накопления -->
    <section>
      <h2 class="mb-3 text-[15px] font-semibold">Цель накопления</h2>
      <SavingsGoalCard
        :title="family.savingsGoal.title"
        :icon="family.savingsGoal.icon"
        :current="family.savingsGoal.current"
        :target="family.savingsGoal.target"
        @click="openGoal"
      />
    </section>
=======
  <div class="min-h-screen text-white pb-24 font-sans relative bg-transparent">
    
    <!-- ОСНОВНОЙ КОНТЕНТ (поверх фона) -->
    <div class="relative z-10">
      
      <!-- Шапка -->
      <header class="flex items-center justify-between px-5 pt-8 pb-4">
        <div class="w-8"></div>
        <h1 class="text-[17px] font-semibold tracking-wide">M-Belarusbank</h1>
        
        <RouterLink to="/notifications" class="text-white relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/>
            <rect x="2" y="4" width="20" height="16" rx="2"/>
          </svg>
          <span v-if="family.notifications.some(n => !n.isRead)" class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </RouterLink>
      </header>

      <div class="px-5">
        <NoticeBanner v-if="family.notice" :notice="family.notice" @dismiss="family.clearNotice()" />
      </div>

      <main class="px-5 space-y-5 pt-2">
        <!-- Блок Карты -->
        <section>
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-[15px] font-semibold text-white">Карты</h2>
            <button class="text-[13px] text-white/80 flex items-center gap-1">Все <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
          </div>
          
          <div class="flex overflow-x-auto snap-x snap-mandatory gap-4 scrollbar-hide -mx-5 px-5 pb-4" @scroll="handleScroll">
            
            <!-- Карта 1 -->
            <div class="snap-center shrink-0 w-[calc(100vw-40px)] md:w-[350px] relative">
              <div v-if="isRefreshing" class="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-sm">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
              <div :class="{ 'opacity-50': isRefreshing }">
                <BankCard
                  masked-number="**** **** **** 9883"
                  :balance="family.parentBalanceFormatted"
                  payment-system="VISA"
                  :is-active="true"
                  title="Карта 1"
                  subtitle="Экономный по 22.11.2026"
                  :is-balance-hidden="isBalanceHidden"
                  :is-refreshing="isRefreshing"
                  @toggle-balance="toggleBalance"
                  @refresh="refreshData"
                />
              </div>
            </div>
            
            <!-- Карта 2 (Добавить) -->
            <div class="snap-center shrink-0 w-[calc(100vw-40px)] md:w-[350px]">
              <AddCard />
            </div>
          </div>
          
          <!-- Точки пагинации (используем family.currentCardIndex) -->
          <div class="flex justify-center gap-2 mt-2">
            <div class="w-1.5 h-1.5 rounded-full transition-colors" :class="family.currentCardIndex === 0 ? 'bg-white' : 'bg-white/20'"></div>
            <div class="w-1.5 h-1.5 rounded-full transition-colors" :class="family.currentCardIndex === 1 ? 'bg-white' : 'bg-white/20'"></div>
          </div>
        </section>

        <!-- Блок Семья -->
        <section>
          <RouterLink to="/family" class="flex items-center justify-between rounded-2xl bg-[#1C1C1E]/80 backdrop-blur-md p-4 hover:bg-[#2C2C2E] transition-colors border border-white/5">
            <div class="flex items-center gap-3">
              <ChildAvatar :initials="family.child.initials" :size="48" />
              <div>
                <p class="text-[15px] font-medium text-white">Моя семья</p>
                <p class="text-[13px] text-white/50">{{ family.child.name }}, {{ family.child.age }} лет</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-white/40" />
          </RouterLink>
        </section>

        <!-- Избранные платежи -->
        <section class="rounded-2xl bg-[#1C1C1E]/80 backdrop-blur-md p-5 border border-white/5">
          <h2 class="text-[15px] font-semibold mb-8">Избранные платежи</h2>
          <div class="flex flex-col items-center justify-center text-white/30 pb-2">
            <div class="relative mb-3">
               <svg class="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
               <div class="absolute -bottom-1 -right-1 bg-[#1C1C1E] rounded-full p-1">
                  <Star class="w-5 h-5 text-white/40" />
               </div>
            </div>
            <p class="text-[13px]">Информация не найдена</p>
          </div>
        </section>

        <!-- Карты лояльности -->
        <section class="rounded-2xl bg-[#1C1C1E]/80 backdrop-blur-md p-5 border border-white/5">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-[15px] font-semibold">Карты лояльности</h2>
            <button class="text-[13px] text-white/80 flex items-center gap-1">Все <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
          </div>
          <div class="w-16 h-10 rounded-lg bg-white/5 flex items-center justify-center cursor-pointer">
            <span class="text-white/40 text-xl">+</span>
          </div>
        </section>
      </main>
    </div>
>>>>>>> Stashed changes
  </div>
</template>