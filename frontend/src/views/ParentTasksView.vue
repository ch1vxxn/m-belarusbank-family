<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, CheckCircle2, Clock, Plus } from 'lucide-vue-next'
import NoticeBanner from '@/components/NoticeBanner.vue'

const router = useRouter()
const family = useFamilyStore()

// Модалка добавления
const isAddModalOpen = ref(false)
const newTitle = ref('')
const newReward = ref(5)

function goBack() { router.push('/family') }
function markDone(choreId: string) {
  const chore = family.chores.find((c) => c.id === choreId)
  if (!chore || chore.completed) return
  chore.completed = true
  family.setNotice('success', `Задание «${chore.title}» отмечено выполненным`)
}
function confirmTask(choreId: string) {
  if (!family.completeChore(choreId)) family.setNotice('error', 'Не удалось начислить награду')
}

function addChore() {
  if (!newTitle.value.trim()) {
    family.setNotice('error', 'Введите название задания')
    return
  }
  family.chores.push({
    id: `ch-${Date.now()}`,
    title: newTitle.value.trim(),
    reward: newReward.value,
    completed: false,
  })
  family.setNotice('success', 'Задание создано')
  isAddModalOpen.value = false
  newTitle.value = ''
  newReward.value = 5
}
</script>

<template>
  <div class="min-h-screen bg-[#0A0A0A] text-white pb-24 font-sans relative">
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="goBack" class="text-white/80"><ChevronLeft class="w-7 h-7" /></button>
      <h1 class="text-[17px] font-semibold">Задания Миши</h1>
      <button @click="isAddModalOpen = true" class="text-[#00A651] hover:opacity-80 transition-opacity">
        <Plus class="w-6 h-6" />
      </button>
    </header>

    <main class="px-5 space-y-4">
      <NoticeBanner v-if="family.notice" :notice="family.notice" @dismiss="family.clearNotice()" />

      <div v-for="chore in family.chores" :key="chore.id" class="bg-[#1C1C1E] rounded-2xl p-4 flex flex-col gap-3">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-[16px] font-medium">{{ chore.title }}</p>
            <p class="text-[13px] text-white/50 mt-1">Награда: <span class="text-[#00A651]">{{ chore.reward }} BYN</span></p>
          </div>
          <div v-if="chore.completed" class="flex items-center gap-1 text-[#00A651] bg-[#00A651]/10 px-2 py-1 rounded-md text-xs font-medium"><CheckCircle2 class="w-3.5 h-3.5" /> Выполнено</div>
          <div v-else class="flex items-center gap-1 text-white/40 bg-white/5 px-2 py-1 rounded-md text-xs font-medium"><Clock class="w-3.5 h-3.5" /> В процессе</div>
        </div>
        <div class="flex gap-2">
          <button v-if="!chore.completed" @click="markDone(chore.id)" class="flex-1 bg-white/[0.06] text-white/80 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/[0.12] transition-colors">Отметить выполненным</button>
          <button v-if="chore.completed" @click="confirmTask(chore.id)" class="flex-1 bg-[#00A651] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#009448] transition-colors">Подтвердить награду</button>
        </div>
      </div>
    </main>

    <!-- МОДАЛКА ДОБАВЛЕНИЯ -->
    <div v-if="isAddModalOpen" class="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center" @click.self="isAddModalOpen = false">
      <div class="bg-[#1C1C1E] w-full max-w-[390px] rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-slide-up">
        <h3 class="text-lg font-bold text-white mb-4">Новое задание</h3>
        <input v-model="newTitle" type="text" placeholder="Название (например, Помыть посуду)" class="w-full bg-[#2C2C2E] text-white p-3 rounded-xl mb-3 outline-none focus:ring-1 focus:ring-[#00A651]" />
        <div class="flex items-center gap-2 mb-6">
          <span class="text-[14px] text-white/60">Награда:</span>
          <input v-model.number="newReward" type="number" class="bg-[#2C2C2E] text-white p-2 rounded-lg w-20 text-center outline-none" />
          <span class="text-[14px] text-white/60">BYN</span>
        </div>
        <button @click="addChore" class="w-full bg-[#00A651] text-white py-3 rounded-xl font-semibold">Создать</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up { animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>