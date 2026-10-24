<script setup lang="ts">
/**
 * ChildCardManage — экран 2: Управление детской картой.
 *
 * Полноразмерная карта, баланс, лимиты, разрешённые категории,
 * история операций с группировкой по датам, кнопка блокировки.
 */

import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ArrowLeft } from 'lucide-vue-next'
import BankCard from '@/components/BankCard.vue'
import BalanceSummary from '@/components/BalanceSummary.vue'
import LimitSelector from '@/components/LimitSelector.vue'
import ToggleListItem from '@/components/ToggleListItem.vue'
import TransactionRow from '@/components/TransactionRow.vue'

const router = useRouter()
const family = useFamilyStore()

function goBack(): void {
  router.push('/')
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })
}
</script>

<template>
  <div class="space-y-6 px-4 pb-12 pt-4">
    <!-- Кнопка назад -->
    <button
      type="button"
      class="flex items-center gap-2 text-[13px] font-medium text-white/50 transition hover:text-white"
      @click="goBack"
    >
      <ArrowLeft class="size-4" stroke-width="1.5" />
      Семья
    </button>

    <!-- Банковская карта (полная) -->
    <BankCard
      :masked-number="family.card.maskedNumber"
      :balance="family.cardBalanceFormatted"
      :payment-system="family.card.paymentSystem"
      :is-active="family.card.isActive"
    />

    <!-- Баланс -->
    <BalanceSummary
      :amount="family.cardBalanceFormatted"
      label="Баланс детской карты"
    />

    <!-- Лимиты -->
    <div class="rounded-2xl bg-[#2C2C2E] p-4 space-y-5">
      <h2 class="text-[15px] font-semibold">Настройка лимитов</h2>
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

    <!-- Разрешённые категории -->
    <div class="rounded-2xl bg-[#2C2C2E] p-4">
      <h2 class="mb-1 text-[15px] font-semibold">Разрешённые категории</h2>
      <div class="divide-y divide-white/[0.06]">
        <ToggleListItem
          v-for="cat in family.spendingCategories"
          :key="cat.id"
          :label="cat.label"
          :model-value="cat.isAllowed"
          @update:model-value="family.toggleSpendingCategory(cat.id)"
        />
      </div>
    </div>

    <!-- История операций (сгруппирована) -->
    <section>
      <h2 class="mb-3 text-[15px] font-semibold">История операций</h2>
      <div class="space-y-4">
        <div
          v-for="group in family.transactionsGrouped"
          :key="group.date"
          class="rounded-2xl bg-[#2C2C2E] p-4"
        >
          <p class="mb-2 text-[13px] font-medium text-white/50">
            {{ formatDate(group.date) }}
          </p>
          <div class="divide-y divide-white/[0.06]">
            <TransactionRow
              v-for="tx in group.items"
              :key="tx.id"
              :merchant="tx.merchant"
              :category="tx.category"
              :amount="tx.amount"
              :time="tx.time"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Кнопка блокировки -->
    <button
      type="button"
      class="w-full rounded-xl py-3.5 text-[15px] font-semibold transition"
      :class="
        family.card.isActive
          ? 'border border-red-400/30 text-red-400 hover:bg-red-400/10'
          : 'bg-[#00A651] text-white hover:bg-[#009448]'
      "
      @click="family.toggleCardActive()"
    >
      {{ family.card.isActive ? 'Заблокировать карту' : 'Разблокировать карту' }}
    </button>
  </div>
</template>