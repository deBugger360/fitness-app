// Profile removed from tabs, accessible via App Stack
import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@repo/ui';

import TodayScreen from '../screens/TodayScreen';
import ActivityScreen from '../screens/ActivityScreen';
import MealsScreen from '../screens/MealsScreen';
import SugarScreen from '../screens/SugarScreen';
import InsightsScreen from '../screens/InsightsScreen';

const Tab = createBottomTabNavigator();

// Tab config — label, icon pair, matches web nav labels
const TAB_CONFIG: Record<string, { icon: string; iconFocused: string; label: string }> = {
    Today: { icon: 'home-outline', iconFocused: 'home', label: 'Today' },
    Activity: { icon: 'clipboard-outline', iconFocused: 'clipboard', label: 'Foundations' },
    Meals: { icon: 'restaurant-outline', iconFocused: 'restaurant', label: 'Meals' },
    Sugar: { icon: 'shield-checkmark-outline', iconFocused: 'shield-checkmark', label: 'Sugar' },
    Insights: { icon: 'bar-chart-outline', iconFocused: 'bar-chart', label: 'Insights' },
};

export default function TabNavigator() {
    const { theme, isDark } = useTheme();

    // Web: bg-white/80 dark:bg-slate-900/80 backdrop-blur border-t border-slate-200 dark:border-slate-800
    const tabBarBg = isDark
        ? 'rgba(15, 23, 42, 0.92)'   // slate-950 / 92%
        : 'rgba(255, 255, 255, 0.92)'; // white / 92%

    const tabBarBorder = isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(15, 23, 42, 0.08)';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => {
                const cfg = TAB_CONFIG[route.name] || { icon: 'ellipse-outline', iconFocused: 'ellipse', label: route.name };
                return {
                    headerShown: false,
                    tabBarLabel: cfg.label,
                    tabBarActiveTintColor: theme.colors.primary,
                    tabBarInactiveTintColor: theme.colors.textSecondary,
                    tabBarStyle: {
                        // Glass tab bar — matches web's bottom nav
                        backgroundColor: tabBarBg,
                        borderTopColor: tabBarBorder,
                        borderTopWidth: 1,
                        // Extra height for modern padding
                        height: Platform.OS === 'ios' ? 88 : 64,
                        paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                        paddingTop: 8,
                        // Shadow above tab bar (web has box-shadow going upward)
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: isDark ? 0.4 : 0.06,
                        shadowRadius: 16,
                        elevation: 12,
                    },
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '600',
                        letterSpacing: 0.3,
                        marginTop: 2,
                    },
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={(focused ? cfg.iconFocused : cfg.icon) as any}
                            size={focused ? 24 : 22}
                            color={color}
                        />
                    ),
                };
            }}
        >
            <Tab.Screen name="Today" component={TodayScreen} />
            <Tab.Screen name="Activity" component={ActivityScreen} />
            <Tab.Screen name="Meals" component={MealsScreen} />
            <Tab.Screen name="Sugar" component={SugarScreen} />
            <Tab.Screen name="Insights" component={InsightsScreen} />
        </Tab.Navigator>
    );
}
