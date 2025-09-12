<template>
    <div class="flex h-screen bg-gray-100">
        <!-- Sidebar -->
        <aside class="w-64 bg-white shadow-md flex flex-col">
            <div class="p-4 text-xl font-bold border-b">Mi POS</div>
            <nav class="flex-1 p-4">
                <ul class="space-y-2">
                    <li>
                        <RouterLink to="/admin/inicio" class="block px-4 py-2 rounded hover:bg-gray-200 transition"
                            active-class="bg-gray-300 font-semibold">
                            Inicio
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/admin/stock" class="block px-4 py-2 rounded hover:bg-gray-200 transition"
                            active-class="bg-gray-300 font-semibold">
                            Stock
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/admin/informes" class="block px-4 py-2 rounded hover:bg-gray-200 transition"
                            active-class="bg-gray-300 font-semibold">
                            Informes
                        </RouterLink>
                    </li>
                </ul>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto">
            <RouterView />
        </main>
    </div>
</template>

<script setup>
// no lógica todavía, el sidebar está fijo y el router-view se encarga del contenido dinámico
</script>
