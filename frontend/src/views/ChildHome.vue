<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Pause, Play, Bike } from 'lucide-vue-next'

const router = useRouter()
const family = useFamilyStore()

// Состояние активной вкладки
const activeTab = ref('operations')

// Шторка перевода
const isTransferModalOpen = ref(false)
const transferAmount = ref(10)

const openTransferModal = () => {
  transferAmount.value = 10
  isTransferModalOpen.value = true
}

const executeTransfer = async () => {
  family.transfer(transferAmount.value)
  isTransferModalOpen.value = false
}

// --- ЛОГИКА ПЕРЕЕЗЖАЮЩЕЙ ПЛАШКИ ---
const tabRefs: Record<string, HTMLElement> = {}
const activeTabStyle = ref({ left: 0, width: 0 })

const setActiveTab = (id: string) => {
  activeTab.value = id
  nextTick(() => {
    const el = tabRefs[id]
    if (el) {
      activeTabStyle.value = {
        left: el.offsetLeft,
        width: el.offsetWidth
      }
    }
  })
}

onMounted(() => {
  setTimeout(() => {
    const el = tabRefs['operations']
    if (el) {
      activeTabStyle.value = {
        left: el.offsetLeft,
        width: el.offsetWidth
      }
    }
  }, 50)
})
</script>

<template>
  <div class="min-h-screen bg-[#0A0A0A] text-white font-sans pb-24">
    
    <!-- Шапка -->
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="router.push('/family')" class="text-white/80 hover:text-white">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      <h1 class="text-[17px] font-semibold">Профиль Миши</h1>
      <div class="w-7"></div>
    </header>

    <main class="px-5 mt-2">
      <!-- КАСТОМНАЯ КАРТОЧКА С ТЕКСТУРОЙ СОТ -->
      <div class="relative overflow-hidden rounded-[22px] p-5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] bg-gradient-to-br from-[#006837] via-[#00A651] to-[#005226] mb-6">
        <svg class="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hex" width="28" height="48.5" patternUnits="userSpaceOnUse" patternTransform="scale(1.15)">
              <path d="M14 0 L28 8.5 L28 25.5 L14 34 L0 25.5 L0 8.5 Z" fill="none" stroke="#7ec8c0" stroke-width="0.9" />
              <path d="M14 34 L28 42.5 L28 59.5 L14 68 L0 59.5 L0 42.5 Z" fill="none" stroke="#7ec8c0" stroke-width="0.9" transform="translate(14, 0)" />
            </pattern>
            <radialGradient id="hexFade" cx="65%" cy="40%" r="70%">
              <stop offset="0%" stop-color="white" stop-opacity="1" />
              <stop offset="55%" stop-color="white" stop-opacity="0.55" />
              <stop offset="100%" stop-color="white" stop-opacity="0" />
            </radialGradient>
            <mask id="hexMask">
              <rect width="100%" height="100%" fill="url(#hexFade)" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex)" mask="url(#hexMask)" />
        </svg>

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
        <button @click="openTransferModal" class="flex-[2] bg-[#00A651] text-white font-semibold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-[#009448] transition-colors">
          <ArrowUpRight class="w-5 h-5" /> Перевести
        </button>
        <button @click="family.toggleCardActive()" class="flex-1 bg-[#1C1C1E] text-white font-semibold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 border border-white/5 hover:bg-[#2C2C2E] transition-colors">
          <Pause v-if="family.card.isActive" class="w-5 h-5" />
          <Play v-else class="w-5 h-5" />
          {{ family.card.isActive ? 'Пауза' : 'Включить' }}
        </button>
      </div>

      <!-- ЕДИНЫЙ КОНТЕЙНЕР С ТАБАМИ И КОНТЕНТОМ -->
      <div class="bg-[#1C1C1E] rounded-2xl p-4 shadow-sm">
        
        <!-- Табы с переезжающим индикатором -->
        <div class="relative flex bg-[#1C1C1E] p-1 rounded-xl mb-6 overflow-x-auto scrollbar-hide">
          
          <!-- Зеленая плашка (переезжает) -->
          <div 
            class="absolute top-1 bottom-1 bg-[#00A651] rounded-lg transition-all duration-300 ease-out z-0"
            :style="{
              left: activeTabStyle.left + 'px',
              width: activeTabStyle.width + 'px'
            }"
          ></div>

          <!-- Кнопки -->
          <button 
            v-for="tab in [
              { id: 'operations', label: 'Операции' },
              { id: 'limits', label: 'Лимиты' },
              { id: 'savings', label: 'Копилки' },
              { id: 'tasks', label: 'Задания' }
            ]" 
            :key="tab.id"
            @click="setActiveTab(tab.id)"
            class="relative z-10 px-4 py-2 text-[13px] font-medium transition-colors duration-300 shrink-0"
            :class="activeTab === tab.id ? 'text-white' : 'text-white/60'"
            :ref="el => { if (el) tabRefs[tab.id] = el as HTMLElement }"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- КОНТЕНТ ВКЛАДКИ: ОПЕРАЦИИ -->
        <div v-if="activeTab === 'operations'">
          <h2 class="text-[15px] font-semibold mb-1">Траты за октябрь</h2>
          <div class="flex justify-between items-center mb-4">
            <p class="text-3xl font-bold text-white">63,10 BYN</p>
            <div class="w-16 h-16 rounded-full" style="background: conic-gradient(#006837 0% 40%, #00A651 40% 70%, #E63946 70% 100%);"></div>
          </div>
          <p class="text-[13px] text-white/50 mb-4">Куда уходят деньги</p>
          
          <div class="flex gap-3">
            <div class="flex-1 bg-[#2C2C2E] rounded-xl p-3">
              <div class="flex justify-between items-center text-[#00A651] mb-1">
                <ArrowUpRight class="w-4 h-4" />
                <div class="w-4 h-0.5 bg-white/20"></div>
              </div>
              <p class="text-[16px] font-bold text-white">63,10 BYN</p>
              <p class="text-[12px] text-white/50">Расходы</p>
            </div>
            <div class="flex-1 bg-[#2C2C2E] rounded-xl p-3">
              <div class="flex justify-between items-center text-[#00A651] mb-1">
                <ArrowDownLeft class="w-4 h-4" />
                <div class="w-4 h-0.5 bg-white/20"></div>
              </div>
              <p class="text-[16px] font-bold text-white">63,00 BYN</p>
              <p class="text-[12px] text-white/50">Пополнения</p>
            </div>
          </div>
        </div>

        <!-- КОНТЕНТ ВКЛАДКИ: ЛИМИТЫ -->
        <div v-if="activeTab === 'limits'" class="space-y-6">
          <div>
            <p class="text-[13px] text-white/50 mb-3">Дневной лимит</p>
            <div class="flex gap-2">
              <button 
                v-for="preset in [0, 50, 100, 200]" :key="preset"
                @click="family.setDailyLimit(preset)"
                class="flex-1 py-3 rounded-xl text-[14px] font-medium transition-colors"
                :class="family.limits.dailyLimit === preset ? 'bg-[#00A651] text-white' : 'bg-[#2C2C2E] text-white/60'"
              >
                {{ preset === 0 ? 'Нет' : preset + ' BYN' }}
              </button>
            </div>
          </div>

          <div>
            <p class="text-[13px] text-white/50 mb-3">Недельный лимит</p>
            <div class="flex gap-2">
              <button 
                v-for="preset in [0, 50, 100, 200]" :key="preset"
                @click="family.setWeeklyLimit(preset)"
                class="flex-1 py-3 rounded-xl text-[14px] font-medium transition-colors"
                :class="family.limits.weeklyLimit === preset ? 'bg-[#00A651] text-white' : 'bg-[#2C2C2E] text-white/60'"
              >
                {{ preset === 0 ? 'Нет' : preset + ' BYN' }}
              </button>
            </div>
          </div>

          <div class="pt-4 border-t border-white/10">
            <p class="text-[13px] text-white/50 mb-3">Разрешённые категории</p>
            <div class="space-y-2">
              <div v-for="cat in family.spendingCategories" :key="cat.id" class="flex items-center justify-between py-2">
                <span class="text-[15px]" :class="cat.isAllowed ? 'text-white' : 'text-white/40'">{{ cat.label }}</span>
                <div @click="family.toggleSpendingCategory(cat.id)" class="w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300" :class="cat.isAllowed ? 'bg-[#00A651]' : 'bg-white/10'">
                  <div class="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-300" :class="cat.isAllowed ? 'right-0.5' : 'left-0.5'"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- КОНТЕНТ ВКЛАДКИ: КОПИЛКИ -->
        <div v-if="activeTab === 'savings'">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-[#00A651]/10 rounded-full flex items-center justify-center text-2xl">🚲</div>
            <div>
              <p class="text-[15px] font-semibold">{{ family.savingsGoal.title }}</p>
              <p class="text-[13px] text-white/50">{{ family.savingsGoal.current }} / {{ family.savingsGoal.target }} BYN</p>
            </div>
          </div>
          <div class="w-full bg-white/10 rounded-full h-3 mb-2">
            <div class="bg-[#00A651] h-3 rounded-full" :style="{ width: family.goalProgress + '%' }"></div>
          </div>
          <button @click="router.push('/goal')" class="w-full mt-4 bg-[#2C2C2E] text-white py-3 rounded-xl font-medium text-[14px]">Перейти к копилке</button>
        </div>

        <!-- КОНТЕНТ ВКЛАДКИ: ЗАДАНИЯ -->
        <div v-if="activeTab === 'tasks'" class="space-y-3">
          <div v-for="chore in family.chores" :key="chore.id" class="flex items-center justify-between bg-[#2C2C2E] p-3 rounded-xl">
            <span class="text-[14px]" :class="chore.completed ? 'line-through text-white/50' : ''">{{ chore.title }}</span>
            <span class="text-[13px] font-semibold text-[#00A651]">+{{ chore.reward }} BYN</span>
          </div>
        </div>

      </div>
    </main>

    <!-- ШТОРКА ПЕРЕВОДА -->
    <div v-if="isTransferModalOpen" class="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center">
      <div class="bg-[#1C1C1E] w-full max-w-[390px] rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-slide-up">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-white">Перевод Мише</h3>
          <button @click="isTransferModalOpen = false" class="text-white/50 text-sm font-medium">Отмена</button>
        </div>
        <div class="flex items-center justify-center gap-2 mb-8">
          <input v-model.number="transferAmount" type="number" class="bg-transparent text-center text-5xl font-bold text-white outline-none w-32 border-b border-[#00A651] pb-2" />
          <span class="text-2xl text-white/50 font-medium">BYN</span>
        </div>
        <button @click="executeTransfer" class="w-full bg-[#00A651] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
          Перевести {{ transferAmount }} BYN
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.animate-slide-up { animation: slideUp 0.3s ease-out; }
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>