// src/services/pricing.js
import { query } from "../db.js";

/**
 * Calcule le prix en temps réel.
 * Entrées possibles (au moins un format requis):
 * - format_code | format_id
 * - support_code | support_id (facultatif)
 * - finish_code  | finish_id (facultatif)
 * - qty (défaut 1)
 * - vat_rate en % (défaut 20)
 *
 * Règle: unit = format.unit_price_ex_vat + support.extra_price_ex_vat + finish.extra_price_ex_vat
 *        line_ht = unit * qty
 */
export async function computePrice({
  format_code, format_id,
  support_code, support_id,
  finish_code, finish_id,
  qty = 1,
  vat_rate = 20
}) {
  const qtyNum = Math.max(1, Number(qty) || 1);
  const vatRate = Math.max(0, Number(vat_rate) || 20);

  // --- helpers pour récupérer par code/id
  const fetchOne = async (table, fields, where, value) => {
    const sql = `SELECT ${fields} FROM ${table} WHERE ${where} LIMIT 1`;
    const { rows } = await query(sql, [value]);
    return rows[0] || null;
  };

  const format = format_code
    ? await fetchOne("formats", "id, code, label, unit_price_ex_vat", "code = $1", format_code)
    : format_id
    ? await fetchOne("formats", "id, code, label, unit_price_ex_vat", "id = $1", format_id)
    : null;

  if (!format) {
    return {
      ok: false,
      error: "FORMAT_REQUIRED",
      message: "Tu dois fournir un format (format_code ou format_id)."
    };
  }

  const support = support_code
    ? await fetchOne("supports", "id, code, label, extra_price_ex_vat", "code = $1", support_code)
    : support_id
    ? await fetchOne("supports", "id, code, label, extra_price_ex_vat", "id = $1", support_id)
    : null;

  const finish = finish_code
    ? await fetchOne("finishes", "id, code, label, extra_price_ex_vat", "code = $1", finish_code)
    : finish_id
    ? await fetchOne("finishes", "id, code, label, extra_price_ex_vat", "id = $1", finish_id)
    : null;

  const unitFormat  = Number(format.unit_price_ex_vat || 0);
  const unitSupport = support ? Number(support.extra_price_ex_vat || 0) : 0;
  const unitFinish  = finish  ? Number(finish.extra_price_ex_vat  || 0) : 0;

  const unit_price_ex_vat = +(unitFormat + unitSupport + unitFinish).toFixed(2);
  const line_ex_vat       = +(unit_price_ex_vat * qtyNum).toFixed(2);
  const vat_amount        = +((line_ex_vat * vatRate) / 100).toFixed(2);
  const total_inc_vat     = +(line_ex_vat + vat_amount).toFixed(2);

  return {
    ok: true,
    currency: "EUR",
    qty: qtyNum,
    vat_rate: vatRate,
    selections: {
      format: {
        id: format.id, code: format.code, label: format.label,
        unit_price_ex_vat: +Number(format.unit_price_ex_vat).toFixed(2)
      },
      support: support ? {
        id: support.id, code: support.code, label: support.label,
        extra_price_ex_vat: +Number(support.extra_price_ex_vat).toFixed(2)
      } : null,
      finish: finish ? {
        id: finish.id, code: finish.code, label: finish.label,
        extra_price_ex_vat: +Number(finish.extra_price_ex_vat).toFixed(2)
      } : null
    },
    computed: {
      unit_price_ex_vat,
      line_ex_vat,
      vat_amount,
      total_inc_vat
    }
  };
}
