import express from "express";
import { pool } from "../utils/db.js";
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

// Endpoint: /cambiarPASS
router.put("/cambiarPASS", async (req, res) => {
  const { actual, nueva, userId } = req.body;

  try {
    const user = await db("usuarios").where({ id: userId }).first();
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Verificar contraseña actual
    const match = await bcrypt.compare(actual, user.password);
    if (!match) return res.status(400).json({ error: "Contraseña actual incorrecta" });

    // Hashear nueva contraseña
    const hashed = await bcrypt.hash(nueva, 10);

    await db("usuarios").where({ id: userId }).update({ password: hashed });

    res.json({ message: "Contraseña actualizada con éxito" });
  } catch (err) {
    console.error(err);
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
