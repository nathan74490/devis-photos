# 🧾 Guide des Prix / Devis Express — API Node.js + PostgreSQL

Ce projet est un **simulateur de devis automatisé** pour les prestations de **graphisme / photo**.  
Il permet de :
- calculer des tarifs à la volée côté serveur,
- gérer des devis complets avec leurs lignes (`quote_items`),
- et générer automatiquement un **PDF client** à partir d’un template **AcroForms**.

---

## 🚀 Stack Technique

| Élément | Outil |
|----------|--------|
| **Backend** | Node.js + Express |
| **Base de données** | PostgreSQL |
| **ORM** | Aucune (requêtes SQL manuelles avec `pg`) |
| **PDF** | Template `AcroForms` via Node |
| **API Test** | Postman / Curl |

---

## 📡 Base URL

```
http://localhost:8081
```

---

## 📁 Endpoints Principaux

### 🧱 Formats / Supports / Finitions

| Méthode | Route | Description |
|----------|--------|-------------|
| GET | `/api/formats` | Liste tous les formats (ex: A4, A3, etc.) |
| GET | `/api/support` | Liste tous les supports (ex: papier brillant, mat, etc.) |
| GET | `/api/finishes` | Liste toutes les finitions (ex: vernis, dorure, etc.) |

**Exemple**
```bash
curl http://localhost:8081/api/formats
```

---

### 💰 Simulation de Prix

#### `GET /api/pricing`

Permet de calculer un prix **sans enregistrer de devis**.  
Les données sont renvoyées en temps réel selon les choix utilisateur.

**Paramètres disponibles**
| Nom | Type | Requis | Exemple |
|------|------|---------|----------|
| `format_code` ou `format_id` | string / int | ✅ | `A4` |
| `support_code` ou `support_id` | string / int | ❌ | `papier_bril` |
| `finish_code` ou `finish_id` | string / int | ❌ | `vernis` |
| `qty` | int | ❌ (défaut 1) | `10` |
| `vat_rate` | float | ❌ (défaut 20) | `20` |

**Exemple**
```
GET /api/pricing?format_code=A4&support_code=papier_bril&finish_code=vernis&qty=10
```

**Réponse**
```json
{
  "ok": true,
  "currency": "EUR",
  "qty": 10,
  "vat_rate": 20,
  "computed": {
    "unit_price_ex_vat": 3.3,
    "line_ex_vat": 33,
    "vat_amount": 6.6,
    "total_inc_vat": 39.6
  }
}
```

---

### 🧾 Devis (Quotes)

#### `POST /api/quotes`

Crée un **nouveau devis** (entête vide).

**Body JSON**
```json
{
  "client_name": "Jean Dupont",
  "client_email": "jean.dupont@example.com",
  "notes": "Séance tirages photo"
}
```

#### `GET /api/quotes/:id`

Récupère un **devis complet** avec ses lignes (`quote_items`).

#### `PATCH /api/quotes/:id/finalize`

Recalcule les totaux depuis les `quote_items` et change le statut du devis.

**Body JSON**
```json
{
  "vat_rate": 20,
  "status": "finalized"
}
```

---

### 🧩 Lignes de devis (Quote Items)

#### `POST /api/quote-items/:quoteId/items`

Ajoute une ligne à un devis existant.  
Le prix est calculé côté serveur et les totaux du devis sont mis à jour automatiquement.

**Body JSON — via codes**
```json
{
  "format_code": "A4",
  "support_code": "papier_bril",
  "finish_code": "vernis",
  "qty": 10,
  "vat_rate": 20,
  "description": "Tirage A4 papier brillant vernis"
}
```

**Body JSON — via IDs**
```json
{
  "format_id": 1,
  "support_id": 2,
  "finish_id": 1,
  "qty": 5,
  "vat_rate": 20
}
```

---

### 🧮 PDF Devis

#### `GET /api/quote-pdf/:id/pdf`

Génère un **PDF complet du devis** depuis son `UUID`.

#### `GET /api/quote-pdf/item/:itemId/pdf`

Génère le **PDF du devis** associé à une **ligne précise** (`quote_items.id`).

---

## 🧱 Structure BDD (rappel simplifié)

### Table `quotes`
| Colonne | Type |
|----------|------|
| id | uuid (PK) |
| created_at | timestamptz |
| client_name | text |
| client_email | text |
| notes | text |
| subtotal_ex_vat | numeric |
| vat_amount | numeric |
| total_inc_vat | numeric |
| status | text |

### Table `quote_items`
| Colonne | Type |
|----------|------|
| id | serial (PK) |
| quote_id | uuid (FK → quotes.id) |
| format_id | integer |
| support_id | integer |
| finish_id | integer |
| qty | integer |
| computed_unit_price_ex_vat | numeric |
| line_ex_vat | numeric |
| vat_rate | numeric |
| description | text |
| breakdown_json | jsonb |

---

## 🧩 Routes Disponibles

| Catégorie | Méthode | Route | Description |
|------------|----------|--------|-------------|
| Formats | GET | `/api/formats` | Liste formats |
| Supports | GET | `/api/support` | Liste supports |
| Finitions | GET | `/api/finishes` | Liste finitions |
| Simulation | GET | `/api/pricing` | Calcul temps réel |
| Devis | POST | `/api/quotes` | Créer un devis |
| Devis | GET | `/api/quotes/:id` | Consulter un devis |
| Devis | PATCH | `/api/quotes/:id/finalize` | Finaliser / recalcul |
| Lignes | POST | `/api/quote-items/:quoteId/items` | Ajouter une ligne |
| PDF | GET | `/api/quote-pdf/:id/pdf` | Générer PDF d’un devis |
| PDF | GET | `/api/quote-pdf/item/:itemId/pdf` | Générer PDF via une ligne |

---

## 🧪 Exemples cURL

Créer un devis :
```bash
curl -X POST http://localhost:8081/api/quotes   -H "Content-Type: application/json"   -d '{"client_name":"Jean Dupont","client_email":"jean@example.com","notes":"Séance tirages"}'
```

Ajouter une ligne :
```bash
curl -X POST http://localhost:8081/api/quote-items/<UUID>/items   -H "Content-Type: application/json"   -d '{"format_code":"A4","support_code":"papier_bril","finish_code":"vernis","qty":10,"vat_rate":20,"description":"Tirage A4 papier brillant vernis"}'
```

Finaliser le devis :
```bash
curl -X PATCH http://localhost:8081/api/quotes/<UUID>/finalize   -H "Content-Type: application/json"   -d '{"vat_rate":20,"status":"finalized"}'
```

Télécharger le PDF :
```
GET http://localhost:8081/api/quote-pdf/<UUID>/pdf
GET http://localhost:8081/api/quote-pdf/item/<ITEM_ID>/pdf
```
