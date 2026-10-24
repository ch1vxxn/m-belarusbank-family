<script setup lang="ts">
/**
 * ParentDashboard — экран 1: Кабинет родителя (Главная).
 *
 * Содержит: заголовок «Семья», профиль ребёнка, банковскую карту,
 * быстрый перевод, лимиты, последние операции, цель накопления.
 */

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
}
</script>

<template>
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
  </div>
</template>