import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./db.js";
import formatsRoutes from "./routes/formats.js"; // 👈 importe ta route
import tariffsRoutes from "./routes/tariffs.js";
import supportRoutes from "./routes/support.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Route test pour vérifier que le serveur répond
app.get("/", (req, res) => res.send("API Node connectée à PostgreSQL 🚀"));

// Utilisation de la route
app.use("/api/formats", formatsRoutes); // 👈 toutes les requêtes /api/formats passent par ton fichier formats.js
app.use("/api/tariffs", tariffsRoutes); // 👈 toutes les requêtes /api/tariffs passent par ton fichier tariffs.js
app.use("/api/support", supportRoutes); // 👈 toutes les requêtes /api/support passent par ton fichier support.js

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`✅ Serveur en ligne sur http://localhost:${PORT}`));
