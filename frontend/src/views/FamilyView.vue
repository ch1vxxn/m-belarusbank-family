<script setup lang="ts">
/**
 * FamilyView — экран «Моя семья» (роут /family).
 *
 * Табы: Дети / Запросы / Настройки.
 * Из «Настроек» можно быстро перевести деньги ребёнку.
 */

import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, Plus, ShieldCheck, } from 'lucide-vue-next'
import { DAILY_LIMIT_PRESETS } from '@/types'

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

// ── Шторка перевода ──
const isTransferModalOpen = ref(false)
const transferAmount = ref(10)

const openTransferModal = () => {
  transferAmount.value = 10
  isTransferModalOpen.value = true
}

const executeTransfer = () => {
  const ok = family.transfer(transferAmount.value)
  if (ok) {
    isTransferModalOpen.value = false
  } else {
    // Если карта заблокирована — показываем правильный текст
    if (!family.card?.isActive) {
      family.setNotice('error', 'Детская карта заблокирована. Разблокируйте её для переводов.')
    } else {
      family.setNotice('error', 'Недостаточно средств или неверная сумма')
    }
  }
}

// БАГ №9: блокируем скролл фона при открытой шторке
watch(isTransferModalOpen, (open) => {
  family.setModalState(open)
})

// ── Лимиты (подключаем к стору) ──
function selectLimit(val: number): void {
  family.setDailyLimit(val)
}

</script>

<template>
  <div class="min-h-screen bg-[#0A0A0A] text-white font-sans pb-24">
    <!-- Шапка -->
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="router.push('/')" class="text-white/80 hover:text-white">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      <h1 class="text-[17px] font-semibold">Моя семья</h1>
      <div class="w-7"></div>
    </header>

    <main class="px-5">
      <!-- Табы с переезжающим индикатором -->
      <div class="relative flex bg-[#1C1C1E] p-1 rounded-2xl mb-6 mt-2 overflow-x-auto scrollbar-hide">
        <div
          class="absolute top-1 bottom-1 bg-[#2C2C2E] rounded-xl transition-all duration-300 ease-out z-0"
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
          :class="activeTab === tab.id ? 'text-white' : 'text-white/50'"
          :ref="(el) => { if (el) tabRefs[tab.id] = el as HTMLElement }"
        >
          {{ tab.label }}
        </button>
      </div>

            <!-- ТАБ: ДЕТИ -->
      <div v-if="activeTab === 'children'" class="space-y-4">
        <!-- Карточки всех детей -->
        <div 
          v-for="(c, index) in family.children" 
          :key="c.id" 
          @click="family.activeChildIndex = index; router.push('/child')"
          class="relative overflow-hidden rounded-2xl p-4 text-white shadow-lg cursor-pointer bg-gradient-to-br from-[#006837] via-[#00A651] to-[#005226]"
        >
          <div class="flex justify-between items-start mb-4">
            <p class="text-[11px] font-medium text-white/70">M-Belarusbank Family</p>
            <div class="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
              </svg>
            </div>
          </div>

          <h2 class="text-lg font-bold mb-2">{{ c.name }}</h2>
          <div class="mb-4">
            <p class="text-[11px] text-white/70">На карте</p>
            <p class="text-2xl font-bold mt-0.5">{{ c.balance.toFixed(2) }} BYN</p>
          </div>

          <div class="flex justify-between items-end">
            <p class="text-[12px] text-white/70 font-mono">•• {{ c.card.maskedNumber.slice(-4) }}</p>
            <p class="text-[10px] text-white/60">
              {{ c.age }} лет • {{ c.ageGroup }} лет
            </p>
          </div>
        </div>

        <!-- Кнопка Добавить -->
        <button @click="router.push('/add-child')" class="w-full mt-4 bg-[#1C1C1E] text-[#00A651] font-semibold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 border border-white/5 text-[14px] hover:bg-[#2C2C2E] transition-colors">
          <Plus class="w-4 h-4" /> Добавить ребёнка
        </button>
      </div>

      <!-- ТАБ: ЗАПРОСЫ -->
      <div v-if="activeTab === 'requests'" class="flex flex-col items-center justify-center pt-24">
        <div class="w-20 h-20 bg-[#00A651]/10 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck class="w-10 h-10 text-[#00A651]" stroke-width="1.5" />
        </div>
        <h3 class="text-[22px] font-bold text-white mb-2">Всё решено</h3>
        <p class="text-[15px] text-white/50 text-center max-w-[280px] leading-relaxed">
          Новые просьбы и важные события появятся здесь
        </p>
      </div>

      <!-- ТАБ: НАСТРОЙКИ -->
      <div v-if="activeTab === 'settings'" class="space-y-4">
        <div class="bg-[#1C1C1E] rounded-2xl p-4 shadow-sm space-y-4">
          <h2 class="text-[15px] font-bold flex items-center gap-2 text-white">
            Лимиты {{ family.child?.name }}
          </h2>
          <p class="text-[12px] text-white/50 -mt-2">Дневной лимит трат</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="preset in DAILY_LIMIT_PRESETS"
              :key="preset"
              @click="selectLimit(preset)"
              class="py-2 rounded-lg text-sm transition-colors"
              :class="
                family.limits?.dailyLimit === preset
                  ? 'bg-[#00A651] text-white font-semibold'
                  : 'bg-[#2C2C2E] text-white/60 hover:bg-[#3C3C3E]'
              "
            >
              {{ preset === 0 ? 'Нет' : preset + ' BYN' }}
            </button>
          </div>
        </div>

        <button
          @click="openTransferModal"
          class="w-full bg-[#00A651] text-white font-semibold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 text-[14px] hover:bg-[#009448] transition-colors"
        >
          Перевести деньги
        </button>
      </div>
    </main>

    <!-- ШТОРКА ПЕРЕВОДА -->
    <div
      v-if="isTransferModalOpen"
      class="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center"
      @click.self="isTransferModalOpen = false"
    >
      <div class="bg-[#1C1C1E] w-full max-w-[390px] rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-slide-up">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-white">Перевод {{ family.child?.name }}</h3>
          <button @click="isTransferModalOpen = false" class="text-white/50 text-sm font-medium">
            Отмена
          </button>
        </div>
        <div class="flex items-center justify-center gap-2 mb-8">
          <input
            v-model.number="transferAmount"
            type="number"
            inputmode="numeric"
            class="bg-transparent text-center text-5xl font-bold text-white outline-none w-32 border-b border-[#00A651] pb-2"
          />
          <span class="text-2xl text-white/50 font-medium">BYN</span>
        </div>
        <p class="text-center text-[13px] text-white/40 mb-4">
          Доступно: {{ family.parentBalanceFormatted }}
        </p>
        <button
          @click="executeTransfer"
          :disabled="transferAmount <= 0"
          class="w-full bg-[#00A651] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#009448] transition-colors"
        >
          Перевести {{ transferAmount }} BYN
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>