import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthProvider';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import { Button } from 'react-native';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const { session, loading, signOut } = useAuth();

    if (loading) {
        // You might want a better loading screen here
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {session ? (
                    // App Stack
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{
                            headerRight: () => (
                                <Button onPress={signOut} title="Log Out" />
                            ),
                        }}
                    />
                ) : (
                    // Auth Stack
                    <Stack.Group screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
