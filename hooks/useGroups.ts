import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Group } from '../lib/supabase';

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<(Group & { role: 'admin' | 'member' })[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshGroups = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get all groups where user is a member
      const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select(`
          role,
          group:groups (*)
        `)
        .eq('user_id', user.id);

      if (membershipError) throw membershipError;

      // Transform the data to match our expected format
      const userGroups = memberships?.map(membership => ({
        ...membership.group,
        role: membership.role as 'admin' | 'member',
      })) || [];

      setGroups(userGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createGroup = useCallback(async (groupData: Partial<Group>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // First create the group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert([{
          ...groupData,
          created_by: user.id,
        }])
        .select()
        .single();

      if (groupError) throw groupError;

      // Then add the creator as an admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: group.id,
          user_id: user.id,
          role: 'admin',
        }]);

      if (memberError) throw memberError;

      // Add the new group to state
      setGroups(prev => [...prev, { ...group, role: 'admin' }]);
      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }, [user]);

  const deleteGroup = useCallback(async (groupId: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)
      .eq('created_by', user.id);

    if (error) throw error;

    setGroups(prev => prev.filter(g => g.id !== groupId));
  }, [user]);

  const updateGroup = useCallback(async (groupId: string, updates: Partial<Group>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .eq('created_by', user.id)
      .select()
      .single();

    if (error) throw error;

    setGroups(prev => prev.map(g => g.id === groupId ? { ...data, role: g.role } : g));
    return data;
  }, [user]);

  const addGroupMember = useCallback(async (groupId: string, memberEmail: string, role: 'admin' | 'member' = 'member') => {
    if (!user) throw new Error('User not authenticated');

    // First get the user ID from the email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', memberEmail)
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error('User not found');

    // Then add them to the group
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([{
        group_id: groupId,
        user_id: userData.id,
        role,
      }]);

    if (memberError) throw memberError;
  }, [user]);

  const removeGroupMember = useCallback(async (groupId: string, userId: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
  }, [user]);

  return {
    groups,
    loading,
    createGroup,
    deleteGroup,
    updateGroup,
    addGroupMember,
    removeGroupMember,
    refreshGroups,
  };
} 