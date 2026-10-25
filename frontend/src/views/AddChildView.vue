<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft } from 'lucide-vue-next'
import type { AgeGroup } from '@/types'

const router = useRouter()
const family = useFamilyStore()

const name = ref('')
const ageGroup = ref<AgeGroup>('7-13')
const errorMsg = ref('')

function goBack() {
  router.push('/family')
}

function submit() {
  if (!name.value.trim()) {
    errorMsg.value = 'Введите имя ребёнка'
    return
  }
  
  const age = ageGroup.value === '7-13' ? 10 : 15
  const parts = name.value.trim().split(' ')
  const initials = parts.map(p => p[0]?.toUpperCase() || '').join('').slice(0, 2)

  const ok = family.addChild({
    name: name.value.trim(),
    age,
    ageGroup: ageGroup.value,
    initials: initials || 'Р'
  })

  if (ok) {
    router.push('/family')
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0A0A0A] text-white font-sans pb-10">
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="goBack" class="text-white/80 hover:text-white">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      <h1 class="text-[17px] font-semibold">Добавление ребёнка</h1>
      <div class="w-7"></div>
    </header>

    <main class="px-5 mt-4 space-y-6">
      <div>
        <label class="block text-[13px] text-white/50 mb-2">Имя ребёнка</label>
        <input 
          v-model="name" 
          @input="errorMsg = ''"
          type="text" 
          placeholder="Например, Саша"
          class="w-full bg-[#1C1C1E] border border-white/10 rounded-xl p-4 text-[16px] text-white outline-none focus:border-[#00A651]"
        >
      </div>

      <div>
        <label class="block text-[13px] text-white/50 mb-2">Возрастная группа</label>
        <div class="flex gap-2">
          <button 
            @click="ageGroup = '7-13'"
            class="flex-1 py-3 rounded-xl border transition-colors text-[14px] font-medium"
            :class="ageGroup === '7-13' ? 'bg-[#00A651] border-[#00A651] text-white' : 'bg-[#1C1C1E] border-white/10 text-white/60'"
          >
            7–13 лет
          </button>
          <button 
            @click="ageGroup = '14-17'"
            class="flex-1 py-3 rounded-xl border transition-colors text-[14px] font-medium"
            :class="ageGroup === '14-17' ? 'bg-[#00A651] border-[#00A651] text-white' : 'bg-[#1C1C1E] border-white/10 text-white/60'"
          >
            14–17 лет
          </button>
        </div>
        <p class="text-[11px] text-white/40 mt-2">
          Для 14–17 лет автоматически откроются онлайн-покупки, переводы друзьям и повышенные лимиты.
        </p>
      </div>

      <p v-if="errorMsg" class="text-red-400 text-[13px] text-center">{{ errorMsg }}</p>

      <button 
        @click="submit"
        class="w-full bg-[#00A651] text-white font-semibold py-4 rounded-xl hover:bg-[#009448] transition-colors mt-4"
      >
        Выпустить карту и добавить
      </button>
    </main>
  </div>
</template>