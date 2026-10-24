/**
 * Маршруты приложения.
 *
 * 4 экрана прототипа + 4 заглушки для вкладок таб-бара.
 */

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Основные экраны прототипа
    {
      path: '/',
      name: 'parent-dashboard',
      component: () => import('@/views/ParentDashboard.vue'),
    },
    {
      path: '/card',
      name: 'child-card',
      component: () => import('@/views/ChildCardManage.vue'),
    },
    {
      path: '/child',
      name: 'child-home',
      component: () => import('@/views/ChildHome.vue'),
    },
    {
      path: '/goal',
      name: 'savings-goal',
      component: () => import('@/views/SavingsGoal.vue'),
    },
    // Заглушки для вкладок таб-бара
    {
      path: '/payments',
      name: 'payments',
      component: () => import('@/views/PlaceholderView.vue'),
      props: { title: 'Платежи' },
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/views/PlaceholderView.vue'),
      props: { title: 'Журнал' },
    },
    {
      path: '/finances',
      name: 'finances',
      component: () => import('@/views/PlaceholderView.vue'),
      props: { title: 'Финансы' },
    },
    {
      path: '/more',
      name: 'more',
      component: () => import('@/views/PlaceholderView.vue'),
      props: { title: 'Ещё' },
    },
  ],
})

export default router