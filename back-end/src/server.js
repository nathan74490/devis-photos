import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./db.js";
import devisRoutes from "./routes/devis.js"; // 👈 import des routes

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes principales
app.get("/", (req, res) => res.send("API Node + PostgreSQL en ligne 🚀"));

// Routes pour les devis
app.use("/api/devis", devisRoutes); // 👈 toutes les routes de devis seront sous /api/devis/...

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`✅ Serveur en ligne sur http://localhost:${PORT}`));
