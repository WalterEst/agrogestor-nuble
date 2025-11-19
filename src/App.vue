<script setup>
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from './componentes/Navbar.vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <div class="app-shell">
  <Navbar />
    <main class="app-main">
      <RouterView />
    </main>
    <footer class="footer">
      <p>© {{ currentYear }} MarkeVUE. Gestión agrícola inteligente.</p>
    </footer>
  </div>
</template>


<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.app-main {
  padding: 1.5rem;
  width: min(1080px, 100%);
  margin: 0 auto;
  display: block;
}
.footer {
  padding: 1.25rem 1.5rem 2rem;
  text-align: center;
  color: var(--muted);
}

@media (max-width: 640px) {
  .app-main {
    padding: 1rem;
  }
}
</style>
