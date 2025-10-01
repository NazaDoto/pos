<template>
    <div class="flex h-screen bg-gray-100">
        <!-- Modal Cambiar Contraseña -->
        <div v-if="mostrarModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    Cambiar Contraseña
                </h3>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-gray-600">Contraseña Actual</label>
                        <input v-model="formPass.actual" type="password"
                            class="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>

                    <div>
                        <label class="block text-sm text-gray-600">Nueva Contraseña</label>
                        <input v-model="formPass.nueva" type="password"
                            class="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>

                    <div>
                        <label class="block text-sm text-gray-600">Confirmar Contraseña</label>
                        <input v-model="formPass.confirmar" type="password"
                            class="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                </div>

                <!-- Botones -->
                <div class="mt-6 flex justify-end gap-3">
                    <button @click="mostrarModal = false"
                        class="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition">
                        Cancelar
                    </button>
                    <button @click="cambiarPassword"
                        class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
        <!-- Sidebar -->
        <aside
            :class="['bg-white shadow-md flex flex-col transition-all duration-300', isCollapsed ? 'w-10 sm:w-16' : 'w-64']">
            <!-- Botón colapsar/expandir -->
            <div class="flex items-center justify-between p-2 sm:p-4 border-b">
                <span v-if="!isCollapsed" class="text-xl font-bold overflow-hidden">{{ nombre }}</span>
                <button @click="toggleSidebar" class="p-1 sm:p-2 rounded-full hover:bg-gray-200"
                    :class="isCollapsed ? 'mx-auto' : ''">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            :d="isCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'" />
                    </svg>
                </button>
            </div>

            <nav class="flex-1 flex-column p-1 sm:p-2">
                <ul class="space-y-2">
                    <li>
                        <RouterLink to="/home" class="block py-2 rounded hover:bg-gray-200 transition"
                            active-class="bg-gray-300 font-semibold">
                            <span v-if="!isCollapsed" class="ml-2">Inicio</span>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mx-auto" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10h14V10" />
                            </svg>
                        </RouterLink>
                    </li>

                </ul>
            </nav>
            <!-- Botones compactos en sidebar -->
            <div class="flex flex-col gap-3 justify-center p-2 mt-auto">
                <!-- Botón Cambiar Contraseña -->
                <button @click="mostrarModal = true"
                    class="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 m-auto" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v1h1a1 1 0 011 1v6a1 1 
           0 01-1 1H8a1 1 0 01-1-1v-6a1 1 0 011-1h1v-1c0-1.1.9-2 
           2-2s2 .9 2 2v1" />
                    </svg>
                    <span v-if="!isCollapsed" class="overflow-hidden m-auto">
                        Cambiar Contraseña
                    </span>
                </button>

                <!-- Botón Cerrar Sesión -->
                <button @click="logout"
                    class="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 m-auto" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 
           01-2 2H5a2 2 0 01-2-2V7a2 2 0 
           012-2h6a2 2 0 012 2v1" />
                    </svg>
                    <span v-if="!isCollapsed" class="overflow-hidden m-auto">
                        Cerrar Sesión
                    </span>
                </button>
            </div>

        </aside>

        <!-- Main Content -->
        <main :class="['flex-1 overflow-y-auto transition-all duration-300']">
            <RouterView />
        </main>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    name: "AdminHomeComponent",
    data() {
        return {
            isCollapsed: false,
            nombre: JSON.parse(localStorage.getItem('name')) || 'Usuario',
            mostrarModal: false,
            formPass: {
                actual: "",
                nueva: "",
                confirmar: "",
            },
        };
    },
    methods: {
        async cambiarPassword() {
            if (this.formPass.nueva !== this.formPass.confirmar) {
                alert("Las contraseñas no coinciden");
                return;
            }

            try {
                await axios.put("/cambiarPASS", {
                    actual: this.formPass.actual,
                    nueva: this.formPass.nueva,
                    userId: localStorage.getItem('id')
                });
                alert("Contraseña cambiada correctamente");
                this.mostrarModal = false;
                this.formPass = { actual: "", nueva: "", confirmar: "" };
            } catch (err) {
                console.error(err);
                alert("Error al cambiar contraseña");
            }
        },
        toggleSidebar() {
            this.isCollapsed = !this.isCollapsed;
        },
        logout() {
            localStorage.removeItem('token'); // o cualquier otro dato de sesión
            window.location.href = '/'; // redirigir al login
        },
        handleResize() {
            if (window.innerWidth < 768) { // sm breakpoint de Tailwind
                this.isCollapsed = true;
            } else {
                this.isCollapsed = false;
            }
        }
    },
    mounted() {
        this.handleResize(); // al cargar
        window.addEventListener("resize", this.handleResize);
    },
    unmounted() {
        window.removeEventListener("resize", this.handleResize);
    }
};
</script>

<style>
.overflow-hidden {
    overflow: hidden;
    text-overflow: hidden;
    white-space: nowrap;
}

.flex-column {
    display: flex;
    flex-direction: column;
}
</style>