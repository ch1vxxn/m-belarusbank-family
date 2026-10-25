<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, ArrowUpRight, Pause } from 'lucide-vue-next'

const router = useRouter()
const family = useFamilyStore()

const activeTab = ref('operations')

const tabRefs: Record<string, HTMLElement> = {}
const activeTabStyle = ref({ left: 0, width: 0 })

const setActiveTab = (id: string) => {
  activeTab.value = id
  nextTick(() => {
    const el = tabRefs[id]
    if (el) {
      activeTabStyle.value = { left: el.offsetLeft, width: el.offsetWidth }
    }
  })
}

onMounted(() => {
  setTimeout(() => {
    const el = tabRefs['operations']
    if (el) {
      activeTabStyle.value = { left: el.offsetLeft, width: el.offsetWidth }
    }
  }, 50)
})
</script>

<template>
  <div class="min-h-screen bg-[#0A0A0A] text-white font-sans pb-24">
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="router.push('/family')" class="text-white/80 hover:text-white">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      <h1 class="text-[17px] font-semibold">Профиль Миши</h1>
      <div class="w-7"></div>
    </header>

    <main class="px-5 mt-2">
      <!-- Карта -->
      <div class="relative overflow-hidden rounded-[22px] p-5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] bg-gradient-to-br from-[#006837] via-[#00A651] to-[#005226] mb-6">
        <div class="relative z-10">
          <div class="flex justify-between items-start mb-6">
            <p class="text-[13px] font-medium text-white/90">M-Belarusbank Family</p>
            <div class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
            </div>
          </div>
          <h2 class="text-2xl font-bold mb-4">Миша</h2>
          <div class="mb-6">
            <p class="text-[12px] text-white/70">На карте</p>
            <p class="text-3xl font-bold mt-0.5">{{ family.childBalanceFormatted }}</p>
          </div>
          <div class="flex justify-between items-end">
            <p class="text-[13px] text-white/80 font-mono">•• {{ family.card.maskedNumber.slice(-4) }}</p>
            <p class="text-[11px] text-white/70">10 лет • 7–13 лет • уровень 2</p>
          </div>
        </div>
      </div>

      <!-- Кнопки -->
      <div class="flex gap-3 mb-6">
        <button @click="router.push('/')" class="flex-[2] bg-[#00A651] text-white font-semibold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-[#009448] transition-colors">
          <ArrowUpRight class="w-5 h-5" /> Перевести
        </button>
        <button class="flex-1 bg-[#1C1C1E] text-white font-semibold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 border border-white/5 hover:bg-[#2C2C2E] transition-colors">
          <Pause class="w-5 h-5" />
          Пауза
        </button>
      </div>

      <!-- Табы -->
      <div class="relative flex bg-[#1C1C1E] p-1 rounded-xl mb-6 overflow-x-auto scrollbar-hide">
        <div class="absolute top-1 bottom-1 bg-[#00A651] rounded-lg transition-all duration-300 ease-out z-0" :style="{ left: activeTabStyle.left + 'px', width: activeTabStyle.width + 'px' }"></div>
        <button v-for="tab in [{ id: 'operations', label: 'Операции' }, { id: 'limits', label: 'Лимиты' }, { id: 'savings', label: 'Копилки' }, { id: 'tasks', label: 'Задания' }]" :key="tab.id" @click="setActiveTab(tab.id)" class="relative z-10 px-4 py-2 text-[13px] font-medium transition-colors duration-300 shrink-0" :class="activeTab === tab.id ? 'text-white' : 'text-white/60'" :ref="el => { if (el) tabRefs[tab.id] = el as HTMLElement }">
          {{ tab.label }}
        </button>
      </div>

      <!-- Контент вкладок -->
            <!-- Контент вкладок -->
      <div class="bg-[#1C1C1E] rounded-2xl p-4 shadow-sm">
        
        <!-- ОПЕРАЦИИ -->
        <div v-if="activeTab === 'operations'">
          <h2 class="text-[15px] font-semibold mb-1">Траты за октябрь</h2>
          <div class="flex justify-between items-center mb-4">
            <p class="text-3xl font-bold text-white">63,10 BYN</p>
            <div class="w-16 h-16 rounded-full" style="background: conic-gradient(#006837 0% 40%, #00A651 40% 70%, #E63946 70% 100%);"></div>
          </div>
          <p class="text-[13px] text-white/50 mb-4">Куда уходят деньги</p>
          <!-- Мини-карточки -->
          <div class="flex gap-3">
            <div class="flex-1 bg-[#2C2C2E] rounded-xl p-3">
              <p class="text-[16px] font-bold text-white">63,10 BYN</p>
              <p class="text-[12px] text-white/50">Расходы</p>
            </div>
            <div class="flex-1 bg-[#2C2C2E] rounded-xl p-3">
              <p class="text-[16px] font-bold text-white">63,00 BYN</p>
              <p class="text-[12px] text-white/50">Пополнения</p>
            </div>
          </div>
        </div>

        <!-- ЛИМИТЫ -->
        <div v-if="activeTab === 'limits'" class="space-y-6">
          <div>
            <p class="text-[13px] text-white/50 mb-3">Дневной лимит</p>
            <div class="flex gap-2">
              <button v-for="preset in [0, 50, 100, 200]" :key="preset" class="flex-1 py-3 rounded-xl text-[14px] font-medium bg-[#2C2C2E] text-white/60">{{ preset === 0 ? 'Нет' : preset + ' BYN' }}</button>
            </div>
          </div>
        </div>

        <!-- КОПИЛКИ -->
        <div v-if="activeTab === 'savings'" class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-[#00A651]/10 rounded-full flex items-center justify-center text-2xl">🚲</div>
            <div>
              <p class="text-[15px] font-semibold">{{ family.savingsGoal.title }}</p>
              <p class="text-[13px] text-white/50">{{ family.savingsGoal.current }} / {{ family.savingsGoal.target }} BYN</p>
            </div>
          </div>
          <!-- Прогресс-бар -->
          <div class="w-full bg-white/10 rounded-full h-2.5">
            <div class="bg-[#00A651] h-2.5 rounded-full" :style="{ width: family.goalProgress + '%' }"></div>
          </div>
          <button @click="router.push('/goal')" class="w-full mt-2 bg-[#2C2C2E] text-white py-3 rounded-xl font-medium text-[14px]">
            Перейти к копилке
          </button>
        </div>

        <!-- ЗАДАНИЯ -->
        <div v-if="activeTab === 'tasks'" class="space-y-3">
          <div v-for="chore in family.chores" :key="chore.id" class="flex items-center justify-between bg-[#2C2C2E] p-3 rounded-xl">
            <span class="text-[14px]" :class="chore.completed ? 'line-through text-white/50' : ''">{{ chore.title }}</span>
            <span class="text-[13px] font-semibold text-[#00A651]">+{{ chore.reward }} BYN</span>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>