<script setup>
defineProps({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  categoria: { type: String, default: '' },
})
</script>

<template>
  <article class="card" :aria-label="titulo">
    <header>
      <p v-if="categoria" class="categoria">{{ categoria }}</p>
      <h3>{{ titulo }}</h3>
    </header>
    <p class="descripcion">{{ descripcion }}</p>
  </article>
</template>

<style scoped>
.card {
  display: grid;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 10px 25px rgba(15, 32, 39, 0.12);
  border: 1px solid rgba(9, 87, 94, 0.15);
}

header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.categoria {
  align-self: flex-start;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  background: rgba(244, 211, 94, 0.18);
  color: #184d47;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h3 {
  font-size: 1.25rem;
  color: #0b2e4a;
}

.descripcion {
  line-height: 1.6;
  color: #2c3e50;
}
</style>
