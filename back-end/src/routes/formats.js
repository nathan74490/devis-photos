import express from "express";
import { query } from "../db.js";

const router = express.Router();

// GET /api/test — récupère toutes les lignes de la table test
router.get("/", async (req, res) => {
  try {
    const { rows } = await query("SELECT * FROM formats ");
    res.json(rows);
  } catch (err) {
    console.error("Erreur SQL :", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
