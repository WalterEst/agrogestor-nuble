<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePublisherStore } from '../../../stores/publisherStore';
import publisherService from '../../../services/publisherService';

const route = useRoute();
const router = useRouter();
const store = usePublisherStore();

const productId = route.params.id;
const isEditMode = computed(() => !!productId);
const isLoading = ref(false);

// Lista de categorías que viene del backend
const categories = ref([]);

const form = ref({
  name: '',
  price: '',
  stock: '',
  description: '',
  category_id: '' // Aquí guardamos el ID seleccionado
});

const portadaFile = ref(null);
const portadaPreview = ref(null);
const errores = ref({});

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    portadaFile.value = file;
    portadaPreview.value = URL.createObjectURL(file);
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    // 1. CARGAR CATEGORÍAS
    const catResponse = await publisherService.getCategories();
    categories.value = catResponse.data;

    // 2. Si es edición, cargar datos del producto
    if (isEditMode.value) {
      const { data } = await publisherService.getProductById(productId);
      form.value = {
        name: data.name || data.titulo,
        price: data.price || data.precio,
        stock: data.stock || 0,
        description: data.description,
        // Aseguramos que el ID de categoría se asigne
        category_id: data.categoria_id || data.category || '' 
      };
      if (data.portada) portadaPreview.value = data.portada;
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

const validarFormulario = () => {
  errores.value = {};
  let esValido = true;

  if (!form.value.name) errores.value.name = 'Nombre requerido';
  if (!form.value.price) errores.value.price = 'Precio requerido';
  
  // Validación de categoría
  if (!form.value.category_id) {
      errores.value.category = 'Debes seleccionar una categoría';
      esValido = false;
  }
  
  if (!isEditMode.value && !portadaFile.value) {
    errores.value.portada = 'Imagen requerida';
    esValido = false;
  }
  return esValido;
};

const saveProduct = async () => {
  if (!validarFormulario()) return;
  isLoading.value = true;

  try {
    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('price', form.value.price);
    formData.append('stock', form.value.stock);
    formData.append('description', form.value.description);
    
    // ENVIAMOS EL ID DE LA CATEGORÍA (como string)
    if (form.value.category_id) {
      formData.append('category_id', String(form.value.category_id));
    }
    
    if (portadaFile.value) {
      formData.append('portada', portadaFile.value);
    }

    if (isEditMode.value) {
       // Lógica de update pendiente...
       alert("Edición enviada (verificar backend)");
    } else {
       await publisherService.createProduct(formData);
       alert("¡Producto creado con éxito!");
    }
    router.push({ name: 'publisher-products' });

  } catch (error) {
    console.error(error);
    alert('Error al guardar: ' + (error.response?.data?.message || 'Error server'));
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="publisher-container">
    <div class="pub-hero">
      <h1>{{ isEditMode ? 'Editar Publicación' : 'Nueva Publicación' }}</h1>
      <button @click="router.back()" class="pub-btn pub-btn--secondary">Cancelar</button>
    </div>

    <div class="pub-card" style="max-width: 800px; margin: 0 auto;">
      <form @submit.prevent="saveProduct">
        
        <div class="pub-field">
          <label>Nombre del Producto *</label>
          <input v-model="form.name" type="text" class="pub-input">
          <span v-if="errores.name" class="error-msg">{{ errores.name }}</span>
        </div>

        <div class="pub-grid-2">
          
          <div class="pub-field">
            <label>Categoría *</label>
            <select v-model.number="form.category_id" class="pub-input" :class="{'input-error': errores.category}">
              <option :value="null" disabled>-- Selecciona --</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.nombre }}
              </option>
            </select>
            <span v-if="errores.category" class="error-msg">{{ errores.category }}</span>
          </div>

          <div class="pub-field">
            <label>Precio ($) *</label>
            <input v-model="form.price" type="number" class="pub-input">
          </div>
        </div>

        <div class="pub-grid-2">
          <div class="pub-field">
            <label>Stock</label>
            <input v-model="form.stock" type="number" class="pub-input">
          </div>
          <div class="pub-field">
            <label>Imagen de Portada</label>
            <input type="file" @change="handleFileUpload" accept="image/*" class="pub-input" style="padding: 0.4rem;">
            <span v-if="errores.portada" class="error-msg">{{ errores.portada }}</span>
          </div>
        </div>

        <div v-if="portadaPreview" class="preview-box">
            <img :src="portadaPreview" alt="Preview">
        </div>

        <div class="pub-field">
          <label>Descripción</label>
          <textarea v-model="form.description" rows="4" class="pub-textarea"></textarea>
        </div>

        <div style="text-align: right; margin-top: 1rem;">
          <button type="submit" class="pub-btn" :disabled="isLoading">
            {{ isLoading ? 'Guardando...' : 'Publicar Producto' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
.error-msg { color: #e11d48; font-size: 0.85rem; display: block; margin-top: 0.2rem; }
.input-error { border-color: #e11d48; }
.preview-box { margin: 1rem 0; text-align: center; }
.preview-box img { max-height: 150px; border-radius: 8px; border: 1px solid #ddd; }
</style>