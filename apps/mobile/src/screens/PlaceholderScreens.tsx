import { View, Text, StyleSheet } from 'react-native';

const createPlaceholderScreen = (name: string) => {
    return function Screen() {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>{name} Screen</Text>
            </View>
        );
    };
};

export const ActivityScreen = createPlaceholderScreen('Activity');
export const MealsScreen = createPlaceholderScreen('Meals');
export const SugarScreen = createPlaceholderScreen('Sugar');
export const InsightsScreen = createPlaceholderScreen('Insights');
export const ProfileScreen = createPlaceholderScreen('Profile');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 20,
        fontWeight: '600',
    },
});
