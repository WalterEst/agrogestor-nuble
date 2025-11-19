<template>
  <header class="navbar">
    <div class="navbar__brand">
      <div class="logo">MV</div>
      <div>
        <p class="brand__title">MarkeVUE</p>
        <p class="brand__subtitle">Mercado agrícola inteligente</p>
      </div>
    </div>
    <nav class="navbar__links">
      <RouterLink to="/login" class="navbar__link">Ingresar</RouterLink>
      <a class="navbar__cta" href="#">Crear cuenta</a>
    </nav>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped src="../estilos/Navbar.css"></style>
