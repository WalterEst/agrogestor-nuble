import { defineStore } from 'pinia'

export const STORAGE_KEY = 'marketvue.session'

export const readSessionFromStorage = () => {
  const rawSession = localStorage.getItem(STORAGE_KEY)

  if (!rawSession) return null

  try {
    return JSON.parse(rawSession)
  } catch (error) {
    console.error('No pudimos leer la sesión almacenada', error)
    return null
  }
}

export const useSessionStore = defineStore('session', {
  state: () => ({
    session: readSessionFromStorage()
  }),

  getters: {
    usuario: (state) => state.session?.usuario || null,
    isAuthenticated: (state) => Boolean(state.session?.usuario),
    avatarUrl: (state) =>
      state.session?.usuario?.avatar ||
      state.session?.usuario?.avatarUrl ||
      state.session?.usuario?.foto ||
      state.session?.usuario?.foto_url ||
      state.session?.usuario?.imageUrl ||
      null,
    roleId: (state) => Number(state.session?.usuario?.rol_id ?? state.session?.usuario?.rolId ?? state.session?.usuario?.roleId),
    roleName: (state) => String(state.session?.usuario?.rol ?? state.session?.usuario?.role ?? '').toLowerCase(),
    isAdmin() {
      return [1, 2, 'super administrador', 'administrador'].some((role) =>
        typeof role === 'number' ? this.roleId === role : this.roleName === role
      )
    },
    isPublisher() {
      return [3, 'usuario'].some((role) =>
        typeof role === 'number' ? this.roleId === role : this.roleName === role
      )
    },
    hasRole: (state) => (allowedRoles = []) => {
      if (!allowedRoles.length) return true

      return allowedRoles.some((role) => {
        if (typeof role === 'number') {
          return state.session?.usuario && Number(role) === Number(state.session?.usuario?.rol_id ?? state.session?.usuario?.rolId ?? state.session?.usuario?.roleId)
        }

        if (typeof role === 'string') {
          return state.session?.usuario && role.toLowerCase() === String(state.session?.usuario?.rol ?? state.session?.usuario?.role ?? '').toLowerCase()
        }

        return false
      })
    }
  },

  actions: {
    setSession(session) {
      this.session = session
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    },
    clearSession() {
      this.session = null
      localStorage.removeItem(STORAGE_KEY)
    },
    refreshFromStorage() {
      this.session = readSessionFromStorage()
    }
  }
})