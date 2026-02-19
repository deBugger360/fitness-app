import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthProvider';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import TabNavigator from './TabNavigator';
import WorkoutScreen from '../screens/WorkoutScreen';
import WaterScreen from '../screens/WaterScreen';
import ProfileScreen from '../screens/ProfileScreen';
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
                    <>
                        <Stack.Screen
                            name="Main"
                            component={TabNavigator}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Workout"
                            component={WorkoutScreen}
                            options={{ headerShown: false, presentation: 'modal' }}
                        />
                        <Stack.Screen
                            name="Water"
                            component={WaterScreen}
                            options={{ headerShown: false, presentation: 'modal' }}
                        />
                        <Stack.Screen
                            name="Profile"
                            component={ProfileScreen}
                        />
                    </>
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
