import { createRouter, createWebHistory } from 'vue-router'

// Importar componentes
import Login from '../components/Auth/LoginComponent.vue'
import RegisterComponent from '../components/Auth/RegisterComponent.vue'
import AdminHome from '../components/Admin/AdminHomeComponent.vue'
import Analisis from '@/components/Admin/Analisis.vue'
import Landing from '@/components/Landing.vue' // 👈 Nueva landing

const routes = [
    {
        path: '/',
        name: 'Landing',
        component: Landing,
        meta: { guest: true } // Pública, no requiere login
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { guest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterComponent,
        meta: { guest: true }
    },
    {
        path: '/home',
        component: AdminHome, // Layout con sidebar
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'Analizar',
                component: Analisis
            },
            {
                path: '*',
                redirect: '' // Default child route
            }
        ]
    },
    {
        path: '/:catchAll(.*)',
        redirect: () => {
            const token = localStorage.getItem('token')
            return token ? '/home' : '/login'
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// === Navigation Guards ===
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    // Si está logueado y quiere ir a login/register → redirigir al /home
    if (token && to.meta.guest && (to.name === 'Login' || to.name === 'Register')) {
        return next('/home')
    }

    // Si requiere auth y no está logueado → redirigir a login
    if (to.meta.requiresAuth && !token) {
        return next('/login')
    }

    next()
})

export default router
