import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@repo/ui';

import TodayScreen from '../screens/TodayScreen';
import ActivityScreen from '../screens/ActivityScreen';
import MealsScreen from '../screens/MealsScreen';
import SugarScreen from '../screens/SugarScreen';
import InsightsScreen from '../screens/InsightsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.tabBar,
                    borderTopColor: theme.colors.border,
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
