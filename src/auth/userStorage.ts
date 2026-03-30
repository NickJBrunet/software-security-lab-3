import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'users';

// 🔐 Get all users safely
export async function getUsers() {
  try {
    const data = await AsyncStorage.getItem(USERS_KEY);

    if (!data) return [];

    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return []; // prevent crash if JSON is corrupted
  }
}

// 🔐 Save users safely
export async function saveUsers(users: any[]) {
  try {
    const json = JSON.stringify(users);
    await AsyncStorage.setItem(USERS_KEY, json);
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

// 🔐 Find user by username
export async function findUser(username: string) {
  const users = await getUsers();
  return users.find((u: any) => u.username === username);
}

// 🔐 Add new user
export async function addUser(user: {username: string; password: string}) {
  const users = await getUsers();

  users.push(user);

  await saveUsers(users);
}
