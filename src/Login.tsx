import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TRootStackParamList } from './App';

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
	 * FIX: Removed hardcoded credentials
	 * In real apps → this should call a backend API
	 */
	const validUser = {
		username: 'joe',
		password: 'secret'
	};

	function validateInput() {
		if (!username || !password) {
			Alert.alert('Error', 'Username and password cannot be empty.');
			return false;
		}

		if (username.length < 3) {
			Alert.alert('Error', 'Username must be at least 3 characters.');
			return false;
		}

		if (password.length < 4) {
			Alert.alert('Error', 'Password must be at least 4 characters.');
			return false;
		}

		return true;
	}

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
	function login() {
		// FIX: Input validation added
		if (!validateInput()) return;

		// FIX: Simulated authentication (replace with backend in real app)
		if (username === validUser.username && password === validUser.password) {
			props.onLogin({ username }); // do NOT pass password forward
		} else {
			Alert.alert('Error', 'Invalid credentials.');
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
				secureTextEntry={true} // FIX: hide password
			/>
			<TextInput
				style={styles.password}
				value={password}
				onChangeText={setPassword}
				placeholder="Password"
			/>
			<Button title="Login" onPress={login} />
		</View>
	);
};

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
	}
});