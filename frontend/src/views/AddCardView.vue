<script setup lang="ts">
/**
 * AddCardView — мастер добавления карты (роут /add-card).
 *
 * 3 шага: данные → дизайн → готово.
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, Camera, Calendar, CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()
const family = useFamilyStore()

// Состояние мастера (1 - данные, 2 - дизайн, 3 - готово)
const step = ref(1)
const cardNumber = ref('')
const cardExpiry = ref('')
const errorMsg = ref('')

// Выбор дизайна
const designs = [
  { id: 'emerald', label: 'Изумруд', style: 'radial-gradient(120% 140% at 78% 62%, #1a7a72 0%, #0f524c 28%, #0b3d39 52%, #082e2c 100%)' },
  { id: 'sunset', label: 'Закат', style: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)' },
  { id: 'sky', label: 'Небо', style: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
  { id: 'glass', label: 'Стекло', style: 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)' }
] as const

const goBack = () => {
  errorMsg.value = ''
  if (step.value > 1) {
    step.value--
  } else {
    router.push('/')
  }
}

// Автоматическое форматирование срока (ММ/ГГ)
const formatExpiry = (e: Event) => {
  errorMsg.value = ''
  let value = (e.target as HTMLInputElement).value.replace(/\D/g, '') // Только цифры

  // Если ввели месяц больше 12, сбрасываем
  if (value.length >= 2) {
    const month = parseInt(value.slice(0, 2))
    if (month > 12 || month === 0) {
      value = '12' // Автоматически ставим 12, если ввели бред
    }
  }

  // Форматируем со слэшем
  if (value.length > 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4)
  }

  cardExpiry.value = value
}

// Проверка данных (Шаг 1)
const validateAndNext = () => {
  const cleanNumber = cardNumber.value.replace(/\s/g, '')

  if (cleanNumber.length !== 16) {
    errorMsg.value = 'Номер карты должен содержать 16 цифр'
    return
  }

  if (cardExpiry.value.length !== 5) {
    errorMsg.value = 'Введите срок действия (ММ/ГГ)'
    return
  }

  const [monthStr, yearStr] = cardExpiry.value.split('/')
  const month = parseInt(monthStr || '0')
  const year = parseInt(yearStr || '0')

  if (month < 1 || month > 12) {
    errorMsg.value = 'Месяц должен быть от 01 до 12'
    return
  }

  if (year < 26) {
    errorMsg.value = 'Срок действия не может быть в прошлом'
    return
  }

  errorMsg.value = ''
  step.value = 2
}

// Выбор дизайна и завершение (Шаг 2)
const selectDesign = (id: 'emerald' | 'sunset' | 'sky' | 'glass') => {
  family.setCardDesign(id)
  step.value = 3 // Переходим к экрану "Готово"
}

// Завершение и возврат на главную
const finish = () => {
  family.addCard(family.cardDesign)
  family.setNotice('success', 'Новая карта успешно добавлена!')
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
        <h1 class="text-[17px] font-semibold">
          {{ step === 1 ? 'Добавление карты' : step === 2 ? 'Дизайн карты' : 'Готово' }}
        </h1>
        <p class="text-[12px] text-white/50">
          {{ step === 1 ? '«Карта 2»' : `Шаг ${step} из 3` }}
        </p>
      </div>
      <div class="w-7"></div>
    </header>

    <main class="px-5">
      <!-- ШАГ 1: ВВОД ДАННЫХ -->
      <div v-if="step === 1" class="space-y-6">
        <!-- Соглашение -->
        <div class="text-center mb-2">
          <a href="#" class="text-[13px] text-[#00A651] underline leading-tight">
            Соглашение о предоставлении Пользователю<br />(физическому лицу) услуги «М-Банкинг»
          </a>
        </div>

        <!-- Название карты -->
        <div>
          <label class="block text-[13px] text-white/50 mb-2">Название карты</label>
          <input
            type="text"
            value="Карта 2"
            class="w-full bg-[#1C1C1E] border border-white/10 rounded-xl p-4 text-[16px] text-white outline-none focus:border-[#00A651]"
          />
        </div>

        <!-- Способ добавления -->
        <div>
          <label class="block text-[13px] text-white/50 mb-2">Способ добавления карты</label>
          <div class="flex gap-2">
            <button class="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border bg-[#2C2C2E] border-[#00A651]">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              <span class="text-[13px] text-white text-center">Данные<br />банковской карты</span>
            </button>
            <button class="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border bg-[#1C1C1E] border-white/10">
              <svg class="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
              <span class="text-[13px] text-white/50 text-center">Пароль<br />SMS-Банкинга</span>
            </button>
          </div>
        </div>

        <div class="text-center">
          <a href="#" class="text-[13px] text-[#00A651] underline">
            Как добавить карту по данным карты
          </a>
        </div>

        <!-- Номер карты -->
        <div>
          <label class="block text-[13px] text-white/50 mb-2">Номер карты</label>
          <div class="relative">
            <input
              v-model="cardNumber"
              @input="errorMsg = ''"
              type="text"
              maxlength="19"
              placeholder="0000 0000 0000 0000"
              class="w-full bg-[#1C1C1E] border border-white/10 rounded-xl p-4 text-[16px] text-white outline-none focus:border-[#00A651] pr-12"
            />
            <Camera class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00A651]" />
          </div>
        </div>

        <!-- Срок действия -->
        <div>
          <label class="block text-[13px] text-white/50 mb-2">Срок действия</label>
          <div class="relative">
            <input
              v-model="cardExpiry"
              @input="formatExpiry"
              type="text"
              maxlength="5"
              placeholder="Введите"
              class="w-full bg-[#1C1C1E] border border-white/10 rounded-xl p-4 text-[16px] text-white outline-none focus:border-[#00A651] pr-12"
            />
            <Calendar class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00A651]" />
          </div>
        </div>

        <!-- БАГ №7: вывод ошибки -->
        <p v-if="errorMsg" class="text-red-400 text-[13px] text-center">
          {{ errorMsg }}
        </p>

        <div class="absolute bottom-0 left-0 right-0 p-5 bg-[#0A0A0A]/90 backdrop-blur-md border-t border-white/5 z-50">
          <button
            @click="validateAndNext"
            class="w-full py-4 rounded-xl font-semibold text-[16px] bg-[#00A651] text-white hover:bg-[#009448] transition-colors"
          >
            Далее
          </button>
        </div>
      </div>

      <!-- ШАГ 2: ВЫБОР ДИЗАЙНА -->
      <div v-if="step === 2" class="space-y-6">
        <p class="text-[14px] text-white/60 mb-4">Выберите, как будет выглядеть ваша новая карта:</p>

        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="d in designs"
            :key="d.id"
            @click="selectDesign(d.id)"
            class="cursor-pointer group"
          >
            <div
              class="h-28 rounded-2xl mb-2 transition-transform group-hover:scale-105 shadow-lg"
              :style="{ background: d.style }"
            ></div>
            <p class="text-[13px] font-medium text-white text-center">{{ d.label }}</p>
          </div>
        </div>
      </div>

      <!-- ШАГ 3: ГОТОВО -->
      <div v-if="step === 3" class="flex flex-col items-center justify-center pt-20">
        <CheckCircle2 class="w-24 h-24 text-[#00A651] mb-6" />
        <h2 class="text-2xl font-bold mb-2">Карта добавлена!</h2>
        <p class="text-white/50 text-center mb-8">Ваша новая карта уже доступна на главном экране.</p>

        <button
          @click="finish"
          class="w-full py-4 rounded-xl font-semibold text-[16px] bg-[#00A651] text-white hover:bg-[#009448] transition-colors"
        >
          На главную
        </button>
      </div>
    </main>
  </div>
</template>