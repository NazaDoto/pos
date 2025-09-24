import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";

import resumenRoutes from "./routes/resumen.js";
import historialRoutes from "./routes/historial.js";
import pdfRoutes from "./routes/pdf.js";
import authRoutes from "./routes/auth.js";
import analisisRoutes from "./routes/analisis.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: "uploads/" });

const PORT = process.env.PORT || 3000;

// === Rutas ===
app.use("/auth", authRoutes);
app.use('/', analisisRoutes);
app.use("/", resumenRoutes);
app.use("/", historialRoutes);
app.use("/", pdfRoutes);

// Servidor
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
