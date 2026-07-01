import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';
import { globalStyles } from '../../constants/globalStyles';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.authCardBg,
          borderTopWidth: 0,
          elevation: 0,
          height: 80,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          position: 'absolute', // To make the rounded corners look good against white background
        },
        tabBarActiveTintColor: colors.buttonDark,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name="stethoscope" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="check"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={globalStyles.tabCenterButton}>
              <MaterialCommunityIcons name="brain" size={30} color={colors.surface} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? "file-clock" : "file-clock-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={26} color={color} />
          ),
        }}
      />
      
    </Tabs>
  );
}
