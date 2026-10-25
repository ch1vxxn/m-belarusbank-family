/**
<<<<<<< Updated upstream
 * Маршруты приложения.
 *
 * 4 экрана прототипа + 4 заглушки для вкладок таб-бара.
 */

import { createRouter, createWebHistory } from 'vue-router'
=======
 * Маршруты «М-Беларусбанк Family».
 *
 * Используем хеш-историю (#/child) чтобы GitHub Pages
 * не пытался найти файл /child/index.html при прямом переходе —
 * статический хостинг не умеет переписывать URL для SPA.
 */

import { createRouter, createWebHashHistory } from 'vue-router'
>>>>>>> Stashed changes

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
<<<<<<< Updated upstream
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
=======
    { path: '/', name: 'parent-dashboard', component: () => import('@/views/ParentDashboard.vue') },
    { path: '/family', name: 'family', component: () => import('@/views/FamilyView.vue') },
    { path: '/child', name: 'child-home', component: () => import('@/views/ChildHome.vue') },
    { path: '/card', name: 'child-card', component: () => import('@/views/ChildCardManage.vue') },
    { path: '/goal', name: 'savings-goal', component: () => import('@/views/SavingsGoal.vue') },
    { path: '/notifications', name: 'notifications', component: () => import('@/views/NotificationsView.vue') },
    { path: '/tasks', name: 'tasks', component: () => import('@/views/ParentTasksView.vue') },
    // Заглушки для таб-бара
    { path: '/payments', name: 'payments', component: () => import('@/views/PlaceholderView.vue'), props: { title: 'Платежи' } },
    { path: '/history', name: 'history', component: () => import('@/views/PlaceholderView.vue'), props: { title: 'Журнал' } },
    { path: '/finances', name: 'finances', component: () => import('@/views/PlaceholderView.vue'), props: { title: 'Финансы' } },
    { path: '/more', name: 'more', component: () => import('@/views/PlaceholderView.vue'), props: { title: 'Ещё' } },
    { path: '/add-card', name: 'add-card', component: () => import('@/views/AddCardView.vue') },
>>>>>>> Stashed changes
  ],
})

export default router