<script setup lang="ts">
import { ref } from 'vue'
import { useFamilyStore } from '@/stores/family'
import BankCard from '@/components/BankCard.vue'
import AddCard from '@/components/AddCard.vue'
import NoticeBanner from '@/components/NoticeBanner.vue'
import ChildAvatar from '@/components/ChildAvatar.vue'
import { Star, ChevronRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const family = useFamilyStore()

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
}
</script>

<template>
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
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>