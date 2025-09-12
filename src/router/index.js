import { createRouter, createWebHistory } from 'vue-router'

// Importar componentes
import Login from '../components/Auth/LoginComponent.vue'
import AdminHome from '../components/Admin/AdminHomeComponent.vue'

// Rutas hijas para el área de administración
const adminChildren = [{
        path: 'inicio',
        name: 'Inicio',
        component: () =>
            import ('@/components/Admin/Inicio.vue') // lo crearás después
    },
    {
        path: 'stock',
        name: 'Stock',
        component: () =>
            import ('@/components/Admin/Stock.vue') // lo crearás después
    },
    {
        path: 'informes',
        name: 'Informes',
        component: () =>
            import ('@/components/Admin/Informes.vue') // lo crearás después
    }
]

const routes = [{
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/admin',
        component: AdminHome,
        children: adminChildren
    },
    {
        path: '/',
        redirect: '/admin/inicio'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router