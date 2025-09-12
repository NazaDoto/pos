<template>
    <div class="space-y-8 p-6">
        <!-- Bienvenida -->
        <div class="text-2xl font-bold">
            Bienvenido, {{ usuario }} 👋
        </div>

        <!-- Fila 1 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Lo más vendido -->
            <div class="bg-white p-4 rounded shadow h-72 flex flex-col">
                <h2 class="text-lg font-semibold mb-2">Lo más vendido</h2>
                <div class="flex-1">
                    <canvas ref="masVendidoChart"></canvas>
                </div>
            </div>

            <!-- Total ganado -->
            <div class="bg-white p-4 rounded shadow h-72 flex flex-col">
                <h2 class="text-lg font-semibold mb-2">Total ganado</h2>
                <div class="flex-1">
                    <canvas ref="totalGanadoChart"></canvas>
                </div>
            </div>

            <!-- Stock crítico -->
            <div class="bg-white p-4 rounded shadow h-72 flex flex-col">
                <h2 class="text-lg font-semibold mb-2">Stock crítico</h2>
                <div class="flex-1 relative min-h-[200px]">
                    <canvas ref="stockCriticoChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Fila 2 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Ventas por categoría -->
            <div class="bg-white p-4 rounded shadow h-72 flex flex-col">
                <h2 class="text-lg font-semibold mb-2">Ventas por categoría</h2>
                <div class="flex-1">
                    <canvas ref="ventasCategoriaChart"></canvas>
                </div>
            </div>

            <!-- Evolución de clientes -->
            <div class="bg-white p-4 rounded shadow h-72 flex flex-col">
                <h2 class="text-lg font-semibold mb-2">Evolución de clientes</h2>
                <div class="flex-1">
                    <canvas ref="clientesChart"></canvas>
                </div>
            </div>

            <!-- Productos más rentables -->
            <div class="bg-white p-4 rounded shadow h-72 flex flex-col">
                <h2 class="text-lg font-semibold mb-2">Productos más rentables</h2>
                <div class="flex-1 relative min-h-[200px]">
                    <canvas ref="productosRentablesChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default {
    name: 'Inicio',
    data() {
        return {
            usuario: 'Nazareno', // luego reemplazar por store/API
            masVendidoChart: null,
            totalGanadoChart: null,
            stockCriticoChart: null,
            ventasCategoriaChart: null,
            clientesChart: null,
            productosRentablesChart: null
        }
    },
    methods: {
        crearGraficos() {
            // --- Fila 1 ---
            // Lo más vendido - barras
            new Chart(this.masVendidoChart, {
                type: 'bar',
                data: {
                    labels: ['Producto A', 'Producto B', 'Producto C', 'Producto D'],
                    datasets: [{
                        label: 'Unidades vendidas',
                        data: [120, 90, 75, 50],
                        backgroundColor: '#3b82f6'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            })

            // Total ganado - línea
            new Chart(this.totalGanadoChart, {
                type: 'line',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
                    datasets: [{
                        label: 'Total ganado ($)',
                        data: [5000, 7000, 6000, 8000, 9000],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16,185,129,0.2)',
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            })

            // Stock crítico - pie
            new Chart(this.stockCriticoChart, {
                type: 'pie',
                data: {
                    labels: ['Producto X', 'Producto Y', 'Producto Z'],
                    datasets: [{
                        data: [5, 3, 8],
                        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { tooltip: { enabled: true } }
                }
            })

            // --- Fila 2 ---
            // Ventas por categoría - barras apiladas
            new Chart(this.ventasCategoriaChart, {
                type: 'bar',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
                    datasets: [
                        { label: 'Bebidas', data: [50, 60, 55, 70, 65], backgroundColor: '#3b82f6' },
                        { label: 'Alimentos', data: [30, 25, 40, 35, 50], backgroundColor: '#f59e0b' },
                        { label: 'Limpieza', data: [20, 15, 25, 20, 30], backgroundColor: '#10b981' }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { tooltip: { enabled: true } },
                    scales: { x: { stacked: true }, y: { stacked: true } }
                }
            })

            // Evolución de clientes - línea
            new Chart(this.clientesChart, {
                type: 'line',
                data: {
                    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                    datasets: [{
                        label: 'Clientes nuevos',
                        data: [5, 8, 6, 10, 7, 12, 9],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59,130,246,0.2)',
                        tension: 0.3,
                        fill: true
                    }, {
                        label: 'Clientes recurrentes',
                        data: [15, 12, 18, 14, 20, 17, 22],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16,185,129,0.2)',
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            })

            // Productos más rentables - doughnut
            new Chart(this.productosRentablesChart, {
                type: 'doughnut',
                data: {
                    labels: ['Producto A', 'Producto B', 'Producto C', 'Producto D'],
                    datasets: [{
                        data: [300, 150, 200, 100],
                        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { tooltip: { enabled: true } }
                }
            })
        }
    },
    mounted() {
        // Guardar refs
        this.masVendidoChart = this.$refs.masVendidoChart
        this.totalGanadoChart = this.$refs.totalGanadoChart
        this.stockCriticoChart = this.$refs.stockCriticoChart
        this.ventasCategoriaChart = this.$refs.ventasCategoriaChart
        this.clientesChart = this.$refs.clientesChart
        this.productosRentablesChart = this.$refs.productosRentablesChart

        // Crear gráficos
        this.crearGraficos()
    }
}
</script>

<style scoped>
/* El tamaño del canvas se ajusta por el contenedor, maintainAspectRatio: false permite hover correcto */
</style>
