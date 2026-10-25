<script setup lang="ts">
/**
 * ParentTasksView — экран «Задания Миши» (роут /tasks).
 *
 * Родитель видит задания ребёнка и может:
 * - отметить задание выполненным (ребёнок «сделал»);
 * - подтвердить награду — деньги начисляются на карту ребёнка.
 */

import { useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { ChevronLeft, CheckCircle2, Clock, Plus } from 'lucide-vue-next'
import NoticeBanner from '@/components/NoticeBanner.vue'

const router = useRouter()
const family = useFamilyStore()

function goBack(): void {
  router.push('/family')
}

/** Отметить задание выполненным (без начисления). */
function markDone(choreId: string): void {
  const chore = family.chores.find((c) => c.id === choreId)
  if (!chore || chore.completed) return
  chore.completed = true
  family.setNotice('success', `Задание «${chore.title}» отмечено выполненным`)
}

/** Подтвердить награду — начисляет деньги ребёнку. */
function confirmTask(choreId: string): void {
  const ok = family.completeChore(choreId)
  if (!ok) {
    family.setNotice('error', 'Не удалось начислить награду')
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0A0A0A] text-white pb-24 font-sans">
    <header class="flex items-center justify-between px-5 pt-8 pb-4">
      <button @click="goBack" class="text-white/80">
        <ChevronLeft class="w-7 h-7" />
      </button>
      <h1 class="text-[17px] font-semibold">Задания Миши</h1>
      <button class="text-[#00A651]" aria-label="Добавить задание">
        <Plus class="w-6 h-6" />
      </button>
    </header>

    <main class="px-5 space-y-4">
      <!-- Баннер уведомления -->
      <NoticeBanner
        v-if="family.notice"
        :notice="family.notice"
        @dismiss="family.clearNotice()"
      />

      <!-- Список заданий -->
      <div
        v-for="chore in family.chores"
        :key="chore.id"
        class="bg-[#1C1C1E] rounded-2xl p-4 flex flex-col gap-3"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-[16px] font-medium">{{ chore.title }}</p>
            <p class="text-[13px] text-white/50 mt-1">
              Награда: <span class="text-[#00A651]">{{ chore.reward }} BYN</span>
            </p>
          </div>

          <div
            v-if="chore.completed"
            class="flex items-center gap-1 text-[#00A651] bg-[#00A651]/10 px-2 py-1 rounded-md text-xs font-medium"
          >
            <CheckCircle2 class="w-3.5 h-3.5" /> Выполнено
          </div>
          <div
            v-else
            class="flex items-center gap-1 text-white/40 bg-white/5 px-2 py-1 rounded-md text-xs font-medium"
          >
            <Clock class="w-3.5 h-3.5" /> В процессе
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="flex gap-2">
          <button
            v-if="!chore.completed"
            @click="markDone(chore.id)"
            class="flex-1 bg-white/[0.06] text-white/80 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/[0.12] transition-colors"
          >
            Отметить выполненным
          </button>
          <button
            v-if="chore.completed"
            @click="confirmTask(chore.id)"
            class="flex-1 bg-[#00A651] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#009448] transition-colors"
          >
            Подтвердить награду
          </button>
        </div>
      </div>

      <!-- Пустое состояние -->
      <p v-if="family.chores.length === 0" class="text-center text-white/40 mt-10">
        Заданий пока нет
      </p>
    </main>
  </div>
</template>