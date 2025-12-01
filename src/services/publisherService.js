import api from './api';

export default {
  
  _readStoredUserId() {
    try {
      const raw = localStorage.getItem('marketvue.session');
      if (raw) {
        const session = JSON.parse(raw);
        const usuario = session?.usuario || session?.user || null;
        if (usuario) return usuario.id || usuario.userId || usuario.usuario_id || null;
      }
    } catch (e) {
      // noop
    }

    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u && u.id) return u.id;
      }
    } catch (e) {
      // noop
    }

    return null;
  },

  getMyProducts() {
    const userId = this._readStoredUserId();
    return api.get(userId ? `/publisher/products?userId=${userId}` : '/publisher/products');
  },


  getProductById(id) {
    return api.get(`/publisher/products/${id}`);
  },

 createProduct(formData) {
    const userId = this._readStoredUserId();
    // si es FormData, añadir userId al body
    if (formData && typeof formData.append === 'function' && userId) {
      formData.append('userId', String(userId));
    }
    return api.post('/publisher/products', formData);
  },
 
  updateProduct(id, data) {
    return api.put(`/publisher/products/${id}`, data);
  },


  deleteProduct(id) {
    return api.delete(`/publisher/products/${id}`);
  },

  getProfile() {
    // Leer la sesión estándar (`marketvue.session`) cuando exista
    let userId = null;

    try {
      const raw = localStorage.getItem('marketvue.session');
      if (raw) {
        const session = JSON.parse(raw);
        const usuario = session?.usuario || session?.user || null;
        if (usuario) {
          userId = usuario.id || usuario.userId || usuario.usuario_id || null;
        }
      }
    } catch (e) {
      console.warn('Error leyendo session desde storage', e);
    }

    // Compatibilidad hacia atrás: si existe la clave `user`, usarla
    if (!userId) {
      try {
        const rawUser = localStorage.getItem('user');
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (u && u.id) userId = u.id;
        }
      } catch (e) {
        // noop
      }
    }

    // Si no hay userId, llamamos al endpoint sin query (el backend debería resolverlo por token);
    // de lo contrario pasamos ?userId=<id>
    return api.get(userId ? `/publisher/profile?userId=${userId}` : `/publisher/profile`);
  },

  updateProfile(data) {
    let userId = null;

    try {
      const raw = localStorage.getItem('marketvue.session');
      if (raw) {
        const session = JSON.parse(raw);
        const usuario = session?.usuario || session?.user || null;
        if (usuario) {
          userId = usuario.id || usuario.userId || usuario.usuario_id || null;
        }
      }
    } catch (e) {
      console.warn('Error leyendo session desde storage', e);
    }

    if (!userId) {
      try {
        const rawUser = localStorage.getItem('user');
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (u && u.id) userId = u.id;
        }
      } catch (e) {
        // noop
      }
    }

    return api.put(userId ? `/publisher/profile?userId=${userId}` : `/publisher/profile`, data);
  },
  // --- SOPORTE ---
  getMyReports() {
    const userId = this._readStoredUserId();
    return api.get(userId ? `/publisher/reports?userId=${userId}` : '/publisher/reports');
  },

  sendContactForm(data) {
    const userId = this._readStoredUserId();
    const payload = { ...data };
    if (userId) payload.userId = userId;
    return api.post('/publisher/contact', payload);
  }

};