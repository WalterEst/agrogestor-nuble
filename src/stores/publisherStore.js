import { defineStore } from 'pinia';
import api from '../services/api'; 
import { readSessionFromStorage } from './session';

export const usePublisherStore = defineStore('publisher', {
  state: () => ({
    products: [],
    loading: false
  }),
  actions: {
    async fetchMyProducts() {
      const session = readSessionFromStorage();
      const userId = session?.usuario?.id;

      if (!userId) {
        console.warn('No se pudo cargar "Mis Publicaciones" porque no hay usuario autenticado.');
        this.products = [];
        return;
      }

      this.loading = true;
      try {
        const { data } = await api.get('/publisher/products', {
          headers: {
            'x-user-id': userId
          }
        });
        this.products = data;
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        this.loading = false;
      }
    },
    async deleteProduct(id) {
        try {
            await api.delete(`/publisher/products/${id}`);
            this.products = this.products.filter(p => p.id !== id);
        } catch (error) {
            console.error(error);
        }
    }
  }
});