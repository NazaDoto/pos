import express from "express";
import { pool } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// === Registro de usuarios ===
router.post("/register", async(req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO usuarios (name, email, password, habilitado) VALUES (?, ?, ?, 0)", [name, email, hashedPassword]
        );

        res.json({ message: "Usuario registrado. Espera aprobación de un administrador." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});


// === Login de usuarios ===
router.post("/login", async(req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        const user = rows[0];

        // 🚨 Revisión de habilitación
        if (!user.habilitado) {
            return res.status(403).json({ error: "Tu cuenta aún no ha sido aprobada por un administrador." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }

        const token = jwt.sign({ id: user.id, email: user.email },
            process.env.JWT_SECRET, { expiresIn: "1h" }
        );

        res.json({
            message: "Login exitoso",
            token,
            name: user.name, // 🔹 clave: valor
            id: user.id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
});


export default router;