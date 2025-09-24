import { createRouter, createWebHistory } from 'vue-router'

// Importar componentes
import Login from '../components/Auth/LoginComponent.vue'
import RegisterComponent from '../components/Auth/RegisterComponent.vue'
import AdminHome from '../components/Admin/AdminHomeComponent.vue'
import Inicio from '@/components/Admin/Inicio.vue'
import Stock from '@/components/Admin/Stock.vue'
import Analisis from '@/components/Admin/Analisis.vue'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { guest: true } // Solo invitados
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterComponent,
        meta: { guest: true } // Solo invitados
    },
    {
        path: '/',
        component: AdminHome, // Layout con sidebar
        meta: { requiresAuth: true }, // Requiere login
        children: [
            {
                path: 'inicio',
                name: 'Inicio',
                component: Analisis
            },
            {
                path: '',
                redirect: 'inicio' // Default child route
            }
        ]
    },
    {
        path: '/',
        redirect: '/' // Redirige al layout principal
    },
    {
        path: '/:catchAll(.*)',
        redirect: () => {
            const token = localStorage.getItem('token')
            return token ? '/' : '/login'
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

    // Si está logueado y quiere ir a login/register → redirigir al layout
    if (token && to.meta.guest) {
        return next('/admin')
    }

    // Si requiere auth y no está logueado → redirigir a login
    if (to.meta.requiresAuth && !token) {
        return next('/login')
    }

    next()
})

export default router
