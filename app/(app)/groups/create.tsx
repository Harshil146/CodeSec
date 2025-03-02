import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppContext } from '../../../store/AppContext';

const EMOJI_LIST = ['🏖️', '🏠', '🍴', '💼', '🎮', '🎓', '🏋️', '🎨', '🎭', '🎪'];

export default function CreateGroup() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, createGroup, addGroupMember, refreshGroups, profile } = useAppContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_LIST[0]);
  const [members, setMembers] = useState<{ email: string }[]>([]);

  const handleAddMember = () => {
    setMembers([...members, { email: '' }]);
  };

  const handleRemoveMember = (index: number) => {
    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index].email = value;
    setMembers(newMembers);
  };

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a group');
      return;
    }

    // Validate member emails and filter out the creator's email to avoid duplicates
    const validMembers = members
      .filter(m => m.email.trim() && m.email.includes('@') && m.email !== profile?.email)
      .filter((m, index, self) => 
        // Remove duplicate email entries
        index === self.findIndex((t) => t.email === m.email)
      );

    if (members.length > 0 && validMembers.length < members.length) {
      Alert.alert('Warning', 'Some member emails were invalid or duplicates and will be ignored');
    }

    try {
      const newGroup = {
        name: name.trim(),
        description: description.trim(),
        icon: selectedEmoji,
        total_expense: 0,
        total_credits: 0,
        balance: 0,
        member_count: validMembers.length + 1,
        created_by: user.id
      };

      const createdGroup = await createGroup(newGroup);
      
      // Add members after group creation
      let failedMembers = [];
      for (const member of validMembers) {
        try {
          await addGroupMember(createdGroup.id, member.email);
        } catch (error) {
          console.error('Error adding member:', member.email, error);
          failedMembers.push({ email: member.email, error: String(error) });
          // Continue with other members even if one fails
        }
      }

      // Check if any members failed to be added
      if (failedMembers.length > 0) {
        // Group was created but some members couldn't be added
        Alert.alert(
          'Group Created with Warnings',
          `Group created, but could not add some members: ${failedMembers.map(m => m.email).join(', ')}`,
          [
            {
              text: 'OK',
              onPress: () => {
                refreshGroups(); // Refresh the groups list
                router.replace('/groups');
              },
            },
          ]
        );
      } else {
        Alert.alert('Success', 'Group created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              refreshGroups(); // Refresh the groups list
              router.replace('/groups');
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? 'white' : 'black',
      marginBottom: 20,
    },
    label: {
      color: isDark ? '#aaa' : '#666',
      fontSize: 14,
      marginBottom: 5,
      marginLeft: 5,
    },
    input: {
      backgroundColor: isDark ? '#2a2a2a' : 'white',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      color: isDark ? 'white' : 'black',
      fontSize: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    descriptionInput: {
      height: 100,
      textAlignVertical: 'top',
    },
    createButton: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
      marginTop: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    createButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
    emojiContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 15,
    },
    emojiButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    emojiText: {
      fontSize: 24,
    },
    memberSection: {
      marginBottom: 20,
    },
    memberContainer: {
      backgroundColor: isDark ? '#2a2a2a' : 'white',
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    memberHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    memberTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? 'white' : 'black',
    },
    removeButton: {
      padding: 5,
    },
    addMemberButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 12,
      backgroundColor: isDark ? '#2a2a2a' : 'white',
      marginBottom: 20,
    },
    addMemberText: {
      color: '#007AFF',
      fontSize: 16,
      marginLeft: 8,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create New Group</Text>

        <Text style={styles.label}>Group Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter group name"
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Enter group description"
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Group Icon</Text>
        <View style={styles.emojiContainer}>
          {EMOJI_LIST.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.emojiButton,
                {
                  borderColor: selectedEmoji === emoji ? '#007AFF' : 'transparent',
                  backgroundColor: isDark ? '#333' : '#f0f0f0',
                },
              ]}
              onPress={() => setSelectedEmoji(emoji)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.memberSection}>
          <Text style={[styles.label, { marginBottom: 10 }]}>Members</Text>
          {members.map((member, index) => (
            <View key={index} style={styles.memberContainer}>
              <View style={styles.memberHeader}>
                <Text style={styles.memberTitle}>Member {index + 1}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveMember(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={member.email}
                onChangeText={(value) => handleMemberChange(index, value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          ))}
          <TouchableOpacity style={styles.addMemberButton} onPress={handleAddMember}>
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.addMemberText}>Add Member</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
          <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
} 