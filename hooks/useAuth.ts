import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import type { User } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Navigate to app on successful sign in
    if (data.session) {
      router.replace('/(app)');
    }
    
    return data;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      // First, sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('User creation failed');

      // Then, create their profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (profileError) {
        // If profile creation fails, attempt to delete the auth user to maintain consistency
        await supabase.auth.admin.deleteUser(data.user.id);
        throw profileError;
      }

      return data;
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Navigate to auth on sign out
    router.replace('/(auth)/login');
  }, []);

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
} 