import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import XLSX from 'xlsx';
import { createWorker } from 'tesseract.js';
import OpenAI from 'openai';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PORT = process.env.PORT || 3000;

// === OCR Worker Singleton ===
let ocrWorker = null;
async function ensureOcrWorker() {
    if (!ocrWorker) {
        ocrWorker = await createWorker('spa'); // sin logger en Node
    }
}

function getExtFromFilename(filename) {
    return path.extname(filename || '').toLowerCase();
}

// Función para extraer texto de imágenes
async function ocrFile(filePath) {
    await ensureOcrWorker();
    const { data } = await ocrWorker.recognize(filePath);
    return data.text || '';
}

app.post('/analizar', upload.single('file'), async(req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No se subió ningún archivo' });

    const filePath = file.path;
    const mimetype = file.mimetype || '';
    let textContent = '';

    try {
        if (mimetype === 'application/pdf' || getExtFromFilename(file.originalname) === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            textContent = pdfData.text || '';
        } else if (
            mimetype.includes('spreadsheet') || ['.xlsx', '.xls', '.csv'].includes(getExtFromFilename(file.originalname))
        ) {
            const workbook = XLSX.readFile(filePath);
            textContent = workbook.SheetNames.map((s) =>
                XLSX.utils.sheet_to_csv(workbook.Sheets[s])
            ).join('\n\n');
        } else if (
            mimetype.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.tiff', '.bmp'].includes(getExtFromFilename(file.originalname))
        ) {
            textContent = await ocrFile(filePath);
        } else {
            try {
                textContent = fs.readFileSync(filePath, 'utf8');
            } catch {
                throw new Error('Formato de archivo no soportado');
            }
        }

        if (!textContent.trim()) textContent = '(No se pudo extraer texto del archivo).';

        // Preparar prompt
        const regionHierarchy = req.body.regionHierarchy ?
            JSON.parse(req.body.regionHierarchy) : ['Argentina', 'Tendencias argentinas', 'Qué se consume en argentina hoy'];

        const prompt = `
Analizá profundamente el siguiente contenido extraído del archivo. Buscá información sobre esto:Datos de Consumo Global: información sobre las tendencias de consumo regional y nacional.
datos sobre los precios y promociones realizadas por comercios argentinos conocidos. datos demográficos o de comportamiento del consumidor que podrían ayudar a personalizar aún más las promociones y productos ofrecidos.
Y la estacionalidad o variaciones del mercado, que pueden afectar la demanda de ciertos productos.
La información que te voy a pasar contiene datos de ventas, inventarios y operaciones de un negocio minorista.
Se venden productos de consumo masivo, alimentos y bebidas.
Objetivo: identificar oportunidades para aumentar ingresos y optimizar operaciones.
Compará la información con informes en la jerarquía: ${regionHierarchy.join(' > ')}.
Devolvé un análisis profundo sobre qué se puede mejorar para incrementar los ingresos, incluyendo:
1) Principales hallazgos,
2) Recomendaciones accionables (promociones, surtido, precios, stock, reposición),
3) Priorización por impacto (Alto/Medio/Bajo),
4) Limitaciones y datos faltantes para un análisis más preciso.

Contenido extraído:
---
${textContent}
---
Quiero la respuesta directa de lo que te pido, sin introducciones ni agradecimientos.
Al final quiero un resumen preciso.
`;

        const resp = await openai.responses.create({
            model: process.env.OPENAI_MODEL || 'gpt-5',
            input: prompt,
        });

        let analysis = '';
        if (resp.output && Array.isArray(resp.output)) {
            for (const out of resp.output) {
                if (!out.content) continue;
                for (const c of out.content) {
                    if (typeof c === 'string') analysis += c;
                    else if (c.text) analysis += c.text;
                }
            }
        }
        if (!analysis && resp.output_text) analysis = resp.output_text;
        if (!analysis) analysis = 'No se obtuvo respuesta del modelo.';

        res.json({ analysis });
    } catch (err) {
        console.error('Error en /analizar:', err);
        res.status(500).json({ error: 'Error al procesar el archivo', details: err.message });
    } finally {
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch {}
    }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
