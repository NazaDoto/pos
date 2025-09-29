import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import https from "https";

import resumenRoutes from "./routes/resumen.js";
import historialRoutes from "./routes/historial.js";
import pdfRoutes from "./routes/pdf.js";
import authRoutes from "./routes/auth.js";
import analisisRoutes from "./routes/analisis.js";
import usuariosRoutes from "./routes/usuarios.js";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ENV = process.env.ENV || "dev"; // "dev" o "prod"

// === Rutas ===
app.use("/auth", authRoutes);
app.use("/", usuariosRoutes);
app.use("/", analisisRoutes);
app.use("/", resumenRoutes);
app.use("/", historialRoutes);
app.use("/", pdfRoutes);

if (ENV === "prod") {
    // Rutas a los certificados de Let's Encrypt o ACME
    const options = {
        key: fs.readFileSync("/var/www/ssl/nazadoto.com.key"),
        cert: fs.readFileSync("/var/www/ssl/nazadoto.com.crt"),
    };

    https.createServer(options, app).listen(PORT, () => {
        console.log(`🚀 Servidor HTTPS corriendo en https://localhost:${PORT}`);
    });
} else {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor HTTP corriendo en http://localhost:${PORT}`);
    });
}
