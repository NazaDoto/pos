import express from "express";
import { pool } from "../utils/db.js";

const router = express.Router();

router.post("/guardarResumen", async (req, res) => {
  try {
    const { analisis, resumen } = req.body;
    if (!analisis || !resumen) {
      return res.status(400).json({ error: "Analisis y resumen requeridos" });
    }

    const sql = "INSERT INTO historial (analisis, resumen, fecha) VALUES (?, ?, NOW())";
    await pool.query(sql, [analisis, resumen]);

    res.status(201).json({ message: "Historial guardado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
