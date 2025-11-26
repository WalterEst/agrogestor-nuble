<template>
  <header class="navbar">
    <div class="navbar__brand">
      <div class="logo">MV</div>
      <div>
        <p class="brand__title">MarkeVUE</p>
        <p class="brand__subtitle">Mercado agrícola inteligente</p>
      </div>
    </div>

    <nav class="navbar__links" v-if="isAuthenticated">
      <RouterLink to="/publicaciones" class="navbar__link">Publicaciones</RouterLink>
      <RouterLink v-if="isPublisher" to="/panel/publicador/mis-productos" class="navbar__link">Mi Panel</RouterLink>
      <RouterLink v-if="isAdmin" to="/admin" class="navbar__link">Administrador</RouterLink>
      <button class="navbar__link navbar__button" type="button" @click="logout">Salir</button>
    </nav>

    <nav class="navbar__links" v-else>
      <RouterLink to="/publicaciones" class="navbar__link">Publicaciones</RouterLink>
      <RouterLink to="/login" class="navbar__link">Ingresar</RouterLink>
      <RouterLink to="/register" class="navbar__cta">Crear cuenta</RouterLink>
    </nav>
  </header>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSessionStore } from '../stores/session'

const router = useRouter()
const sessionStore = useSessionStore()
const { isAuthenticated, isAdmin, isPublisher } = storeToRefs(sessionStore)

const logout = () => {
  sessionStore.clearSession()
  router.push({ name: 'login' })
}
</script>

<style scoped src="../estilos/Navbar.css"></style>