import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { sharedFunction, analyzeRealityLog } from '@repo/shared';

export default function App() {
    const analysis = analyzeRealityLog("I ate a burger and fries", "stressed");
    return (
        <View style={styles.container}>
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
});
