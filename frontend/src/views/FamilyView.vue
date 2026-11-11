<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, Plus, ShieldCheck } from 'lucide-vue-next'

// ── ФОНЫ ДЕТСКИХ КАРТ ──
import cardEmerald from '@/assets/cards/emerald.png'
import cardGlass from '@/assets/cards/hare.png'
import cardSunset from '@/assets/cards/deer.png'
import cardSky from '@/assets/cards/stork.png'

const cardBackgrounds: Record<string, string> = {
  emerald: cardEmerald,
  glass: cardGlass,
  sunset: cardSunset,
  sky: cardSky,
}

const router = useRouter()
const family = useFamilyStore()

// ── Табы ──
const activeTab = ref('children')

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
    const el = tabRefs['children']
    if (el) {
      activeTabStyle.value = { left: el.offsetLeft, width: el.offsetWidth }
    }
  }, 50)
})

</script>

<template>
  <div class="min-h-screen text-black dark:text-white font-sans pb-24 transition-colors duration-300">
    <!-- Шапка -->
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="router.push('/')" class="text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      <h1 class="text-[17px] font-semibold">Моя семья</h1>
      <div class="w-7"></div>
    </header>

    <main class="px-5 pb-24 overflow-y-auto">
      <!-- Табы с переезжающим индикатором -->
      <div class="relative flex bg-black/5 dark:bg-[#1C1C1E] p-1 rounded-2xl mb-6 mt-2 overflow-x-auto scrollbar-hide transition-colors">
        <div
          class="absolute top-1 bottom-1 bg-white dark:bg-[#2C2C2E] shadow-sm rounded-xl transition-all duration-300 ease-out z-0"
          :style="{ left: activeTabStyle.left + 'px', width: activeTabStyle.width + 'px' }"
        ></div>

        <button
          v-for="tab in [
            { id: 'children', label: 'Дети' },
            { id: 'requests', label: 'Запросы' },
            { id: 'settings', label: 'Настройки' },
          ]"
          :key="tab.id"
          @click="setActiveTab(tab.id)"
          class="relative z-10 flex-1 py-2 text-[13px] font-semibold transition-colors duration-300 shrink-0 text-center"
          :class="activeTab === tab.id ? 'text-black dark:text-white' : 'text-black/50 dark:text-white/50'"
          :ref="(el) => { if (el) tabRefs[tab.id] = el as HTMLElement }"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- ТАБ: ДЕТИ -->
      <div v-if="activeTab === 'children'" class="space-y-5 pt-2">
        <div 
          v-for="(c, index) in family.children" 
          :key="c.id" 
          @click="family.activeChildIndex = index; router.push('/child')"
          class="relative overflow-hidden rounded-2xl p-4 text-white shadow-lg cursor-pointer"
          :style="{ backgroundImage: `url(${cardBackgrounds[family.cardDesign] || cardEmerald})`, backgroundSize: 'cover', backgroundPosition: 'center' }"
        >
          <div class="absolute inset-0 bg-black/30"></div>
          <div class="flex justify-between items-start mb-4">
            <p class="text-[11px] font-medium text-white">M-Belarusbank Family</p>
            <div class="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
              </svg>
            </div>
          </div>

          <h2 class="text-lg font-bold mb-2">{{ c.name }}</h2>
          <div class="mb-4">
            <p class="text-[11px] text-white">На карте</p>
            <p class="text-2xl font-bold mt-0.5">{{ c.balance.toFixed(2) }} BYN</p>
          </div>

          <div class="flex justify-between items-end">
            <p class="text-[12px] text-white font-mono">•• {{ c.card.maskedNumber.slice(-4) }}</p>
            <p class="text-[10px] text-white">
              {{ c.age }} лет • {{ c.ageGroup === '14-17' ? '14–17' : '7–13' }} лет
            </p>
          </div>
        </div>

        <!-- Кнопка Добавить -->
        <button @click="router.push('/add-child')" class="w-full mt-4 bg-white dark:bg-[#1C1C1E] text-[#00A651] font-semibold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 border border-black/5 dark:border-white/5 text-[14px] hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors">
          <Plus class="w-4 h-4" /> Добавить ребёнка
        </button>
      </div>

      <!-- ТАБ: ЗАПРОСЫ -->
      <div v-if="activeTab === 'requests'" class="flex flex-col items-center justify-center pt-24">
        <div class="w-20 h-20 bg-[#00A651]/10 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck class="w-10 h-10 text-[#00A651]" stroke-width="1.5" />
        </div>
        <h3 class="text-[22px] font-bold mb-2">Всё решено</h3>
        <p class="text-[15px] text-black/50 dark:text-white/50 text-center max-w-[280px] leading-relaxed">
          Новые просьбы и важные события появятся здесь
        </p>
      </div>

      <!-- ТАБ: НАСТРОЙКИ (Детский режим) -->
      <div v-if="activeTab === 'settings'" class="space-y-6">
        <div>
          <h2 class="text-[22px] font-bold mb-2">Детский режим</h2>
          <p class="text-[14px] text-black/50 dark:text-white/50 leading-relaxed">
            Нажмите на профиль ребёнка, чтобы открыть его приложение.<br>Вернуться к родителю можно по паролю.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div 
            v-for="(c, index) in family.children" 
            :key="c.id"
            @click="family.activeChildIndex = index; router.push('/child-dashboard')"
            class="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-5 flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors border border-black/5 dark:border-white/5 shadow-sm dark:shadow-none"
          >
            <div class="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3">
              <span class="text-2xl font-bold text-black/80 dark:text-white/80">{{ c.initials }}</span>
            </div>
            <p class="text-[16px] font-bold mb-1">{{ c.name }}</p>
            <p class="text-[12px] text-black/40 dark:text-white/40 mb-2">{{ c.age }} лет</p>
            <div class="w-6 h-6 rounded-md border-2 border-[#00A651] flex items-center justify-center">
              <div class="w-1 h-1 bg-[#00A651] rounded-full"></div>
            </div>
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