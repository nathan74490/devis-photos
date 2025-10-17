<template>
  <div class="print-preview-page">
    <!-- Contenu principal en deux parties -->
    <div class="main-content">
      <!-- Zone principale : Visualisation de la photo -->
      <div class="preview-area">
        <!-- Cadre d'impression simulé -->
        <div class="print-frame">
          <!-- Photo avec transformations appliquées -->
          <div class="photo-container">
            <div
              class="photo-wrapper"
              :style="{
                transform: `rotate(${rotation}deg) scale(${scale})`,
                border: selectedBorder.label === 'Aucune' ? 'none' : '10px solid white',
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)'
              }"
              v-if="uploadedPhoto"
            >
              <img :src="uploadedPhoto" class="photo" />
            </div>
            <div v-else class="empty-preview">
              <p>Importez une photo pour la visualiser</p>
            </div>
          </div>

          <!-- Légende sous la photo -->
          <div class="photo-caption" v-if="uploadedPhoto">
            <p>{{ format.label }} | {{ selectedBorder.label }} | {{ orientation }}</p>
          </div>
        </div>
      </div>

      <!-- Panel latéral pour les options -->
      <div class="options-panel">
        <!-- Onglets pour naviguer entre les étapes -->
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

        <!-- Contenu dynamique selon l'étape -->
        <div class="panel-content">
          <!-- Étape 1 : Bordure et quantité -->
          <div v-if="currentStep === 1" class="step-content">
            <h3>Options de bordure</h3>
            <div class="border-options">
              <div
                v-for="border in borders"
                :key="border.id"
                class="border-option"
                :class="{ selected: selectedBorder.id === border.id }"
                @click="selectedBorder = border"
              >
                <p>{{ border.label }}</p>
                <p class="price">+{{ border.extra_price_ex_vat }} €</p>
              </div>
            </div>
            <div class="quantity-section">
              <label>Quantité</label>
              <input type="number" v-model="quantity" min="1" class="quantity-input" />
            </div>
          </div>

          <!-- Étape 2 : Import de la photo -->
          <div v-if="currentStep === 2" class="step-content">
            <h3>Importer une photo</h3>
            <div
              class="upload-zone"
              @click="triggerFileInput"
              @dragover.prevent="dragover = true"
              @dragleave.prevent="dragover = false"
              @drop.prevent="onDrop"
            >
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

          <!-- Étape 3 : Recadrage et orientation -->
          <div v-if="currentStep === 3" class="step-content">
            <h3>Ajuster la photo</h3>
            <div class="adjustment-tools">
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
                  <button @click="rotation += 90" :class="{ active: rotation === 'portrait' }">Portrait</button>
                  <button @click="rotation -= 90" :class="{ active: rotation === 'landscape' }">Paysage</button>
                </div>
              </div>
              <div class="tool-group">
                <label>Format</label>
                <div class="tool-buttons">
                  <button 
                    v-for="format in formats" 
                    :key="format.id" 
                    @click="format = format" 
                    :class="{ active: format.id === format.id }"
                  >
                    {{ format.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Étape 4 : Récapitulatif -->
          <div v-if="currentStep === 4" class="step-content">
            <h3>Récapitulatif</h3>
            <div class="summary">
              <div class="summary-item">
                <span>Format:</span>
                <span>{{ format.label }}</span>
              </div>
              <div class="summary-item">
                <span>Bordure:</span>
                <span>{{ selectedBorder.label }}</span>
              </div>
              <div class="summary-item">
                <span>Quantité:</span>
                <span>{{ quantity }}</span>
              </div>
              <div class="summary-item">
                <span>Orientation:</span>
                <span>{{ orientation }}</span>
              </div>
              <div class="summary-item total">
                <span>Prix total:</span>
                <span>{{ totalPrice }} €</span>
              </div>
            </div>
            <button @click="saveQuote" class="print-button">Enregistrer et imprimer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

// Récupérer l'ID du format depuis l'URL
const route = useRoute();
const formatId = route.params.type;

// Données
const format = ref({});
const borders = ref([]);
const isLoading = ref(true);
const error = ref(null);

// État des étapes
const currentStep = ref(1);
const steps = ['Bordures', 'Importer', 'Ajuster', 'Récapitulatif'];

// Données de configuration
const selectedBorder = ref({});
const quantity = ref(1);
const uploadedPhoto = ref(null);
const rotation = ref(0);
const scale = ref(1);
const orientation = ref('portrait');
const fileInput = ref(null);
const dragover = ref(false);

// Liste des formats disponibles
const formats = ref([]);

// Calcul du prix total
const totalPrice = computed(() => {
  const basePrice = parseFloat(format.value.unit_price_ex_vat) || 0;
  const borderPrice = parseFloat(selectedBorder.value.price) || 0;
  return (basePrice + borderPrice) * quantity.value;
});

// Récupérer les données depuis l'API
onMounted(async () => {
  try {
    isLoading.value = true;
    const formatResponse = await fetch(`http://192.168.10.177:8081/api/formats`);
    if (!formatResponse.ok) throw new Error('Format non trouvé');
    format.value = await formatResponse.json();

    const bordersResponse = await fetch('http://192.168.10.177:8081/api/finishes');
    if (!bordersResponse.ok) throw new Error('Erreur lors du chargement des bordures');
    borders.value = await bordersResponse.json();

    if (borders.value.length > 0) {
      selectedBorder.value = borders.value[0];
    }

    const formatsResponse = await fetch('http://192.168.10.177:8081/api/formats');
    if (!formatsResponse.ok) throw new Error('Erreur lors du chargement des formats');
    formats.value = await formatsResponse.json();
  } catch (err) {
    error.value = err.message;
    console.error('Erreur:', err);
  } finally {
    isLoading.value = false;
  }
});

// Gestion de l'import de photo
const triggerFileInput = () => {
  fileInput.value.click();
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedPhoto.value = event.target.result;
      currentStep.value = 3; // Passer à l'étape d'ajustement après import
    };
    reader.readAsDataURL(file);
  }
};

const onDrop = (e) => {
  dragover.value = false;
  const file = e.dataTransfer.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedPhoto.value = event.target.result;
      currentStep.value = 3;
    };
    reader.readAsDataURL(file);
  }
};

// Sauvegarde du devis
const saveQuote = () => {
  const quoteData = {
    format: format.value,
    border: selectedBorder.value,
    quantity: quantity.value,
    photo: uploadedPhoto.value,
    orientation: orientation.value,
    totalPrice: totalPrice.value,
  };
  console.log('Devis enregistré :', quoteData);
  alert('Devis enregistré avec succès !');
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
