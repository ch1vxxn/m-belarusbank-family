<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, Bike, CheckCircle, Circle } from 'lucide-vue-next'
import ChildAvatar from '@/components/ChildAvatar.vue'
import BankCard from '@/components/BankCard.vue'

const router = useRouter()
const family = useFamilyStore()

function goBack() {
  router.push('/family') // Возвращаемся в кабинет родителя
}

function openGoal() {
  router.push('/goal')
}
</script>

<template>
  <div class="min-h-screen bg-[#121212] text-white font-sans pb-10">
    <!-- Шапка детского профиля -->
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="goBack" class="text-white/80 hover:text-white">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      <h1 class="text-[17px] font-semibold">Профиль Миши</h1>
      <div class="w-7"></div>
    </header>

    <main class="px-5 space-y-6">
      <!-- Приветствие -->
      <div class="flex items-center gap-3">
        <ChildAvatar :initials="family.child.initials" :size="56" />
        <div>
          <p class="text-[22px] font-bold">Привет, {{ family.child.name }}!</p>
          <p class="text-[13px] text-white/50">Твои карманные деньги</p>
        </div>
      </div>

      <!-- Баланс и карта -->
      <div class="text-center">
        <p class="text-[40px] font-extrabold text-[#00A651]">{{ family.cardBalanceFormatted }}</p>
      </div>
      
      <BankCard
        :masked-number="family.card.maskedNumber"
        balance=""
        :payment-system="family.card.paymentSystem"
        :is-active="family.card.isActive"
        title="Моя карта"
        subtitle="Кактус BYN"
      />

      <!-- Копилка -->
      <div @click="openGoal" class="bg-[#1C1C1E] rounded-2xl p-5 cursor-pointer hover:bg-[#2C2C2E] transition-colors">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#00A651]/15 flex items-center justify-center">
              <Bike class="w-5 h-5 text-[#00A651]" />
            </div>
            <div>
              <p class="text-[15px] font-semibold">{{ family.savingsGoal.title }}</p>
              <p class="text-[12px] text-white/50">Моя цель</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-[16px] font-bold text-[#00A651]">{{ family.savingsGoal.current }} / {{ family.savingsGoal.target }} BYN</p>
            <p class="text-[11px] text-white/50">{{ family.goalProgress }}%</p>
          </div>
        </div>
        <!-- Прогресс-бар -->
        <div class="w-full bg-white/10 rounded-full h-2.5">
          <div class="bg-[#00A651] h-2.5 rounded-full transition-all duration-500" :style="{ width: family.goalProgress + '%' }"></div>
        </div>
      </div>

      <!-- Задания -->
      <section>
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-[15px] font-semibold">Задания</h2>
          <p class="text-[13px] text-white/50">{{ family.completedChoreCount }} / {{ family.chores.length }}</p>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="chore in family.chores" 
            :key="chore.id"
            class="flex items-center justify-between bg-[#1C1C1E] p-4 rounded-xl transition"
            :class="chore.completed ? 'opacity-50' : ''"
          >
            <div class="flex items-center gap-3">
              <button 
                @click="family.completeChore(chore.id)"
                :disabled="chore.completed"
                class="text-[#00A651]"
              >
                <CheckCircle v-if="chore.completed" class="w-6 h-6" />
                <Circle v-else class="w-6 h-6 text-white/30" />
              </button>
              <span class="text-[15px]" :class="chore.completed ? 'line-through text-white/50' : 'text-white'">
                {{ chore.title }}
              </span>
            </div>
            <span class="text-[14px] font-semibold text-[#00A651]">+{{ chore.reward }} BYN</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>