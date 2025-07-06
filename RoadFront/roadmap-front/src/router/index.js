import { createRouter, createWebHistory } from 'vue-router'
import RoadmapView from '../views/RoadmapView.vue'
import HomeView from '../views/HomeView.vue'
import SettingsView from '../views/SettingsView.vue'
import ProfileView from '../views/ProfileView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AdminPage from '../views/AdminPage.vue'
import SyllabusSearch from '../views/SyllabusSearch.vue'
import MySyllabuses from '../views/MySyllabuses.vue'
import TestView from '../views/TestView.vue'

const routes = [
    {
        path: '/roadmap/:subjectId',
        name: 'roadmap',
        component: RoadmapView,
        props: true,
    },
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/test',
        name: 'test',
        component: TestView
    },
    {
        path: '/settings',
        name: 'settings',
        component: SettingsView
    },
    {
        path: '/profile',
        name: 'profile',
        component: ProfileView
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterView
    },
    {
        path: '/admin',
        name: 'admin',
        component: AdminPage
    },
    {
        path: '/syllabus-search',
        name: 'syllabus-search',
        component: SyllabusSearch
    },
    {
        path: '/my-syllabuses',
        name: 'my-syllabuses',
        component: MySyllabuses
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

// Глобальный навигейшн-гард для защиты роутов
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem('token');

  if (authRequired && !token) {
    return next('/login');
  }
  next();
});

export default router