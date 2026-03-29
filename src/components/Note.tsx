import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { evaluate } from 'mathjs'; // SAFE math equation

interface IProps {
	title: string;
	text: string;
}

function Note(props: IProps) {
	function evaluateEquation() {
		// FIX: Removed eval() → replaced with safe math evaluation
		try {
			// VERY basic safe calculation (only numbers/operators)
			if (!/^[0-9+\-*/().\s]+$/.test(props.text)) {
				throw new Error('Invalid expression');
			}

			// Only allow safe math expressions
			const result = evaluate(props.text);

			Alert.alert('Result', 'Result: ' + result);
		} catch {
			Alert.alert('Error', 'Invalid equation.');
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>
				{props.title}
			</Text>
			<Text style={styles.text}>
				{props.text}
			</Text>

			<View style={styles.evaluateContainer}>
				<Button title='Evaluate' onPress={evaluateEquation} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 10,
		marginTop: 5,
		marginBottom: 5,
		backgroundColor: '#fff',
		borderRadius: 5,
		borderColor: 'black',
		borderWidth: 1
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold'
	},
	text: {
		fontSize: 16,
	},
	evaluateContainer: {
		marginTop: 10,
		marginBottom: 10
	}
});

export default Note;