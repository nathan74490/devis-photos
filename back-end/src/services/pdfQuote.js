// src/services/pdfQuote.js
import { PDFDocument, StandardFonts } from "pdf-lib";
import dayjs from "dayjs";
import fs from "fs/promises";
import { constants as fsConst } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------- Helpers ---------- */
const CURRENCY = "€";
const fmtMoney = (n) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Number(n || 0)) + " " + CURRENCY;
const fmtQty = (n) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(n || 0));

/* ---------- Charge données devis + lignes ---------- */
export async function loadQuoteData(quoteId) {
  const q = await query(
    `SELECT id, created_at, client_name, client_email, notes,
            subtotal_ex_vat, vat_amount, total_inc_vat
     FROM quotes
     WHERE id = $1`,
    [quoteId]
  );
  if (!q.rowCount) throw new Error("QUOTE_NOT_FOUND");
  const header = q.rows[0];

  const itemsRes = await query(
    `SELECT qi.id, qi.qty, qi.computed_unit_price_ex_vat, qi.line_ex_vat, qi.description,
            f.label  AS format_label,
            s.label  AS support_label,
            fi.label AS finish_label
     FROM quote_items qi
     LEFT JOIN formats  f  ON f.id  = qi.format_id
     LEFT JOIN supports s  ON s.id  = qi.support_id
     LEFT JOIN finishes fi ON fi.id = qi.finish_id
     WHERE qi.quote_id = $1
     ORDER BY qi.id ASC`,
    [quoteId]
  );

  const items = itemsRes.rows.map((r) => ({
    desc: r.description || [r.format_label, r.support_label, r.finish_label].filter(Boolean).join(" · "),
    qty: Number(r.qty || 0),
    unit: Number(r.computed_unit_price_ex_vat || 0),
    total: Number(r.line_ex_vat || 0),
  }));

  return {
    id: header.id,
    date: dayjs(header.created_at).format("DD/MM/YYYY"),
    client_name: header.client_name,
    client_email: header.client_email || "",
    notes: header.notes || "",
    subtotal: Number(header.subtotal_ex_vat || 0),
    vat: Number(header.vat_amount || 0),
    total: Number(header.total_inc_vat || 0),
    items,
  };
}

/* ---------- Accès champ texte AcroForm en douceur ---------- */
function getTextFieldSafe(form, name) {
  try { return form.getTextField(name); } catch { return null; }
}

/* ---------- Construit le PDF à partir du template ---------- */
export async function buildQuotePdf(quoteId) {
  // 1) Données
  const data = await loadQuoteData(quoteId);

  // 2) Template (chemin robuste, relatif à ce fichier)
  //   src/services/pdfQuote.js -> ../../src/templates/Modele_Devis_Client.pdf
  const templatePath = path.resolve(__dirname, "..", "templates", "Modele_Devis_Client.pdf");

  // Vérification d'existence (erreur claire si absent)
  try {
    await fs.access(templatePath, fsConst.R_OK);
  } catch {
    const err = new Error("TEMPLATE_NOT_FOUND");
    err.details = { path: templatePath };
    throw err;
  }

  const templateBytes = await fs.readFile(templatePath);
  if (!templateBytes || templateBytes.length === 0) {
    const err = new Error("TEMPLATE_EMPTY");
    err.details = { path: templatePath };
    throw err;
  }

  const pdfDoc = await PDFDocument.load(templateBytes);

  // Police de base (fallback)
  await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 3) Formulaire
  const form = pdfDoc.getForm();
  const set = (fieldName, value) => {
    const f = getTextFieldSafe(form, fieldName);
    if (f) f.setText(value ?? "");
  };

  // En-tête
  set("quote_id", String(data.id));
  set("quote_date", data.date);
  set("client_name", data.client_name);
  set("client_email", data.client_email);
  // set("notes", data.notes);

  set("subtotal_ht", fmtMoney(data.subtotal));
  set("vat_amount", fmtMoney(data.vat));
  set("total_ttc", fmtMoney(data.total));

  // Lignes
  const MAX_ROWS = 10;
  data.items.slice(0, MAX_ROWS).forEach((it, idx) => {
    const i = idx + 1;
    set(`item_${i}_desc`, it.desc || "");
    set(`item_${i}_qty`, fmtQty(it.qty));
    set(`item_${i}_unit`, fmtMoney(it.unit));
    set(`item_${i}_total`, fmtMoney(it.total));
  });

  // form.flatten() pour rendre non éditable
  form.flatten();

  // 5) Bytes
  const bytes = await pdfDoc.save();
  // Renvoie directement un Buffer pour simplifier la route HTTP
  return Buffer.from(bytes);
}
