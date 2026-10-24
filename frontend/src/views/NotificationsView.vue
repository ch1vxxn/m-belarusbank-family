<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, Search, Trash, CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()
const family = useFamilyStore()

const isSearchActive = ref(false)
const searchQuery = ref('')

const filteredNotifications = computed(() => {
  if (!searchQuery.value) return family.notifications
  const q = searchQuery.value.toLowerCase()
  return family.notifications.filter(n => 
    n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
  )
})

function goBack() { router.push('/') }
function clearAll() {
  if (confirm('Удалить все уведомления?')) {
    family.notifications.forEach(n => family.deleteNotification(n.id))
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0A0A0A] text-white font-sans pb-10">
    <header class="flex items-center justify-between px-5 pt-8 pb-4 gap-3">
      <button @click="goBack" class="text-white/80 hover:text-white">
        <ChevronLeft class="w-7 h-7" stroke-width="1.5" />
      </button>
      
      <div class="flex-1 flex items-center">
        <h1 v-if="!isSearchActive" class="text-[17px] font-semibold">Уведомления</h1>
        <input v-else v-model="searchQuery" type="text" placeholder="Поиск..." class="w-full bg-transparent border-b border-white/20 text-white outline-none pb-1 text-[17px]" autofocus />
      </div>

      <div class="flex items-center gap-3">
        <button @click="isSearchActive = !isSearchActive" class="text-white/80 hover:text-white">
          <Search class="w-5 h-5" stroke-width="1.5" />
        </button>
        <button @click="clearAll" class="text-white/80 hover:text-red-400 transition-colors">
          <Trash class="w-5 h-5" stroke-width="1.5" />
        </button>
      </div>
    </header>

    <main class="px-5 mt-4">
      <p class="text-[13px] text-white/50 mb-4">{{ filteredNotifications.filter(n => !n.isRead).length }} непрочитанных</p>

      <div class="flex flex-col gap-3">
        <div v-for="n in filteredNotifications" :key="n.id" class="relative rounded-2xl p-4 transition-colors" :class="n.isRead ? 'bg-[#1A1A1A]' : 'bg-[#1C1C1E] border border-[#00A651]/30'">
          <div v-if="!n.isRead" class="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#00A651]"></div>

          <div class="flex items-start gap-3">
            <div class="mt-0.5">
              <CheckCircle2 v-if="n.type === 'request'" class="w-5 h-5 text-[#00A651]" stroke-width="1.5" />
              <div v-else class="w-5 h-5 rounded-full bg-white/10"></div>
            </div>
            <div class="flex-1 pr-6">
              <h3 class="text-[15px] font-medium" :class="n.isRead ? 'text-white/70' : 'text-white'">{{ n.title }}</h3>
              <p class="text-[13px] mt-1" :class="n.isRead ? 'text-white/40' : 'text-white/60'">{{ n.message }}</p>
              <p class="text-[11px] text-white/30 mt-2">{{ n.time }}</p>
            </div>
          </div>

          <div v-if="!n.isRead && n.type === 'request'" class="flex gap-2 mt-3 pl-8">
            <button @click="family.markAsRead(n.id)" class="flex-1 bg-[#00A651] text-white py-2 rounded-lg text-xs font-semibold">Разрешить</button>
            <button @click="family.deleteNotification(n.id)" class="flex-1 bg-white/10 text-white py-2 rounded-lg text-xs font-semibold">Отклонить</button>
          </div>
          <button v-else @click="family.deleteNotification(n.id)" class="absolute bottom-4 right-4 text-white/20 hover:text-red-400 transition-colors">
            <Trash class="w-4 h-4" />
          </button>
        </div>

        <div v-if="filteredNotifications.length === 0" class="text-center text-white/40 mt-10">Нет уведомлений</div>
      </div>
    </main>
  </div>
</template>