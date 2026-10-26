<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { X, ArrowRight, Check, User } from 'lucide-vue-next'
import type { AgeGroup } from '@/types'

const router = useRouter()
const family = useFamilyStore()

const step = ref(1)
const name = ref('')
const birthDate = ref('')
const isCardOrdered = ref(true)
const isAgreed = ref(false)

const calculatedAge = computed(() => {
  if (!birthDate.value) return 0
  const birth = new Date(birthDate.value)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
})

const ageGroup = computed<AgeGroup>(() => (calculatedAge.value >= 14 ? '14-17' : '7-13'))

function close() { router.push('/family') }

function nextStep() {
  if (step.value === 1) {
    if (!name.value.trim() || !birthDate.value) {
      family.setNotice('error', 'Заполните имя и дату рождения')
      return
    }
    if (calculatedAge.value < 7 || calculatedAge.value > 17) {
      family.setNotice('error', 'Возраст ребёнка должен быть от 7 до 17 лет')
      return
    }
  }
  if (step.value < 3) step.value++
}

function prevStep() { if (step.value > 1) step.value-- }

function submit() {
  if (!isAgreed.value) {
    family.setNotice('error', 'Необходимо согласие на обработку данных')
    return
  }
  const parts = name.value.trim().split(' ')
  const initials = parts.map(p => p[0]?.toUpperCase() || '').join('').slice(0, 2)

  family.addChild({
    name: name.value.trim(),
    age: calculatedAge.value,
    ageGroup: ageGroup.value,
    initials: initials || 'Р'
  })
  step.value = 4
}
</script>

<template>
  <div class="min-h-screen text-black dark:text-white font-sans pb-10 relative overflow-hidden transition-colors duration-300">
    
    <!-- Шапка -->
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="close" class="w-10 h-10 bg-black/5 dark:bg-[#1C1C1E] rounded-full flex items-center justify-center text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors">
        <X class="w-5 h-5" stroke-width="2" />
      </button>
      <h1 class="text-[17px] font-semibold">Пакет Family</h1>
      <button 
        v-if="step > 1 && step < 4" 
        @click="prevStep"
        class="text-[#00A651] text-[15px] font-medium"
      >
        Назад
      </button>
      <div v-else class="w-10"></div>
    </header>

    <main class="px-5 mt-2">
      
      <!-- Прогресс-бар -->
      <div v-if="step < 4" class="bg-white dark:bg-[#1C1C1E] shadow-sm rounded-3xl p-5 mb-6 border border-black/5 dark:border-transparent transition-colors">
        <div class="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 mb-4 overflow-hidden">
          <div 
            class="bg-[#00A651] h-1.5 rounded-full transition-all duration-300"
            :style="{ width: (step / 3) * 100 + '%' }"
          ></div>
        </div>
        <p class="text-[12px] text-black/50 dark:text-white/50">Шаг {{ step }} из 3</p>
      </div>

      <!-- ШАГ 1 -->
      <div v-if="step === 1" class="space-y-6 animate-fade-in">
        <h2 class="text-[22px] font-bold">О ребёнке</h2>
        
        <div class="bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-sm border border-black/5 dark:border-transparent transition-colors">
          <div class="border-b border-black/5 dark:border-white/5">
            <input 
              v-model="name" 
              type="text" 
              placeholder="Имя ребёнка"
              class="w-full bg-transparent p-4 text-[16px] outline-none placeholder:text-black/30 dark:placeholder:text-white/30"
            />
          </div>
          <div class="flex items-center justify-between p-4">
            <span class="text-[16px]">Дата рождения</span>
            <input 
              v-model="birthDate" 
              type="date" 
              class="bg-black/5 dark:bg-[#2C2C2E] px-3 py-1.5 rounded-lg outline-none border border-transparent dark:border-white/10"
            />
          </div>
        </div>
      </div>

      <!-- ШАГ 2 -->
      <div v-if="step === 2" class="space-y-6 animate-fade-in">
        <h2 class="text-[22px] font-bold text-black/50 dark:text-white/50">Возрастной профиль</h2>
        
        <div class="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-sm transition-colors">
          <div class="flex items-center gap-3 mb-4">
            <User class="w-6 h-6 text-[#00A651]" />
            <h3 class="text-[17px] font-bold">{{ ageGroup === '14-17' ? '14–17 лет' : '7–13 лет' }}</h3>
          </div>
          
          <div class="space-y-4 text-[14px] text-black/60 dark:text-white/60 leading-relaxed">
            <p>Дополнительная карта к счёту законного представителя. Лимиты и покупки контролирует родитель.</p>
            <div class="h-px w-full bg-black/5 dark:bg-white/5"></div>
            <p>Профиль выбран по дате рождения ({{ calculatedAge }} лет). Лимиты и категории можно уточнить после оформления.</p>
          </div>
        </div>
      </div>

      <!-- ШАГ 3 -->
      <div v-if="step === 3" class="space-y-6 animate-fade-in">
        <h2 class="text-[22px] font-bold text-black/50 dark:text-white/50">Карта и согласия</h2>
        
        <div class="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 space-y-5 border border-black/5 dark:border-white/5 shadow-sm transition-colors">
          <!-- Заказ карты -->
          <div class="flex items-center justify-between">
            <span class="text-[15px] pr-4">Заказать пластиковую карту</span>
            <div 
              @click="isCardOrdered = !isCardOrdered"
              class="w-12 h-7 rounded-full relative cursor-pointer transition-colors shrink-0"
              :class="isCardOrdered ? 'bg-[#00A651]' : 'bg-black/20 dark:bg-white/20'"
            >
              <div 
                class="w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all"
                :class="isCardOrdered ? 'right-1' : 'left-1'"
              ></div>
            </div>
          </div>
          
          <div class="h-px w-full bg-black/5 dark:bg-white/5"></div>

          <!-- Согласие -->
          <div class="flex items-center justify-between">
            <span class="text-[15px] pr-4 leading-snug">Принимаю условия пакета и даю согласие на обработку данных и доступ ребёнка</span>
            <div 
              @click="isAgreed = !isAgreed"
              class="w-12 h-7 rounded-full relative cursor-pointer transition-colors shrink-0"
              :class="isAgreed ? 'bg-[#00A651]' : 'bg-black/20 dark:bg-white/20'"
            >
              <div 
                class="w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all"
                :class="isAgreed ? 'right-1' : 'left-1'"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ШАГ 4 -->
      <div v-if="step === 4" class="flex flex-col items-center justify-center pt-20 animate-fade-in">
        <div class="w-24 h-24 bg-[#00A651]/10 rounded-full flex items-center justify-center mb-6">
          <Check class="w-12 h-12 text-[#00A651]" stroke-width="2" />
        </div>
        <h2 class="text-2xl font-bold mb-2">Пакет оформлен!</h2>
        <p class="text-black/50 dark:text-white/50 text-center mb-8">
          {{ name }} добавлен(а) в семейный банкинг.<br>Карта уже в пути!
        </p>
        <button 
          @click="close"
          class="w-full py-4 rounded-xl font-semibold text-[16px] bg-[#00A651] text-white hover:bg-[#009448] transition-colors"
        >
          На главную
        </button>
      </div>

    </main>

    <!-- Кнопка "Далее" -->
    <div 
      v-if="step < 4" 
      class="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md border-t border-black/5 dark:border-white/5 px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] transition-colors"
    >
      <button 
        v-if="step < 3"
        @click="nextStep"
        class="w-full max-w-[390px] mx-auto py-4 rounded-xl font-semibold text-[16px] bg-[#00A651] text-white flex items-center justify-center gap-2 hover:bg-[#009448] transition-colors"
      >
        Далее <ArrowRight class="w-5 h-5" />
      </button>
      
      <button 
        v-if="step === 3"
        @click="submit"
        :disabled="!isAgreed"
        class="w-full max-w-[390px] mx-auto py-4 rounded-xl font-semibold text-[16px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        :class="isAgreed ? 'bg-[#00A651] text-white hover:bg-[#009448]' : 'bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/40'"
      >
        <Check class="w-5 h-5" /> Оформить пакет
      </button>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>