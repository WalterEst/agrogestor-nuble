<template>
  <section class="page">
    <header class="page__header">
      <h1 class="page__title">Mercado agrícola</h1>
      <p class="page__subtitle">
        Descubre las últimas publicaciones de productores locales. Cada ficha incluye precio referencial, descripción y datos del
        vendedor para que concretes tu próximo negocio.
      </p>
    </header>

    <div v-if="loading" class="empty-state">Cargando publicaciones...</div>
    <div v-else-if="items.length === 0" class="empty-state">Aún no hay publicaciones disponibles.</div>

    <div v-else class="grid-responsive">
      <article v-for="p in items" :key="p.id" class="market-card card">
        <img
          v-if="p.imageUrl"
          class="market-card__image"
          :src="apiBase + p.imageUrl"
          :alt="`Imagen de ${p.title}`"
          loading="lazy"
        />

        <div class="market-card__content">
          <h3>{{ p.title }}</h3>
          <p class="market-card__price">{{ formatPrice(p.price) }}</p>
          <p class="market-card__description">{{ p.description }}</p>
        </div>

        <footer class="market-card__footer">
          <span class="pill">Vendedor: {{ p.seller }}</span>
          <span class="pill" :class="p.isActive ? 'pill--success' : 'pill--warning'">
            {{ p.isActive ? 'Disponible' : 'Inactiva temporalmente' }}
          </span>
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
const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

const formatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const formatPrice = (value) => formatter.format(Number(value || 0));

async function load() {
  loading.value = true;
  try {
    const { data } = await api.get('/posts');
    items.value = data;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.market-card {
  display: grid;
  gap: 1.25rem;
}

.market-card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 1rem;
}

.market-card__content {
  display: grid;
  gap: 0.75rem;
}

.market-card__content h3 {
  font-size: 1.35rem;
  color: #0b2e4a;
}

.market-card__price {
  font-weight: 700;
  font-size: 1.1rem;
  color: #184d47;
}

.market-card__description {
  color: rgba(16, 55, 92, 0.75);
  line-height: 1.6;
}

.market-card__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.pill--success {
  background: rgba(24, 77, 71, 0.1);
  color: #184d47;
}

.pill--warning {
  background: rgba(244, 162, 89, 0.15);
  color: #c5691f;
}
</style>
