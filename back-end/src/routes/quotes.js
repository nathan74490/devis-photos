// src/routes/quotes.js
import express from "express";
import { pool, query } from "../db.js";

const router = express.Router();

/**
 * POST /api/quotes
 * Body: { client_name, client_email?, notes? }
 */
router.post("/", async (req, res) => {
  const { client_name, client_email = null, notes = null } = req.body || {};
  if (!client_name) {
    return res.status(400).json({ ok: false, error: "CLIENT_NAME_REQUIRED" });
  }

  try {
    const { rows } = await query(
      `INSERT INTO quotes (client_name, client_email, notes)
       VALUES ($1, $2, $3)
       RETURNING id, created_at, client_name, client_email, notes,
                 subtotal_ex_vat, vat_amount, total_inc_vat, status`,
      [client_name, client_email, notes]
    );
    return res.status(201).json({ ok: true, quote: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR", message: e.message });
  }
});

/**
 * GET /api/quotes/:id
 * → en-tête + lignes
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const header = await query(
      `SELECT id, created_at, client_name, client_email, notes,
              subtotal_ex_vat, vat_amount, total_inc_vat, status
       FROM quotes
       WHERE id = $1`,
      [id]
    );
    if (!header.rowCount) {
      return res.status(404).json({ ok: false, error: "QUOTE_NOT_FOUND" });
    }

    const items = await query(
      `SELECT qi.id, qi.quote_id, qi.format_id, qi.support_id, qi.finish_id,
              qi.qty, qi.computed_unit_price_ex_vat, qi.line_ex_vat, qi.vat_rate,
              qi.description, qi.breakdown_json,
              f.label  AS format_label,
              s.label  AS support_label,
              fi.label AS finish_label
       FROM quote_items qi
       LEFT JOIN formats  f  ON f.id  = qi.format_id
       LEFT JOIN supports s  ON s.id  = qi.support_id
       LEFT JOIN finishes fi ON fi.id = qi.finish_id
       WHERE qi.quote_id = $1
       ORDER BY qi.id ASC`,
      [id]
    );

    return res.json({
      ok: true,
      quote: header.rows[0],
      items: items.rows
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR", message: e.message });
  }
});

/**
 * PATCH /api/quotes/:id/finalize
 * Body (optionnel): { vat_rate=20, status="finalized" }
 */
router.patch("/:id/finalize", async (req, res) => {
  const { id } = req.params;
  const { vat_rate = 20, status = "finalized" } = req.body || {};
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const exists = await client.query(`SELECT id FROM quotes WHERE id = $1`, [id]);
    if (!exists.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ ok: false, error: "QUOTE_NOT_FOUND" });
    }

    const updated = await client.query(
      `WITH sums AS (
         SELECT quote_id, COALESCE(SUM(line_ex_vat), 0) AS sum_ht
         FROM quote_items
         WHERE quote_id = $1
         GROUP BY quote_id
       )
       UPDATE quotes q
       SET subtotal_ex_vat = s.sum_ht,
           vat_amount      = ROUND(s.sum_ht * $2 / 100.0, 2),
           total_inc_vat   = ROUND(s.sum_ht * (1 + $2 / 100.0), 2),
           status          = $3
       FROM sums s
       WHERE q.id = s.quote_id
       RETURNING q.*`,
      [id, vat_rate, status]
    );

    await client.query("COMMIT");
    return res.json({ ok: true, quote: updated.rows[0] });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR", message: e.message });
  } finally {
    client.release();
  }
});

export default router;
