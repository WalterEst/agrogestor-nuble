import { defineStore } from 'pinia';
import api from '../services/api'; // Asegúrate de que api.js exista en services

export const usePublisherStore = defineStore('publisher', {
  state: () => ({
    products: [],
    loading: false
  }),
  actions: {
    async fetchMyProducts() {
      this.loading = true;
      try {
        const { data } = await api.get('/publisher/products');
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