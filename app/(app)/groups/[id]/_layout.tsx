import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function GroupLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#2a2a2a' : 'white',
        },
        headerTintColor: isDark ? 'white' : 'black',
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Group Details',
        }}
      />
    </Stack>
  );
} 