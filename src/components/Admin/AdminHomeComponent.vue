<template>
    <div class="flex h-screen bg-gray-100">
        <!-- Sidebar -->
        <aside :class="['bg-white shadow-md flex flex-col transition-all duration-300', isCollapsed ? 'w-16' : 'w-64']">
            <!-- Botón colapsar/expandir -->
            <div class="flex items-center justify-between p-4 border-b">
                <span v-if="!isCollapsed" class="text-xl font-bold overflow-hidden">{{ nombre }}</span>
                <button @click="toggleSidebar" class="p-1 rounded hover:bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            :d="isCollapsed ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'" />
                    </svg>
                </button>
            </div>

            <nav class="flex-1 flex-column p-4">
                <ul class="space-y-2">
                    <li>
                        <RouterLink to="/inicio" class="block py-2 rounded hover:bg-gray-200 transition"
                            active-class="bg-gray-300 font-semibold">
                            <span v-if="!isCollapsed" class="ml-2">Inicio</span>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mx-auto" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10h14V10" />
                            </svg>
                        </RouterLink>
                    </li>
                    <!-- <li>
                        <RouterLink to="/stock" class="block py-2 rounded hover:bg-gray-200 transition"
                            active-class="bg-gray-300 font-semibold">
                            <span v-if="!isCollapsed" class="ml-2">Stock</span>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mx-auto" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
                            </svg>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/analisis" class="block py-2 rounded hover:bg-gray-200 transition"
                            active-class="bg-gray-300 font-semibold">
                            <span v-if="!isCollapsed" class="ml-2">Análisis</span>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto" fill="none"
                                viewBox="4 -4 16 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 2a6 6 0 00-6 6c0 2.21 1.343 4.099 3.23 5.024L10 16h4l.77-2.976A5.997 5.997 0 0018 8a6 6 0 00-6-6z" />
                            </svg>

                        </RouterLink>
                    </li> -->
                </ul>
            </nav>
            <!-- Botón de cerrar sesión compacto -->
            <div class="flex justify-center p-2 mt-auto border-t">
                <button @click="logout"
                    class="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                    </svg>
                    <span v-if="!isCollapsed">Cerrar Sesión</span>
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

export default {
  name: "AdminHomeComponent",
  data() {
    return {
      isCollapsed: false,
      nombre: JSON.parse(localStorage.getItem('name')) || 'Usuario'
    };
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
    },
    logout() {
      localStorage.removeItem('token'); // o cualquier otro dato de sesión
      window.location.href = '/login'; // redirigir al login
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
.flex-column{
    display: flex;
    flex-direction: column; 
}
</style>