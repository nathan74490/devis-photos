// src/validators/quoteItems.validators.js
import { body, param } from "express-validator";

const idOrCode = (idField, codeField, label) => [
  body(idField).optional().isInt({ min: 1 }).withMessage(`${idField} doit être un entier >=1`),
  body(codeField)
    .optional()
    .trim().toLowerCase()
    .isLength({ min: 1, max: 100 }).withMessage(`${codeField} invalide`)
    .matches(/^[a-z0-9_\-\.]+$/i).withMessage(`${codeField} caractères autorisés: lettres, chiffres, _ - .`),
  body().custom((value, { req }) => {
    if (!req.body[idField] && !req.body[codeField]) {
      throw new Error(`Fournir ${label}: ${idField} ou ${codeField}`);
    }
    return true;
  })
];

export const quoteIdForItemValidator = [
  param("quoteId").isUUID().withMessage("quoteId doit être un UUID"),
];

export const addQuoteItemValidator = [
  ...idOrCode("format_id", "format_code", "format"),
  ...idOrCode("support_id", "support_code", "support (optionnel)"),
  ...idOrCode("finish_id", "finish_code", "finish (optionnel)"),
  body("qty").optional().isInt({ min: 1 }).withMessage("qty doit être un entier >= 1"),
  body("vat_rate").optional().isFloat({ min: 0, max: 100 }).withMessage("vat_rate entre 0 et 100"),
  body("description").optional({ nullable: true }).trim().isLength({ max: 500 }).escape()
];
