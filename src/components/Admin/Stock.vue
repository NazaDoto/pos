<template>
    <div class="p-6 space-y-6 h-screen flex flex-col">

        <div class="text-2xl font-bold">
            Stock
        </div>
        <!-- Resumen de stock -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="bg-white p-4 rounded shadow flex flex-col items-center justify-center">
                <div class="text-sm text-gray-500">Productos totales</div>
                <div class="text-2xl font-bold">{{ totalProductos }}</div>
            </div>
            <div class="bg-white p-4 rounded shadow flex flex-col items-center justify-center">
                <div class="text-sm text-gray-500">Cantidad total</div>
                <div class="text-2xl font-bold">{{ totalCantidad }}</div>
            </div>
            <div class="bg-white p-4 rounded shadow flex flex-col items-center justify-center">
                <div class="text-sm text-gray-500">Valor total ($)</div>
                <div class="text-2xl font-bold">{{ valorTotal }}</div>
            </div>
        </div>

        <!-- Fila superior: búsqueda, importación y exportación -->
        <div class="flex flex-wrap items-center gap-4 mb-4">
            <input v-model="searchTerm" @keyup.enter="buscarProducto" type="text"
                placeholder="Buscar por código o nombre"
                class="border rounded px-3 py-2 flex-1 min-w-[200px] focus:ring-2 focus:ring-blue-400" />

            <button @click="buscarProducto"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Buscar
            </button>

            <button @click="importarExcel"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                Importar Excel
            </button>

            <button @click="exportarExcel"
                class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
                Exportar Excel
            </button>

            <select v-model="filtroCategoria" class="border rounded px-3 py-2">
                <option value="">Todas las categorías</option>
                <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
            </select>
        </div>

        <!-- Contenido principal: panel lateral y tabla -->
        <div class="flex flex-1 gap-6 overflow-hidden">
            <!-- Panel lateral -->
            <div class="w-64 flex-shrink-0 space-y-4 overflow-y-auto">
                <!-- Productos críticos -->
                <div class="bg-white p-4 rounded shadow">
                    <h3 class="font-semibold mb-2">Stock crítico</h3>
                    <ul class="space-y-1 text-sm">
                        <li v-for="item in stockCritico" :key="item.codigo" class="flex justify-between">
                            {{ item.nombre }}
                            <span class="bg-red-500 text-white px-2 py-0.5 rounded-full">Crítico</span>
                        </li>
                    </ul>
                </div>

                <!-- Productos agotados -->
                <div class="bg-white p-4 rounded shadow">
                    <h3 class="font-semibold mb-2">Agotados</h3>
                    <ul class="space-y-1 text-sm">
                        <li v-for="item in stockAgotado" :key="item.codigo" class="flex justify-between">
                            {{ item.nombre }}
                            <span class="bg-gray-700 text-white px-2 py-0.5 rounded-full">0</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Tabla de stock -->
            <div class="flex-1 flex flex-col bg-white rounded shadow overflow-hidden">
                <div class="flex-1 overflow-y-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer"
                                    @click="ordenar('codigo')">Código</th>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer"
                                    @click="ordenar('nombre')">Nombre</th>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer"
                                    @click="ordenar('categoria')">Categoría</th>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer"
                                    @click="ordenar('cantidad')">Cantidad</th>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer"
                                    @click="ordenar('precio')">Precio ($)</th>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer"
                                    @click="ordenar('stockMinimo')">Stock mínimo</th>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr v-for="item in paginadoItems" :key="item.codigo" class="hover:bg-gray-50 transition">
                                <td class="px-4 py-2 text-sm text-gray-800">{{ item.codigo }}</td>
                                <td class="px-4 py-2 text-sm text-gray-800">{{ item.nombre }}</td>
                                <td class="px-4 py-2 text-sm text-gray-800">{{ item.categoria }}</td>
                                <td class="px-4 py-2 text-sm text-gray-800">
                                    {{ item.cantidad }}
                                    <span v-if="item.cantidad <= item.stockMinimo"
                                        class="ml-2 inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Crítico</span>
                                </td>
                                <td class="px-4 py-2 text-sm text-gray-800">{{ item.precio }}</td>
                                <td class="px-4 py-2 text-sm text-gray-800">{{ item.stockMinimo }}</td>
                                <td class="px-4 py-2 text-sm text-gray-800 space-x-2">
                                    <button class="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500 transition"
                                        @click="editarItem(item)">Editar</button>
                                    <button class="bg-red-500 px-2 py-1 rounded text-white hover:bg-red-600 transition"
                                        @click="eliminarItem(item)">Eliminar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginación siempre abajo -->
                <div class="flex justify-end items-center mt-2 space-x-2 p-2 bg-gray-50">
                    <button @click="paginaAnterior" :disabled="pagina === 1"
                        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Anterior</button>
                    <span>Página {{ pagina }} de {{ totalPaginas }}</span>
                    <button @click="paginaSiguiente" :disabled="pagina === totalPaginas"
                        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Siguiente</button>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default {
    name: "Stock",
    data() {
        return {
            searchTerm: "",
            filtroCategoria: "",
            categorias: ["Bebidas", "Alimentos", "Limpieza", "Varios"],
            items: [
                { codigo: "001", nombre: "Agua Mineral", categoria: "Bebidas", cantidad: 50, precio: 30, stockMinimo: 10 },
                { codigo: "002", nombre: "Coca-Cola", categoria: "Bebidas", cantidad: 5, precio: 80, stockMinimo: 10 },
                { codigo: "003", nombre: "Pan", categoria: "Alimentos", cantidad: 20, precio: 50, stockMinimo: 5 },
                { codigo: "004", nombre: "Detergente", categoria: "Limpieza", cantidad: 8, precio: 120, stockMinimo: 5 },
                { codigo: "005", nombre: "Galletas", categoria: "Alimentos", cantidad: 0, precio: 40, stockMinimo: 10 },
                { codigo: "006", nombre: "Leche", categoria: "Bebidas", cantidad: 25, precio: 60, stockMinimo: 10 },
                { codigo: "007", nombre: "Jugo de Naranja", categoria: "Bebidas", cantidad: 12, precio: 70, stockMinimo: 8 },
                { codigo: "008", nombre: "Arroz", categoria: "Alimentos", cantidad: 30, precio: 90, stockMinimo: 15 },
                { codigo: "009", nombre: "Fideos", categoria: "Alimentos", cantidad: 18, precio: 45, stockMinimo: 10 },
                { codigo: "010", nombre: "Shampoo", categoria: "Limpieza", cantidad: 15, precio: 150, stockMinimo: 5 },
                { codigo: "011", nombre: "Jabón Líquido", categoria: "Limpieza", cantidad: 7, precio: 80, stockMinimo: 5 },
                { codigo: "012", nombre: "Aceite de Girasol", categoria: "Alimentos", cantidad: 22, precio: 110, stockMinimo: 10 },
                { codigo: "013", nombre: "Azúcar", categoria: "Alimentos", cantidad: 40, precio: 50, stockMinimo: 20 },
                { codigo: "014", nombre: "Sal", categoria: "Alimentos", cantidad: 35, precio: 30, stockMinimo: 15 },
                { codigo: "015", nombre: "Cerveza", categoria: "Bebidas", cantidad: 60, precio: 120, stockMinimo: 20 },
                { codigo: "016", nombre: "Vino Tinto", categoria: "Bebidas", cantidad: 8, precio: 300, stockMinimo: 5 },
                { codigo: "017", nombre: "Papel Higiénico", categoria: "Limpieza", cantidad: 20, precio: 50, stockMinimo: 10 },
                { codigo: "018", nombre: "Cereal", categoria: "Alimentos", cantidad: 12, precio: 90, stockMinimo: 8 },
                { codigo: "019", nombre: "Manteca", categoria: "Alimentos", cantidad: 5, precio: 70, stockMinimo: 5 },
                { codigo: "020", nombre: "Lavandina", categoria: "Limpieza", cantidad: 10, precio: 60, stockMinimo: 5 }
            ]
            ,
            pagina: 1,
            itemsPorPagina: 12,
            orden: { campo: '', asc: true },
            charts: {}
        };
    },
    computed: {
        filteredItems() {
            return this.items
                .filter(item =>
                    (!this.searchTerm || item.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) || item.codigo.includes(this.searchTerm))
                )
                .filter(item =>
                    (!this.filtroCategoria || item.categoria === this.filtroCategoria)
                );
        },
        paginadoItems() {
            const inicio = (this.pagina - 1) * this.itemsPorPagina;
            return this.filteredItems.slice(inicio, inicio + this.itemsPorPagina);
        },
        totalPaginas() {
            return Math.ceil(this.filteredItems.length / this.itemsPorPagina);
        },
        totalProductos() {
            return this.items.length;
        },
        totalCantidad() {
            return this.items.reduce((sum, i) => sum + i.cantidad, 0);
        },
        valorTotal() {
            return this.items.reduce((sum, i) => sum + i.cantidad * i.precio, 0);
        },
        stockCritico() {
            return this.items.filter(i => i.cantidad <= i.stockMinimo && i.cantidad > 0);
        },
        stockAgotado() {
            return this.items.filter(i => i.cantidad === 0);
        }
    },
    methods: {
        buscarProducto() { console.log("Buscando:", this.searchTerm); },
        importarExcel() { alert("Importar Excel (simulado)"); },
        exportarExcel() { alert("Exportar Excel (simulado)"); },
        editarItem(item) { alert(`Editar: ${item.nombre}`); },
        eliminarItem(item) { this.items = this.items.filter(i => i.codigo !== item.codigo); },

        ordenar(campo) {
            if (this.orden.campo === campo) this.orden.asc = !this.orden.asc;
            else this.orden = { campo, asc: true };
            this.items.sort((a, b) => {
                if (a[campo] < b[campo]) return this.orden.asc ? -1 : 1;
                if (a[campo] > b[campo]) return this.orden.asc ? 1 : -1;
                return 0;
            });
        },

        paginaAnterior() { if (this.pagina > 1) this.pagina--; },
        paginaSiguiente() { if (this.pagina < this.totalPaginas) this.pagina++; },
    }
};
</script>

<style scoped>
/* Nada extra: todos los estilos son Tailwind */
</style>
