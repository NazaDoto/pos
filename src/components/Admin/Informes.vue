<template>
  <div class="p-6 space-y-6">
    <!-- Título -->
    <h1 class="text-2xl font-bold">Análisis Inteligente</h1>

    <!-- Botón para análisis -->
    <button @click="onClickAnalisis" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 hover:cursor-pointer transition">
      Análisis Inteligente
    </button>

    <!-- Sección de análisis completo -->
    <div class="bg-white p-4 rounded shadow mt-6">
      <h3 class="font-semibold mb-2">Análisis generado</h3>
      <div class="relative">
        <textarea readonly class="w-full h-64 border rounded p-2 bg-gray-50" :value="analisisGPTText"></textarea>

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

    <!-- Historial de resúmenes -->
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

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="application/pdf,image/*" class="hidden" @change="onFileSelected" />
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      analisisGPTText: "Análisis no generado aún.",
      isAnalyzing: false,
      historial: [] // historial de resúmenes
    };
  },
  methods: {
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

    // Tomar el último resumen del historial
    const ultimoResumen = this.historial.length > 0
      ? this.historial[0].resumen
      : "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("regionHierarchy", JSON.stringify(['Argentina', 'Tendencias argentinas', 'Qué se consume en argentina hoy']));
    formData.append("ultimoResumen", ultimoResumen); // <-- envío del último resumen

    const resp = await axios.post("/analizar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000
    });

    if (resp.data && resp.data.analysis) {
      this.analisisGPTText = resp.data.analysis;

      const resumenFinal = this.analisisGPTText.substring(this.analisisGPTText.lastIndexOf("Resumen"));

      // Guardar resumen en DB
      await axios.post("/guardarResumen", { resumen: resumenFinal });

      // Actualizar historial
      await this.fetchHistorial();
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
    this.fetchHistorial();
  }
};
</script>

<style scoped>
/* Mantener estilo simple */

</style>
