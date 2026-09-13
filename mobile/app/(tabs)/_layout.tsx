import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '../../lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon(name: IconName, focused: boolean) {
  return <Ionicons name={name} size={22} color={focused ? colors.primary : colors.textFaint} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { borderTopColor: colors.border, height: 58, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ focused }) => TabIcon(focused ? 'home' : 'home-outline', focused) }}
      />
      <Tabs.Screen
        name="items"
        options={{ title: 'Items', tabBarIcon: ({ focused }) => TabIcon(focused ? 'grid' : 'grid-outline', focused) }}
      />
      <Tabs.Screen
        name="reports"
        options={{ title: 'Reports', tabBarIcon: ({ focused }) => TabIcon(focused ? 'bar-chart' : 'bar-chart-outline', focused) }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: 'More', tabBarIcon: ({ focused }) => TabIcon(focused ? 'menu' : 'menu-outline', focused) }}
      />
    </Tabs>
  );
}
