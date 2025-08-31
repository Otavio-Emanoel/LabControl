import axios, { AxiosRequestHeaders } from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = ((Constants.expoConfig?.extra as any)?.API_URL as string | undefined) || process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  if (!config.baseURL) config.baseURL = BASE_URL;
  const url = (config.url || '').toLowerCase();
  if (url.includes('/auth/login') || url.includes('/auth/register')) {
    return config;
  }
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    if (config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    } else {
      config.headers = { Authorization: `Bearer ${token}` } as AxiosRequestHeaders;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.message === 'Network Error') {
      console.error('Erro de rede ao chamar API. Verifique API_URL e conectividade do dispositivo.', error);
    }
    return Promise.reject(error);
  }
);

export function getApiBaseUrl() {
  return BASE_URL;
}
