<template>
  <div class="space-y-8 p-4 sm:p-6">
    <!-- Bienvenida -->
    <div class="text-xl sm:text-2xl font-bold">
      Bienvenido, {{ nombre }} 👋
    </div>

    <!-- Fila 1 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <!-- Lo más vendido -->
      <!-- Ejemplo de tarjeta adaptativa -->
<div class="bg-white p-4 rounded shadow flex flex-col aspect-[4/3] sm:aspect-[16/9]">
  <h2 class="text-lg font-semibold mb-2">Lo más vendido</h2>
  <div class="flex-1">
    <canvas ref="masVendidoChart" class="w-full h-full"></canvas>
  </div>
</div>


      <!-- Total ganado -->
<div class="bg-white p-4 rounded shadow flex flex-col aspect-[4/3] sm:aspect-[16/9]">
        <h2 class="text-lg font-semibold mb-2">Total ganado</h2>
        <div class="flex-1">
          <canvas ref="totalGanadoChart" class="w-full h-full"></canvas>
        </div>
      </div>

      <!-- Stock crítico -->
<div class="bg-white p-4 rounded shadow flex flex-col aspect-[4/3] sm:aspect-[16/9]">
        <h2 class="text-lg font-semibold mb-2">Stock crítico</h2>
        <div class="flex-1 min-h-[200px]">
          <canvas ref="stockCriticoChart" class="w-full h-full"></canvas>
        </div>
      </div>
    </div>

    <!-- Fila 2 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <!-- Ventas por categoría -->
<div class="bg-white p-4 rounded shadow flex flex-col aspect-[4/3] sm:aspect-[16/9]">
        <h2 class="text-lg font-semibold mb-2">Ventas por categoría</h2>
        <div class="flex-1">
          <canvas ref="ventasCategoriaChart" class="w-full h-full"></canvas>
        </div>
      </div>

      <!-- Productos más rentables -->
<div class="bg-white p-4 rounded shadow flex flex-col aspect-[4/3] sm:aspect-[16/9]">
        <h2 class="text-lg font-semibold mb-2">Productos más rentables</h2>
        <div class="flex-1 min-h-[200px]">
          <canvas ref="productosRentablesChart" class="w-full h-full"></canvas>
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
      usuario: 'Nazareno',
      masVendidoChart: null,
      totalGanadoChart: null,
      stockCriticoChart: null,
      ventasCategoriaChart: null,
      productosRentablesChart: null,
            nombre: JSON.parse(localStorage.getItem('name')) || 'Usuario'

    }
  },
  methods: {
    crearGraficos() {
      const commonOptions = { responsive: true, maintainAspectRatio: false }

      // Lo más vendido
      new Chart(this.masVendidoChart, {
        type: 'bar',
        data: {
          labels: ['Producto A', 'Producto B', 'Producto C', 'Producto D'],
          datasets: [{ label: 'Unidades vendidas', data: [120, 90, 75, 50], backgroundColor: '#3b82f6' }]
        },
        options: { ...commonOptions, plugins: { legend: { display: false } } }
      })

      // Total ganado
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
        options: commonOptions
      })

      // Stock crítico
      new Chart(this.stockCriticoChart, {
        type: 'pie',
        data: {
          labels: ['Producto X', 'Producto Y', 'Producto Z'],
          datasets: [{ data: [5, 3, 8], backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6'] }]
        },
        options: commonOptions
      })

      // Ventas por categoría
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
        options: { ...commonOptions, scales: { x: { stacked: true }, y: { stacked: true } } }
      })

      // Productos más rentables
      new Chart(this.productosRentablesChart, {
        type: 'doughnut',
        data: {
          labels: ['Producto A', 'Producto B', 'Producto C', 'Producto D'],
          datasets: [{ data: [300, 150, 200, 100], backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'] }]
        },
        options: commonOptions
      })
    }
  },
  mounted() {
    this.masVendidoChart = this.$refs.masVendidoChart
    this.totalGanadoChart = this.$refs.totalGanadoChart
    this.stockCriticoChart = this.$refs.stockCriticoChart
    this.ventasCategoriaChart = this.$refs.ventasCategoriaChart
    this.productosRentablesChart = this.$refs.productosRentablesChart

    this.crearGraficos()
  }
}
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
