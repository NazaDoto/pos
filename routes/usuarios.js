import express from "express";
import { pool } from "../utils/db.js";
import bcrypt from "bcrypt";

const router = express.Router();

// === Obtener todos los usuarios ===
router.get("/fetchUsuarios", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, name, email, nivel, habilitado, fecha_activacion FROM usuarios");
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

// === Actualizar un usuario ===
router.put("/updateUsuario", async (req, res) => {
    const { id, name, email, nivel, habilitado } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Falta el ID del usuario" });
    }

    try {
        await pool.query(
            `UPDATE usuarios 
       SET name = ?, email = ?, nivel = ?, habilitado = ? WHERE id = ?`,
            [name, email, nivel, habilitado, id]
        );

        res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
});

// === Cambiar contraseña ===
router.put("/cambiarPASS", async (req, res) => {
  const { actual, nueva, userId } = req.body;

  if (!userId || !actual || !nueva) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    // 1. Obtener usuario
    const [rows] = await pool.query(
      "SELECT password FROM usuarios WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = rows[0];

    // 2. Verificar contraseña actual
    const match = await bcrypt.compare(actual, user.password);
    if (!match) {
      return res.status(400).json({ error: "Contraseña actual incorrecta" });
    }

    // 3. Hashear la nueva contraseña
    const hashed = await bcrypt.hash(nueva, 10);

    // 4. Actualizar en DB
    await pool.query("UPDATE usuarios SET password = ? WHERE id = ?", [
      hashed,
      userId,
    ]);

    res.json({ message: "Contraseña actualizada con éxito" });
  } catch (err) {
    console.error("Error en /cambiarPASS:", err);
    res.status(500).json({ error: "Error al cambiar contraseña" });
  }
});



// === Activar cuenta de usuario (+30 días) ===
router.put("/activarUsuario", async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: "ID de usuario requerido" });
    }

    try {
        // Actualiza la fecha_activacion a la fecha actual
        const [result] = await pool.query(
            "UPDATE usuarios SET fecha_activacion = NOW() WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ message: "Cuenta activada por 30 días desde hoy" });
    } catch (error) {
        console.error("Error en /activarUsuario:", error);
        res.status(500).json({ error: "Error al activar la cuenta" });
    }
});

export default router;
