<script setup lang="ts">
/**
 * NotificationsView — экран уведомлений (роут /notifications).
 *
 * Список запросов от ребёнка и информационных уведомлений.
 * Запросы можно одобрить (деньги придут ребёнку) или отклонить.
 * Есть поиск и очистка всех уведомлений.
 */

import { computed, ref } from 'vue'
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
  return family.notifications.filter(
    (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q),
  )
})

function goBack(): void {
  router.push('/')
}

/** Закрыть/открыть поиск (сбрасываем запрос при закрытии). */
function toggleSearch(): void {
  isSearchActive.value = !isSearchActive.value
  if (!isSearchActive.value) searchQuery.value = ''
}

/** Очистить все уведомления. */
function clearAll(): void {
  if (family.notifications.length === 0) return
  family.clearNotifications()
  family.setNotice('success', 'Уведомления очищены')
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
        <input
          v-else
          v-model="searchQuery"
          type="text"
          placeholder="Поиск..."
          class="w-full bg-transparent border-b border-white/20 text-white outline-none pb-1 text-[17px]"
          autofocus
        />
      </div>

      <div class="flex items-center gap-3">
        <button @click="toggleSearch" class="text-white/80 hover:text-white" aria-label="Поиск">
          <Search class="w-5 h-5" stroke-width="1.5" />
        </button>
        <button
          @click="clearAll"
          class="text-white/80 hover:text-red-400 transition-colors"
          aria-label="Очистить всё"
        >
          <Trash class="w-5 h-5" stroke-width="1.5" />
        </button>
      </div>
    </header>

    <main class="px-5 mt-4">
      <div class="flex flex-col gap-3">
        <TransitionGroup name="list">
          <div
            v-for="n in filteredNotifications"
            :key="n.id"
            class="relative rounded-2xl p-4 bg-[#1C1C1E] border border-white/5"
          >
            <div class="flex items-start gap-3">
              <CheckCircle2
                v-if="n.type === 'request'"
                class="w-5 h-5 text-[#00A651] mt-0.5"
                stroke-width="1.5"
              />
              <div class="flex-1 pr-6">
                <h3 class="text-[15px] font-medium">{{ n.title }}</h3>
                <p class="text-[13px] mt-1 text-white/60">{{ n.message }}</p>
                <p class="text-[11px] text-white/30 mt-2">{{ n.time }}</p>
              </div>
            </div>

            <!-- Кнопки для запросов -->
            <div v-if="n.type === 'request'" class="flex gap-2 mt-3 pl-8">
              <button
                @click="family.resolveRequest(n.id, true)"
                class="flex-1 bg-[#00A651] text-white py-2 rounded-lg text-xs font-semibold hover:bg-[#009448] transition-colors"
              >
                Разрешить
              </button>
              <button
                @click="family.resolveRequest(n.id, false)"
                class="flex-1 bg-white/10 text-white py-2 rounded-lg text-xs font-semibold hover:bg-white/[0.16] transition-colors"
              >
                Отклонить
              </button>
            </div>

            <!-- Кнопка удаления для info -->
            <button
              v-else
              @click="family.deleteNotification(n.id)"
              class="absolute top-4 right-4 text-white/30 hover:text-white transition"
              aria-label="Удалить"
            >
              ✕
            </button>
          </div>
        </TransitionGroup>

        <div v-if="filteredNotifications.length === 0" class="text-center text-white/40 mt-10">
          {{ searchQuery ? 'Ничего не найдено' : 'Нет уведомлений' }}
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>