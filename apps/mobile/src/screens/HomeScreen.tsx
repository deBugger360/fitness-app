import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { sharedFunction, analyzeRealityLog } from '@repo/shared';
import { useAuth } from './src/context/AuthProvider';

export default function HomeScreen() {
    const analysis = analyzeRealityLog("I ate a burger and fries", "stressed");
    const { user } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome {user?.email}</Text>
            <Text>Open up App.tsx to start working on your app!</Text>
            <Text>{sharedFunction()}</Text>
            <Text>Reality Analysis: {analysis.calorieDensity} Calorie Density</Text>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20
    }
});
