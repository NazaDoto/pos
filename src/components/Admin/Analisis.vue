<template>
  <div class="p-4 sm:p-6 mx-auto space-y-6 md:space-y-0 md:flex md:gap-6 min-h-screen">

    <!-- Columna principal: Análisis -->
    <div class="flex-1 space-y-6">
      <h1 class="text-2xl font-bold mb-4">Análisis Inteligente</h1>

      <!-- Botones subir + analizar -->
      <div class="flex flex-col md:flex-row md:items-start md:space-x-4 space-y-2 md:space-y-0">
        <button @click="$refs.fileInput.click()"
          class="bg-blue-600 text-white px-4 py-2 rounded w-full md:w-auto shadow-sm hover:shadow-md hover:bg-blue-700 transition-colors whitespace-nowrap">
          Subir archivos
        </button>

        <button @click="analizarArchivos"
          class="bg-green-600 text-white px-4 py-2 rounded w-full md:w-auto shadow-sm hover:shadow-md hover:bg-green-700 transition-colors whitespace-nowrap"
          :disabled="archivosSubidos.length === 0 || isAnalyzing">
          {{ isAnalyzing ? 'Analizando...' : 'Analizar' }}
        </button>

        <p class="text-sm text-gray-500 md:mt-1">
          Sube uno o más archivos y luego clic en "Analizar" para generar el análisis. Formatos soportados: PDF, Excel,
          imágenes.
        </p>
      </div>

      <!-- Previsualización de archivos subidos -->
      <div v-if="archivosSubidos.length"
        class="flex flex-wrap gap-3 bg-white p-6 rounded-lg shadow-md max-w-200">
        <div v-for="(file, index) in archivosSubidos" :key="index" class="flex flex-col items-center w-20">

          <!-- Miniatura o icono -->
          <div class="w-20 h-20 overflow-hidden flex items-center justify-center bg-white">
            <img v-if="file.preview" :src="file.preview" class="object-contain w-full h-full" />
            <span v-else class="text-gray-500 text-xs text-center">Archivo</span>
          </div>

          <!-- Nombre del archivo -->
          <span class="text-xs text-center mt-1 break-words w-full">{{ file.name }}</span>

          <!-- Botón eliminar -->
          <button @click="eliminarArchivo(index)" class="text-red-600 hover:text-red-800 text-xs mt-1">Eliminar</button>
        </div>
      </div>


      <!-- Sección de análisis completo -->
      <section class="bg-white p-6 rounded-lg shadow-md max-w-200">
        <h2 class="font-semibold text-lg mb-3">Análisis generado</h2>
        <div class="relative min-h-[10rem] border rounded-lg overflow-hidden bg-gray-50">
          <div v-html="analisisHtml" class="analisis-markdown h-64 p-4 overflow-auto break-words"></div>

          <div v-if="isAnalyzing"
            class="absolute inset-0 bg-white/70 flex flex-col items-center justify-center backdrop-blur-sm">
            <svg class="animate-spin h-6 w-6 text-green-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
            </svg>
            <span class="text-gray-700 text-sm text-center px-4">
              Generando análisis — esto puede tardar unos segundos...
            </span>
          </div>
        </div>
      </section>
    </div>

    <!-- Columna secundaria: Historial -->
<div class="w-full md:w-1/3 flex flex-col space-y-4">
  <section class="bg-white p-6 rounded-lg shadow-md flex flex-col">
    <h2 class="font-semibold text-lg mb-4">Historial de análisis</h2>

    <div v-if="historial.length === 0" class="text-gray-400 text-sm text-center py-6">
      No hay resúmenes guardados.
    </div>

    <!-- Contenedor con scroll -->
    <div class="flex-1 overflow-auto max-h-[500px] space-y-2">
      <div v-for="item in historial" :key="item.id"
           class="rounded-lg border border-gray-200 hover:shadow-sm transition bg-white">

        <!-- Header del historial con PDF -->
        <div
          class="flex justify-between items-center px-3 py-2 cursor-pointer select-none border-b border-gray-200 bg-gray-50"
          @click="abrirModalHistorial(item)">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">{{ formatearFecha(item.fecha) }}</span>
            <span class="text-blue-600 font-semibold text-xs">Ver detalle</span>
          </div>

          <!-- Botón PDF -->
          <button @click.stop="descargarPDF(item)"
                  class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-xs flex items-center justify-center"
                  :disabled="loadingPdfId === item.id">
            <span v-if="loadingPdfId === item.id"
                  class="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-1"></span>
            {{ loadingPdfId === item.id ? 'Generando...' : 'PDF' }}
          </button>
        </div>

      </div>
    </div>
  </section>
</div>

<!-- Modal Historial -->
<transition name="fade">
  <div v-if="modalHistorialAbierto"
       class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
       @click.self="cerrarModalHistorial">
    <div class="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto relative p-6">
      <!-- Botón cerrar -->
      <button @click="cerrarModalHistorial"
              class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold">
        ×
      </button>

      <h2 class="text-lg font-semibold mb-4">Detalle del análisis</h2>
      <div class="text-gray-700 analisis-markdown" v-html="historialSeleccionado?.analisis"></div>
    </div>
  </div>
</transition>


    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="application/pdf,image/*" class="hidden" @change="onFilesSelected" />

    <!-- Contenedor oculto para exportar a PDF -->
    <div v-if="pdfHtml" ref="pdfExport" class="analisis-markdown"
      style="position: absolute; left: -9999px; top: 0; width: 800px; background: #fff; padding: 32px" v-html="pdfHtml">
    </div>
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
      archivosSubidos: [],
modalHistorialAbierto: false,
      historialSeleccionado: null,
      expandedId: null, // Para manejar expansión de un resumen
      pdfHtml: null, // Nuevo: para renderizar el HTML a exportar
      loadingPdfId: null, // NUEVO: id del historial que se está generando en PDF

    };
  },
  computed: {
    analisisHtml() {
      // Convierte el texto plano a HTML usando marked
      return marked.parse(this.analisisGPTText || '');
    },
  },
  methods: {
    abrirModalHistorial(item) {
      this.historialSeleccionado = item;
      this.modalHistorialAbierto = true;
    },
    cerrarModalHistorial() {
      this.historialSeleccionado = null;
      this.modalHistorialAbierto = false;
    },
    async descargarPDF(item) {
      // 1. Tu CSS como string
      this.loadingPdfId = item.id; // Indica que se está generando PDF

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
        const resp = await axios.post('/generar-pdf', {
          html: html,
          title: `Analisis_${this.formatearFecha(item.fecha).replace(/\//g, '-')}`
        }, { responseType: 'blob' });

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
      } finally {
        this.loadingPdfId = null; // Termina el loader
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
    async onFilesSelected(e) {
      const files = e.target.files;
      if (!files) return;

      Array.from(files).forEach(file => {
        const fileObj = { file, name: file.name, preview: null };

        // Solo generar preview si es imagen
        if (file.type.startsWith('image/')) {
          fileObj.preview = URL.createObjectURL(file);
        } else if (file.type === 'application/pdf') {
          // Opcional: icono genérico para PDF
          fileObj.preview = '/img/pdf-icon.png';
        }

        this.archivosSubidos.push(fileObj);
      });

      e.target.value = ''; // reset para poder subir los mismos archivos otra vez
    },

    eliminarArchivo(index) {
      const fileObj = this.archivosSubidos[index];
      if (fileObj.preview && fileObj.file.type.startsWith('image/')) {
        URL.revokeObjectURL(fileObj.preview);
      }
      this.archivosSubidos.splice(index, 1);
    },


    async analizarArchivos() {
      if (this.archivosSubidos.length === 0){
        await console.log('No hay archivos para analizar');
        alert('Por favor, subí al menos un archivo para analizar.');
      } else {

        this.isAnalyzing = true;
        this.analisisGPTText = 'Generando análisis...';
  
        try {
          const formData = new FormData();
          this.archivosSubidos.forEach(fileObj => formData.append('files[]', fileObj.file));
  
          const resp = await axios.post('/analizar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000,
          });
  
          if (resp.data && resp.data.analysis) {
            this.analisisGPTText = resp.data.analysis;
            // Opcional: limpiar archivos después del análisis
            this.archivosSubidos = [];
            // Actualizar historial si tu endpoint lo requiere
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
      }
    },

    async fetchHistorial() {
      try {
        const resp = await axios.get('/historial');
        if (resp.data && Array.isArray(resp.data)) this.historial = resp.data;
      } catch (err) {
        console.error(err);
      }
    },
  },

  mounted() {
    this.fetchHistorial();
  },
};
</script>

<style>
body,
.analisis-markdown {
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

.space-between {
  display: flex;
  justify-content: space-between
}
.bg-green-600:disabled{
  background-color: #16a34a !important;
  cursor: not-allowed;
  opacity: 0.6;
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

.analisis-markdown h1 {
  font-size: 2rem;
}

.analisis-markdown h2 {
  font-size: 1.5rem;
}

.analisis-markdown h3 {
  font-size: 1.2rem;
}

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
