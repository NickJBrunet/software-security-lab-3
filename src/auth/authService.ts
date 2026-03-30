import {sha256} from 'js-sha256';
import {findUser, addUser, getUsers} from './userStorage';

// REGISTER
export async function register(username: string, password: string) {
  const existing = await findUser(username);
  if (existing) throw new Error('User already exists');
  const hashedPassword = await sha256(password);

  await addUser({username, password: hashedPassword});
}

// LOGIN
export async function login(username: string, password: string) {
  const user = await findUser(username);

  if (!user) throw new Error('User not found');

  const isMatch = sha256(password) === user.password;
  if (!isMatch) throw new Error('Invalid credentials');

  return {username};
}
