import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const teamMembers = [
  {
    name: 'John Doe',
    role: 'Lead Developer',
    github: 'https://github.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
  },
  {
    name: 'Jane Smith',
    role: 'UI/UX Designer',
    github: 'https://github.com/janesmith',
    linkedin: 'https://linkedin.com/in/janesmith',
  },
  {
    name: 'Mike Johnson',
    role: 'Backend Developer',
    github: 'https://github.com/mikejohnson',
    linkedin: 'https://linkedin.com/in/mikejohnson',
  },
];

export default function About() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    },
    content: {
      padding: 20,
    },
    section: {
      backgroundColor: isDark ? '#2a2a2a' : 'white',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    },
    appTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? 'white' : 'black',
      textAlign: 'center',
      marginBottom: 10,
    },
    appVersion: {
      fontSize: 16,
      color: isDark ? '#aaa' : '#666',
      textAlign: 'center',
      marginBottom: 20,
    },
    description: {
      fontSize: 16,
      color: isDark ? '#aaa' : '#666',
      lineHeight: 24,
      textAlign: 'center',
      marginBottom: 20,
    },
    featuresTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? 'white' : 'black',
      marginBottom: 15,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    featureText: {
      fontSize: 16,
      color: isDark ? '#aaa' : '#666',
      marginLeft: 10,
    },
    teamTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? 'white' : 'black',
      marginBottom: 15,
    },
    teamMember: {
      marginBottom: 20,
    },
    memberName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? 'white' : 'black',
      marginBottom: 5,
    },
    memberRole: {
      fontSize: 14,
      color: isDark ? '#aaa' : '#666',
      marginBottom: 10,
    },
    socialLinks: {
      flexDirection: 'row',
      gap: 10,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#333' : '#eee',
      padding: 8,
      borderRadius: 8,
    },
    socialButtonText: {
      color: isDark ? 'white' : 'black',
      marginLeft: 5,
    },
    contactSection: {
      alignItems: 'center',
    },
    contactButton: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    contactButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.appTitle}>Phainance</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.description}>
            A comprehensive finance management app that helps you track personal and group
            expenses, analyze spending patterns, and make better financial decisions with
            AI-powered insights.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.featuresTitle}>Key Features</Text>
          <View style={styles.featureItem}>
            <Ionicons
              name="wallet-outline"
              size={24}
              color={isDark ? '#aaa' : '#666'}
            />
            <Text style={styles.featureText}>
              Personal Expense Tracking
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons
              name="people-outline"
              size={24}
              color={isDark ? '#aaa' : '#666'}
            />
            <Text style={styles.featureText}>
              Group Expense Management
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons
              name="analytics-outline"
              size={24}
              color={isDark ? '#aaa' : '#666'}
            />
            <Text style={styles.featureText}>
              AI-Powered Financial Insights
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons
              name="sync-outline"
              size={24}
              color={isDark ? '#aaa' : '#666'}
            />
            <Text style={styles.featureText}>
              Automatic Expense Settlement
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.teamTitle}>Our Team</Text>
          {teamMembers.map((member, index) => (
            <View key={index} style={styles.teamMember}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
              <View style={styles.socialLinks}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => openLink(member.github)}
                >
                  <Ionicons
                    name="logo-github"
                    size={20}
                    color={isDark ? 'white' : 'black'}
                  />
                  <Text style={styles.socialButtonText}>GitHub</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => openLink(member.linkedin)}
                >
                  <Ionicons
                    name="logo-linkedin"
                    size={20}
                    color={isDark ? 'white' : 'black'}
                  />
                  <Text style={styles.socialButtonText}>LinkedIn</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, styles.contactSection]}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => openLink('mailto:support@phainance.app')}
          >
            <Ionicons name="mail-outline" size={24} color="white" />
            <Text style={styles.contactButtonText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
} 