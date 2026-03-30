import React from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {TRootStackParamList} from './App';
import {login} from './auth/authService';
import {generateToken, saveToken} from './auth/tokenService';

/**
 * VULNERABILITY: No Input Validation
 * Type: Insufficient Input Validation
 *
 * Issue:
 * Username and password inputs are not validated or sanitized.
 *
 * Risk:
 * - Empty or malformed input accepted
 * - Potential injection attacks in future expansions
 *
 * Fix:
 * - Validate input length and format
 * - Sanitize user input
 */
export interface IUser {
  username: string;
  // REMOVED password from interface (security improvement)
}

interface IProps {
  onLogin: (user: IUser) => void;
}

type TProps = NativeStackScreenProps<TRootStackParamList, 'Login'> & IProps;

export default function Login(props: TProps) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  /**
   * Aashish Arun
   * SECURITY FIX: Username Validation and Sanitization
   *
   * Issue:
   * Username input previously accepted raw values without format restrictions.
   *
   * Change Made:
   * Added trimming, required-field checks, length checks,
   * and a whitelist of allowed username characters.
   *
   * Security Benefit:
   * Prevents malformed usernames and reduces the risk of
   * unsafe input being processed or stored.
   */
  function validateUsername(value: string): string | null {
    const trimmed = value.trim();

    if (!trimmed) {
      return 'Username is required.';
    }

    if (trimmed.length < 3 || trimmed.length > 20) {
      return 'Username must be between 3 and 20 characters.';
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return 'Username can contain only letters, numbers, and underscores.';
    }

    return null;
  }

  /**
   * Aashish Arun
   * SECURITY FIX: Password Validation and Sanitization
   *
   * Issue:
   * Password input previously accepted empty or malformed values.
   *
   * Change Made:
   * Added trimming, required checks, and length limits.
   *
   * Security Benefit:
   * Improves input quality and prevents weak or malformed values
   * from being passed into the authentication flow.
   */
  function validatePassword(value: string): string | null {
    const trimmed = value.trim();

    if (!trimmed) {
      return 'Password is required.';
    }

    if (trimmed.length < 4 || trimmed.length > 50) {
      return 'Password must be between 4 and 50 characters.';
    }

    return null;
  }

  async function loginUser() {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    const usernameError = validateUsername(cleanUsername);
    if (usernameError) {
      Alert.alert('Error', usernameError);
      return;
    }

    const passwordError = validatePassword(cleanPassword);
    if (passwordError) {
      Alert.alert('Error', passwordError);
      return;
    }

    try {
      const user = await login(cleanUsername, cleanPassword);

      const token = generateToken(user.username);
      await saveToken(token);

      props.onLogin(user);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.username}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.password}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry={true} // FIX: hide password
      />
      <Button title="Login" onPress={loginUser} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  username: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  password: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
});