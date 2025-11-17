<template>
  <div class="post-filters">
    <form class="post-filters__form" @submit.prevent>
      <div class="post-filters__grid">
        <div class="input-field">
          <label for="q">Buscar</label>
          <input id="q" v-model="local.q" type="search" placeholder="Buscar por título o descripción" @input="emitChange" />
        </div>

        <div class="price-section">
          <div class="input-field">
            <label>Precio (CLP)</label>
            <div class="price-row">
              <input v-model.number="local.minPrice" type="number" min="0" placeholder="Mín" @input="emitChange" />
              <span class="sep">—</span>
              <input v-model.number="local.maxPrice" type="number" min="0" placeholder="Máx" @input="emitChange" />
            </div>
          </div>
          <button class="btn-clear" type="button" @click="clear">
            <span>✕</span>
            Limpiar
          </button>
        </div>

        <div class="input-field">
          <label for="availability">Disponibilidad</label>
          <select id="availability" v-model="local.availability" @change="emitChange">
            <option value="any">Todos</option>
            <option value="available">Disponibles</option>
            <option value="unavailable">No disponibles</option>
          </select>
        </div>
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
  padding: 2.5rem 0;
  margin-bottom: 3rem;
}

.post-filters__form {
  width: 100%;
}

.post-filters__grid {
  /* display: grid; */
  grid-template-columns: 2.5fr 1fr 1.2fr;
  gap: 1.75rem;
  align-items: flex-start;
  background: white;
  padding: 2rem;
  border-radius: 1.25rem;
  border: 1px solid rgba(24, 77, 71, 0.1);
  box-shadow: 0 2px 8px rgba(24, 77, 71, 0.05);
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
}

.input-field label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.input-field input,
.input-field select {
  padding: 0.85rem 1.15rem;
  border: 2px solid rgba(24, 77, 71, 0.12);
  border-radius: 0.8rem;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--primary);
  background: #f9fdfb;
  transition: all 0.3s ease;
}

.input-field input::placeholder {
  color: var(--muted);
  opacity: 0.55;
}

.input-field input:focus,
.input-field select:focus {
  outline: none;
  border-color: var(--accent);
  background: white;
  box-shadow: 0 0 0 4px rgba(24, 77, 71, 0.08);
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.75rem
}

.price-row {
  display: flex;
  gap: 0.85rem;
  align-items: center;
}

.price-row input {
  flex: 1;
  min-width: 0;
}

.sep {
  color: var(--muted);
  font-weight: 700;
  opacity: 0.4;
  flex-shrink: 0;
}

.btn-clear {
  padding: 0.85rem 1.5rem;
  border: 2px solid var(--primary);
  background: white;
  color: var(--primary);
  border-radius: 0.8rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
  align-self: center;
}

.btn-clear span {
  font-size: 1.1rem;
  font-weight: 800;
}

.btn-clear:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(24, 77, 71, 0.2);
}

.btn-clear:active {
  transform: translateY(-1px);
}

@media (max-width: 1200px) {
  .post-filters__grid {
    grid-template-columns: 1.8fr 1fr 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 900px) {
  .post-filters {
    margin-bottom: 2.5rem;
  }
  
  .post-filters__grid {
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .post-filters {
    padding: 2rem 0;
    margin-bottom: 2rem;
  }
  
  .post-filters__grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 1.75rem;
  }
  
  .price-section {
    gap: 1rem;
  }
  
  .price-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 0.75rem;
  }
  
  .btn-clear {
    width: 100%;
    align-self: stretch;
  }
}
</style>
