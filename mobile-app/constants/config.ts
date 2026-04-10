import { Platform } from 'react-native';

// Detectar si estamos en desarrollo local o producción
const isDevelopment = __DEV__;

// URLs del backend
const BACKEND_URLS = {
  // Railway (producción)
  railway: 'https://tu-proyecto.railway.app/api', // Lo actualizaremos después del deploy
  
  // Desarrollo local
  local: 'http://localhost:3001/api',
  
  // Para Expo Go en dispositivo físico (reemplaza con tu IP local)
  // Encuentra tu IP: ipconfig (Windows) o ifconfig (Mac/Linux)
  localNetwork: 'http://192.168.1.XXX:3001/api', // <-- REEMPLAZA XXX
};

// Seleccionar URL según el entorno
export const getApiUrl = () => {
  if (isDevelopment) {
    // En desarrollo, usar Railway si está disponible, sino local
    return BACKEND_URLS.railway !== 'https://tu-proyecto.railway.app/api' 
      ? BACKEND_URLS.railway 
      : BACKEND_URLS.localNetwork;
  }
  return BACKEND_URLS.railway;
};

export const CONFIG = {
  API_URL: getApiUrl(),
  API_TIMEOUT: 15000, // 15 segundos timeout para móvil
  REFRESH_INTERVAL: 60000, // 60 segundos
};

// Helper para actualizar la URL de Railway después del deploy
export const updateRailwayUrl = (url: string) => {
  BACKEND_URLS.railway = url;
};