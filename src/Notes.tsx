import React from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Note from './components/Note';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {TRootStackParamList} from './App';

export interface INote {
  title: string;
  text: string;
}

// interface IProps {
// }

interface IState {
  notes: INote[];
  newNoteTitle: string;
  newNoteEquation: string;
}

type TProps = NativeStackScreenProps<TRootStackParamList, 'Notes'>;

export default class Notes extends React.Component<TProps, IState> {
  constructor(props: Readonly<TProps>) {
    super(props);

    this.state = {
      notes: [],
      newNoteTitle: '',
      newNoteEquation: '',
    };
  }

  async componentDidMount() {
    const existing = await this.getStoredNotes();
    this.setState({notes: existing});
  }

  async componentWillUnmount() {
    await this.storeNotes(this.state.notes);
  }

  private async getStoredNotes(): Promise<INote[]> {
    try {
      //FIX: Removed password from storage key
      const key = 'notes-' + this.props.route.params.user.username;

      const value = await AsyncStorage.getItem(key);

      if (value) {
        /**
         * VULNERABILITY: Unsafe JSON Parsing
         *
         * Issue:
         * JSON.parse is used without error handling.
         *
         * Risk:
         * - App crash if stored data is corrupted
         *
         * Fix:
         * - Wrap in try/catch
         */
        // return JSON.parse(value);
        try {
          return JSON.parse(value);
        } catch (e) {
          console.error('Corrupted notes data:', e);
          return [];
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load notes.');
    }

    return [];
  }

  private async storeNotes(notes: INote[]) {
    try {
      const safeUsername = this.props.route.params.user.username.replace(
        /[^a-zA-Z0-9]/g,
        '',
      );
      const key = 'notes-' + safeUsername;
      const jsonValue = JSON.stringify(notes);

      /**
       * VULNERABILITY: Insecure Data Storage
       * Type: Insecure Data Storage
       *
       * Issue:
       * Notes are stored using AsyncStorage in plain text.
       * The storage key includes the user's password.
       *
       * Risk:
       * - Sensitive data can be accessed if device is compromised
       * - Password exposure via storage key
       *
       * Fix:
       * - Use encrypted storage (react-native-keychain or secure storage)
       * - Never include passwords in storage keys
       */
      /**
       * NOTE: Still using AsyncStorage (not encrypted)
       * In real apps → use encrypted storage
       */
      await AsyncStorage.setItem(key, jsonValue);
    } catch (err) {
      Alert.alert('Error', 'Failed to save notes.');
    }
  }

  private addNote = () => {
    const {newNoteTitle, newNoteEquation} = this.state;

    //FIX: Input validation
    if (!newNoteTitle.trim() || !newNoteEquation.trim()) {
      Alert.alert('Error', 'Title and equation cannot be empty.');
      return;
    }

    //FIX: Basic sanitization (prevent injection patterns)
    if (!/^[0-9+\-*/().\s]+$/.test(newNoteEquation)) {
      Alert.alert('Error', 'Invalid equation format.');
      return;
    }

    const note: INote = {
      title: newNoteTitle,
      text: newNoteEquation,
    };

    this.setState({
      notes: [...this.state.notes, note],
      newNoteTitle: '',
      newNoteEquation: '',
    });
  };

  render() {
    return (
      <SafeAreaView>
        <ScrollView>
          <View style={styles.container}>
            <Text style={styles.title}>
              {'Math Notes: ' + this.props.route.params.user.username}
            </Text>

            <TextInput
              style={styles.titleInput}
              value={this.state.newNoteTitle}
              onChangeText={value => this.setState({newNoteTitle: value})}
              placeholder="Enter your title"
            />

            <TextInput
              style={styles.textInput}
              value={this.state.newNoteEquation}
              onChangeText={value => this.setState({newNoteEquation: value})}
              placeholder="Enter your math equation"
            />

            <Button title="Add Note" onPress={this.addNote} />

            <View style={styles.notes}>
              {this.state.notes.map((note, index) => (
                <Note key={index} title={note.title} text={note.text} />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
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
  titleInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  notes: {
    marginTop: 15,
  },
});
