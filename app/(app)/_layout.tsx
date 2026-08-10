// app/(app)/_layout.tsx
import { Tabs } from 'expo-router'
import { View, StyleSheet, Platform } from 'react-native'
import { Home, ArrowUpRight, ArrowDownLeft, Clock, User } from 'lucide-react-native'
import { colors, layout, radii, shadows } from '@/theme/tokens'

interface TabIconProps {
  icon:    React.ReactNode
  focused: boolean
}

function TabIcon({ icon, focused }: TabIconProps) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {icon}
    </View>
  )
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor:   colors.teal,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              icon={<Home size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="enviar/index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              icon={<ArrowUpRight size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="recibir"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              icon={<ArrowDownLeft size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              icon={<Clock size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              icon={<User size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />}
            />
          ),
        }}
      />

      {/* Ocultar pantallas del flujo de envío del tab bar */}
      <Tabs.Screen name="enviar/monto"    options={{ href: null }} />
      <Tabs.Screen name="enviar/confirmar" options={{ href: null }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.ink2,
    borderTopWidth:  1,
    borderTopColor:  colors.borderSubtle,
    height:          layout.tabBarHeight + (Platform.OS === 'ios' ? 20 : 0),
    paddingBottom:   Platform.OS === 'ios' ? 20 : 8,
    paddingTop:      8,
    ...shadows.md,
  },
  tabIcon: {
    width:          40,
    height:         40,
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   radii.md,
  },
  tabIconFocused: {
    backgroundColor: colors.tealLight,
  },
})