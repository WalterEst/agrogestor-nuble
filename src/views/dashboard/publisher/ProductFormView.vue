<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const isEditMode = computed(() => !!route.params.id);
const form = ref({ name: '', price: '', stock: '', description: '' });
</script>

<template>
  <div class="publisher-container">
    
    <div class="pub-hero">
      <h1>{{ isEditMode ? 'Editar Publicación' : 'Nueva Publicación' }}</h1>
      <button @click="router.back()" class="pub-btn pub-btn--secondary">
        Cancelar
      </button>
    </div>

    <div class="pub-card" style="max-width: 800px; margin: 0 auto;">
      <form @submit.prevent>
        
        <div class="pub-field">
          <label>Nombre del Producto</label>
          <input v-model="form.name" type="text" class="pub-input" placeholder="Ej: Miel de abeja">
        </div>

        <div class="pub-grid-2">
          <div class="pub-field">
            <label>Precio ($)</label>
            <input v-model="form.price" type="number" class="pub-input">
          </div>
          <div class="pub-field">
            <label>Stock</label>
            <input v-model="form.stock" type="number" class="pub-input">
          </div>
        </div>

        <div class="pub-field">
          <label>Descripción</label>
          <textarea v-model="form.description" rows="5" class="pub-textarea"></textarea>
        </div>

        <div style="text-align: right;">
          <button class="pub-btn">
            {{ isEditMode ? 'Guardar Cambios' : 'Publicar Ahora' }}
          </button>
        </div>

      </form>
    </div>

  </div>
</template>

<style scoped>

</style>