
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications behave when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const NotificationService = {

    // 1. Request Permissions
    async registerForPushNotificationsAsync() {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (!Device.isDevice) {
            // Simulator handling
            console.log('Must use physical device for Push Notifications');
            return null;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }

        return true;
    },

    // 2. Schedule Local Notification
    async scheduleDailyNotification(
        title: string,
        body: string,
        hour: number,
        minute: number = 0,
        id?: string
    ) {
        // Cancel existing with same title/id heuristic if sophisticated management needed
        // For simple MVP:

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: {
                hour,
                minute,
                repeats: true,
            },
        });
    },

    // 3. Setup Default Schedules
    async setupDefaultNotifications(preferences: {
        workout: boolean;
        craving: boolean;
        walk: boolean;
        streak: boolean;
    }) {
        // Clear all first to reset schedules based on prefs
        await Notifications.cancelAllScheduledNotificationsAsync();

        if (preferences.workout) {
            await this.scheduleDailyNotification(
                "🌅 Rise and Grind!",
                "It's 5 AM. Crush your morning workout and own the day.",
                5, 0 // 5:00 AM
            );
        }

        if (preferences.craving) {
            await this.scheduleDailyNotification(
                "🛡️ Craving Alert",
                "Sugar cravings often hit now. Stay strong! Drink water or grab a protein snack.",
                14, 0 // 2:00 PM
            );
        }

        if (preferences.walk) {
            await this.scheduleDailyNotification(
                "🚶 Time to Move",
                "Clear your mind with an evening walk. Hit your step goal!",
                18, 0 // 6:00 PM
            );
        }

        if (preferences.streak) {
            await this.scheduleDailyNotification(
                "🔥 Streak Risk!",
                "Don't lose your streak! Log your activity now to keep it alive.",
                20, 0 // 8:00 PM
            );
        }
    },

    async cancelAll() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
};
