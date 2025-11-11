import { reactive, toRefs } from 'vue';

// Estado de autenticación
const state = reactive({
  isLogged: true,
  user: null,
});

export function useAuth() {
  const login = async (email, password) => {
    state.isLogged = true;
  };

  const logout = () => {
    state.isLogged = false;
    state.user = null;
  };

  state.login = login;
  state.logout = logout;

  return state;
}
