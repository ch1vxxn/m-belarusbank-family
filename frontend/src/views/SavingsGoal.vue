<script setup lang="ts">
/**
 * SavingsGoal — экран 4: Финансовая цель накопления.
 *
 * Подробный экран: название, прогресс, история пополнений,
 * кнопка «Пополнить копилку» (работает — добавляет +10 BYN).
 */

import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ArrowLeft, Bike, Plus } from 'lucide-vue-next'
import GoalProgressBar from '@/components/GoalProgressBar.vue'
import NoticeBanner from '@/components/NoticeBanner.vue'

const router = useRouter()
const family = useFamilyStore()

function goBack(): void {
  router.push('/')
}

function handleContribute(): void {
  family.contributeToGoal(10)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
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
      Назад
    </button>

    <!-- Notice -->
    <NoticeBanner
      v-if="family.notice"
      :notice="family.notice"
      @dismiss="family.clearNotice()"
    />

    <!-- Заголовок цели -->
    <div class="flex items-center gap-3">
      <div class="flex size-12 items-center justify-center rounded-xl bg-white/[0.06]">
        <Bike class="size-6 text-[#00A651]" stroke-width="1.5" />
      </div>
      <h1 class="text-[22px] font-semibold leading-tight">{{ family.savingsGoal.title }}</h1>
    </div>

    <!-- Прогресс -->
    <div class="rounded-2xl bg-[#2C2C2E] p-4">
      <GoalProgressBar
        :current="family.savingsGoal.current"
        :target="family.savingsGoal.target"
      />
    </div>

    <!-- Кнопка пополнения -->
    <button
      type="button"
      class="w-full rounded-xl bg-[#00A651] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#009448] active:scale-[0.98]"
      @click="handleContribute"
    >
      <span class="flex items-center justify-center gap-2">
        <Plus class="size-5" stroke-width="2" />
        Пополнить копилку на 10 BYN
      </span>
    </button>

    <!-- История пополнений -->
    <section>
      <h2 class="mb-3 text-[15px] font-semibold">История пополнений</h2>
      <div class="rounded-2xl bg-[#2C2C2E] p-4">
        <div class="divide-y divide-white/[0.06]">
          <div
            v-for="item in family.goalHistory"
            :key="item.id"
            class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div>
              <p class="text-[15px]">{{ item.sourceLabel }}</p>
              <p class="text-[13px] text-white/40">{{ formatDate(item.date) }}</p>
            </div>
            <p class="text-[15px] font-semibold text-[#00A651]">
              +{{ item.amount }} BYN
            </p>
          </div>
          <p v-if="family.goalHistory.length === 0" class="py-4 text-[13px] text-white/40 text-center">
            Пока нет пополнений
          </p>
        </div>
      </div>
    </section>
  </div>
</template>