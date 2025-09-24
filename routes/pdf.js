// filepath: routes/pdf.js
import express from "express";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";

const router = express.Router();

router.post("/generar-pdf", async (req, res) => {
  try {
    const { html, title } = req.body;

    if (!html) return res.status(400).json({ error: "No se recibió HTML para generar PDF" });

    // 1️⃣ Lanzar Puppeteer y renderizar HTML
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "2.5cm", bottom: "2.5cm", left: "2cm", right: "2cm" },
    });

    await browser.close();

    // 2️⃣ Modificar metadata interna del PDF con pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.setTitle(title || `Análisis_${new Date().toISOString().slice(0,10)}`);
    const finalPdf = await pdfDoc.save();

    // 3️⃣ Enviar PDF al cliente
    res.setHeader("Content-Type", "application/pdf");
    res.send(finalPdf);

  } catch (err) {
    console.error("Error generando PDF:", err);
    res.status(500).json({ error: "Error generando PDF", details: err.message });
  }
});

export default router;
