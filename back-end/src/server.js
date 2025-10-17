import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./db.js";

import formatsRoutes from "./routes/formats.js";
import finishesRoutes from "./routes/finishes.js";
import supportRoutes from "./routes/support.js";
import pricingRoutes from "./routes/pricing.js";
import quotePdfRoutes from "./routes/quotePdf.js"; // ✅ nouvelle route pour les PDF
import quoteItemsRoutes from "./routes/quoteItems.js";
import quotesRoutes from "./routes/quotes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Route test
app.get("/", (req, res) => res.send("API Node connectée à PostgreSQL 🚀"));

// ✅ Routes principales
app.use("/api/formats", formatsRoutes);
app.use("/api/finishes", finishesRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/quote-pdf", quotePdfRoutes); // ✅ route du PDF (ex: /api/quotes/:id/pdf)
app.use("/api/quote-items", quoteItemsRoutes); // POST /api/quotes/:quoteId/items
app.use("/api/quotes", quotesRoutes);

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 8081;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serveur en ligne sur http://0.0.0.0:${PORT}`);
});
