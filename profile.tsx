import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

type UserProfile = {
  name: string;
  email: string;
  currency: string;
  profileImage: string | null;
};

export default function Profile() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    currency: 'USD',
    profileImage: null,
  });

  const [isEditing, setIsEditing] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfile(prev => ({
        ...prev,
        profileImage: result.assets[0].uri,
      }));
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    },
    header: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: isDark ? '#2a2a2a' : 'white',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333' : '#eee',
    },
    profileImageContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDark ? '#333' : '#eee',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      overflow: 'hidden',
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    cameraIcon: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: isDark ? '#444' : '#ddd',
      padding: 8,
      borderRadius: 20,
    },
    form: {
      padding: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      color: isDark ? '#aaa' : '#666',
      marginBottom: 8,
    },
    input: {
      backgroundColor: isDark ? '#333' : 'white',
      padding: 12,
      borderRadius: 8,
      color: isDark ? 'white' : 'black',
      fontSize: 16,
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    displayText: {
      fontSize: 16,
      color: isDark ? 'white' : 'black',
      padding: 12,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
          {profile.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person" size={60} color={isDark ? '#666' : '#999'} />
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color={isDark ? 'white' : 'black'} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
              placeholder="Enter your name"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />
          ) : (
            <Text style={styles.displayText}>{profile.name}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.email}
              onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? '#666' : '#999'}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.displayText}>{profile.email}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preferred Currency</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.currency}
              onChangeText={(text) => setProfile(prev => ({ ...prev, currency: text }))}
              placeholder="Enter preferred currency (e.g., USD)"
              placeholderTextColor={isDark ? '#666' : '#999'}
              autoCapitalize="characters"
            />
          ) : (
            <Text style={styles.displayText}>{profile.currency}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.buttonText}>
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 