<script setup>
import { computed, onMounted, onBeforeUnmount, ref, nextTick, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSessionStore } from '../stores/session'

const emit = defineEmits(['logout'])

const sessionStore = useSessionStore()
const { usuario, isAdmin, isPublisher } = storeToRefs(sessionStore)

const menuOpen = ref(false)
const isProcessing = ref(false)
const triggerRef = ref(null)
const dropdownEl = ref(null)
const dropdownStyle = ref({ position: 'fixed' })
const DROPDOWN_WIDTH = 240

const profileLink = computed(() => {
  if (isPublisher.value) return { name: 'publisher-profile' }
  if (isAdmin.value) return { name: 'admin' }
  return { name: 'publicaciones' }
})

const userInitials = computed(() => {
  const names = [usuario.value?.nombre, usuario.value?.apellido].filter(Boolean)
  if (names.length) {
    return names
      .map((part) => String(part).trim().charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  if (usuario.value?.email) {
    return usuario.value.email.substring(0, 2).toUpperCase()
  }

  return 'US'
})

const toggleMenu = async () => {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) {
    await nextTick()
    computePosition()
  }
}

const closeMenu = () => {
  menuOpen.value = false
}

const computePosition = () => {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const top = rect.bottom + 8
  const left = Math.max(8, rect.right - DROPDOWN_WIDTH)
  dropdownStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width: `${DROPDOWN_WIDTH}px`,
    zIndex: 99999,
  }
}

const handleClickOutside = (event) => {
  const clickedInsideTrigger = event.target.closest('.avatar-menu')
  const clickedInsideDropdown = dropdownEl.value && dropdownEl.value.contains(event.target)
  if (!clickedInsideTrigger && !clickedInsideDropdown) closeMenu()
}

watch(menuOpen, (val) => {
  if (val) {
    computePosition()
  }
})


const handleLogout = () => {
  emit('logout')
  closeMenu()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', computePosition)
  window.addEventListener('scroll', computePosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', computePosition)
  window.removeEventListener('scroll', computePosition, true)
})
</script>

<template>
  <div class="avatar-menu">
    <button ref="triggerRef" class="avatar-trigger" type="button" @click.stop="toggleMenu">
      <span class="avatar-fallback" aria-hidden="true">{{ userInitials }}</span>
      <div class="user-meta">
        <p class="user-name">{{ usuario?.nombre || 'Usuario' }}</p>
        <small class="user-role">{{ usuario?.rol || usuario?.role || 'Mi perfil' }}</small>
      </div>
      <svg
        class="chevron"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <teleport to="body">
      <div v-if="menuOpen" ref="dropdownEl" class="avatar-dropdown" :style="dropdownStyle">
      <div class="dropdown-header">
        <div class="dropdown-avatar" aria-hidden="true">
          <span class="avatar-fallback">{{ userInitials }}</span>
        </div>
        <div>
          <p class="user-name">{{ usuario?.nombre || 'Usuario' }}</p>
          <p class="user-email">{{ usuario?.email || 'sin correo' }}</p>
        </div>
      </div>

      <RouterLink :to="profileLink" class="dropdown-link" @click="closeMenu">
        Gestionar perfil
      </RouterLink>
      <button class="dropdown-link" type="button" @click="handleLogout">
        Cerrar sesión
      </button>
      
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.avatar-menu {
  position: relative;
}

.avatar-trigger {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.5rem;
  border-radius: 999px;
  border: 1px solid rgba(11, 63, 57, 0.12);
  background: #fff;
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.avatar-trigger:hover {
  border-color: rgba(11, 63, 57, 0.2);
  box-shadow: 0 10px 24px rgba(11, 63, 57, 0.08);
}

.avatar-image,
.avatar-fallback {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-weight: 700;
  color: #0b3f39;
  background-color: #e5f3f0;
}

.user-meta {
  text-align: left;
  line-height: 1.1;
}

.user-name {
  font-weight: 700;
  margin: 0;
  color: #0b3f39;
}

.user-role,
.user-email {
  margin: 0;
  color: #6b7280;
  font-size: 0.85rem;
}

.chevron {
  width: 18px;
  height: 18px;
  color: #0b3f39;
}

.avatar-dropdown {
  position: fixed;
  width: 240px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.08);
  padding: 0.75rem;
  z-index: 99999;
  display: grid;
  gap: 0.25rem;
}

.dropdown-header {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eef2f7;
}

.dropdown-avatar .avatar-image,
.dropdown-avatar .avatar-fallback {
  width: 48px;
  height: 48px;
}

.dropdown-link {
  width: 100%;
  text-align: left;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #0b3f39;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  text-decoration: none;
}

.dropdown-link:hover {
  background: #f1f7f5;
}

.dropdown-link:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dropdown-link.danger {
  color: #b91c1c;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>