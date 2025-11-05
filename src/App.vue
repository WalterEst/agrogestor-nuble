<script setup>
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <div class="layout">
    <AppNavbar />
    <main>
      <RouterView />
    </main>
    <footer>
      <p>© {{ currentYear }} Municipalidad de Chillán. Turismo y cultura para todos.</p>
    </footer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 3rem min(6vw, 4rem);
  background: linear-gradient(180deg, rgba(244, 211, 94, 0.15), rgba(11, 83, 148, 0.05));
}

footer {
  background: #10375c;
  color: #fff;
  text-align: center;
  padding: 1.5rem;
  font-size: 0.9rem;
}
</style>
