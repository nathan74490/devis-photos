
<template>
  <div class="print-preview-page">
    <div class="main-content">
      <!-- Zone de visualisation -->
      <div class="preview-area">
        <div class="print-frame">
          <div v-if="uploadedPhoto" class="photo-container" :style="photoContainerStyle">
            <img :src="uploadedPhoto" class="photo" :style="photoStyle" />
          </div>
          <div v-else class="empty-preview">
            <p>Importez une photo pour la visualiser</p>
          </div>
        </div>
      </div>

      <!-- Panel latéral -->
      <div class="options-panel">
        <div class="panel-tabs">
          <button
            v-for="(step, index) in steps"
            :key="index"
            @click="currentStep = index + 1"
            :class="{ active: currentStep === index + 1 }"
          >
            {{ step }}
          </button>
        </div>

        <div class="panel-content">
          <!-- Étape 1: Import -->
          <div v-if="currentStep === 1" class="step-content">
            <h3>Importer une photo</h3>
            <div class="upload-zone" @click="triggerFileInput">
              <input
                type="file"
                ref="fileInput"
                @change="onFileChange"
                accept="image/*"
                style="display: none"
              />
              <p v-if="!uploadedPhoto">Glissez-déposez une photo ici ou cliquez pour importer.</p>
              <img v-else :src="uploadedPhoto" class="upload-preview" />
            </div>
          </div>

          <!-- Étape 2: Options -->
          <div v-if="currentStep === 2" class="step-content">
            <h3>Options</h3>
            <div class="form-group">
              <label>Format</label>
              <select v-model="format" class="form-control">
                <option v-for="f in formats" :key="f.id" :value="f">
                  {{ f.label }} ({{ f.width_mm }}x{{ f.height_mm }} mm)
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Support</label>
              <select v-model="support" class="form-control">
                <option v-for="s in supports" :key="s.id" :value="s">
                  {{ s.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Finition</label>
              <div class="border-options">
                <div
                  v-for="finish in finishes"
                  :key="finish.id"
                  class="border-option"
                  :class="{ selected: selectedFinish.id === finish.id }"
                  @click="selectedFinish = finish"
                >
                  <p>{{ finish.label }}</p>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Quantité</label>
              <input type="number" v-model="quantity" min="1" class="form-control" />
            </div>
          </div>

          <!-- Étape 3: Ajustements -->
          <div v-if="currentStep === 3" class="step-content">
            <h3>Ajustements</h3>
            <div class="tool-group">
              <label>Zoom</label>
              <div class="tool-buttons">
                <button @click="scale += 0.1">+</button>
                <button @click="scale -= 0.1">-</button>
                <button @click="scale = 1">Réinitialiser</button>
              </div>
            </div>
            <div class="tool-group">
              <label>Orientation</label>
              <div class="tool-buttons">
                <button @click="orientation = 'portrait'" :class="{ active: orientation === 'portrait' }">Portrait</button>
                <button @click="orientation = 'landscape'" :class="{ active: orientation === 'landscape' }">Paysage</button>
              </div>
            </div>
          </div>

          <!-- Étape 4: Informations client -->
          <div v-if="currentStep === 4" class="step-content">
            <h3>Vos informations</h3>
            <div class="client-form">
              <div class="form-group">
                <input v-model="firstName" type="text" class="form-control" placeholder="Prénom" />
              </div>
              <div class="form-group">
                <input v-model="lastName" type="text" class="form-control" placeholder="Nom" />
              </div>
              <div class="form-group">
                <input v-model="email" type="email" class="form-control" placeholder="Email" />
              </div>
              <button @click="createQuote" class="print-button">
                Créer le devis
              </button>
            </div>
          </div>

          <!-- Étape 5: Confirmation -->
          <div v-if="currentStep === 5" class="step-content">
            <h3>Devis généré</h3>
            <div class="summary">
              <div class="summary-item">
                <span>Client:</span>
                <span>{{ firstName }} {{ lastName }}</span>
              </div>
              <div class="summary-item">
                <span>Format:</span>
                <span>{{ format.label }}</span>
              </div>
              <div class="summary-item">
                <span>Support:</span>
                <span>{{ support.label }}</span>
              </div>
              <div class="summary-item">
                <span>Finition:</span>
                <span>{{ selectedFinish.label }}</span>
              </div>
              <div class="summary-item">
                <span>Quantité:</span>
                <span>{{ quantity }}</span>
              </div>
              <div class="summary-item total">
                <span>Prix total:</span>
                <span>{{ totalPrice }} €</span>
              </div>
            </div>
            <a v-if="pdfUrl" :href="pdfUrl" download="devis.pdf" class="download-link">
              Télécharger le PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

// URL du backend
const BASE_URL = 'http://192.168.10.177:8081';

// Données réactives
const route = useRoute();
const formatId = route.params.type;

// État des données
const formats = ref([]);
const supports = ref([]);
const finishes = ref([]);
const format = ref({});
const support = ref({});
const selectedFinish = ref({});
const uploadedPhoto = ref(null);
const quantity = ref(1);
const rotation = ref(0);
const scale = ref(1);
const orientation = ref('portrait');
const currentStep = ref(1);

// Informations client
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const quoteId = ref(null);
const pdfUrl = ref(null);

// Étapes
const steps = ['Importer', 'Options', 'Ajustements', 'Vos informations', 'Devis généré'];

// Styles calculés
const photoContainerStyle = computed(() => ({
  transform: `rotate(${rotation.value}deg) scale(${scale.value})`,
  border: selectedFinish.value.label === 'Aucune' ? 'none' : '10px solid white',
  width: `${format.value.width_mm || 300}px`,
  height: `${format.value.height_mm || 200}px`
}));

const photoStyle = computed(() => ({
  maxWidth: '100%',
  maxHeight: '100%'
}));

// Prix total (simulé, sera calculé côté serveur)
const totalPrice = computed(() => {
  const basePrice = parseFloat(format.value.unit_price_ex_vat) || 0;
  const supportPrice = parseFloat(support.value.extra_price_ex_vat) || 0;
  const finishPrice = parseFloat(selectedFinish.value.extra_price_ex_vat) || 0;
  return (basePrice + supportPrice + finishPrice) * quantity.value;
});

// Fonction pour faire une requête API
const fetchApi = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Erreur API:', err);
    throw err;
  }
};

// Récupérer les données depuis l'API
onMounted(async () => {
  try {
    // Récupérer les formats, supports et finitions
    const [formatsRes, supportsRes, finishesRes] = await Promise.all([
      fetchApi(`${BASE_URL}/api/formats`),
      fetchApi(`${BASE_URL}/api/support`),
      fetchApi(`${BASE_URL}/api/finishes`)
    ]);

    formats.value = formatsRes;
    supports.value = supportsRes;
    finishes.value = finishesRes;

    // Sélectionner les valeurs par défaut
    format.value = formats.value[0] || {};
    support.value = supports.value[0] || {};
    selectedFinish.value = finishes.value[0] || {};
  } catch (err) {
    console.error('Erreur:', err);
    alert(`Erreur lors du chargement des données: ${err.message}`);
  }
});

// Gestion de l'import de photo
const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value.click();
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedPhoto.value = event.target.result;
      currentStep.value = 2;
    };
    reader.readAsDataURL(file);
  }
};

// Validation des informations client
const validateClientInfo = () => {
  if (!firstName.value || !lastName.value || !email.value) {
    alert('Veuillez remplir tous les champs (prénom, nom, email)');
    return false;
  }
  return true;
};

// Créer un devis et ajouter une ligne
const createQuote = async () => {
  if (!validateClientInfo()) return;

  try {
    // 1. Créer le devis
    const quoteResponse = await fetchApi(`${BASE_URL}/api/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: `${firstName.value} ${lastName.value}`,
        client_email: email.value,
        notes: `Devis pour ${format.value.label}`
      })
    });

    quoteId.value = quoteResponse.quote.id;

    // 2. Ajouter une ligne au devis
    const itemResponse = await fetchApi(`${BASE_URL}/api/quote-items/${quoteId.value}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format_code: format.value.code,
        support_code: support.value.code,
        finish_code: selectedFinish.value.code,
        qty: quantity.value,
        vat_rate: 20,
        description: `${format.value.label} - ${support.value.label} - ${selectedFinish.value.label}`
      })
    });

    // 3. Finaliser le devis
    await fetchApi(`${BASE_URL}/api/quotes/${quoteId.value}/finalize`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vat_rate: 20, status: 'finalized' })
    });

    // 4. Générer le PDF
    await generatePDF();

    currentStep.value = 5;
    alert(`Devis créé avec succès ! ID: ${quoteId.value}`);
  } catch (err) {
    console.error('Erreur:', err);
    alert(`Erreur: ${err.message}`);
  }
};

// Générer le PDF
const generatePDF = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/quote-pdf/${quoteId.value}/pdf`);
    if (!response.ok) throw new Error('Erreur lors de la génération du PDF');

    const blob = await response.blob();
    pdfUrl.value = URL.createObjectURL(blob);
  } catch (err) {
    console.error('Erreur:', err);
    alert(`Erreur lors de la génération du PDF: ${err.message}`);
  }
};
</script>


<style scoped>
.print-preview-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}
.header {
  margin-bottom: 20px;
  text-align: center;
}
.steps-indicator {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}
.steps-indicator span {
  padding: 5px 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 14px;
}
.steps-indicator span.active {
  background-color: #4CAF50;
  color: white;
}
.steps-indicator span.completed {
  background-color: #8BC34A;
  color: white;
}
.main-content {
  display: flex;
  gap: 30px;
  margin-top: 20px;
}
.preview-area {
  flex: 2;
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.print-frame {
  width: 100%;
  max-width: 600px;
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
.photo-container {
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}
.photo-wrapper {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.3s ease;
}
.photo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.empty-preview {
  color: #999;
  font-style: italic;
  text-align: center;
}
.photo-caption {
  text-align: center;
  color: #666;
  font-size: 14px;
}
.options-panel {
  flex: 1;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  height: fit-content;
}
.panel-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}
.panel-tabs button {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
  color: #666;
  border-bottom: 2px solid transparent;
}
.panel-tabs button.active {
  color: #4CAF50;
  border-bottom-color: #4CAF50;
}
.step-content {
  padding: 10px 0;
}
.border-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}
.border-option {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  color:#333; 
}
.border-option.selected {
  border-color: #4CAF50;
  background-color: #f0f9ff;
}
.border-preview {
  width: 80px;
  height: 50px;
  margin: 0 auto 5px;
  background-color: #f0f0f0;
  border-radius: 2px;
}
.price {
  font-size: 12px;
  color: #666;
}
.quantity-section {
  margin-bottom: 20px;
}
.quantity-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.upload-zone {
  border: 2px dashed #ccc;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  margin-bottom: 20px;
  color: #333; /* Ensure text is visible */
}
.upload-zone:hover {
  border-color: #4CAF50;
  background-color: #f9f9f9;
}
.upload-preview {
  max-width: 100%;
  max-height: 200px;
  margin-top: 10px;
}
.adjustment-tools {
  display: flex;
  flex-direction: column;
  gap: 15px;
  color: #333;
}
.tool-group {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
}
.tool-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.tool-buttons {
  display: flex;
  gap: 5px;
}
.tool-buttons button {
  flex: 1;
  padding: 5px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  color:#333;
}
.tool-buttons button.active {
  background-color: #4CAF50;
  color: white;
}
.summary {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  color:#333;
}
.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.summary-item.total {
  font-weight: bold;
  font-size: 16px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ddd;
}
.print-button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
}
</style>