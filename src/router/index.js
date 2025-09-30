import { createRouter, createWebHistory } from 'vue-router'

// Importar componentes
import Login from '../components/Auth/LoginComponent.vue'
import RegisterComponent from '../components/Auth/RegisterComponent.vue'
import UsuarioHome from '../components/Usuario/UsuarioHomeComponent.vue'
import Analisis from '@/components/Usuario/Analisis.vue'
import Landing from '@/components/Landing.vue' // 👈 Nueva landing
import Admin from '@/components/Admin/AdminComponent.vue'

const routes = [{
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
        path: '/admin',
        name: 'Admin',
        component: Admin,
        meta: { requiresAuth: true }
    },
    {
        path: '/home',
        component: UsuarioHome, // Layout con sidebar
        meta: { requiresAuth: true },
        children: [{
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
            const nivel = JSON.parse(localStorage.getItem('nivel'))
            if (!token) return '/login'
            return nivel === 1 ? '/admin' : '/home'
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
    const nivel = JSON.parse(localStorage.getItem('id') || null) // obtener nivel o id

    // Si está logueado y quiere ir a login/register → redirigir al /home o /admin
    if (token && to.meta.guest && (to.name === 'Login' || to.name === 'Register')) {
        if (nivel === 1) return next('/admin') // admin
        return next('/home') // usuario normal
    }

    // Si requiere auth y no está logueado → redirigir a login
    if (to.meta.requiresAuth && !token) {
        return next('/login')
    }

    // 🚨 Protección de ruta admin
    if (to.path === '/admin') {
        if (!token || nivel !== 1) {
            return next('/home') // Redirige usuarios normales
        }
    }

    next()
})


export default router
