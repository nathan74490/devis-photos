// src/routes/quoteItems.js
import express from "express";
import { pool } from "../db.js";
import { computePrice } from "../services/pricing.js";

const router = express.Router();

/**
 * POST /api/quote-items/:quoteId/items
 * Body via codes ou via IDs (voir README)
 */
router.post("/:quoteId/items", async (req, res) => {
  const { quoteId } = req.params;
  const {
    format_code, format_id,
    support_code, support_id,
    finish_code, finish_id,
    qty = 1, vat_rate = 20,
    description = ""
  } = req.body || {};

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Devis ?
    const q = await client.query("SELECT id FROM quotes WHERE id = $1 LIMIT 1", [quoteId]);
    if (!q.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ ok: false, error: "QUOTE_NOT_FOUND" });
    }

    // 2) Calcul
    const price = await computePrice({
      format_code, format_id,
      support_code, support_id,
      finish_code, finish_id,
      qty, vat_rate
    });
    if (!price.ok) {
      await client.query("ROLLBACK");
      return res.status(400).json(price);
    }

    // 3) Résoudre IDs depuis codes
    async function idFrom(table, codeCol, codeVal, idVal) {
      if (idVal) return idVal;
      if (!codeVal) return null;
      const { rows } = await client.query(
        `SELECT id FROM ${table} WHERE ${codeCol} = $1 LIMIT 1`,
        [codeVal]
      );
      return rows[0]?.id ?? null;
    }

    const fId  = await idFrom("formats",  "code", format_code,  format_id);
    const sId  = await idFrom("supports", "code", support_code, support_id);
    const fiId = await idFrom("finishes", "code", finish_code, finish_id);

    if (!fId) {
      await client.query("ROLLBACK");
      return res.status(400).json({ ok: false, error: "FORMAT_NOT_FOUND" });
    }

    // 4) INSERT
    const breakdown = { selections: price.selections, computed: price.computed };

    const insertItem = await client.query(
      `INSERT INTO quote_items (
         quote_id, format_id, support_id, finish_id,
         qty, computed_unit_price_ex_vat,
         line_ex_vat, vat_rate, description, breakdown_json
       ) VALUES (
         $1, $2, $3, $4,
         $5, $6,
         $7, $8, $9, $10
       )
       RETURNING *`,
      [
        quoteId,
        fId, sId, fiId,
        price.qty,
        price.computed.unit_price_ex_vat,
        price.computed.line_ex_vat,
        price.vat_rate,
        description || (price.selections?.format?.label ?? "Ligne devis"),
        JSON.stringify(breakdown)
      ]
    );
    const newItem = insertItem.rows[0];

    // 5) Recalcul totaux devis
    const updated = await client.query(
      `WITH sums AS (
         SELECT quote_id, SUM(line_ex_vat) AS sum_ht
         FROM quote_items
         WHERE quote_id = $1
         GROUP BY quote_id
       )
       UPDATE quotes q
       SET subtotal_ex_vat = COALESCE(s.sum_ht, 0),
           vat_amount      = ROUND(COALESCE(s.sum_ht, 0) * $2 / 100.0, 2),
           total_inc_vat   = ROUND(COALESCE(s.sum_ht, 0) * (1 + $2 / 100.0), 2)
       FROM sums s
       WHERE q.id = s.quote_id
       RETURNING q.*`,
      [quoteId, price.vat_rate]
    );

    await client.query("COMMIT");

    return res.json({
      ok: true,
      message: "Ligne ajoutée avec succès 🎉",
      item: newItem,
      quote_totals: updated.rows[0] || null
    });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR", message: e.message });
  } finally {
    client.release();
  }
});

export default router;
