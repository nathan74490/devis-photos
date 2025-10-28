// src/validators/quotes.validators.js
import { body, param } from "express-validator";

export const createQuoteValidator = [
  body("client_name")
    .trim().isLength({ min: 1, max: 200 }).withMessage("client_name requis (1–200)")
    .escape(),
  body("client_email")
    .optional({ nullable: true })
    .trim().isEmail().withMessage("email invalide")
    .normalizeEmail(),
  body("notes")
    .optional({ nullable: true })
    .trim().isLength({ max: 2000 }).withMessage("notes max 2000 caractères")
    .escape()
];

export const quoteIdParamValidator = [
  param("id")
    .isUUID().withMessage("id doit être un UUID")
];

export const finalizeQuoteValidator = [
  param("id").isUUID().withMessage("id doit être un UUID"),
  body("vat_rate")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("vat_rate entre 0 et 100"),
  body("status")
    .optional()
    .isIn(["draft","finalized","sent","archived"]).withMessage("status invalide")
];
