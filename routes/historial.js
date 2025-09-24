import express from "express";
import { pool } from "../utils/db.js";

const router = express.Router();

router.get("/historial", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, analisis, resumen, fecha FROM historial ORDER BY fecha DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
