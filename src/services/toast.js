export function showError(message) {
  // Implementación simple por ahora; se puede reemplazar por un componente toast
  if (typeof window !== 'undefined' && window.alert) {
    window.alert(message);
  }
}

export function showSuccess(message) {
  if (typeof window !== 'undefined' && window.alert) {
    window.alert(message);
  }
}

export default { showError, showSuccess };
