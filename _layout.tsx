import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { AppProvider } from '../store/AppContext';
import { LogBox } from 'react-native';

// Disable all error and warning logs
LogBox.ignoreAllLogs();
LogBox.ignoreLogs(['Warning:']);

// Override console.error to suppress error messages
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress all error messages
  return;
};

// Root layout wraps the entire app
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? '#2a2a2a' : 'white',
          },
          headerTintColor: isDark ? 'white' : 'black',
        }}
      />
    </AppProvider>
  );
}
