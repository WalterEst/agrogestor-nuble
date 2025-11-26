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
  <RouterLink to="/admin" class="navbar__link">Administrador</RouterLink>
  <RouterLink to="/productos" class="navbar__link">Productos</RouterLink>
  <RouterLink to="/register" class="navbar__cta">Crear cuenta</RouterLink>
    </nav>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped src="../estilos/Navbar.css"></style>
