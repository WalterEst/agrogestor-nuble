<template>
  <section class="page">
    <header class="page__header">
      <h1 class="page__title">Mis publicaciones</h1>
      <p class="page__subtitle">
        Administra el estado de tus productos y mantén tu inventario actualizado para clientes y mayoristas.
      </p>
    </header>

    <div v-if="loading" class="empty-state">Cargando tus publicaciones...</div>

    <div v-else-if="items.length === 0" class="empty-state">
      Aún no has creado publicaciones.
      <router-link to="/new">Crea la primera</router-link>
    </div>

    <div v-else class="grid-responsive">
      <article v-for="p in items" :key="p.id" class="mypost card">
        <header class="mypost__header">
          <h3>{{ p.title }}</h3>
          <span class="mypost__price">{{ formatPrice(p.price) }}</span>
        </header>

        <p class="mypost__description">{{ p.description || 'Sin descripción detallada.' }}</p>

        <footer class="mypost__footer">
          <span class="pill" :class="p.isActive ? 'pill--success' : 'pill--warning'">
            {{ p.isActive ? 'Publicado' : 'Inactivo' }}
          </span>
          <button class="btn btn--ghost" type="button" :disabled="actionId === p.id" @click="toggle(p.id)">
            {{ p.isActive ? 'Pausar' : 'Reactivar' }}
          </button>
        </footer>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import api from '../services/api';

const items = ref([]);
const loading = ref(true);
const actionId = ref(null);
const formatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const formatPrice = (value) => formatter.format(Number(value || 0));

async function load() {
  loading.value = true;
  try {
    const { data } = await api.get('/posts/mine');
    items.value = data;
  } finally {
    loading.value = false;
  }
}

async function toggle(id) {
  if (actionId.value) return;
  actionId.value = id;
  try {
    await api.patch(`/posts/${id}/toggle`);
    await load();
  } finally {
    actionId.value = null;
  }
}

onMounted(load);
</script>

<style scoped>
.mypost {
  display: grid;
  gap: 1.25rem;
}

.mypost__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.mypost__header h3 {
  font-size: 1.3rem;
  color: #0b2e4a;
}

.mypost__price {
  font-weight: 700;
  color: #184d47;
}

.mypost__description {
  color: rgba(16, 55, 92, 0.75);
  line-height: 1.6;
}

.mypost__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

button[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
