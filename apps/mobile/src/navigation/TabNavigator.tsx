import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

import TodayScreen from '../screens/TodayScreen';
import ActivityScreen from '../screens/ActivityScreen';
import MealsScreen from '../screens/MealsScreen';
import SugarScreen from '../screens/SugarScreen';
import InsightsScreen from '../screens/InsightsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const activeColor = isDark ? '#818CF8' : '#4F46E5'; // Indigo-400 : Indigo-600

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: isDark ? '#94a3b8' : '#64748b', // Slate-400 : Slate-500
                tabBarStyle: {
                    backgroundColor: isDark ? '#020617' : '#ffffff', // Slate-950 : White
                    borderTopColor: isDark ? '#1e293b' : '#f1f5f9',
                },
                tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';

                    // Mapping Web App Icons (Lucide) to Mobile (Ionicons)
                    // Web: Home -> Mobile: Today
                    if (route.name === 'Today') {
                        iconName = focused ? 'home' : 'home-outline';
                    }
                    // Web: Foundations -> Mobile: Activity
                    else if (route.name === 'Activity') {
                        iconName = focused ? 'clipboard' : 'clipboard-outline';
                    }
                    // Web: Meals -> Mobile: Meals
                    else if (route.name === 'Meals') {
                        iconName = focused ? 'restaurant' : 'restaurant-outline';
                    }
                    // Web: Sugar (Shield) -> Mobile: Sugar
                    else if (route.name === 'Sugar') {
                        iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
                    }
                    // Web: Stats -> Mobile: Insights
                    else if (route.name === 'Insights') {
                        iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                    }
                    // Web: None -> Mobile: Profile
                    else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Today" component={TodayScreen} />
            <Tab.Screen name="Activity" component={ActivityScreen} />
            <Tab.Screen name="Meals" component={MealsScreen} />
            <Tab.Screen name="Sugar" component={SugarScreen} />
            <Tab.Screen name="Insights" component={InsightsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
