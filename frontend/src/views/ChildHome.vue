<script setup lang="ts">
/**
 * ChildHome — экран 3: Детский интерфейс.
 *
 * Отдельный интерфейс для ребёнка: приветствие, баланс, карта,
 * цель накопления, задания с наградой, достижения.
 */

import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import {
  ArrowLeft,
  Bike,
  PiggyBank,
  Target,
  ShieldCheck,
  Circle,
} from 'lucide-vue-next'
import BankCard from '@/components/BankCard.vue'
import BalanceSummary from '@/components/BalanceSummary.vue'
import ChildAvatar from '@/components/ChildAvatar.vue'
import GoalProgressBar from '@/components/GoalProgressBar.vue'
import NoticeBanner from '@/components/NoticeBanner.vue'

const router = useRouter()
const family = useFamilyStore()

function goBack(): void {
  router.push('/')
}

function openGoal(): void {
  router.push('/goal')
}

const achievementIcons: Record<string, typeof Target> = {
  Target,
  ShieldCheck,
  PiggyBank,
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
      К родителю
    </button>

    <!-- Notice -->
    <NoticeBanner
      v-if="family.notice"
      :notice="family.notice"
      @dismiss="family.clearNotice()"
    />

    <!-- Приветствие + аватар -->
    <div class="flex items-center gap-4">
      <ChildAvatar :initials="family.child.initials" :size="56" />
      <div>
        <p class="text-[22px] font-semibold leading-tight">
          Привет, {{ family.child.name }}!
        </p>
        <p class="text-[13px] text-white/40">Сегодня отличный день</p>
      </div>
    </div>

    <!-- Баланс -->
    <BalanceSummary :amount="family.cardBalanceFormatted" label="Мои деньги" />

    <!-- Карта -->
    <BankCard
      :masked-number="family.card.maskedNumber"
      :balance="family.cardBalanceFormatted"
      :payment-system="family.card.paymentSystem"
      :is-active="family.card.isActive"
    />

    <!-- Цель накопления -->
    <div
      class="cursor-pointer rounded-2xl bg-[#2C2C2E] p-4 transition active:scale-[0.98]"
      @click="openGoal"
    >
      <div class="flex items-center gap-3 mb-4">
        <div class="flex size-10 items-center justify-center rounded-xl bg-white/[0.06]">
          <Bike class="size-5 text-[#00A651]" stroke-width="1.5" />
        </div>
        <div>
          <p class="text-[15px] font-semibold">{{ family.savingsGoal.title }}</p>
          <p class="text-[13px] text-white/40">Моя цель</p>
        </div>
      </div>
      <GoalProgressBar
        :current="family.savingsGoal.current"
        :target="family.savingsGoal.target"
      />
    </div>

    <!-- Задания -->
    <section>
      <h2 class="mb-3 text-[15px] font-semibold">
        Задания · {{ family.completedChoreCount }}/{{ family.chores.length }}
      </h2>
      <div class="space-y-2">
        <div
          v-for="chore in family.chores"
          :key="chore.id"
          class="flex items-center gap-3 rounded-xl bg-[#2C2C2E] p-4 transition"
          :class="chore.completed ? 'opacity-50' : 'cursor-pointer active:bg-[#333539]'"
          @click="family.completeChore(chore.id)"
        >
          <div
            class="flex size-5 shrink-0 items-center justify-center rounded-full border-2"
            :class="chore.completed ? 'border-[#00A651] bg-[#00A651]' : 'border-white/15'"
          >
            <Circle v-if="chore.completed" class="size-2.5 text-white" fill="currentColor" />
          </div>
          <span class="flex-1 text-[15px]" :class="chore.completed ? 'line-through' : ''">
            {{ chore.title }}
          </span>
          <span class="text-[13px] font-semibold text-[#00A651]">
            +{{ chore.reward }} BYN
          </span>
        </div>
      </div>
    </section>

    <!-- Достижения -->
    <section>
      <h2 class="mb-3 text-[15px] font-semibold">Достижения</h2>
      <div class="flex gap-3">
        <div
          v-for="a in family.achievements"
          :key="a.id"
          class="flex flex-1 flex-col items-center gap-2 rounded-xl bg-[#2C2C2E] p-3 text-center"
        >
          <div
            class="flex size-10 items-center justify-center rounded-full"
            :style="{ backgroundColor: a.color + '18', color: a.color }"
          >
            <component
              :is="achievementIcons[a.icon as keyof typeof achievementIcons] ?? Target"
              class="size-5"
              stroke-width="1.5"
              v-if="a.icon in achievementIcons"
            />
            <span v-else class="text-lg">{{ a.icon }}</span>
          </div>
          <p class="text-[11px] font-medium leading-tight text-white/60">
            {{ a.title }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>