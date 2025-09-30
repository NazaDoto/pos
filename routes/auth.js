import express from "express";
import { pool } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();


import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PW
    }
});


// === Registro de usuarios ===
router.post("/register", async(req, res) => {
    const { name, email, password, nivel } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO usuarios (name, email, password, nivel, habilitado) VALUES (?, ?, ?, ?, 0)", [name, email, hashedPassword, nivel]
        );

        // Configurar correo HTML
        let amount, nivelText;

        if (nivel == "1") {
            amount = "$25.000";
            nivelText = "Nivel 1";
        } else if (nivel == "2") {
            amount = "$35.000";
            nivelText = "Nivel 2";
        } else if (nivel == "3") {
            amount = "$50.000";
            nivelText = "Nivel 3";
        }

        const mailHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Registro Exitoso</title>
  <style>
    body {
        font-family: 'Arial', sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
    }
    .container {
        width: 100%;
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        border-top: 5px solid #007BFF;
    }
    .header {
        background-color: #007BFF;
        color: #ffffff;
        padding: 20px;
        text-align: center;
        font-size: 24px;
        font-weight: bold;
    }
    .content {
        padding: 30px;
        color: #333333;
        line-height: 1.6;
    }
    .content p {
        margin: 15px 0;
    }
    .highlight {
        font-weight: bold;
        color: #007BFF;
    }
    .button {
        display: inline-block;
        background-color: #007BFF;
        color: #ffffff;
        padding: 12px 20px;
        border-radius: 5px;
        text-decoration: none;
        margin-top: 20px;
    }
    .footer {
        text-align: center;
        padding: 15px;
        font-size: 12px;
        color: #777777;
        background-color: #f4f4f4;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      Registro Exitoso - ${nivelText}
    </div>
    <div class="content">
      <p>Hola <span class="highlight">${name}</span>,</p>
      <p>Tu registro en <span class="highlight">Ventas con IA</span> fue exitoso.</p>
      <p>Para que tu cuenta se active, por favor realiza el pago de <span class="highlight">${amount}</span> a la siguiente cuenta:</p>
      <ul>
        <li><strong>Alias:</strong> nazadoto-mp</li>
        <li><strong>Nombre:</strong> Nazareno Navarrete</li>
      </ul>
      <p>Una vez realizado el pago, responde a este mail con el comprobante, luego tu cuenta será habilitada por un administrador.</p>
      <p>Gracias por confiar en nosotros.</p>
    </div>
    <div class="footer">
      Ventas con IA &copy; ${new Date().getFullYear()} - Todos los derechos reservados
    </div>
  </div>
</body>
</html>
`;

        // Enviar correo
        await transporter.sendMail({
            from: `"Ventas con IA" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Registro Exitoso - Ventas con IA",
            html: mailHTML
        });


        res.json({ message: "Usuario registrado. Espera aprobación de un administrador." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});


// === Login de usuarios ===
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

        // 🚨 Verificar vencimiento de 30 días desde fecha_activacion
        if (user.fecha_activacion) {
            const fechaActivacion = new Date(user.fecha_activacion);
            const hoy = new Date();
            const diffDias = Math.floor((hoy - fechaActivacion) / (1000 * 60 * 60 * 24));

            if (diffDias > 30) {
                // Enviar correo para reactivar cuenta
                let amount, nivelText;

                if (user.nivel == "1") {
                    amount = "$25.000";
                    nivelText = "Nivel 1";
                } else if (user.nivel == "2") {
                    amount = "$35.000";
                    nivelText = "Nivel 2";
                } else if (user.nivel == "3") {
                    amount = "$50.000";
                    nivelText = "Nivel 3";
                }

                const mailHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reactivación de Cuenta</title>
  <style>
    body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { width: 100%; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border-top: 5px solid #007BFF; }
    .header { background-color: #007BFF; color: #ffffff; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; }
    .content { padding: 30px; color: #333333; line-height: 1.6; }
    .content p { margin: 15px 0; }
    .highlight { font-weight: bold; color: #007BFF; }
    .button { display: inline-block; background-color: #007BFF; color: #ffffff; padding: 12px 20px; border-radius: 5px; text-decoration: none; margin-top: 20px; }
    .footer { text-align: center; padding: 15px; font-size: 12px; color: #777777; background-color: #f4f4f4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      Reactivación de Cuenta - ${nivelText}
    </div>
    <div class="content">
      <p>Hola <span class="highlight">${user.name}</span>,</p>
      <p>Tu cuenta en <span class="highlight">Ventas con IA</span> ha vencido tras 30 días desde su activación.</p>
      <p>Para reactivarla, por favor realiza el pago de <span class="highlight">${amount}</span> a la siguiente cuenta:</p>
      <ul>
        <li><strong>Alias:</strong> nazadoto-mp</li>
        <li><strong>Nombre:</strong> Nazareno Navarrete</li>
      </ul>
      <p>Luego de realizar el pago, responde a este correo con el comprobante. Un administrador habilitará tu cuenta nuevamente.</p>
      <p>Gracias por confiar en nosotros.</p>
    </div>
    <div class="footer">
      Ventas con IA &copy; ${new Date().getFullYear()} - Todos los derechos reservados
    </div>
  </div>
</body>
</html>
`;

                // Enviar correo
                await transporter.sendMail({
                    from: `"Ventas con IA" <${process.env.MAIL_USER}>`,
                    to: user.email,
                    subject: "Cuenta Vencida - Ventas con IA",
                    html: mailHTML
                });

                return res.status(403).json({ error: "El período de activación de tu cuenta ha vencido. Se te envió un correo con los detalles para reactivarla." });
            }
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
            name: user.name,
            id: user.id,
            nivel: user.nivel
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
});



export default router;
