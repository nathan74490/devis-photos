<template>
  <div class="simulator-page">
    <header class="app-header">
      <h1>📸 Simulateur de Devis</h1>
      <p>Créez votre devis photo en quelques clics.</p>
    </header>

    <main class="simulator-container">
      <!-- Preview -->
      <section class="preview-panel glass">
        <div class="preview-frame" :style="photoContainerStyle">
          <img v-if="uploadedPhoto" :src="uploadedPhoto" class="preview-image" />
          <div v-else class="empty-preview">
            <p>📁 Importez une photo à visualiser</p>
          </div>
        </div>
      </section>

      <!-- Options -->
      <aside class="options-panel glass">
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
          <!-- Étape 1 -->
          <div v-if="currentStep === 1" class="step fade-in">
            <h3>Importer une photo</h3>
            <div class="upload-zone" @click="triggerFileInput">
              <input ref="fileInput" type="file" @change="onFileChange" accept="image/*" hidden />
              <p v-if="!uploadedPhoto">Cliquez ou glissez une image ici</p>
              <img v-else :src="uploadedPhoto" class="upload-thumb" />
            </div>
          </div>

          <!-- Étape 2 -->
          <div v-if="currentStep === 2" class="step fade-in">
            <h3>Options</h3>
            <label>Format</label>
            <select v-model="format" class="form-control">
              <option v-for="f in formats" :key="f.id" :value="f">{{ f.label }}</option>
            </select>

            <label>Support</label>
            <select v-model="support" class="form-control">
              <option v-for="s in supports" :key="s.id" :value="s">{{ s.label }}</option>
            </select>

            <label>Finition</label>
            <div class="finishes">
              <button
                v-for="finish in finishes"
                :key="finish.id"
                :class="{ selected: finish.id === selectedFinish.id }"
                @click="selectedFinish = finish"
              >
                {{ finish.label }}
              </button>
            </div>

            <label>Quantité</label>
            <input type="number" v-model="quantity" min="1" class="form-control" />
          </div>

          <!-- Étape 3 -->
          <div v-if="currentStep === 3" class="step fade-in">
            <h3>Ajustements</h3>
            <div class="controls">
              <label>Zoom</label>
              <div class="zoom-buttons">
                <button @click="scale += 0.1">+</button>
                <button @click="scale = 1">Reset</button>
                <button @click="scale -= 0.1">−</button>
              </div>
              <label>Orientation</label>
              <div class="orientation">
                <button @click="orientation = 'portrait'" :class="{ active: orientation === 'portrait' }">📐 Portrait</button>
                <button @click="orientation = 'landscape'" :class="{ active: orientation === 'landscape' }">🖼️ Paysage</button>
              </div>
            </div>
          </div>

          <!-- Étape 4 -->
          <div v-if="currentStep === 4" class="step fade-in">
            <h3>Vos informations</h3>
            <input v-model="firstName" class="form-control" placeholder="Prénom" />
            <input v-model="lastName" class="form-control" placeholder="Nom" />
            <input v-model="email" class="form-control" placeholder="Email" type="email" />
            <button class="btn-main" @click="createQuote">Générer le devis</button>
          </div>

          <!-- Étape 5 -->
          <div v-if="currentStep === 5" class="step fade-in">
            <h3>Devis généré 🎉</h3>
            <div class="summary">
              <p><strong>Client :</strong> {{ firstName }} {{ lastName }}</p>
              <p><strong>Format :</strong> {{ format.label }}</p>
              <p><strong>Support :</strong> {{ support.label }}</p>
              <p><strong>Finition :</strong> {{ selectedFinish.label }}</p>
              <p><strong>Quantité :</strong> {{ quantity }}</p>
              <p class="total"><strong>Total :</strong> {{ totalPrice }} €</p>
            </div>
            <a v-if="pdfUrl" :href="pdfUrl" download="devis.pdf" class="btn-secondary">⬇ Télécharger le PDF</a>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

const BASE_URL = "http://192.168.10.177:8081";
const formats = ref([]);
const supports = ref([]);
const finishes = ref([]);

const format = ref({});
const support = ref({});
const selectedFinish = ref({});
const uploadedPhoto = ref(null);
const quantity = ref(1);
const scale = ref(1);
const orientation = ref("portrait");

const currentStep = ref(1);
const firstName = ref("");
const lastName = ref("");
const email = ref("");
const pdfUrl = ref(null);
const steps = ["Importer", "Options", "Ajustements", "Informations", "Devis"];

const totalPrice = computed(() => {
  const base = parseFloat(format.value.unit_price_ex_vat) || 0;
  const sup = parseFloat(support.value.extra_price_ex_vat) || 0;
  const fin = parseFloat(selectedFinish.value.extra_price_ex_vat) || 0;
  return ((base + sup + fin) * quantity.value).toFixed(2);
});

const photoContainerStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  aspectRatio: orientation.value === "portrait" ? "3 / 4" : "4 / 3",
}));

const fetchApi = async (url) => (await fetch(url)).json();

onMounted(async () => {
  [formats.value, supports.value, finishes.value] = await Promise.all([
    fetchApi(`${BASE_URL}/api/formats`),
    fetchApi(`${BASE_URL}/api/support`),
    fetchApi(`${BASE_URL}/api/finishes`),
  ]);
  format.value = formats.value[0];
  support.value = supports.value[0];
  selectedFinish.value = finishes.value[0];
});

const fileInput = ref(null);
const triggerFileInput = () => fileInput.value.click();
const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => (uploadedPhoto.value = ev.target.result);
  reader.readAsDataURL(file);
  currentStep.value = 2;
};

const createQuote = async () => {
  currentStep.value = 5;
  pdfUrl.value = "#"; // placeholder pour exemple
};
</script>

<style scoped>
/* --- Global Layout --- */
.simulator-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff, #e9f5ee, #fdfdfd);
  color: #333;
  font-family: 'Inter', system-ui, sans-serif;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* --- Header --- */
.app-header {
  text-align: center;
}
.app-header h1 {
  font-size: 2.4rem;
  background: linear-gradient(90deg, #4CAF50, #1B5E20);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.app-header p {
  color: #555;
  margin-top: 8px;
}

/* --- Main Layout --- */
.simulator-container {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  justify-content: center;
}

/* --- Panels --- */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 20px;
  transition: all 0.3s ease;
}

.preview-panel {
  flex: 1 1 450px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.preview-frame {
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  overflow: hidden;
  background: #fafafa;
  border: 2px dashed #cce0cc;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.4s;
}
.preview-frame:hover {
  border-color: #4caf50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.2);
}
.preview-image {
  width: 100%;
  height: auto;
  object-fit: contain;
}
.empty-preview {
  color: #999;
  font-style: italic;
}

/* --- Options Panel --- */
.options-panel {
  flex: 1 1 350px;
  display: flex;
  flex-direction: column;
}
.steps {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 20px;
}
.steps button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: #f1f1f1;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
}
.steps button.active {
  background: #4caf50;
  color: white;
  box-shadow: 0 0 8px rgba(76,175,80,0.4);
}

.form-control {
  width: 100%;
  margin: 6px 0 16px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
  transition: 0.3s;
}
.form-control:focus {
  border-color: #4caf50;
  box-shadow: 0 0 4px rgba(76,175,80,0.2);
}

.finishes {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.finishes button {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  cursor: pointer;
  transition: 0.3s;
}
.finishes button.selected {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.btn-main {
  width: 100%;
  padding: 12px;
  border: none;
  background: linear-gradient(90deg, #43A047, #66BB6A);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}
.btn-main:hover {
  box-shadow: 0 4px 14px rgba(76,175,80,0.3);
}
.btn-secondary {
  display: inline-block;
  margin-top: 16px;
  text-decoration: none;
  color: #388E3C;
  font-weight: 600;
  border: 1px solid #388E3C;
  border-radius: 8px;
  padding: 8px 12px;
  transition: 0.3s;
}
.btn-secondary:hover {
  background: #388E3C;
  color: white;
}

/* --- Animation --- */
.fade-in { animation: fade 0.3s ease; }
@keyframes fade {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: none; }
}
</style>