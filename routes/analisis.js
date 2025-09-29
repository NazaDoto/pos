// filepath: routes/analisis.js
import 'undici'; // esto define Headers y fetch globalmente

import express from 'express';
import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import XLSX from 'xlsx';
import multer from 'multer';
import fetch from 'node-fetch';
globalThis.fetch = fetch;
import OpenAI from 'openai';
import { pool } from '../utils/db.js';
import { ocrFile } from '../utils/ocr.js';
import { getExtFromFilename } from '../utils/fileUtils.js';

const router = express.Router();

// === Configuración de Multer ===
const upload = multer({ dest: 'uploads/' });

// === Configuración de OpenAI ===
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
// router.post('/analizar', upload.array('files[]'), async(req, res) => {
// console.log(req.body.nivel)
// })  
// === Endpoint: Analizar múltiples archivos + historial ===
router.post('/analizar', upload.array('files[]'), async(req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    const usuarioId = req.body.id;
    const nivel = req.body.nivel || '1'; // Default nivel 1
    let combinedText = '';

    try {
        // === Extraer texto de todos los archivos ===
        for (const file of files) {
            const filePath = file.path;
            const mimetype = file.mimetype || '';
            let textContent = '';

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
                    textContent = `(No se pudo extraer texto de ${file.originalname})`;
                }
            }

            if (!textContent.trim()) textContent = `(No se pudo extraer texto de ${file.originalname})`;
            combinedText += `=== Archivo: ${file.originalname} ===\n${textContent}\n\n`;

            // Eliminar archivo temporal
            try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
        }

        // === Preparar prompt y modelo según nivel ===
        const regionHierarchy = req.body.regionHierarchy ? JSON.parse(req.body.regionHierarchy) : ['Argentina', 'Tendencias argentinas', 'Qué se consume en argentina hoy'];
        let ultimoResumen = req.body.ultimoResumen || '';
        if (!ultimoResumen) {
            const [rows] = await pool.query('SELECT resumen FROM historial ORDER BY fecha DESC LIMIT 1');
            if (rows.length > 0) ultimoResumen = rows[0].resumen;
        }
        const hierarchyText = regionHierarchy.join(' > ');

        let prompt = '';
        let modelo = '';

        switch (nivel) {
            case '1': // GPT-3.5
                modelo = 'gpt-3.5-turbo';
                prompt = `
Analiza el siguiente contenido extraído de los archivos, considerando la jerarquía: "${hierarchyText}".

Contenido a analizar:
${combinedText}

1. Listá los **principales hallazgos** (bullets).
2. Proponé **recomendaciones accionables** con ejemplos concretos de bundles, promociones o ajustes de surtido (lo que creas).
Genera un apartado **resumen claro** y algunas **recomendaciones**.
`;
                break;

            case '2': // GPT-4
                modelo = 'gpt-4';
                prompt = `
Analiza el siguiente contenido extraído de los archivos, considerando la jerarquía: "${hierarchyText}".

Contenido a analizar:
${combinedText}

1. **Resumen ejecutivo** (máx. 5 líneas).
2. Listá los **Principales hallazgos** (bullets).
3. Recomendaciones accionables, separando rápidas y de mediano plazo con ejemplos concretos de bundles, promociones o ajustes de surtido (lo que creas).
Genera un apartado **resumen claro** con hallazgos y **recomendaciones prácticas** de mediano nivel de detalle.
`;
                break;

            case '3': // GPT-5
            default:
                modelo = 'gpt-5';
                prompt = `
Analizá profundamente el siguiente contenido extraído de los archivos considerando la jerarquía de región/categoría: "${hierarchyText}".
Tomá en cuenta el último resumen previo guardado para generar un análisis más consistente: "${ultimoResumen}"

Contenido a analizar:
${combinedText}

1. Comenzá con un **resumen ejecutivo** (máx. 5 líneas) con los hallazgos y recomendaciones clave.
2. Listá los **principales hallazgos** (bullets).
3. Proponé **recomendaciones accionables** separadas en:
   - Acciones inmediatas (“quick wins”)
   - Acciones de mediano plazo
   - Ejemplos concretos de bundles, promociones o ajustes de surtido.
4. Priorizá las recomendaciones por impacto (alto, medio, bajo) en una tabla.
5. Señalá **riesgos, alertas o problemas de datos** detectados.
6. Contrastá con tendencias y mecánicas de retailers líderes en la jerarquía indicada.
7. Finalizá con un apartado **resumen preciso**.

Usá bullets, tablas y lenguaje claro orientado a la toma de decisiones.
`;
                break;
        }

        // === Llamada a OpenAI ===
        const resp = await openai.chat.completions.create({
            model: modelo,
            messages: [{ role: 'user', content: prompt }],
        });

        let analysis = 'No se obtuvo respuesta del modelo.';
        if (resp?.choices?.[0]?.message?.content) {
            analysis = resp.choices[0].message.content;
        }

        const resumen = analysis.split('\n').slice(0, 5).join(' ');

        // === Guardar en historial ===
        try {
            const sql = 'INSERT INTO historial (usuario, analisis, resumen, fecha) VALUES (?, ?, ?, NOW())';
            await pool.query(sql, [usuarioId, analysis, resumen]);
            console.log('Análisis guardado en historial ✅');
        } catch (dbErr) {
            console.error('Error al guardar en historial:', dbErr);
        }

        res.json({ analysis });
    } catch (err) {
        console.error('Error en /analizar:', err);
        res.status(500).json({ error: 'Error al procesar los archivos', details: err.message });
    }
});


export default router;