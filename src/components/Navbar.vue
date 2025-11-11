<template>
  <header class="navbar" :class="{ 'navbar--elevated': isScrolled }">
    <nav class="navbar__content">
      <router-link class="navbar__brand" :to="brandDestination">
        <span class="navbar__logo" aria-hidden="true">🌱</span>
        AgroGestor
      </router-link>

      <button class="navbar__toggle" @click="toggleMenu" aria-label="Mostrar menú">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="navbar__links" :class="{ 'navbar__links--open': mobileOpen }">
        <router-link
          v-if="auth.user?.role === 'SUPERADMIN'"
          to="/admin/dashboard"
          class="navbar__link"
          active-class="is-active"
        >
          Panel
        </router-link>
        <router-link to="/explore" class="navbar__link" active-class="is-active">Explorar</router-link>
        <router-link v-if="auth.isLogged" to="/new" class="navbar__link" active-class="is-active">
          Publicar
        </router-link>
        <router-link v-if="auth.isLogged" to="/mine" class="navbar__link" active-class="is-active">
          Mis publicaciones
        </router-link>
        <router-link
          v-if="auth.user?.role === 'SUPERADMIN'"
          to="/admin/users"
          class="navbar__link"
          active-class="is-active"
        >
          Aprobaciones
        </router-link>

        <router-link v-if="!auth.isLogged" to="/login" class="navbar__cta">Iniciar sesión</router-link>
        <button v-else class="navbar__cta navbar__cta--secondary" @click="logout">Cerrar sesión</button>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../stores/auth';

const auth = useAuth();
const route = useRoute();
const mobileOpen = ref(false);
const isScrolled = ref(false);

const brandDestination = computed(() => {
  if (auth.user?.role === 'SUPERADMIN') return '/admin/dashboard';
  return auth.isLogged ? '/explore' : '/login';
});

function toggleMenu() {
  mobileOpen.value = !mobileOpen.value;
}

function handleScroll() {
  isScrolled.value = window.scrollY > 12;
}

async function logout() {
  await auth.logout();
  mobileOpen.value = false;
  if (route.path !== '/login') {
    location.assign('/login');
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false;
  },
);
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(253, 248, 238, 0.85);
  backdrop-filter: blur(10px);
  transition: box-shadow 0.2s ease;
}

.navbar--elevated {
  box-shadow: 0 12px 24px rgba(16, 55, 92, 0.08);
}

.navbar__content {
  margin: 0 auto;
  width: min(1080px, 100%);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.navbar__brand {
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.04em;
  text-decoration: none;
  color: #10375c;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.navbar__logo {
  font-size: 1.5rem;
}

.navbar__links {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar__link {
  text-decoration: none;
  font-weight: 600;
  color: rgba(16, 55, 92, 0.85);
  padding: 0.35rem 0.5rem;
  border-radius: 0.6rem;
  transition: background 0.2s ease, color 0.2s ease;
}

.navbar__link:hover,
.navbar__link.is-active {
  background: rgba(16, 55, 92, 0.1);
  color: #10375c;
}

.navbar__cta {
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #184d47, #0b5394);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.navbar__cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(16, 55, 92, 0.2);
}

.navbar__cta--secondary {
  background: #fff;
  color: #184d47;
  border: 1px solid rgba(16, 55, 92, 0.18);
}

.navbar__toggle {
  display: none;
  flex-direction: column;
  gap: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
}

.navbar__toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background: #10375c;
  border-radius: 999px;
}

@media (max-width: 760px) {
  .navbar__content {
    padding: 0.85rem 1rem;
  }

  .navbar__toggle {
    display: flex;
  }

  .navbar__links {
    position: absolute;
    inset: 100% 0 auto;
    background: rgba(253, 248, 238, 0.97);
    display: grid;
    gap: 0.75rem;
    padding: 1rem;
    transform-origin: top;
    transform: scaleY(0.7);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .navbar__links--open {
    transform: scaleY(1);
    opacity: 1;
    pointer-events: auto;
  }

  .navbar__cta,
  .navbar__link {
    width: 100%;
  }
}
</style>
