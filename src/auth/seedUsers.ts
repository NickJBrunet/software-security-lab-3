import {sha256} from 'js-sha256';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'users';

/**
 * 🔐 Seed default test user
 * Runs only once (won’t duplicate users)
 */
export async function seedUsers() {
  try {
    const existing = await AsyncStorage.getItem(USERS_KEY);
    const users = existing ? JSON.parse(existing) : [];

    // ❌ prevent duplicate seeding
    const alreadyExists = users.find((u: any) => u.username === 'joe');
    if (alreadyExists) return;

    // 🔐 "hashed password" (using sha256 since bcrypt is broken in RN)
    const hashedPassword = sha256('secret');

    users.push({
      username: 'joe',
      password: hashedPassword,
    });

    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

    console.log('✅ Seed user created: joe / secret');
  } catch (err) {
    console.log('❌ Seeding failed:', err);
  }
}
