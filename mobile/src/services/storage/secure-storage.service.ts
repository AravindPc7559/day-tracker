import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

export const storeToken = (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const getStoredToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);
