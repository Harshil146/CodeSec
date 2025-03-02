import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useColorScheme, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../store/AppContext';

type DrawerIconProps = {
  color: string;
  size: number;
};

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { signOut } = useAppContext();

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
        },
        headerTintColor: isDark ? 'white' : 'black',
        drawerStyle: {
          backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
        },
        drawerActiveTintColor: '#007AFF',
        drawerInactiveTintColor: isDark ? '#aaa' : '#666',
      }}
      drawerContent={(props) => (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            {props.state.routes.map((route, index) => {
              const isFocused = props.state.index === index;
              const icon = {
                index: 'home-outline',
                'groups/index': 'people-outline',
                'analytics/index': 'analytics-outline',
                'edit-profile/index': 'person-circle-outline',
                about: 'information-circle-outline',
              }[route.name];

              return (
                <TouchableOpacity
                  key={route.key}
                  style={[
                    styles.drawerItem,
                    isFocused && { backgroundColor: isDark ? '#333' : '#f0f0f0' },
                  ]}
                  onPress={() => props.navigation.navigate(route.name)}
                >
                  <Ionicons
                    name={icon as any}
                    size={24}
                    color={isFocused ? '#007AFF' : isDark ? '#aaa' : '#666'}
                  />
                  <Text
                    style={[
                      styles.drawerLabel,
                      {
                        color: isFocused ? '#007AFF' : isDark ? '#aaa' : '#666',
                      },
                    ]}
                  >
                    {route.name === 'index'
                      ? 'Dashboard'
                      : route.name === 'groups/index'
                      ? 'Groups'
                      : route.name === 'analytics/index'
                      ? 'Analytics'
                      : route.name === 'edit-profile/index'
                      ? 'Edit Profile'
                      : route.name.charAt(0).toUpperCase() + route.name.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={[
              styles.drawerItem,
              styles.logoutButton,
              { backgroundColor: isDark ? '#333' : '#f0f0f0' },
            ]}
            onPress={signOut}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color={isDark ? '#ff4444' : '#ff0000'}
            />
            <Text
              style={[
                styles.drawerLabel,
                { color: isDark ? '#ff4444' : '#ff0000' },
              ]}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      )}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color, size }: DrawerIconProps) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="groups/index"
        options={{
          title: 'Groups',
          drawerIcon: ({ color, size }: DrawerIconProps) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="analytics/index"
        options={{
          title: 'Analytics',
          drawerIcon: ({ color, size }: DrawerIconProps) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="edit-profile/index"
        options={{
          title: 'Edit Profile',
          drawerIcon: ({ color, size }: DrawerIconProps) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="about"
        options={{
          title: 'About Us',
          drawerIcon: ({ color, size }: DrawerIconProps) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  drawerLabel: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    marginBottom: 16,
  },
}); 