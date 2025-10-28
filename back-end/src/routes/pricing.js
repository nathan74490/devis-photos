// src/routes/pricing.js
import express from "express";
import { computePrice } from "../services/pricing.js";
import { query as qv, validationResult } from "express-validator";

const router = express.Router();

/* ---------- Middleware de validation ---------- */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(422).json({
    ok: false,
    error: "VALIDATION_ERROR",
    details: errors.array().map(e => ({
      location: e.location, param: e.param, msg: e.msg, value: e.value
    }))
  });
}

/* ---------- Validators ---------- */
const pricingQueryValidator = [
  qv("format_id").optional().isInt({ min: 1 }),
  qv("format_code").optional().trim().toLowerCase()
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-z0-9_\-\.]+$/i),

  qv("support_id").optional().isInt({ min: 1 }),
  qv("support_code").optional().trim().toLowerCase()
    .matches(/^[a-z0-9_\-\.]+$/i),

  qv("finish_id").optional().isInt({ min: 1 }),
  qv("finish_code").optional().trim().toLowerCase()
    .matches(/^[a-z0-9_\-\.]+$/i),

  qv("qty").optional().isInt({ min: 1 }),
  qv("vat_rate").optional().isFloat({ min: 0, max: 100 }),

  // format requis (au moins id ou code)
  qv().custom((_, { req }) => {
    if (!req.query.format_id && !req.query.format_code) {
      throw new Error("format_id ou format_code est requis");
    }
    return true;
  })
];

/* ---------- Route ---------- */
/**
 * GET /api/pricing
 * Ex: /api/pricing?format_code=A4&support_code=papier_bril&finish_code=vernis&qty=10
 */
router.get("/", pricingQueryValidator, validate, async (req, res) => {
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
