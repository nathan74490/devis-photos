// src/validators/pricing.validators.js
import { query } from "express-validator";

export const pricingQueryValidator = [
  query("format_id").optional().isInt({ min: 1 }),
  query("format_code")
    .optional()
    .trim().toLowerCase()
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-z0-9_\-\.]+$/i),

  query("support_id").optional().isInt({ min: 1 }),
  query("support_code").optional().trim().toLowerCase()
    .matches(/^[a-z0-9_\-\.]+$/i),

  query("finish_id").optional().isInt({ min: 1 }),
  query("finish_code").optional().trim().toLowerCase()
    .matches(/^[a-z0-9_\-\.]+$/i),

  query("qty").optional().isInt({ min: 1 }),
  query("vat_rate").optional().isFloat({ min: 0, max: 100 }),

  // format requis: au moins id ou code
  query().custom((value, { req }) => {
    if (!req.query.format_id && !req.query.format_code) {
      throw new Error("format_id ou format_code est requis");
    }
    return true;
  })
];
