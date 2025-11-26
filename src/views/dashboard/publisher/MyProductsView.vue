<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// NO importamos el CSS aquí con import, lo haremos en <style>
const router = useRouter();

const myProducts = ref([
  { id: 1, name: 'Miel de Ulmo Orgánica', price: 8500, stock: 12, status: 'approved' },
  { id: 2, name: 'Tejido a Lana', price: 15000, stock: 5, status: 'pending' },
  { id: 3, name: 'Mermelada Casera', price: 4000, stock: 0, status: 'rejected' },
]);

const getStatusClass = (status) => {
  const map = {
    approved: 'status-approved',
    pending: 'status-pending',
    rejected: 'status-rejected'
  };
  return map[status] || '';
};

const getStatusLabel = (status) => {
  const map = { approved: 'Publicado', pending: 'Revisión', rejected: 'Rechazado' };
  return map[status] || status;
};

const goToEdit = (id) => router.push({ name: 'publisher-edit-product', params: { id } });
const goToDetail = (id) => router.push({ name: 'publisher-product-detail', params: { id } });
</script>

<template>
  <div class="publisher-container">
    
    <div class="pub-hero">
      <div>
        <h1>Mis Publicaciones</h1>
        <p>Administra tus productos de MarketVue</p>
      </div>
      <button class="pub-btn" @click="goToEdit(null)">
        + Nuevo Producto
      </button>
    </div>

    <div class="pub-list">
      <div v-for="product in myProducts" :key="product.id" class="pub-item">
        
        <div class="pub-item__info">
          <h3>{{ product.name }}</h3>
          <div class="pub-item__meta">
            <span>💲 ${{ product.price }}</span>
            <span>📦 Stock: {{ product.stock }}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem;">
          <span :class="['pub-badge', getStatusClass(product.status)]">
            {{ getStatusLabel(product.status) }}
          </span>
          
          <div style="display: flex; gap: 0.5rem;">
            <button @click="goToDetail(product.id)" class="pub-btn pub-btn--secondary" style="padding: 0.4rem 0.8rem;">Ver</button>
            <button @click="goToEdit(product.id)" class="pub-btn pub-btn--secondary" style="padding: 0.4rem 0.8rem;">Editar</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
</style>