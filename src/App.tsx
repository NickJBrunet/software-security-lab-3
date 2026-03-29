/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

/**
 * VULNERABILITY: Improper Authentication Handling
 * Type: Authentication / Session Management
 * 
 * Issue:
 * Authentication state is stored only in memory.
 * No tokens, no persistence, no expiration.
 * 
 * Risk:
 * - Session bypass
 * - No secure authentication enforcement
 * 
 * Fix:
 * - Use JWT or session tokens
 * - Store securely (SecureStore / Keychain)
 */
import React from 'react';
import type { PropsWithChildren } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Notes from './Notes';
import Login, { IUser } from './Login';

export type TRootStackParamList = {
    Login: undefined;
    Notes: {
        user: IUser;
    };
};

function App() {
    // If app is closed or crashed, user will be signed out (no persistence)
    // FIX: In real apps, use secure token storage and validation
    const [signedInAs, setSignedInAs] = React.useState<IUser | false>(false);

    const Stack = createNativeStackNavigator<TRootStackParamList>();

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {
                    !signedInAs ?
                        <Stack.Screen name="Login">
                            {(props) => <Login {...props} onLogin={(user) => setSignedInAs(user)} />}
                        </Stack.Screen> :
                        // passing the full user object to Notes screen, which is not ideal (security risk)
                        // FIX: Only pass necessary info (e.g. username) or use a secure context/state management
                        <Stack.Screen name="Notes" component={Notes} initialParams={{ user: signedInAs }} />
                }
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
});

export default App;
