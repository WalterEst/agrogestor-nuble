<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="navbar">
    <div class="branding">
      <span class="logo">Turismo Chillán</span>
      <span class="subtitle">Descubre la identidad de Ñuble</span>
    </div>
    <nav>
      <RouterLink to="/" class="nav-link">Inicio</RouterLink>
      <RouterLink to="/atractivos" class="nav-link">Atractivos</RouterLink>
      <RouterLink to="/gastronomia" class="nav-link">Gastronomía</RouterLink>
      <RouterLink to="/contacto" class="nav-link">Contacto</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #0b5394, #184d47);
  color: #fff;
  border-bottom: 4px solid #f4a259;
}

.branding {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.subtitle {
  font-size: 0.85rem;
  opacity: 0.8;
}

nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  color: inherit;
  text-decoration: none;
  font-weight: 500;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s ease, opacity 0.2s ease;
  opacity: 0.8;
}

.nav-link:hover,
.nav-link.router-link-active {
  border-color: #f4d35e;
  opacity: 1;
}

@media (max-width: 640px) {
  .navbar {
    flex-direction: column;
    align-items: flex-start;
  }

  nav {
    flex-wrap: wrap;
  }
}
</style>
