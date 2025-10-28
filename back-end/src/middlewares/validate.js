// src/middlewares/validate.js
import { validationResult } from "express-validator";

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  // format d'erreur propre et utile au front
  return res.status(422).json({
    ok: false,
    error: "VALIDATION_ERROR",
    details: errors.array().map(e => ({
      location: e.location,
      param: e.param,
      msg: e.msg,
      value: e.value
    }))
  });
}
