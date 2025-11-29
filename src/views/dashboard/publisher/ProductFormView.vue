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


const form = ref({
  name: '',
  price: '',
  stock: '',
  description: '',
  category: 'General'
});

// Estado de las imágenes
const portadaFile = ref(null);
const portadaPreview = ref(null);
const errores = ref({});

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    portadaFile.value = file; 
    portadaPreview.value = URL.createObjectURL(file);
    }
    portadaFile.value = file;
    portadaPreview.value = URL.createObjectURL(file);
  };


// Cargar datos si es edición
onMounted(async () => {
  if (isEditMode.value) {
    isLoading.value = true;
    try {
      const { data } = await publisherService.getProductById(productId);
      form.value = {
        name: data.name || data.titulo,
        price: data.price || data.precio,
        stock: data.stock || 0,
        description: data.description,
        category: data.category || 'General'
      };
      // Si el backend devuelve la foto, la mostramos
      if (data.portada) {
          portadaPreview.value = data.portada;
      }
    } catch (error) {
      console.error(error);
      // Si falla, volvemos a la lista para evitar pantallas blancas
      router.push({ name: 'publisher-products' });
    } finally {
      isLoading.value = false;
    }
  }
});

const validarFormulario = () => {
  errores.value = {};
  let esValido = true;

  if (!form.value.name || form.value.name.length < 3) {
    errores.value.name = 'El nombre debe tener al menos 3 letras.';
    esValido = false;
  }
  if (!form.value.price || form.value.price <= 0) {
    errores.value.price = 'El precio debe ser mayor a 0.';
    esValido = false;
  }
  if (form.value.stock < 0) {
    errores.value.stock = 'El stock no puede ser negativo.';
    esValido = false;
  }
  // En creación (nuevo), la foto es obligatoria
  if (!isEditMode.value && !portadaFile.value) {
    errores.value.portada = 'Debes subir una imagen de portada.';
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
    formData.append('category', form.value.category);
    
    if (portadaFile.value) {
    formData.append('portada', portadaFile.value); 
    }

    if (isEditMode.value) {
       // Lógica de edición
       await publisherService.updateProduct(productId, formData); 
       alert("Producto actualizado");
    } else {
       // Lógica de creación
       await publisherService.createProduct(formData);
       alert("¡Producto creado con éxito!");
    }

    router.push({ name: 'publisher-products' });

  } catch (error) {
    console.error(error);
    alert('Error al guardar: ' + (error.response?.data?.message || 'Error desconocido'));
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="publisher-container">
    <div class="pub-hero">
      <div>
        <h1>{{ isEditMode ? 'Editar Publicación' : 'Nueva Publicación' }}</h1>
      </div>
      <button @click="router.back()" class="pub-btn pub-btn--secondary">Cancelar</button>
    </div>

    <div class="pub-card" style="max-width: 800px; margin: 0 auto;">
      <form @submit.prevent="saveProduct" enctype="multipart/form-data">
        
        <div class="pub-field">
          <label>Nombre del Producto *</label>
          <input v-model="form.name" type="text" class="pub-input" :class="{'input-error': errores.name}">
          <span v-if="errores.name" class="error-msg">{{ errores.name }}</span>
        </div>

        <div class="pub-field">
          <label>Imagen de Portada {{ isEditMode ? '(Opcional)' : '*' }}</label>
          <div class="image-upload-box">
            <input type="file" @change="handleFileUpload" accept="image/*">
            <div v-if="portadaPreview" class="preview-container">
              <img :src="portadaPreview" alt="Vista previa">
              <button type="button" @click="portadaPreview = null; portadaFile = null" class="remove-btn">❌</button>
            </div>
          </div>
          <span v-if="errores.portada" class="error-msg">{{ errores.portada }}</span>
        </div>

        <div class="pub-grid-2">
          <div class="pub-field">
            <label>Precio ($) *</label>
            <input v-model="form.price" type="number" class="pub-input" :class="{'input-error': errores.price}">
            <span v-if="errores.price" class="error-msg">{{ errores.price }}</span>
          </div>
          <div class="pub-field">
            <label>Stock *</label>
            <input v-model="form.stock" type="number" class="pub-input" :class="{'input-error': errores.stock}">
            <span v-if="errores.stock" class="error-msg">{{ errores.stock }}</span>
          </div>
        </div>

        <div class="pub-field">
          <label>Descripción</label>
          <textarea v-model="form.description" rows="4" class="pub-textarea"></textarea>
        </div>

        <div style="text-align: right; margin-top: 1rem;">
          <button type="submit" class="pub-btn" :disabled="isLoading">
            {{ isLoading ? 'Subiendo...' : 'Publicar Producto' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
/* Estilos sin imports para evitar errores */
.error-msg { color: #e11d48; font-size: 0.85rem; margin-top: 0.25rem; display: block; }
.input-error { border-color: #e11d48; }
.image-upload-box { border: 2px dashed #ccc; padding: 1rem; border-radius: 0.5rem; text-align: center; background: #f9fafb; }
.preview-container { margin-top: 1rem; position: relative; display: inline-block; }
.preview-container img { max-width: 200px; max-height: 200px; border-radius: 0.5rem; border: 1px solid #ddd; object-fit: cover; }
.remove-btn { position: absolute; top: -10px; right: -10px; background: white; border: 1px solid #ccc; border-radius: 50%; cursor: pointer; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
</style>