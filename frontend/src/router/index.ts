/**
 * Маршруты «М-Беларусбанк Family».
 */
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'parent-dashboard', component: () => import('@/views/ParentDashboard.vue') },
    { path: '/family', name: 'family', component: () => import('@/views/FamilyView.vue') },
    { path: '/child', name: 'child-home', component: () => import('@/views/ChildHome.vue') },
    { path: '/card', name: 'child-card', component: () => import('@/views/ChildCardManage.vue') },
    { path: '/goal', name: 'savings-goal', component: () => import('@/views/SavingsGoal.vue') },
    { path: '/notifications', name: 'notifications', component: () => import('@/views/NotificationsView.vue') },
    { path: '/tasks', name: 'tasks', component: () => import('@/views/ParentTasksView.vue') },
    { path: '/add-card', name: 'add-card', component: () => import('@/views/AddCardView.vue') },
    // Заглушки для таб-бара
    { path: '/payments', name: 'payments', component: () => import('@/views/PlaceholderView.vue'), props: { title: 'Платежи' } },
    { path: '/history', name: 'history', component: () => import('@/views/PlaceholderView.vue'), props: { title: 'Журнал' } },
    { path: '/finances', name: 'finances', component: () => import('@/views/PlaceholderView.vue'), props: { title: 'Финансы' } },
    { path: '/more', name: 'more', component: () => import('@/views/PlaceholderView.vue'), props: { title: 'Ещё' } },
    { path: '/add-child', name: 'add-child', component: () => import('@/views/AddChildView.vue') },
    { path: '/child-dashboard', name: 'child-dashboard', component: () => import('@/views/ChildDashboard.vue') },
  ],
})

export default router