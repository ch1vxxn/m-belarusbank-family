<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, CheckCircle2, Clock, Plus } from 'lucide-vue-next'

const router = useRouter()
const family = useFamilyStore()

const confirmTask = (choreId: string) => {
  const chore = family.chores.find(c => c.id === choreId)
  if (chore && chore.completed) {
    // Деньги уже начислены при выполнении, тут мы просто показываем уведомление
    family.notice = { kind: 'success', text: `Задание "${chore.title}" оплачено!` }
    setTimeout(() => family.notice = null, 3000)
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0A0A0A] text-white pb-24 font-sans">
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="router.push('/family')" class="text-white/80"><ChevronLeft class="w-7 h-7" /></button>
      <h1 class="text-[17px] font-semibold">Задания Миши</h1>
      <button class="text-[#00A651]"><Plus class="w-6 h-6" /></button>
    </header>

    <main class="px-5 space-y-4">
      <div v-if="family.notice" class="bg-[#00A651]/20 text-[#00A651] p-3 rounded-xl text-sm mb-4">
        {{ family.notice.text }}
      </div>

      <div v-for="chore in family.chores" :key="chore.id" class="bg-[#1C1C1E] rounded-2xl p-4 flex flex-col gap-3">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-[16px] font-medium">{{ chore.title }}</p>
            <p class="text-[13px] text-white/50 mt-1">Награда: <span class="text-[#00A651]">{{ chore.reward }} BYN</span></p>
          </div>
          <div v-if="chore.completed" class="flex items-center gap-1 text-[#00A651] bg-[#00A651]/10 px-2 py-1 rounded-md text-xs font-medium">
            <CheckCircle2 class="w-3.5 h-3.5" /> Выполнено
          </div>
          <div v-else class="flex items-center gap-1 text-white/40 bg-white/5 px-2 py-1 rounded-md text-xs font-medium">
            <Clock class="w-3.5 h-3.5" /> В процессе
          </div>
        </div>
        <button v-if="chore.completed" @click="confirmTask(chore.id)" class="w-full bg-[#00A651] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#009448] transition-colors">
          Подтвердить награду
        </button>
      </div>
    </main>
  </div>
</template>