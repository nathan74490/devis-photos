// src/routes/quotePdf.js
import express from "express";
import { buildQuotePdf } from "../services/pdfQuote.js";

const router = express.Router();

router.get("/:id/pdf", async (req, res) => {
  try {
    const pdfBytes = await buildQuotePdf(req.params.id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="devis-${req.params.id}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (e) {
    console.error(e);
    const status = e.message === "QUOTE_NOT_FOUND" ? 404 : 500;
    res.status(status).json({ ok: false, error: e.message });
  }
});

export default router;
