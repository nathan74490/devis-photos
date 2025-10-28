// src/routes/pricing.js
import express from "express";
import { computePrice } from "../services/pricing.js";

const router = express.Router();

/**
 * GET /api/pricing
 * Exemples:
 *  /api/pricing?format_code=A4
 *  /api/pricing?format_code=A4&finish_code=vernis
 *  /api/pricing?format_code=A4&support_code=papier_bril&finish_code=vernis&qty=10
 */
router.get("/", async (req, res) => {
  try {
    const result = await computePrice(req.query);
    if (!result.ok) return res.status(400).json(result);
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR", message: e.message });
  }
});

export default router;
