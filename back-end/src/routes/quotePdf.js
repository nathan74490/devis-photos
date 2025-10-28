// src/routes/quotePdf.js
import express from "express";
import { buildQuotePdf } from "../services/pdfQuote.js";

const router = express.Router();

router.get("/:id/pdf", async (req, res) => {
  try {
    const pdfBuffer = await buildQuotePdf(req.params.id);

    // En-têtes binaire propres
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="devis-${req.params.id}.pdf"`,
      "Content-Length": pdfBuffer.length,
      "Cache-Control": "no-store"
    });

    return res.end(pdfBuffer); // ✅ important: binaire pur
  } catch (e) {
    console.error("[quote-pdf]", e);
    const status =
      e.message === "QUOTE_NOT_FOUND" ? 404 :
      e.message === "TEMPLATE_NOT_FOUND" ? 500 :
      e.message === "TEMPLATE_EMPTY" ? 500 : 500;

    return res.status(status).json({
      ok: false,
      error: e.message,
      ...(e.details ? { details: e.details } : {})
    });
  }
});

export default router;
