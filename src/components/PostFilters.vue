<template>
  <div class="card post-filters">
    <form class="post-filters__grid" @submit.prevent>
      <div class="input-field">
        <label for="q">Buscar</label>
        <input id="q" v-model="local.q" type="search" placeholder="Buscar por título o descripción" @input="emitChange" />
      </div>

      <div class="input-field">
        <label>Precio (CLP)</label>
        <div class="price-row">
          <input v-model.number="local.minPrice" type="number" min="0" placeholder="Mín" @input="emitChange" />
          <span class="sep">—</span>
          <input v-model.number="local.maxPrice" type="number" min="0" placeholder="Máx" @input="emitChange" />
        </div>
      </div>

      <div class="input-field">
        <label for="availability">Disponibilidad</label>
        <select id="availability" v-model="local.availability" @change="emitChange">
          <option value="any">Todos</option>
          <option value="available">Disponibles</option>
          <option value="unavailable">No disponibles</option>
        </select>
      </div>

      <div class="actions">
        <button class="btn btn--ghost" type="button" @click="clear">Limpiar</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, toRefs, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['change']);

const local = reactive({
  q: props.modelValue.q || '',
  minPrice: props.modelValue.minPrice ?? null,
  maxPrice: props.modelValue.maxPrice ?? null,
  availability: props.modelValue.availability || 'any',
});

let _timer = null;
function emitChange() {
  if (_timer) clearTimeout(_timer);
  _timer = setTimeout(() => emit('change', { ...local }), 250);
}

function clear() {
  local.q = '';
  local.minPrice = null;
  local.maxPrice = null;
  local.availability = 'any';
  emit('change', { ...local });
}

watch(
  () => props.modelValue,
  (v) => {
    local.q = v.q || '';
    local.minPrice = v.minPrice ?? null;
    local.maxPrice = v.maxPrice ?? null;
    local.availability = v.availability || 'any';
  }
);
</script>

<style scoped>
.post-filters {
  padding: 0;
}
.post-filters__grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
}
.post-filters .input-field {
  margin: 0;
}
.post-filters .price-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.post-filters input[type="number"] { width: 100%; }
.post-filters .sep { color: rgba(16,55,92,0.35); margin: 0 6px; }
.post-filters .actions { display:flex; align-items:center; gap:0.5rem; }

@media (max-width: 720px) {
  .post-filters__grid { grid-template-columns: 1fr; }
}
</style>
