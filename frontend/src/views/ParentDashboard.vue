<script setup lang="ts">
import { ref } from 'vue'
import { useFamilyStore } from '@/stores/family'
import BankCard from '@/components/BankCard.vue'
import AddCard from '@/components/AddCard.vue'
import ChildAvatar from '@/components/ChildAvatar.vue'
import { Star, ChevronRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const family = useFamilyStore()
const isBalanceHidden = ref(false)
const toggleBalance = () => { isBalanceHidden.value = !isBalanceHidden.value }
const isRefreshing = ref(false)

const refreshData = async () => {
  isRefreshing.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  isRefreshing.value = false
  family.setNotice('success', 'Данные обновлены')
}

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const index = Math.round(target.scrollLeft / (target.clientWidth + 16))
  family.setCurrentCardIndex(index)
}

const showDev = () => family.setNotice('error', 'Раздел в разработке')
</script>

<template>
  <div class="min-h-screen text-black dark:text-white pb-24 font-sans relative bg-transparent transition-colors duration-300">
    <div class="relative z-10">
      <header class="flex items-center justify-between px-5 pt-8 pb-4">
        <div class="w-8"></div>
        <h1 class="text-[17px] font-semibold tracking-wide">M-Belarusbank</h1>
        <RouterLink to="/notifications" class="text-black dark:text-white relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
          <span v-if="family.notifications.some(n => !n.isRead)" class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </RouterLink>
      </header>

    

      <main class="px-5 space-y-5 pt-2">
        <section>
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-[15px] font-semibold">Карты</h2>
            <button @click="showDev" class="text-[13px] text-black/60 dark:text-white/80 flex items-center gap-1">Все <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
          </div>

          <div class="flex overflow-x-auto snap-x snap-mandatory gap-4 scrollbar-hide -mx-5 px-5 pb-4" @scroll="handleScroll">
            <div v-for="card in family.cards" :key="card.id" class="snap-center shrink-0 w-[calc(100vw-40px)] md:w-[350px]">
              <BankCard
                :masked-number="card.maskedNumber"
                :balance="card.balance.toFixed(2) + ' BYN'"
                :payment-system="card.paymentSystem"
                :is-active="card.isActive"
                :title="card.title"
                :subtitle="card.subtitle"
                :design="card.design"
                :is-balance-hidden="isBalanceHidden"
                :is-refreshing="isRefreshing"
                @toggle-balance="toggleBalance"
                @refresh="refreshData"
              />
            </div>
            <div class="snap-center shrink-0 w-[calc(100vw-40px)] md:w-[350px]">
              <AddCard />
            </div>
          </div>

          <div class="flex justify-center gap-2 mt-2">
            <div v-for="(card, index) in [...family.cards, { id: 'add' }]" :key="card.id" class="w-1.5 h-1.5 rounded-full transition-colors" :class="family.currentCardIndex === index ? 'bg-black dark:bg-white' : 'bg-black/20 dark:bg-white/20'"></div>
          </div>
        </section>

        <section>
          <RouterLink to="/family" class="flex items-center justify-between rounded-2xl bg-white dark:bg-[#1C1C1E]/80 shadow-sm dark:shadow-none p-4 border border-black/5 dark:border-white/5 transition-colors">
            <div class="flex items-center gap-3">
              <ChildAvatar :initials="family.child.initials as string" :size="48" />
              <div>
                <p class="text-[15px] font-medium">Моя семья</p>
                <p class="text-[13px] text-black/50 dark:text-white/50">{{ family.child.name as string }}, {{ family.child.age }} лет</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-black/40 dark:text-white/40" />
          </RouterLink>
        </section>

        <section class="rounded-2xl bg-white dark:bg-[#1C1C1E]/80 shadow-sm dark:shadow-none p-5 border border-black/5 dark:border-white/5 transition-colors">
          <h2 class="text-[15px] font-semibold mb-8">Избранные платежи</h2>
          <div class="flex flex-col items-center justify-center text-black/30 dark:text-white/30 pb-2">
            <div class="relative mb-3">
               <svg class="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
               <div class="absolute -bottom-1 -right-1 bg-white dark:bg-[#1C1C1E] rounded-full p-1"><Star class="w-5 h-5 text-black/40 dark:text-white/40" /></div>
            </div>
            <p class="text-[13px]">Информация не найдена</p>
          </div>
        </section>

        <section class="rounded-2xl bg-white dark:bg-[#1C1C1E]/80 shadow-sm dark:shadow-none p-5 border border-black/5 dark:border-white/5 transition-colors">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-[15px] font-semibold">Карты лояльности</h2>
            <button @click="showDev" class="text-[13px] text-black/60 dark:text-white/80 flex items-center gap-1">Все <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
          </div>
          <div @click="showDev" class="w-16 h-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <span class="text-black/40 dark:text-white/40 text-xl">+</span>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>