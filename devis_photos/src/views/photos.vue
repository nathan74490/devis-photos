<template>
  <div class="simulator-page">
    <header class="app-header">
      <h1>📸 Simulateur de Devis</h1>
      <p>Créez votre devis photo en quelques clics.</p>
    </header>

    <main class="simulator-container">
      <!-- Aperçu -->
      <section class="preview-panel glass">
        <div class="preview-frame" :style="photoContainerStyle">
          <img v-if="uploadedPhoto" :src="uploadedPhoto" class="preview-image" />
          <div v-else class="empty-preview">
            <p>📁 Importez une photo à visualiser</p>
          </div>
        </div>
      </section>

      <!-- Panneau étapes -->
      <aside class="control-panel glass">
        <div class="steps">
          <button
            v-for="(step, i) in steps"
            :key="i"
            @click="currentStep = i + 1"
            :class="{ active: currentStep === i + 1 }"
          >
            {{ step }}
          </button>
        </div>

        <div class="panel-content">
          <!-- 1) Importer -->
          <div v-if="currentStep === 1" class="step fade-in">
            <h3>Importer une photo</h3>
            <div class="upload-zone" @click="triggerFileInput">
              <input ref="fileInput" type="file" @change="onFileChange" accept="image/*" hidden />
              <p v-if="!uploadedPhoto">Cliquez ou glissez une image ici</p>
              <img v-else :src="uploadedPhoto" class="upload-thumb" />
            </div>
            <div class="actions">
              <button class="btn" :disabled="!uploadedPhoto" @click="currentStep = 2">Suivant → Options</button>
            </div>
          </div>

          <!-- 2) Options -->
          <div v-if="currentStep === 2" class="step fade-in">
            <h3>Options</h3>

            <label>Format</label>
            <select v-model="format" class="form-control">
              <option v-for="f in formats" :key="f.id" :value="f">
                {{ `${f.label} (${money(f.unit_price_ex_vat)} HT)` }}
              </option>
            </select>

            <label>Support</label>
            <select v-model="support" class="form-control">
              <option :value="null">Aucun</option>
              <option v-for="s in supports" :key="s.id" :value="s">
                {{ `${s.label} (+ ${money(s.extra_price_ex_vat)} HT)` }}
              </option>
            </select>

            <label>Finition</label>
            <div class="finishes">
              <button
                v-for="finish in finishes"
                :key="finish.id"
                :class="{ selected: selectedFinish?.id === finish.id }"
                @click="selectedFinish = finish"
              >
                {{ `${finish.label} (+ ${money(finish.extra_price_ex_vat)} HT)` }}
              </button>
              <button :class="{ selected: !selectedFinish }" @click="selectedFinish = null">Aucune</button>
            </div>

            <label>Quantité</label>
            <input type="number" v-model.number="quantity" min="1" class="form-control" />

            <div class="price-row"><div>Prix unitaire HT</div><div>{{ money(localUnitExVat) }}</div></div>
            <div class="price-row"><div>Total HT</div><div>{{ money(localTotalExVat) }}</div></div>
            <div class="price-row"><div>TVA (20%)</div><div>{{ money(localTotalExVat * 0.2) }}</div></div>
            <div class="price-row total"><div>Total TTC</div><div>{{ money(localTotalExVat * 1.2) }}</div></div>

            <div class="actions">
              <button class="btn ghost" @click="currentStep = 1">← Retour</button>
              <button class="btn" @click="currentStep = 3">Suivant → Ajustements</button>
            </div>
          </div>

          <!-- 3) Ajustements -->
          <div v-if="currentStep === 3" class="step fade-in">
            <h3>Ajustements</h3>
            <div class="controls">
              <label>Zoom</label>
              <div class="zoom-buttons">
                <button @click="scale = Math.min(2, +(scale + 0.1).toFixed(1))">+</button>
                <button @click="scale = 1">Reset</button>
                <button @click="scale = Math.max(0.5, +(scale - 0.1).toFixed(1))">−</button>
              </div>

              <label>Orientation</label>
              <div class="orientation">
                <button @click="orientation = 'portrait'" :class="{ active: orientation === 'portrait' }">📐 Portrait</button>
                <button @click="orientation = 'landscape'" :class="{ active: orientation === 'landscape' }">🖼️ Paysage</button>
              </div>
            </div>

            <div class="actions">
              <button class="btn ghost" @click="currentStep = 2">← Retour</button>
              <button class="btn" @click="currentStep = 4">Suivant → Informations</button>
            </div>
          </div>

          <!-- 4) Informations -->
          <div v-if="currentStep === 4" class="step fade-in">
            <h3>Vos informations</h3>
            <input v-model="firstName" class="form-control" placeholder="Prénom" />
            <input v-model="lastName" class="form-control" placeholder="Nom" />
            <input v-model="email" class="form-control" placeholder="Email" type="email" />

            <div class="actions">
              <button class="btn ghost" @click="currentStep = 3">← Retour</button>
              <button class="btn" @click="validerInformationsEtCreerDevis">Valider mes informations</button>
              <button class="btn" :disabled="!quoteId" @click="currentStep = 5">Aller au Devis →</button>
              <button class="btn danger" @click="resetQuoteAndClient">Nouveau client / Nouveau devis</button>
            </div>

            <p class="muted" v-if="quoteId">Devis en cours : <code>{{ quoteId }}</code></p>
          </div>

          <!-- 5) Devis -->
          <div v-if="currentStep === 5" class="step fade-in">
            <h3>Devis généré 🎉</h3>
            <div class="summary">
              <p><strong>Client :</strong> {{ firstName }} {{ lastName }} — {{ email }}</p>
              <p><strong>Format :</strong> {{ format?.label }}</p>
              <p><strong>Support :</strong> {{ support?.label || '—' }}</p>
              <p><strong>Finition :</strong> {{ selectedFinish?.label || '—' }}</p>
              <p><strong>Quantité :</strong> {{ quantity }}</p>
              <p class="total"><strong>Total estimé :</strong> {{ money(localTotalExVat * 1.2) }} TTC</p>
            </div>

            <div class="actions">
              <button class="btn ghost" @click="currentStep = 4">← Retour</button>
              <button class="btn" :disabled="!quoteId || isGenerating" @click="genererDevisEtPdf">
                {{ isGenerating ? 'Génération…' : 'Générer le PDF' }}
              </button>
              <a v-if="pdfUrl" :href="pdfUrl" download="devis.pdf" class="btn-secondary">⬇ Télécharger le PDF</a>
              <button class="btn danger" @click="resetQuote">Nouveau devis (même client)</button>
            </div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

/* ======== ÉTATS ======== */
const steps = ["Importer", "Options", "Ajustements", "Informations", "Devis"];
const currentStep = ref(1);

const formats = ref([]);
const supports = ref([]);
const finishes = ref([]);

const format = ref(null);
const support = ref(null);
const selectedFinish = ref(null);

const quantity = ref(1);
const scale = ref(1);
const orientation = ref("portrait");

const uploadedPhoto = ref(null);
const fileInput = ref(null);

const firstName = ref("");
const lastName = ref("");
const email = ref("");

const pdfUrl = ref("");
const isGenerating = ref(false);

/* ======== API / DEVIS ======== */
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";
const quoteId = ref(localStorage.getItem("quoteId") || "");
const storedClientKey = ref(localStorage.getItem("quoteClientKey") || "");

// clé stable pour détecter changement client
const clientKeyOf = ({ first, last, email }) =>
  `${(first||"").trim().toLowerCase()}|${(last||"").trim().toLowerCase()}|${(email||"").trim().toLowerCase()}`;

const currentClientKey = computed(() => clientKeyOf({
  first: firstName.value,
  last: lastName.value,
  email: email.value
}));

const fetchJson = async (url, opts) => {
  const r = await fetch(url, opts);
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`${opts?.method || "GET"} ${url} failed: ${r.status} ${t}`);
  }
  return r.json();
};

// crée un devis si pas d'ID OU si le client a changé
async function ensureQuote({ client_name, client_email, notes } = {}) {
  // si le client courant est différent de celui stocké, on force un nouveau devis
  if (quoteId.value && storedClientKey.value && storedClientKey.value !== currentClientKey.value) {
    quoteId.value = "";
    localStorage.removeItem("quoteId");
  }

  if (quoteId.value) return quoteId.value;
  if (!client_name) throw new Error("CLIENT_NAME_REQUIRED");

  const resp = await fetchJson(`${BASE_URL}/api/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name,
      client_email: client_email || null,
      notes: notes || null
    })
  });
  quoteId.value = resp.quote.id;
  localStorage.setItem("quoteId", quoteId.value);
  // mémorise la signature du client associé à ce devis
  storedClientKey.value = currentClientKey.value;
  localStorage.setItem("quoteClientKey", storedClientKey.value);
  return quoteId.value;
}

async function addQuoteItemFromSelection() {
  if (!quoteId.value) throw new Error("MISSING_QUOTE_ID");
  const body = {
    format_id: format.value?.id,
    support_id: support.value?.id || null,
    finish_id: selectedFinish.value?.id || null,
    qty: Number(quantity.value) || 1,
    vat_rate: 20,
    description: [format.value?.label, support.value?.label, selectedFinish.value?.label].filter(Boolean).join(" · ")
  };
  return await fetchJson(`${BASE_URL}/api/quote-items/${quoteId.value}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

async function finalizeQuote(vat = 20) {
  if (!quoteId.value) throw new Error("MISSING_QUOTE_ID");
  return await fetchJson(`${BASE_URL}/api/quotes/${quoteId.value}/finalize`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vat_rate: vat, status: "finalized" })
  });
}

/* ======== HELPERS UI ======== */
const money = (n) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Number(n || 0)) + " €";

const localUnitExVat = computed(() => {
  const base = Number(format.value?.unit_price_ex_vat || 0);
  const sup  = Number(support.value?.extra_price_ex_vat || 0);
  const fin  = Number(selectedFinish.value?.extra_price_ex_vat || 0);
  return base + sup + fin;
});
const localTotalExVat = computed(() => localUnitExVat.value * (Number(quantity.value) || 1));

const photoContainerStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  aspectRatio: orientation.value === "portrait" ? "3 / 4" : "4 / 3",
}));

/* ======== ACTIONS ======== */
const triggerFileInput = () => fileInput.value?.click();
const onFileChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => (uploadedPhoto.value = ev.target.result);
  reader.readAsDataURL(file);
};

async function validerInformationsEtCreerDevis() {
  try {
    const client_name = `${firstName.value} ${lastName.value}`.trim();
    await ensureQuote({
      client_name,
      client_email: email.value || null,
      notes: "Devis généré depuis le simulateur"
    });
    currentStep.value = 5;
  } catch (e) {
    console.error(e);
    alert("Création du devis impossible. Vérifie les informations.");
  }
}

async function genererDevisEtPdf() {
  if (!quoteId.value) {
    alert("Aucun devis en cours. Reviens à l'étape Informations.");
    return;
  }
  try {
    isGenerating.value = true;
    // Si le client a changé depuis, ensureQuote créera un nouvel ID.
    await ensureQuote({
      client_name: `${firstName.value} ${lastName.value}`.trim(),
      client_email: email.value || null,
      notes: "Devis généré depuis le simulateur"
    });
    await addQuoteItemFromSelection();
    await finalizeQuote(20);
    pdfUrl.value = `${BASE_URL}/api/quote-pdf/${quoteId.value}/pdf`;
  } catch (e) {
    console.error(e);
    alert("Génération du devis/PDF impossible.");
  } finally {
    isGenerating.value = false;
  }
}

// Nouveau devis mais même client
function resetQuote() {
  localStorage.removeItem("quoteId");
  quoteId.value = "";
  pdfUrl.value = "";
  // on conserve quoteClientKey pour réutiliser même client automatiquement
}

// Nouveau devis ET nouveau client
function resetQuoteAndClient() {
  resetQuote();
  localStorage.removeItem("quoteClientKey");
  storedClientKey.value = "";
  firstName.value = "";
  lastName.value = "";
  email.value = "";
  pdfUrl.value = "";
  currentStep.value = 4;
}

/* ======== INIT ======== */
onMounted(async () => {
  try {
    const [fs, ss, fis] = await Promise.all([
      fetchJson(`${BASE_URL}/api/formats`),
      fetchJson(`${BASE_URL}/api/support`),
      fetchJson(`${BASE_URL}/api/finishes`)
    ]);
    formats.value = fs;
    supports.value = ss;
    finishes.value = fis;

    format.value = formats.value[0] || null;
    support.value = null;
    selectedFinish.value = null;
  } catch (e) {
    console.error("Chargement des listes impossible :", e);
    alert("Impossible de charger les options. Vérifie l'API.");
  }
});
</script>

<style scoped>
/* --- Layout --- */
.simulator-page { max-width: 1100px; margin: 24px auto; padding: 0 12px; }
.app-header h1 {
  font-size: 28px;
  background: linear-gradient(90deg, #4CAF50, #1B5E20);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.app-header p { color: #555; margin-top: 8px; }

.simulator-container { display: flex; flex-wrap: wrap; gap: 40px; justify-content: space-between; }
.glass {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(6px);
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 6px 14px rgba(0,0,0,0.05);
}

.preview-panel { flex: 1 1 420px; padding: 16px; min-width: 320px; }
.preview-frame { width: 100%; aspect-ratio: 4 / 3; border-radius: 12px; border: 1px dashed #cbd5e1; display: grid; place-items: center; overflow: hidden; }
.preview-image { width: 100%; height: 100%; object-fit: cover; }
.empty-preview { color: #64748b; font-size: 14px; }

.control-panel { flex: 1 1 420px; padding: 16px; min-width: 320px; }
.steps { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.steps button { padding: 6px 10px; border-radius: 999px; border: 1px solid #e5e7eb; background: #606060; cursor: pointer; }
.steps button.active { background: #111827; color: white; }

.step h3 { margin: 8px 0 12px; }
.upload-zone { border: 1px dashed #cbd5e1; padding: 16px; border-radius: 12px; text-align: center; cursor: pointer; }
.upload-thumb { max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 12px; }

.form-control { width: 100%; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 10px; }
.form-control:focus { border-color: #4caf50; box-shadow: 0 0 4px rgba(76,175,80,0.2); outline: none; }

.finishes { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.finishes button { border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; background: #6f6e6e; cursor: pointer; }
.finishes button.selected { background: #111827; color: white; border-color: #111827; }

.price-row { display: flex; justify-content: space-between; margin: 6px 0; }
.price-row.total { font-weight: 700; }

.actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.btn { background: #111827; color: white; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer; }
.btn.ghost { background: white; color: #111827; border: 1px solid #cbd5e1; }
.btn-secondary { background: white; color: #111827; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; transition: 0.3s; }
.btn-secondary:hover { background: #388E3C; color: white; }
.btn.danger { background: #ef4444; color: white; }

.fade-in { animation: fade 0.25s ease; }
@keyframes fade {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
.muted { color: #6b7280; font-size: 13px; margin-top: 6px; }
</style>
