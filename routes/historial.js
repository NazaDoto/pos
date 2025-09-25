import express from "express";
import { pool } from "../utils/db.js";

const router = express.Router();

router.get("/historial", async(req, res) => {
    try {
        const usuarioId = req.query.usuario;
        console.log('req.query: ', req.query)
        console.log('req.params.id: ', req.params.id)
        console.log('req.query.usuario: ', usuarioId)
        if (!usuarioId) {
            return res.status(400).json({ error: "Falta el id del usuario" });
        }

        const [rows] = await pool.query(
            "SELECT id, analisis, resumen, fecha FROM historial WHERE usuario = ? ORDER BY fecha DESC", [usuarioId]
        );

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


export default router;