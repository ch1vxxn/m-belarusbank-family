<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, CreditCard, MessageSquare, Camera, Calendar } from 'lucide-vue-next'

const router = useRouter()
const family = useFamilyStore()

const cardNumber = ref('')
const cardExpiry = ref('')
const activeTab = ref('card')

const goBack = () => router.push('/')

// Проверяем, заполнены ли поля
const isFormValid = computed(() => {
  const cleanNumber = cardNumber.value.replace(/\s/g, '')
  return cleanNumber.length >= 16 && cardExpiry.value.length >= 5
})

const handleNext = () => {
  if (!isFormValid.value) return

  family.notice = { kind: 'success', text: 'Карта 2 успешно добавлена!' }
  setTimeout(() => family.clearNotice(), 3000)
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-[#0A0A0A] text-white font-sans pb-10 relative">
    <!-- Шапка -->
    <header class="flex items-center justify-between px-5 pt-8 pb-6">
      <button @click="goBack" class="text-white/80 hover:text-white">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      <div class="text-center">
        <h1 class="text-[17px] font-semibold">Добавление карты</h1>
        <p class="text-[12px] text-white/50">«Карта 2»</p>
      </div>
      <div class="w-7"></div>
    </header>

    <!-- Контент (добавили pb-32, чтобы кнопка не перекрывала поля) -->
    <main class="px-5 space-y-6 pb-32">
      
      <!-- Соглашение -->
      <div class="text-center">
        <a href="#" class="text-[13px] text-[#00A651] underline leading-tight">Соглашение о предоставлении Пользователю (физическому лицу) услуги «М-Банкинг»</a>
      </div>

      <!-- Название -->
      <div>
        <label class="block text-[13px] text-white/50 mb-2">Название карты</label>
        <input type="text" value="Карта 2" class="w-full bg-[#1C1C1E] border border-white/10 rounded-xl p-4 text-[16px] text-white outline-none focus:border-[#00A651]">
      </div>

      <!-- Способ добавления -->
      <div>
        <label class="block text-[13px] text-white/50 mb-2">Способ добавления карты</label>
        <div class="flex gap-2">
          <button 
            @click="activeTab = 'card'"
            class="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-colors"
            :class="activeTab === 'card' ? 'bg-[#2C2C2E] border-[#00A651]' : 'bg-[#1C1C1E] border-white/10'"
          >
            <CreditCard class="w-6 h-6" :class="activeTab === 'card' ? 'text-white' : 'text-white/50'" />
            <span class="text-[13px] text-center" :class="activeTab === 'card' ? 'text-white' : 'text-white/50'">Данные<br>банковской карты</span>
          </button>
          
          <button 
            @click="activeTab = 'sms'"
            class="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-colors"
            :class="activeTab === 'sms' ? 'bg-[#2C2C2E] border-[#00A651]' : 'bg-[#1C1C1E] border-white/10'"
          >
            <MessageSquare class="w-6 h-6" :class="activeTab === 'sms' ? 'text-white' : 'text-white/50'" />
            <span class="text-[13px] text-center" :class="activeTab === 'sms' ? 'text-white' : 'text-white/50'">Пароль<br>SMS-Банкинга</span>
          </button>
        </div>
      </div>

      <!-- Поля для ввода (если выбран способ "по данным карты") -->
      <div v-if="activeTab === 'card'" class="space-y-6">
        <a href="#" class="block text-center text-[13px] text-[#00A651] underline">Как добавить карту по данным карты</a>

        <!-- Номер карты -->
        <div>
          <label class="block text-[13px] text-white/50 mb-2">Номер карты</label>
          <div class="relative">
            <input 
              v-model="cardNumber"
              type="text" 
              placeholder="0000 0000 0000 0000" 
              class="w-full bg-[#1C1C1E] border border-white/10 rounded-xl p-4 text-[16px] text-white outline-none focus:border-[#00A651] pr-12"
            >
            <Camera class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00A651]" />
          </div>
        </div>

        <!-- Срок действия -->
        <div>
          <label class="block text-[13px] text-white/50 mb-2">Срок действия карты</label>
          <div class="relative">
            <input 
              v-model="cardExpiry"
              type="text" 
              placeholder="ММ/ГГ" 
              class="w-full bg-[#1C1C1E] border border-white/10 rounded-xl p-4 text-[16px] text-white outline-none focus:border-[#00A651] pr-12"
            >
            <Calendar class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00A651]" />
          </div>
        </div>
      </div>

    </main>

    <!-- Кнопка Далее -->
    <div class="absolute bottom-0 left-0 right-0 p-5 bg-[#0A0A0A]/90 backdrop-blur-md border-t border-white/5 z-50">
      <button 
        @click="handleNext"
        :disabled="!isFormValid"
        class="w-full py-4 rounded-xl font-semibold text-[16px] transition-colors shadow-lg"
        :class="isFormValid 
          ? 'bg-[#00A651] text-white hover:bg-[#009448] shadow-[#00A651]/20' 
          : 'bg-white/10 text-white/30 cursor-not-allowed shadow-none'"
      >
        Далее
      </button>
    </div>
  </div>
</template>