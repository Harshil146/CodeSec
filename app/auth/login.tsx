import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
      padding: 20,
      justifyContent: 'center',
    },
    logo: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logoText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: isDark ? 'white' : 'black',
    },
    input: {
      backgroundColor: isDark ? '#333' : 'white',
      padding: 15,
      borderRadius: 8,
      marginBottom: 15,
      color: isDark ? 'white' : 'black',
      fontSize: 16,
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    registerLink: {
      marginTop: 20,
      alignItems: 'center',
    },
    registerText: {
      color: isDark ? '#aaa' : '#666',
      fontSize: 14,
    },
    registerLinkText: {
      color: '#007AFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 5,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons
          name="wallet-outline"
          size={60}
          color={isDark ? 'white' : 'black'}
        />
        <Text style={styles.logoText}>Phainance</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={isDark ? '#666' : '#999'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={isDark ? '#666' : '#999'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, isLoading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <View style={styles.registerLink}>
        <Link href="/auth/register" asChild>
          <TouchableOpacity>
            <Text style={styles.registerText}>
              Don't have an account?
              <Text style={styles.registerLinkText}> Register</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
} 