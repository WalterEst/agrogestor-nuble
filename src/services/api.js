import axios from 'axios';
import { readSessionFromStorage } from '../stores/session';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', 
 // headers: {
//   'Content-Type': 'application/json',
    'Accept': 'application/json'
//  }
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const session = readSessionFromStorage();
  const userId = session?.usuario?.id;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  return config;
});

export default apiClient;