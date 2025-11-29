import api from './api';

export default {
  
  getMyProducts() {
    return api.get('/publisher/products');
  },


  getProductById(id) {
    return api.get(`/publisher/products/${id}`);
  },

 createProduct(formData) {
    return api.post('/publisher/products', formData);
  },
 
  updateProduct(id, data) {
    return api.put(`/publisher/products/${id}`, data);
  },


  deleteProduct(id) {
    return api.delete(`/publisher/products/${id}`);
  }
};