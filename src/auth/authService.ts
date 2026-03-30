import {sha256} from 'js-sha256';
import {findUser, addUser} from './userStorage';

/**
 * Aashish Arun
 * SECURITY FIX: Input Validation for Registration
 *
 * Issue:
 * Registration previously accepted raw username and password input
 * without validation or sanitization.
 *
 * Change Made:
 * Added trimming, required checks, username whitelist validation,
 * and password length validation before storing a new user.
 *
 * Security Benefit:
 * Prevents malformed input from being saved and reduces the risk
 * of unsafe user-controlled values entering storage.
 */

// REGISTER
export async function register(username: string, password: string) {
  const cleanUsername = username.trim();
  const cleanPassword = password.trim();

  if (!cleanUsername) {
    throw new Error('Username is required');
  }

  if (cleanUsername.length < 3 || cleanUsername.length > 20) {
    throw new Error('Username must be between 3 and 20 characters');
  }

  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    throw new Error(
      'Username can contain only letters, numbers, and underscores',
    );
  }

  if (!cleanPassword) {
    throw new Error('Password is required');
  }

  if (cleanPassword.length < 4 || cleanPassword.length > 50) {
    throw new Error('Password must be between 4 and 50 characters');
  }

  const existing = await findUser(cleanUsername);
  if (existing) {
    throw new Error('User already exists');
  }

  const hashedPassword = sha256(cleanPassword);

  await addUser({username: cleanUsername, password: hashedPassword});
}

// LOGIN
export async function login(username: string, password: string) {
  const user = await findUser(username);

  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = sha256(password) === user.password;
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return {username};
}