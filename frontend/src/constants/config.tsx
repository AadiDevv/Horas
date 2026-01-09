export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK === "true" || false,
  TIMEOUT: 5000
};

export const APP_CONFIG = {
  APP_NAME: 'HORAS',
  VERSION: '1.0.0'
};