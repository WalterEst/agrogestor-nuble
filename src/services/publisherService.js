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
  },

  getProfile() {
   
    const userStr = localStorage.getItem('user');
    let userId = 1; 

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id) userId = user.id;
      } catch (e) {
        console.warn("Error leyendo storage");
      }
    }
    
    
    return api.get(`/publisher/profile?userId=${userId}`);
  },

  updateProfile(data) {
    
    const userStr = localStorage.getItem('user');
    let userId = 1; 

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        if (user.id) userId = user.id;
      } catch (e) {
        console.warn("Error leyendo usuario del storage al actualizar");
      }
    }
    
    
    return api.put(`/publisher/profile?userId=${userId}`, data);
  },
  // --- SOPORTE ---
  getMyReports() {
    return api.get('/publisher/reports');
  },

  sendContactForm(data) {
    return api.post('/publisher/contact', data);
  }

};