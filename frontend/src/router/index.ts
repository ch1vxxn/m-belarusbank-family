import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'parent-dashboard', component: () => import('@/views/ParentDashboard.vue') },
    { path: '/family', name: 'family', component: () => import('@/views/FamilyView.vue') }, // НОВЫЙ РОУТ
    { path: '/child', name: 'child-home', component: () => import('@/views/ChildHome.vue') },
    { path: '/card', name: 'child-card', component: () => import('@/views/ChildCardManage.vue') },
    { path: '/goal', name: 'savings-goal', component: () => import('@/views/SavingsGoal.vue') },
    { path: '/notifications', name: 'notifications', component: () => import('@/views/NotificationsView.vue') },
    // Заглушки
    { path: '/payments', name: 'payments', component: () => import('@/views/PlaceholderView.vue'), props: { title: 'Платежи' } },
    { path: '/history', name: 'history', component: () => import('@/views/PlaceholderView.vue'), props: { title: 'Журнал' } },
    { path: '/finances', name: 'finances', component: () => import('@/views/PlaceholderView.vue'), props: { title: 'Финансы' } },
    { path: '/more', name: 'more', component: () => import('@/views/PlaceholderView.vue'), props: { title: 'Ещё' } },
    { path: '/tasks', name: 'tasks', component: () => import('@/views/ParentTasksView.vue'), meta: { transition: 'slide' }},
  ],
})

export default router