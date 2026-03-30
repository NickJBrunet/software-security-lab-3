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

interface IProps {}

interface IState {
  notes: INote[];
  newNoteTitle: string;
  newNoteEquation: string;
}

type TProps = NativeStackScreenProps<TRootStackParamList, 'Notes'>;

/**
 * SECURITY FIXES APPLIED:
 * 1. Added validation for note title and equation inputs
 * 2. Added whitelist checks for safe title characters
 * 3. Added strict equation validation to prevent injection-like input
 * 4. Added length limits to reduce abuse and malformed payloads
 * 5. Added validation for loaded notes before rendering/storing
 */
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

  /**
   * Aashish Arun
   * SECURITY FIX: Consistent Username Sanitization for Storage Keys
   *
   * Issue:
   * Storage keys could be built inconsistently if raw usernames
   * are used in one place and sanitized usernames in another.
   *
   * Change Made:
   * Added one shared helper method to sanitize the username
   * before building the notes storage key.
   *
   * Security Benefit:
   * Ensures predictable storage access and prevents malformed
   * key names from user-controlled input.
   */
  private getSafeUsername(): string {
    return this.props.route.params.user.username.replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Aashish Arun
   * SECURITY FIX: Note Object Validation
   *
   * Issue:
   * Parsed stored data was not fully validated before use.
   *
   * Change Made:
   * Added strict validation to ensure each loaded note contains
   * a valid title and equation as strings with acceptable content.
   *
   * Security Benefit:
   * Prevents malformed or unsafe stored objects from being rendered
   * or reused by the application.
   */
  private isValidNote(note: any): note is INote {
    return (
      note &&
      typeof note.title === 'string' &&
      typeof note.text === 'string' &&
      note.title.trim().length > 0 &&
      note.title.trim().length <= 50 &&
      /^[a-zA-Z0-9\s\-_]+$/.test(note.title.trim()) &&
      note.text.trim().length > 0 &&
      note.text.trim().length <= 100 &&
      /^[0-9+\-*/().\s]+$/.test(note.text.trim())
    );
  }

  /**
   * Aashish Arun
   * SECURITY FIX: Note Title Validation
   *
   * Issue:
   * Note titles were only checked for empty input.
   *
   * Change Made:
   * Added trimming, required checks, length limits,
   * and a whitelist of safe characters.
   *
   * Security Benefit:
   * Prevents malformed note titles and reduces the risk
   * of injection-style payloads being stored.
   */
  private validateNoteTitle(value: string): string | null {
    const trimmed = value.trim();

    if (!trimmed) {
      return 'Title is required.';
    }

    if (trimmed.length < 2 || trimmed.length > 50) {
      return 'Title must be between 2 and 50 characters.';
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
      return 'Title can contain only letters, numbers, spaces, hyphens, and underscores.';
    }

    return null;
  }

  /**
   * Aashish Arun
   * SECURITY FIX: Equation Validation
   *
   * Issue:
   * Equation input needed stricter validation and length limits.
   *
   * Change Made:
   * Added trimming, required checks, maximum length control,
   * and a strict whitelist for allowed math characters only.
   *
   * Security Benefit:
   * Reduces the risk of malformed or injection-style input
   * being accepted and stored.
   */
  private validateEquation(value: string): string | null {
    const trimmed = value.trim();

    if (!trimmed) {
      return 'Equation is required.';
    }

    if (trimmed.length > 100) {
      return 'Equation must be 100 characters or less.';
    }

    if (!/^[0-9+\-*/().\s]+$/.test(trimmed)) {
      return 'Invalid equation format.';
    }

    return null;
  }

  private async getStoredNotes(): Promise<INote[]> {
    try {
      //FIX: Removed password from storage key
      const key = 'notes-' + this.getSafeUsername();

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
        try {
          const parsed = JSON.parse(value);

          if (!Array.isArray(parsed)) {
            return [];
          }

          return parsed.filter(note => this.isValidNote(note));
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
      const key = 'notes-' + this.getSafeUsername();
      const safeNotes = notes.filter(note => this.isValidNote(note));
      const jsonValue = JSON.stringify(safeNotes);

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

    const safeTitle = newNoteTitle.trim();
    const safeEquation = newNoteEquation.trim();

    const titleError = this.validateNoteTitle(safeTitle);
    if (titleError) {
      Alert.alert('Error', titleError);
      return;
    }

    const equationError = this.validateEquation(safeEquation);
    if (equationError) {
      Alert.alert('Error', equationError);
      return;
    }

    const note: INote = {
      title: safeTitle,
      text: safeEquation,
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