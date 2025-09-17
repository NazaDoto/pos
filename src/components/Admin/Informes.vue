<template>
  <div class="p-6 space-y-6">
    <!-- Título -->
    <h1 class="text-2xl font-bold">Informes Avanzados</h1>

    <!-- Filtros avanzados -->
    <div class="flex flex-wrap items-center gap-4">
      <input type="date" v-model="filtroFechaInicio" class="border rounded px-3 py-2" placeholder="Desde" />
      <input type="date" v-model="filtroFechaFin" class="border rounded px-3 py-2" placeholder="Hasta" />

      <select v-model="filtroCategoria" class="border rounded px-3 py-2">
        <option value="">Todas las categorías</option>
        <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
      </select>

      <label class="flex items-center space-x-2">
        <input type="checkbox" v-model="soloCritico" />
        <span class="text-sm">Solo productos críticos</span>
      </label>

      <button @click="onClickAnalisis" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
        Análisis Inteligente
      </button>

      <button @click="generarInforme" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
        Generar Informe
      </button>
    </div>

    <!-- Resumen rápido -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <div class="bg-white p-4 rounded shadow flex flex-col items-center justify-center">
        <div class="text-sm text-gray-500">Productos analizados</div>
        <div class="text-2xl font-bold">{{ resumen.totalProductos }}</div>
      </div>
      <div class="bg-white p-4 rounded shadow flex flex-col items-center justify-center">
        <div class="text-sm text-gray-500">Total vendido</div>
        <div class="text-2xl font-bold">{{ resumen.totalVendido }}</div>
      </div>
      <div class="bg-white p-4 rounded shadow flex flex-col items-center justify-center">
        <div class="text-sm text-gray-500">Stock crítico</div>
        <div class="text-2xl font-bold">{{ resumen.stockCritico }}</div>
      </div>
    </div>

    <!-- Gráficos dinámicos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <div class="bg-white p-4 rounded shadow h-72">
        <h3 class="font-semibold mb-2">Top productos vendidos</h3>
        <canvas ref="topVendidosChart"></canvas>
      </div>

      <div class="bg-white p-4 rounded shadow h-72 flex flex-col">
        <h3 class="font-semibold mb-2">Productos con menor stock</h3>
        <div class="flex-1 relative min-h-[200px]">
          <canvas ref="stockCriticoChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Sección de análisis completo -->
    <div class="bg-white p-4 rounded shadow mt-6">
      <h3 class="font-semibold mb-2">Análisis completo de ventas</h3>
      <div class="relative">
        <textarea readonly class="w-full h-40 border rounded p-2 bg-gray-50" :value="analisisGPTText"></textarea>

        <!-- Loader overlay -->
        <div v-if="isAnalyzing" class="absolute inset-0 bg-white/60 flex items-center justify-center">
          <div class="flex items-center gap-3">
            <svg class="animate-spin h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
            </svg>
            <span class="text-gray-700">Generando análisis — esto puede tardar unos segundos...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Nueva sección: Historial de resúmenes -->
    <div class="bg-white p-4 rounded shadow mt-6">
      <h3 class="font-semibold mb-2">Historial de resúmenes</h3>
      <div v-if="historial.length === 0" class="text-gray-500">No hay resúmenes guardados.</div>
      <ul v-else class="space-y-2 max-h-64 overflow-y-auto">
        <li v-for="item in historial" :key="item.id" class="border p-2 rounded bg-gray-50">
          <div class="text-sm text-gray-400">{{ item.fecha }}</div>
          <div>{{ item.resumen }}</div>
        </li>
      </ul>
    </div>

    <!-- hidden file input -->
    <input ref="fileInput" type="file" accept="application/pdf,image/*" class="hidden" @change="onFileSelected" />
  </div>
</template>

<script>
import { Chart, registerables } from "chart.js";
import axios from "axios";
Chart.register(...registerables);

export default {
  data() {
    return {
      filtroFechaInicio: "",
      filtroFechaFin: "",
      filtroCategoria: "",
      soloCritico: false,
      categorias: ["Bebidas", "Alimentos", "Limpieza", "Varios"],
      resumen: { totalProductos: 0, totalVendido: 0, stockCritico: 0 },
      items: [
        { codigo: "001", nombre: "Agua Mineral", categoria: "Bebidas", cantidad: 50, vendido: 120, stockMinimo: 10 },
        { codigo: "002", nombre: "Coca-Cola", categoria: "Bebidas", cantidad: 5, vendido: 200, stockMinimo: 10 },
        { codigo: "003", nombre: "Pan", categoria: "Alimentos", cantidad: 20, vendido: 90, stockMinimo: 5 },
        { codigo: "004", nombre: "Detergente", categoria: "Limpieza", cantidad: 8, vendido: 40, stockMinimo: 5 },
        { codigo: "005", nombre: "Galletas", categoria: "Alimentos", cantidad: 0, vendido: 75, stockMinimo: 10 }
      ],
      charts: {},
      analisisGPTText: "Análisis no generado aún.",
      isAnalyzing: false,
      historial: [] // nuevo array para historial
    };
  },
  methods: {
    generarInforme() {
      let filtrados = this.items
        .filter(i => !this.filtroCategoria || i.categoria === this.filtroCategoria)
        .filter(i => !this.soloCritico || i.cantidad <= i.stockMinimo);

      this.resumen.totalProductos = filtrados.length;
      this.resumen.totalVendido = filtrados.reduce((sum, i) => sum + (i.vendido || 0), 0);
      this.resumen.stockCritico = filtrados.filter(i => i.cantidad <= i.stockMinimo).length;

      this.renderCharts(filtrados);
    },

    renderCharts(data) {
      const topCtx = this.$refs.topVendidosChart;
      if (this.charts.topVendidos) this.charts.topVendidos.destroy();
      this.charts.topVendidos = new Chart(topCtx, {
        type: "bar",
        data: { labels: data.map(i => i.nombre), datasets: [{ label: "Vendidos", data: data.map(i => i.vendido), backgroundColor: "#3b82f6" }] },
        options: { responsive: true, maintainAspectRatio: false }
      });

      const stockCtx = this.$refs.stockCriticoChart;
      if (this.charts.stockCritico) this.charts.stockCritico.destroy();
      this.charts.stockCritico = new Chart(stockCtx, {
        type: "pie",
        data: { labels: data.map(i => i.nombre), datasets: [{ data: data.map(i => i.cantidad), backgroundColor: ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"] }] },
        options: { responsive: true, maintainAspectRatio: false }
      });
    },

    onClickAnalisis() {
      this.$refs.fileInput.click();
    },

    async onFileSelected(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      await this.uploadAndAnalyze(file);
      e.target.value = "";
    },

    async uploadAndAnalyze(file) {
      try {
        this.isAnalyzing = true;
        this.analisisGPTText = "Generando análisis...";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("filtroFechaInicio", this.filtroFechaInicio || "");
        formData.append("filtroFechaFin", this.filtroFechaFin || "");
        formData.append("filtroCategoria", this.filtroCategoria || "");
        formData.append("regionHierarchy", JSON.stringify(['Argentina', 'Tendencias argentinas', 'Qué se consume en argentina hoy']));

        const resp = await axios.post("/analizar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120000
        });

        if (resp.data && resp.data.analysis) {
          this.analisisGPTText = resp.data.analysis;

          // Extraer el resumen final (últimas líneas después de "Al final quiero un resumen preciso")
          const resumenMatch = this.analisisGPTText.match(/Resumen preciso[:\s]*([\s\S]*)$/i);
          const resumenFinal = resumenMatch ? resumenMatch[1].trim() : this.analisisGPTText.slice(-200); // fallback: últimas 200 chars

          // Guardar resumen en DB
          //await axios.post("/guardarResumen", { resumen: resumenFinal });

          // Actualizar historial local
          //await this.fetchHistorial();
        } else {
          this.analisisGPTText = "No se recibió un análisis válido del servidor.";
        }
      } catch (err) {
        console.error(err);
        this.analisisGPTText = "Error al generar el análisis. Revisá la consola del servidor.";
      } finally {
        this.isAnalyzing = false;
      }
    },

    async fetchHistorial() {
      try {
        const resp = await axios.get("/historial");
        if (resp.data && Array.isArray(resp.data)) {
          this.historial = resp.data;
        }
      } catch (err) {
        console.error("Error al cargar historial:", err);
      }
    }
  },

  mounted() {
    this.generarInforme();
    this.fetchHistorial(); // cargar historial al inicio
  }
};
</script>

<style scoped>
/* textarea style kept in-line via value binding */
</style>
