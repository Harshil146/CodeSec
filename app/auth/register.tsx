import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

export default function Register() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    upiId: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const { username, email, password, confirmPassword, upiId } = formData;

    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password, username, upiId);
      Alert.alert('Success', 'Registration successful! You can now log in.');
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Error', error.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    },
    content: {
      padding: 20,
      justifyContent: 'center',
      minHeight: '100%',
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
    loginLink: {
      marginTop: 20,
      alignItems: 'center',
    },
    loginText: {
      color: isDark ? '#aaa' : '#666',
      fontSize: 14,
    },
    loginLinkText: {
      color: '#007AFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 5,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
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
          placeholder="Username"
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={formData.username}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, username: text }))
          }
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={formData.email}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, email: text }))
          }
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={formData.password}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, password: text }))
          }
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={formData.confirmPassword}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, confirmPassword: text }))
          }
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="UPI ID"
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={formData.upiId}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, upiId: text }))
          }
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, isLoading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Registering...' : 'Register'}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginLink}>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginText}>
                Already have an account?
                <Text style={styles.loginLinkText}> Login</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
} 