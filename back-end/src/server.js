import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./db.js";
import formatsRoutes from "./routes/formats.js"; // 👈 importe ta route
import finishesRoutes from "./routes/finishes.js";
import supportRoutes from "./routes/support.js";
import pricingRoutes from "./routes/pricing.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Route test pour vérifier que le serveur répond
app.get("/", (req, res) => res.send("API Node connectée à PostgreSQL 🚀"));

// Utilisation de la route
app.use("/api/formats", formatsRoutes); 
app.use("/api/finishes", finishesRoutes); 
app.use("/api/support", supportRoutes); 
app.use("/api/pricing", pricingRoutes);

const PORT = process.env.PORT || 8081;
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Serveur en ligne sur http://0.0.0.0:${PORT}`));
