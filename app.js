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
import mysql from 'mysql2/promise';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PORT = process.env.PORT || 3000;

// === Conexión MySQL con pool ===
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '2112',
    database: process.env.MYSQL_DATABASE || 'pos',
});

// === OCR Worker Singleton ===
let ocrWorker = null;
async function ensureOcrWorker() {
    if (!ocrWorker) {
        ocrWorker = await createWorker('spa');
    }
}

function getExtFromFilename(filename) {
    return path.extname(filename || '').toLowerCase();
}

async function ocrFile(filePath) {
    await ensureOcrWorker();
    const { data } = await ocrWorker.recognize(filePath);
    return data.text || '';
}

// === Endpoint: Analizar archivo + historial ===
app.post('/analizar', upload.single('file'), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No se subió ningún archivo' });

    const filePath = file.path;
    const mimetype = file.mimetype || '';
    let textContent = '';

    try {
        // === Extracción de texto ===
        if (mimetype === 'application/pdf' || getExtFromFilename(file.originalname) === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            textContent = pdfData.text || '';
        } else if (mimetype.includes('spreadsheet') || ['.xlsx', '.xls', '.csv'].includes(getExtFromFilename(file.originalname))) {
            const workbook = XLSX.readFile(filePath);
            textContent = workbook.SheetNames.map(s =>
                XLSX.utils.sheet_to_csv(workbook.Sheets[s])
            ).join('\n\n');
        } else if (mimetype.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.tiff', '.bmp'].includes(getExtFromFilename(file.originalname))) {
            textContent = await ocrFile(filePath);
        } else {
            try {
                textContent = fs.readFileSync(filePath, 'utf8');
            } catch {
                throw new Error('Formato de archivo no soportado');
            }
        }

        if (!textContent.trim()) textContent = '(No se pudo extraer texto del archivo).';

        // === Preparar prompt ===
        const regionHierarchy = req.body.regionHierarchy
            ? JSON.parse(req.body.regionHierarchy)
            : ['Argentina', 'Tendencias argentinas', 'Qué se consume en argentina hoy'];

        // Tomar último resumen guardado en DB si no se envió desde frontend
        let ultimoResumen = req.body.ultimoResumen || "";
        if (!ultimoResumen) {
            const [rows] = await pool.query('SELECT resumen FROM historial ORDER BY fecha DESC LIMIT 1');
            if (rows.length > 0) ultimoResumen = rows[0].resumen;
        }

        const prompt = `
Analizá profundamente el siguiente contenido extraído del archivo.
Tomá en cuenta el último resumen previo guardado para generar un análisis más consistente:
"${ultimoResumen}"

Datos de Consumo Global: información sobre tendencias de consumo regional y nacional,
precios y promociones, comportamiento del consumidor y estacionalidad.
Contenido extraído:
---
${textContent}
---
Objetivo: identificar oportunidades para aumentar ingresos y optimizar operaciones,
comparando con jerarquía: ${regionHierarchy.join(' > ')}.
Devolvé un análisis profundo, incluyendo hallazgos, recomendaciones, priorización por impacto y limitaciones.
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
        try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
    }
});

// === Endpoint: Guardar análisis + resumen ===
app.post('/guardarResumen', async (req, res) => {
    try {
        const { analisis, resumen } = req.body;
        if (!analisis || !resumen) return res.status(400).json({ error: 'Analisis y resumen requeridos' });

        const sql = 'INSERT INTO historial (analisis, resumen, fecha) VALUES (?, ?, NOW())';
        await pool.query(sql, [analisis, resumen]);

        res.status(201).json({ message: 'Historial guardado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// === Endpoint: Historial ===
app.get('/historial', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, analisis, resumen, fecha FROM historial ORDER BY fecha DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
