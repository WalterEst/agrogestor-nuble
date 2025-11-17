<script setup>
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <div class="app-shell">
  <Navbar />
    <main class="app-main">
      <RouterView />
    </main>
    <footer>
      <p>© {{ currentYear }} MarkeVUE. Gestión agrícola inteligente.</p>
    </footer>
  </div>
</template>

<script setup></script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
}

.app-main {
  padding: 2.5rem 1.5rem 3.5rem;
  width: min(1080px, 100%);
  margin: 0 auto;
  display: block;
}

@media (max-width: 640px) {
  .app-main {
    padding: 1.75rem 1rem 2.5rem;
  }
}
</style>
