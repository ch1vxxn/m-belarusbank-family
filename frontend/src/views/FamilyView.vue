<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, Lock, Unlock, Send, Settings } from 'lucide-vue-next'
import ChildAvatar from '@/components/ChildAvatar.vue'
import BankCard from '@/components/BankCard.vue'
import LimitSelector from '@/components/LimitSelector.vue'

const router = useRouter()
const family = useFamilyStore()

function goBack() {
  router.push('/')
}

function goToChildView() {
  router.push('/child')
}

const toggleBlock = () => {
  family.toggleCardActive()
}
</script>

<template>
  <div class="min-h-screen bg-[#0A0A0A] text-white font-sans pb-24">
    <!-- Шапка -->
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="goBack" class="text-white/80 hover:text-white">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      <h1 class="text-[17px] font-semibold">Моя семья</h1>
      <div class="w-7"></div>
    </header>

    <main class="px-5 space-y-6">
      <!-- Карточка ребенка -->
      <div class="flex items-center justify-between bg-[#1C1C1E] rounded-2xl p-4">
        <div class="flex items-center gap-3">
          <ChildAvatar :initials="family.child.initials" :size="48" />
          <div>
            <p class="text-[16px] font-semibold">{{ family.child.name }}</p>
            <p class="text-[13px] text-white/50">{{ family.child.age }} лет</p>
          </div>
        </div>
        <!-- Кнопка "Посмотреть глазами ребенка" -->
        <button @click="goToChildView" class="text-[12px] bg-[#00A651]/15 text-[#00A651] px-3 py-1.5 rounded-lg font-medium">
          Профиль Миши
        </button>
      </div>

      <!-- Карта ребенка -->
      <BankCard
        :masked-number="family.card.maskedNumber"
        :balance="family.cardBalanceFormatted"
        :payment-system="family.card.paymentSystem"
        :is-active="family.card.isActive"
        title="Детская карта"
        subtitle="Основная"
      />

      <!-- Кнопка блокировки -->
      <button 
        @click="toggleBlock"
        class="w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-colors"
        :class="family.card.isActive ? 'border-red-400/30 text-red-400 hover:bg-red-400/10' : 'border-[#00A651]/30 text-[#00A651] hover:bg-[#00A651]/10'"
      >
        <Lock v-if="family.card.isActive" class="w-5 h-5" />
        <Unlock v-else class="w-5 h-5" />
        {{ family.card.isActive ? 'Заблокировать карту' : 'Разблокировать карту' }}
      </button>

      <!-- Перевод денег -->
      <section>
        <h2 class="text-[15px] font-semibold mb-3">Перевести деньги</h2>
        <div class="bg-[#1C1C1E] rounded-2xl p-4 flex gap-3">
           <button class="flex-1 bg-[#00A651] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
             <Send class="w-4 h-4" /> 10 BYN
           </button>
           <button class="flex-1 bg-[#00A651] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
             <Send class="w-4 h-4" /> 50 BYN
           </button>
        </div>
      </section>

      <!-- Лимиты -->
      <section class="bg-[#1C1C1E] rounded-2xl p-4 space-y-4">
        <h2 class="text-[15px] font-semibold flex items-center gap-2">
          <Settings class="w-4 h-4 text-white/50" /> Лимиты
        </h2>
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
      </section>
    </main>
  </div>
</template>