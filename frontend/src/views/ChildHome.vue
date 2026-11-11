<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, ArrowUpRight, Plus } from 'lucide-vue-next'
import ToggleListItem from '@/components/ToggleListItem.vue'

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

const activeTab = ref('operations')
const isCardSelectOpen = ref(false)
const isTransferModalOpen = ref(false)
const isStatsModalOpen = ref(false)

const transferAmount = ref(10)

// ── Переезжающий индикатор табов ──
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

watch([isTransferModalOpen, isStatsModalOpen], ([transfer, stats]) => {
  family.setModalState(transfer || stats)
})

const openTransferModal = () => {
  transferAmount.value = 10
  isTransferModalOpen.value = true
}

const executeTransfer = async () => {
  const ok = await family.transfer(transferAmount.value)
  if (ok) {
    isTransferModalOpen.value = false
  } else {
    if (!family.card?.isActive) {
      family.setNotice('error', 'Детская карта заблокирована. Разблокируйте её для переводов.')
    } else {
      family.setNotice('error', 'Недостаточно средств или неверная сумма')
    }
  }
}

const monthlyStats = computed(() => {
  let expenses = 0
  let topups = 0
  for (const t of family.transactions) {
    if (t.amount < 0) expenses += Math.abs(t.amount)
    else topups += t.amount
  }
  return {
    expenses,
    topups,
    expensesFormatted: expenses.toFixed(2).replace('.', ',') + ' BYN',
    topupsFormatted: topups.toFixed(2).replace('.', ',') + ' BYN',
  }
})

const categoriesStats = computed(() => {
  const map: Record<string, { label: string; emoji: string; total: number; color: string }> = {
    food: { label: 'Еда', emoji: '🍔', total: 0, color: '#F4A261' },
    cafe: { label: 'Кафе', emoji: '☕', total: 0, color: '#E9C46A' },
    transport: { label: 'Транспорт', emoji: '🚌', total: 0, color: '#3B3B98' },
    entertainment: { label: 'Развлечения', emoji: '🎮', total: 0, color: '#E63946' },
    clothes: { label: 'Одежда', emoji: '👕', total: 0, color: '#8E44AD' },
  }
  for (const t of family.transactions) {
    if (t.amount < 0 && map[t.category]) {
      map[t.category]!.total += Math.abs(t.amount)
    }
  }
  const total = Object.values(map).reduce((s, c) => s + c.total, 0) || 1
  return Object.values(map)
    .filter((c) => c.total > 0)
    .map((c) => ({
      ...c,
      percent: Math.round((c.total / total) * 100),
      formatted: c.total.toFixed(2).replace('.', ',') + ' BYN',
    }))
})
</script>

<template>
  <!-- Добавлены классы text-black dark:text-white для глобального фона -->
  <div
    class="min-h-screen text-black dark:text-white font-sans pb-24 transition-all duration-300"
    :class="{ 'h-screen overflow-hidden': isTransferModalOpen || isStatsModalOpen }"
  >
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="router.push('/family')" class="text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      <h1 class="text-[17px] font-semibold">Профиль {{ family.child?.name || 'ребёнка' }}</h1>
      <div class="w-7"></div>
    </header>

    <main class="px-5 pb-24 overflow-y-auto">
            <!-- Карта -->
      <div
        class="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg mb-6 transition-all duration-500"
        :style="family.card?.isActive
          ? { backgroundImage: `url(${cardBackgrounds[family.cardDesign] || cardEmerald})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: '#2C2C2E' }"
        :class="{ 'grayscale': !family.card?.isActive }"
      >
        <div v-if="family.card?.isActive" class="absolute inset-0 bg-black/30"></div>
        
        <div class="relative z-10">
          <div class="flex justify-between items-start mb-6">
            <!-- Поменял на M-Belarusbank (как на главной) -->
            <p class="text-[13px] font-medium text-white/80">M-Belarusbank</p>
            <svg class="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
            </svg>
          </div>
          
          <!-- Баланс теперь сверху и крупный (как на главной) -->
          <p class="text-[28px] font-bold mb-1">{{ family.childBalanceFormatted }}</p>
          
          <!-- Имя и номер карты снизу -->
          <div class="flex justify-between items-end mt-4">
            <p class="text-[14px] font-medium text-white/90">{{ family.child?.name || 'Ребёнок' }}</p>
            <p class="text-[13px] font-mono text-white/70">•••• {{ family.card?.maskedNumber.slice(-4) || '0000' }}</p>
          </div>
        </div>
      </div>

      <!-- Кнопки -->
      <div class="flex gap-3 mb-6">
        <button
          @click="openTransferModal"
          class="flex-[2] bg-[#00A651] text-white font-semibold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-[#009448] transition-colors"
        >
          <ArrowUpRight class="w-5 h-5" /> Перевести
        </button>

        <button
          @click="family.toggleCardActive()"
          class="flex-1 bg-white dark:bg-[#1C1C1E] text-black dark:text-white font-semibold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 border border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors"
        >
          <svg v-if="family.card?.isActive" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          {{ family.card?.isActive ? 'Пауза' : 'Включить' }}
        </button>
      </div>

      <!-- Табы -->
      <div class="relative flex bg-black/5 dark:bg-[#1C1C1E] p-1 rounded-xl mb-6 overflow-x-auto scrollbar-hide transition-colors">
        <div
          class="absolute top-1 bottom-1 bg-white dark:bg-[#00A651] rounded-lg shadow-sm dark:shadow-none transition-all duration-300 ease-out z-0"
          :style="{ left: activeTabStyle.left + 'px', width: activeTabStyle.width + 'px' }"
        ></div>
        <button
          v-for="tab in [
            { id: 'operations', label: 'Операции' },
            { id: 'limits', label: 'Лимиты' },
            { id: 'savings', label: 'Копилки' },
            { id: 'tasks', label: 'Задания' },
          ]"
          :key="tab.id"
          @click="setActiveTab(tab.id)"
          class="relative z-10 px-4 py-2 text-[13px] font-medium transition-colors duration-300 shrink-0"
          :class="activeTab === tab.id ? 'text-black dark:text-white' : 'text-black/60 dark:text-white/60'"
          :ref="(el) => { if (el) tabRefs[tab.id] = el as HTMLElement }"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Контент вкладок -->
      <div class="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 shadow-sm border border-black/5 dark:border-transparent relative z-10 transition-colors">
        
        <!-- ОПЕРАЦИИ -->
        <div v-if="activeTab === 'operations'" class="space-y-6">
          
          <!-- Блок Траты за октябрь -->
          <div @click="isStatsModalOpen = true" class="cursor-pointer bg-black/5 dark:bg-[#2C2C2E] rounded-2xl p-4 transition-transform active:scale-[0.98]">
            <div class="flex justify-between items-center mb-2">
              <h2 class="text-[15px] font-semibold">Траты за октябрь</h2>
              <span class="text-[13px] text-[#00A651]">Подробнее &gt;</span>
            </div>
            <p class="text-3xl font-bold mb-1">{{ monthlyStats.expensesFormatted }}</p>
            <p class="text-[13px] text-black/50 dark:text-white/50">Куда уходят деньги</p>
            
            <!-- Мини-карточки -->
            <div class="flex gap-3 mt-4">
              <div class="flex-1 bg-white dark:bg-[#1C1C1E] rounded-xl p-3 shadow-sm dark:shadow-none">
                <p class="text-[16px] font-bold">{{ monthlyStats.expensesFormatted }}</p>
                <p class="text-[12px] text-black/50 dark:text-white/50">Расходы</p>
              </div>
              <div class="flex-1 bg-white dark:bg-[#1C1C1E] rounded-xl p-3 shadow-sm dark:shadow-none">
                <p class="text-[16px] font-bold text-[#00A651]">{{ monthlyStats.topupsFormatted }}</p>
                <p class="text-[12px] text-black/50 dark:text-white/50">Пополнения</p>
              </div>
            </div>
          </div>

          <!-- Список операций по датам -->
          <div class="space-y-6">
            <div v-for="group in family.transactionsGrouped" :key="group.date">
              <p class="text-[13px] font-medium text-black/50 dark:text-white/50 mb-3">{{ group.date }}</p>
              
              <div class="bg-black/5 dark:bg-[#2C2C2E] rounded-2xl flex flex-col">
                <div 
                  v-for="(tx, index) in group.items" 
                  :key="tx.id" 
                  class="flex items-center justify-between p-4"
                  :class="{ 'border-t border-black/5 dark:border-white/5': index > 0 }"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white dark:bg-[#1C1C1E] shadow-sm dark:shadow-none">
                      <span v-if="tx.category === 'food'">🍔</span>
                      <span v-else-if="tx.category === 'cafe'">☕</span>
                      <span v-else-if="tx.category === 'transport'">🚌</span>
                      <span v-else-if="tx.category === 'topup'">💸</span>
                      <span v-else>💳</span>
                    </div>
                    <div>
                      <p class="text-[14px] font-medium">{{ tx.merchant }}</p>
                      <p class="text-[12px] text-black/50 dark:text-white/50">{{ tx.time }}</p>
                    </div>
                  </div>
                  <p class="text-[15px] font-bold" :class="tx.amount > 0 ? 'text-[#00A651]' : ''">
                    {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount.toFixed(2) }} BYN
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ЛИМИТЫ -->
        <div v-if="activeTab === 'limits'" class="space-y-6">
          <div>
            <p class="text-[15px] font-medium mb-2">Возрастной профиль · {{ family.child?.ageGroup === '14-17' ? '14–17' : '7–13' }} лет</p>
            <p class="text-[13px] text-black/50 dark:text-white/50 leading-relaxed">
              Дополнительная карта к счёту законного представителя. Лимиты и покупки контролирует родитель.
            </p>
          </div>

          <div>
            <p class="text-[15px] font-medium mb-3">Можно ребёнку</p>
            <div class="space-y-1">
              <ToggleListItem label="Оплата по QR" :model-value="family.permissions?.qrPay || false" @update:model-value="family.togglePermission('qrPay')" />
              <ToggleListItem label="Покупки картой" :model-value="family.permissions?.cardPay || false" @update:model-value="family.togglePermission('cardPay')" />
              <ToggleListItem label="Покупки онлайн" :model-value="family.permissions?.onlinePay || false" @update:model-value="family.togglePermission('onlinePay')" />
              <ToggleListItem label="Переводы друзьям" :model-value="family.permissions?.friendsTransfer || false" @update:model-value="family.togglePermission('friendsTransfer')" />
              <ToggleListItem label="Снятие наличных" :model-value="family.permissions?.cashWithdrawal || false" @update:model-value="family.togglePermission('cashWithdrawal')" />
            </div>
          </div>

          <div>
            <p class="text-[15px] font-medium mb-3">Лимиты и одобрение</p>
            <div class="space-y-3">
              <div class="flex justify-between items-center py-1">
                <span class="text-[14px] text-black/70 dark:text-white/70">На одну покупку</span>
                <div class="flex items-center gap-2">
                  <button @click="family.setPerPurchase(Math.max(0, (family.limits?.perPurchase || 0) - 1))" class="w-7 h-7 bg-black/5 dark:bg-[#2C2C2E] rounded-md flex items-center justify-center hover:bg-black/10 dark:hover:bg-[#3C3C3E] transition-colors">−</button>
                  <span class="text-[14px] font-medium w-20 text-center">{{ family.limits?.perPurchase || 0 }},00 BYN</span>
                  <button @click="family.setPerPurchase((family.limits?.perPurchase || 0) + 1)" class="w-7 h-7 bg-black/5 dark:bg-[#2C2C2E] rounded-md flex items-center justify-center hover:bg-black/10 dark:hover:bg-[#3C3C3E] transition-colors">+</button>
                </div>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-[14px] text-black/70 dark:text-white/70">В день</span>
                <div class="flex items-center gap-2">
                  <button @click="family.setDailyLimit(Math.max(0, (family.limits?.dailyLimit || 0) - 1))" class="w-7 h-7 bg-black/5 dark:bg-[#2C2C2E] rounded-md flex items-center justify-center hover:bg-black/10 dark:hover:bg-[#3C3C3E] transition-colors">−</button>
                  <span class="text-[14px] font-medium w-20 text-center">{{ family.limits?.dailyLimit || 0 }},00 BYN</span>
                  <button @click="family.setDailyLimit((family.limits?.dailyLimit || 0) + 1)" class="w-7 h-7 bg-black/5 dark:bg-[#2C2C2E] rounded-md flex items-center justify-center hover:bg-black/10 dark:hover:bg-[#3C3C3E] transition-colors">+</button>
                </div>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-[14px] text-black/70 dark:text-white/70">В месяц</span>
                <div class="flex items-center gap-2">
                  <button @click="family.setMonthlyLimit(Math.max(0, (family.limits?.monthlyLimit || 0) - 1))" class="w-7 h-7 bg-black/5 dark:bg-[#2C2C2E] rounded-md flex items-center justify-center hover:bg-black/10 dark:hover:bg-[#3C3C3E] transition-colors">−</button>
                  <span class="text-[14px] font-medium w-20 text-center">{{ family.limits?.monthlyLimit || 0 }},00 BYN</span>
                  <button @click="family.setMonthlyLimit((family.limits?.monthlyLimit || 0) + 1)" class="w-7 h-7 bg-black/5 dark:bg-[#2C2C2E] rounded-md flex items-center justify-center hover:bg-black/10 dark:hover:bg-[#3C3C3E] transition-colors">+</button>
                </div>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-[14px] text-black/70 dark:text-white/70">Спрашивать родителя от</span>
                <div class="flex items-center gap-2">
                  <button @click="family.setApprovalThreshold(Math.max(0, (family.limits?.approvalThreshold || 0) - 1))" class="w-7 h-7 bg-black/5 dark:bg-[#2C2C2E] rounded-md flex items-center justify-center hover:bg-black/10 dark:hover:bg-[#3C3C3E] transition-colors">−</button>
                  <span class="text-[14px] font-medium w-20 text-center">{{ family.limits?.approvalThreshold || 0 }},00 BYN</span>
                  <button @click="family.setApprovalThreshold((family.limits?.approvalThreshold || 0) + 1)" class="w-7 h-7 bg-black/5 dark:bg-[#2C2C2E] rounded-md flex items-center justify-center hover:bg-black/10 dark:hover:bg-[#3C3C3E] transition-colors">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Карманные -->
          <div>
            <p class="text-[15px] font-medium mb-3">Карманные</p>
            <div class="flex justify-between items-center mb-2 py-1">
              <span class="text-[14px] text-black/70 dark:text-white/70">Каждый понедельник</span>
              <div @click="family.toggleAllowance()" class="w-10 h-5 rounded-md relative cursor-pointer transition-colors" :class="family.allowances.isActive ? 'bg-[#00A651]' : 'bg-black/10 dark:bg-[#2C2C2E]'">
                <div class="w-4 h-4 bg-white rounded-sm absolute top-0.5 shadow-sm transition-all" :class="family.allowances.isActive ? 'right-0.5' : 'left-0.5'"></div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="family.setAllowanceAmount(Math.max(0, family.allowances.amount - 1))" class="w-7 h-7 bg-black/5 dark:bg-[#2C2C2E] rounded-md flex items-center justify-center text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-[#3C3C3E]">−</button>
              <p class="text-[16px] font-medium w-20 text-center">{{ family.allowances.amount }},00 BYN</p>
              <button @click="family.setAllowanceAmount(family.allowances.amount + 1)" class="w-7 h-7 bg-black/5 dark:bg-[#2C2C2E] rounded-md flex items-center justify-center text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-[#3C3C3E]">+</button>
            </div>
          </div>

          <!-- Категории -->
          <div>
            <p class="text-[15px] font-medium mb-3">Категории</p>
            <div class="mb-4 bg-black/5 dark:bg-[#2C2C2E] p-3 rounded-lg border border-black/5 dark:border-white/5">
              <p class="text-[13px] text-red-500 flex items-center gap-2 mb-1 font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Азартные игры, 18+, алкоголь и табак
              </p>
              <p class="text-[11px] text-black/40 dark:text-white/40">Эти запреты установлены банком и не отключаются.</p>
            </div>
            <div class="space-y-1">
              <ToggleListItem v-for="cat in family.spendingCategories" :key="cat.id" :label="cat.label" :model-value="cat.isAllowed" @update:model-value="family.toggleSpendingCategory(cat.id)" />
            </div>
          </div>
        </div>

        <!-- КОПИЛКИ -->
        <div v-if="activeTab === 'savings'" class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-[#00A651]/10 rounded-full flex items-center justify-center text-2xl">🚲</div>
            <div>
              <p class="text-[15px] font-semibold">{{ family.savingsGoal.title }}</p>
              <p class="text-[13px] text-black/50 dark:text-white/50">{{ family.savingsGoal.current }} / {{ family.savingsGoal.target }} BYN</p>
            </div>
          </div>
          <div class="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5">
            <div class="bg-[#00A651] h-2.5 rounded-full" :style="{ width: family.goalProgress + '%' }"></div>
          </div>
          <button @click="router.push('/goal')" class="w-full mt-2 bg-black/5 dark:bg-[#2C2C2E] py-3 rounded-xl font-medium text-[14px] hover:bg-black/10 dark:hover:bg-[#3C3C3E] transition-colors">
            Перейти к копилке
          </button>
        </div>

        <!-- ЗАДАНИЯ -->
        <div v-if="activeTab === 'tasks'" class="space-y-4">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[15px] font-semibold">Задания</p>
            <button @click="router.push('/tasks')" class="flex items-center gap-1 text-[#00A651] text-[13px] font-medium hover:opacity-80 transition-opacity">
              <Plus class="w-4 h-4" /> Добавить
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="chore in family.chores" :key="chore.id" class="flex items-center justify-between bg-black/5 dark:bg-[#2C2C2E] p-3 rounded-xl">
              <span class="text-[14px]" :class="chore.completed ? 'line-through text-black/50 dark:text-white/50' : ''">{{ chore.title }}</span>
              <span class="text-[13px] font-semibold text-[#00A651]">+{{ chore.reward }} BYN</span>
            </div>
            <p v-if="family.chores.length === 0" class="text-center text-sm text-black/40 dark:text-white/40 py-4">Заданий пока нет</p>
          </div>
        </div>
      </div>
    </main>

    <!-- ШТОРКА СТАТИСТИКИ -->
    <Transition name="slide-up">
      <div v-if="isStatsModalOpen" class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="isStatsModalOpen = false">
        <div class="bg-white dark:bg-[#1C1C1E] w-full max-w-[390px] rounded-t-[32px] p-6 pb-[calc(env(safe-area-inset-bottom)+24px)] max-h-[90dvh] overflow-y-auto scrollbar-hide">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">Траты по категориям</h3>
            <button @click="isStatsModalOpen = false" class="text-[#00A651] font-medium text-sm">Готово</button>
          </div>
          <div class="text-center mb-8">
            <p class="text-4xl font-extrabold">{{ monthlyStats.expensesFormatted }}</p>
            <p class="text-[13px] text-black/50 dark:text-white/50 mt-1">Расходы за месяц</p>
          </div>
          <div class="space-y-4">
            <div v-for="cat in categoriesStats" :key="cat.label" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-xl">{{ cat.emoji }}</span>
                <span class="text-[14px]">{{ cat.label }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-20 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div class="h-full" :style="{ width: cat.percent + '%', background: cat.color }"></div>
                </div>
                <span class="text-[14px] font-bold w-16 text-right">{{ cat.formatted }}</span>
              </div>
            </div>
            <p v-if="categoriesStats.length === 0" class="text-center text-black/40 dark:text-white/40 text-sm">Расходов пока нет</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ШТОРКА ПЕРЕВОДА -->
    <Transition name="slide-up">
      <div v-if="isTransferModalOpen" class="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end" style="height: 100dvh">
        <div class="bg-white dark:bg-[#1C1C1E] w-full rounded-t-[32px] p-6 pb-8 max-h-[90dvh] overflow-y-auto">
          <div class="w-12 h-1.5 bg-black/10 dark:bg-white/20 rounded-full mx-auto mb-6"></div>
          <div class="flex items-center justify-between mb-6">
            <button @click="isTransferModalOpen = false" class="w-8 h-8 bg-black/5 dark:bg-[#2C2C2E] rounded-full flex items-center justify-center text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors">✕</button>
            <h3 class="text-[17px] font-semibold">Перевод ребёнку</h3>
            <div class="w-8"></div>
          </div>
          <div class="relative mb-6">
            <button @click="isCardSelectOpen = !isCardSelectOpen" class="w-full bg-black/5 dark:bg-[#2C2C2E] rounded-2xl p-4 flex justify-between items-center border border-transparent dark:border-white/5 hover:bg-black/10 dark:hover:bg-[#3C3C3E] transition-colors">
              <div class="flex flex-col items-start">
                <span class="text-[11px] text-black/40 dark:text-white/40 mb-0.5">С карты</span>
                <span class="text-[15px] font-medium">{{ family.cards[family.currentCardIndex]?.title || 'Карта 1' }} •• {{ family.cards[family.currentCardIndex]?.maskedNumber.slice(-4) || '9883' }}</span>
              </div>
              <span class="text-[15px] font-semibold text-[#00A651]">{{ family.cards[family.currentCardIndex]?.balance.toFixed(2) || '0.00' }} BYN</span>
            </button>
            <div v-if="isCardSelectOpen" class="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#2C2C2E] rounded-xl shadow-xl z-50 overflow-hidden border border-black/5 dark:border-white/5">
              <button v-for="(c, index) in family.cards" :key="c.id" @click="family.setCurrentCardIndex(index); isCardSelectOpen = false" class="w-full text-left p-4 hover:bg-black/5 dark:hover:bg-[#3C3C3E] transition-colors border-b border-black/5 dark:border-white/5 last:border-0 flex justify-between items-center">
                <div>
                  <p class="text-[14px] font-medium">{{ c.title }} •• {{ c.maskedNumber.slice(-4) }}</p>
                  <p class="text-[12px] text-black/50 dark:text-white/50">{{ c.balance.toFixed(2) }} BYN</p>
                </div>
                <span v-if="family.currentCardIndex === index" class="text-[#00A651]">✓</span>
              </button>
            </div>
          </div>
          <p class="text-[14px] text-black/50 dark:text-white/50 mb-2">Для {{ family.child?.name || 'ребёнка' }}</p>
          <div class="bg-black/5 dark:bg-[#2C2C2E] rounded-2xl p-4 flex justify-between items-center mb-4 border border-transparent dark:border-white/5">
            <input v-model.number="transferAmount" type="number" inputmode="numeric" class="bg-transparent text-3xl font-bold w-full outline-none" />
            <span class="text-[16px] font-semibold text-black/40 dark:text-white/40">BYN</span>
          </div>
          <p class="text-[15px] mb-3">Карманные</p>
          <div class="flex gap-2 mb-8">
            <button @click="transferAmount = 10" class="px-4 py-2 bg-[#00A651]/10 text-[#00A651] rounded-full text-[13px] font-medium hover:bg-[#00A651]/20 transition-colors">На обед</button>
            <button @click="transferAmount = 50" class="px-4 py-2 bg-[#00A651]/10 text-[#00A651] rounded-full text-[13px] font-medium hover:bg-[#00A651]/20 transition-colors">Карманные</button>
            <button @click="transferAmount = 100" class="px-4 py-2 bg-[#00A651]/10 text-[#00A651] rounded-full text-[13px] font-medium hover:bg-[#00A651]/20 transition-colors">Молодец!</button>
          </div>
          <button @click="executeTransfer" class="w-full bg-[#00A651] text-white py-4 rounded-xl font-semibold text-[16px] shadow-lg shadow-[#00A651]/20 mb-2">Перевести {{ transferAmount }} BYN</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
.slide-up-enter-from { opacity: 0; transform: translateY(100%); }
.slide-up-leave-to { opacity: 0; transform: translateY(100%); }
</style>