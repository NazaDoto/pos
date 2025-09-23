<!-- filepath: d:\Proyectos\pos\src\components\Admin\Informes.vue -->
<template>
  <div class="p-6 space-y-8 max-w-4xl mx-auto">
    <!-- Título principal -->
    <h1 class="text-2xl font-bold mb-2">Análisis Inteligente</h1>

    <!-- Botón para análisis -->
    <button
      @click="onClickAnalisis"
      class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
    >
      Nuevo análisis
    </button>

    <!-- Sección de análisis completo -->
    <section class="bg-white p-6 rounded shadow mt-6">
      <h2 class="font-semibold text-lg mb-3">Análisis generado</h2>
      <div class="relative min-h-[10rem]">
        <div
          v-html="analisisHtml"
          class="analisis-markdown w-full h-64 border rounded p-4 bg-gray-50 overflow-auto"
        ></div>
        <!-- Loader overlay -->
        <div
          v-if="isAnalyzing"
          class="absolute inset-0 bg-white/60 flex items-center justify-center"
        >
          <div class="flex items-center gap-3">
            <svg
              class="animate-spin h-6 w-6 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
              ></path>
            </svg>
            <span class="text-gray-700">
              Generando análisis — esto puede tardar unos segundos...
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Historial de análisis -->
    <section class="bg-white p-6 rounded shadow mt-6">
      <h2 class="font-semibold text-lg mb-3">Historial de análisis</h2>
      <div v-if="historial.length === 0" class="text-gray-500">No hay resúmenes guardados.</div>
      <ul v-else class="space-y-2">
        <li
          v-for="item in historial"
          :key="item.id"
          class="group flex items-start border-b last:border-b-0 pb-4 pt-2"
        >
          <!-- Fecha y expand/collapse -->
          <div class="flex-1">
            <div
              class="flex items-center gap-2 cursor-pointer select-none"
              @click="toggleExpanded(item.id)"
            >
              <span class="text-sm text-gray-400">{{ formatearFecha(item.fecha) }}</span>
              <span class="text-blue-600 font-semibold text-xs">
                {{ expandedId === item.id ? '▲' : '▼' }}
              </span>
            </div>
            <transition name="fade">
              <div v-if="expandedId === item.id" class="mt-2">
                <div class="text-gray-600">
                  <strong>Análisis Completo</strong>
                  <div v-html="parseMarkdown(item.analisis)" class="analisis-markdown mt-2"></div>
                </div>
              </div>
            </transition>
          </div>
          <!-- Botón PDF siempre visible a la derecha -->
          <div class="flex-shrink-0 ml-4 self-start">
            <button
              @click.stop="descargarPDF(item)"
              class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-xs hover:cursor-pointer"
              title="Descargar PDF"
            >
              PDF
            </button>
          </div>
        </li>
      </ul>
    </section>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="application/pdf,image/*"
      class="hidden"
      @change="onFileSelected"
    />

    <!-- Contenedor oculto para exportar a PDF -->
    <div
      v-if="pdfHtml"
      ref="pdfExport"
      class="analisis-markdown"
      style="position: absolute; left: -9999px; top: 0; width: 800px; background: #fff; padding: 32px"
      v-html="pdfHtml"
    ></div>
  </div>
</template>
<script>
import axios from 'axios';
import { marked } from 'marked';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';

export default {
  data() {
    return {
      analisisGPTText: 'Análisis no generado aún.',
      isAnalyzing: false,
      historial: [],
      expandedId: null, // Para manejar expansión de un resumen
      pdfHtml: null, // Nuevo: para renderizar el HTML a exportar
    };
  },
  computed: {
    analisisHtml() {
      // Convierte el texto plano a HTML usando marked
      return marked.parse(this.analisisGPTText || '');
    },
  },
  methods: {
    async descargarPDF(item) {
  // 1. Tu CSS como string
  const css = `
    <style>
      body, .analisis-markdown {
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 1rem;
        color: #222;
        text-align: justify;
      }
      .analisis-markdown table {
        width: 100%;
        border-collapse: collapse;
        background: #fff;
        font-size: 0.98rem;
        margin: 1rem 0;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
      }
      .analisis-markdown th {
        background: #f3f4f6;
        font-weight: 600;
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        color: #374151;
      }
      .analisis-markdown td {
        padding: 0.5rem 0.75rem;
        border: 1px solid #e5e7eb;
      }
      .analisis-markdown tr:nth-child(even) {
        background: #f9fafb;
      }
      .analisis-markdown h1,
      .analisis-markdown h2,
      .analisis-markdown h3 {
        font-weight: 700;
        color: #166534;
        margin-top: 1.2em;
        margin-bottom: 0.5em;
      }
      .analisis-markdown h1 { font-size: 2rem; }
      .analisis-markdown h2 { font-size: 1.5rem; }
      .analisis-markdown h3 { font-size: 1.2rem; }
      .analisis-markdown ul {
        list-style: disc inside;
        margin: 0.5em 0 1em 1em;
        padding-left: 1em;
      }
      .analisis-markdown li {
        margin-bottom: 0.3em;
      }
      .analisis-markdown p {
        margin: 0.5em 0;

      }
      .analisis-markdown strong {
        font-weight: 600;
        color: #166534;
      }
    </style>
  `;

  // 2. Armá el HTML completo
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        ${css}
      </head>
      <body>
        <div class="analisis-markdown">
          ${this.parseMarkdown(item.analisis)}
        </div>
      </body>
    </html>
  `;

  // 3. Enviá el HTML al backend
  try {
    const resp = await axios.post('/generar-pdf', { html }, { responseType: 'blob' });

    // Descarga el PDF como antes
    const url = window.URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis_${this.formatearFecha(item.fecha).replace(/\//g, '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  } catch (err) {
    alert('No se pudo generar el PDF.');
    console.error(err);
  }
},
    parseMarkdown(text) {
      if (!text) return '';

      // Normaliza todas las tablas Markdown del texto
      text = text.replace(
        // Busca bloques de tabla (al menos 2 filas)
        /((?:\|[^\n]+\|\s*\n){2,})/g,
        (block) => {
          // Quita líneas vacías y separadores extra
          let lines = block
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0 && !/^(\|\s*-+\s*)+\|$/.test(l));
          if (lines.length < 2) return block; // No es tabla válida

          // Inserta separador después del encabezado
          const cols = lines[0].split('|').length - 2;
          const separator = '|' + Array(cols).fill('---').join('|') + '|';
          lines.splice(1, 0, separator);

          return '\n' + lines.join('\n') + '\n';
        }
      );

      return marked.parse(text);
    },
    formatearFecha(fechaISO) {
      const fecha = new Date(fechaISO);
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
      const anio = String(fecha.getFullYear()).slice(-2); // últimos 2 dígitos
      return `${dia}/${mes}/${anio}`;
    },
    onClickAnalisis() {
      this.$refs.fileInput.click();
    },

    toggleExpanded(id) {
      this.expandedId = this.expandedId === id ? null : id;
    },

    async onFileSelected(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      await this.uploadAndAnalyze(file);
      e.target.value = '';
    },

    async uploadAndAnalyze(file) {
      try {
        this.isAnalyzing = true;
        this.analisisGPTText = 'Generando análisis...';

        const ultimoResumen = this.historial.length > 0 ? this.historial[0].resumen : '';

        const formData = new FormData();
        formData.append('file', file);
        formData.append(
          'regionHierarchy',
          JSON.stringify(['Argentina', 'Tendencias argentinas', 'Qué se consume en argentina hoy'])
        );
        formData.append('ultimoResumen', ultimoResumen);

        const resp = await axios.post('/analizar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000,
        });

        if (resp.data && resp.data.analysis) {
          this.analisisGPTText = resp.data.analysis;

          const resumenFinal = this.analisisGPTText.substring(
            this.analisisGPTText.lastIndexOf('Resumen')
          );

          // Guardar análisis + resumen
          await axios.post('/guardarResumen', {
            analisis: this.analisisGPTText,
            resumen: resumenFinal,
          });

          // Actualizar historial
          await this.fetchHistorial();
        } else {
          this.analisisGPTText = 'No se recibió un análisis válido del servidor.';
        }
      } catch (err) {
        console.error(err);
        this.analisisGPTText = 'Error al generar el análisis. Revisá la consola del servidor.';
      } finally {
        this.isAnalyzing = false;
      }
    },

    async fetchHistorial() {
      try {
        const resp = await axios.get('/historial');
        if (resp.data && Array.isArray(resp.data)) {
          this.historial = resp.data;
        }
      } catch (err) {
        console.error('Error al cargar historial:', err);
      }
    },
  },

  mounted() {
    this.fetchHistorial();
  },
};
</script>

<style>
body, .analisis-markdown {
  font-family: Arial, Helvetica, sans-serif !important;
  font-size: 1rem;
  color: #222;
    text-align: justify;

}
.analisis-markdown table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  font-size: 0.98rem;
  margin: 1rem 0;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}
.analisis-markdown th {
  background: #f3f4f6;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  color: #374151;
}
.analisis-markdown td {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
}
.analisis-markdown tr:nth-child(even) {
  background: #f9fafb;
}
.analisis-markdown h1,
.analisis-markdown h2,
.analisis-markdown h3 {
  font-weight: 700;
  color: #166534;
  margin-top: 1.2em;
  margin-bottom: 0.5em;
}
.analisis-markdown h1 { font-size: 2rem; }
.analisis-markdown h2 { font-size: 1.5rem; }
.analisis-markdown h3 { font-size: 1.2rem; }
.analisis-markdown ul {
  list-style: disc inside;
  margin: 0.5em 0 1em 1em;
  padding-left: 1em;
}
.analisis-markdown li {
  margin-bottom: 0.3em;
}
.analisis-markdown p {
  margin: 0.5em 0;
}
.analisis-markdown strong {
  font-weight: 600;
  color: #166534;
}
</style>
