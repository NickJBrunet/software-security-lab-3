import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

// 🔐 generate fake token
export function generateToken(username: string) {
  return `${username}-${Date.now()}`; // simple token simulation
}

// store token
export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

// get token
export async function getToken() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

// remove token (logout)
export async function removeToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
