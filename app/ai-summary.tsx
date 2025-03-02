import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Alert,
  TextInput,
} from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAppContext } from '../store/AppContext';
import { router } from 'expo-router';

type FinancialSummary = {
  totalExpenses: number;
  topCategories: { category: string; amount: number }[];
  monthlyTrend: string;
  suggestions: string[];
  loading: boolean;
};

export default function AISummary() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { transactions, getTransactionStats } = useAppContext();

  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalExpenses: 0,
    topCategories: [],
    monthlyTrend: '',
    suggestions: [],
    loading: false,
  });

  useEffect(() => {
    if (transactions.length > 0) {
      // Pre-calculate some statistics for display before AI summary
      const { totalExpenses } = getTransactionStats();
      
      // Create a map of categories and their total amounts
      const categoryMap = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const category = t.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);
      
      // Convert to sorted array
      const topCategories = Object.entries(categoryMap)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      
      setSummary(prev => ({
        ...prev,
        totalExpenses,
        topCategories,
      }));
    }
  }, [transactions, getTransactionStats]);

  const generateAISummary = async () => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    if (transactions.length === 0) {
      Alert.alert('No Transactions', 'Please add some transactions first to generate a summary.');
      return;
    }

    setSummary(prev => ({ ...prev, loading: true }));

    try {
      // Initialize Google Generative AI with your API key
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Prepare transactions data for the prompt
      const transactionsData = transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        name: t.name,
        category: t.category || 'Uncategorized',
        date: new Date(t.date).toISOString().split('T')[0],
        type: t.type,
      }));

      // Calculate monthly spending for trend analysis
      const monthlySpending = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const date = new Date(t.date);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
          acc[monthYear] = (acc[monthYear] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      // Prepare the prompt with transaction data
      const prompt = `
        Analyze this financial data and provide insights:
        
        Transactions: ${JSON.stringify(transactionsData, null, 2)}
        
        Monthly Spending: ${JSON.stringify(monthlySpending, null, 2)}
        
        Please provide:
        1. List of top spending categories (format: "Category: ₹Amount")
        2. Monthly spending trend analysis in 1-2 sentences
        3. Three personalized suggestions for better financial management based on spending patterns
        
        Format your response as JSON with the following structure:
        {
          "topCategories": [{"category": "string", "amount": number}],
          "monthlyTrend": "string",
          "suggestions": ["string", "string", "string"]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          
          setSummary({
            totalExpenses: summary.totalExpenses,
            topCategories: parsedData.topCategories || summary.topCategories,
            monthlyTrend: parsedData.monthlyTrend || 'No trend data available.',
            suggestions: parsedData.suggestions || ['No suggestions available.'],
            loading: false,
          });
        } else {
          throw new Error('Could not parse AI response as JSON');
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback to displaying raw text if JSON parsing fails
        setSummary({
          totalExpenses: summary.totalExpenses,
          topCategories: summary.topCategories,
          monthlyTrend: 'AI analysis completed, but could not format the response.',
          suggestions: [text.substring(0, 500) + '...'],
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      Alert.alert(
        'Error', 
        'Failed to generate AI summary. Please check your API key and internet connection.'
      );
      setSummary(prev => ({ ...prev, loading: false }));
    }
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
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? 'white' : 'black',
      marginBottom: 15,
    },
    categoryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    categoryText: {
      fontSize: 16,
      color: isDark ? '#aaa' : '#666',
    },
    categoryAmount: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#00C851' : '#00994D',
    },
    trendText: {
      fontSize: 16,
      color: isDark ? '#aaa' : '#666',
      lineHeight: 24,
    },
    suggestionItem: {
      backgroundColor: isDark ? '#333' : '#f0f0f0',
      borderRadius: 8,
      padding: 15,
      marginBottom: 10,
    },
    suggestionText: {
      fontSize: 16,
      color: isDark ? 'white' : 'black',
    },
    generateButton: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
    },
    generateButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    backButton: {
      backgroundColor: isDark ? '#333' : '#e0e0e0',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    backButtonText: {
      color: isDark ? 'white' : 'black',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    apiKeyContainer: {
      backgroundColor: isDark ? '#2a2a2a' : 'white',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    },
    apiKeyInput: {
      backgroundColor: isDark ? '#333' : '#f0f0f0',
      borderRadius: 8,
      padding: 12,
      color: isDark ? 'white' : 'black',
      marginBottom: 15,
    },
    apiKeyText: {
      fontSize: 14,
      color: isDark ? '#aaa' : '#666',
      marginBottom: 10,
    },
    saveButton: {
      backgroundColor: '#007AFF',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    saveButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    noTransactions: {
      textAlign: 'center',
      color: isDark ? '#aaa' : '#666',
      marginTop: 20,
      fontSize: 16,
    },
  });

  if (summary.loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: isDark ? 'white' : 'black', marginTop: 20 }}>
          Generating AI Summary...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Back to Dashboard
          </Text>
        </TouchableOpacity>

        {showApiKeyInput ? (
          <View style={styles.apiKeyContainer}>
            <Text style={styles.sectionTitle}>Enter Gemini API Key</Text>
            <Text style={styles.apiKeyText}>
              Get your API key from Google AI Studio at https://makersuite.google.com/app/apikey
            </Text>
            <TextInput
              style={styles.apiKeyInput}
              placeholder="Enter your Gemini API Key"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                if (apiKey) {
                  setShowApiKeyInput(false);
                  generateAISummary();
                } else {
                  Alert.alert('Error', 'Please enter an API key');
                }
              }}
            >
              <Text style={styles.saveButtonText}>Save & Generate Summary</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateAISummary}
          >
            <Text style={styles.generateButtonText}>
              Generate AI Summary
            </Text>
          </TouchableOpacity>
        )}

        {transactions.length === 0 ? (
          <Text style={styles.noTransactions}>
            Add some transactions first to get an AI-powered financial summary.
          </Text>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Spending Categories</Text>
              {summary.topCategories.length > 0 ? (
                summary.topCategories.map((category, index) => (
                  <View key={index} style={styles.categoryItem}>
                    <Text style={styles.categoryText}>{category.category}</Text>
                    <Text style={styles.categoryAmount}>
                      ₹{category.amount.toFixed(2)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.categoryText}>No category data available.</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Monthly Trend</Text>
              <Text style={styles.trendText}>{summary.monthlyTrend}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Suggestions</Text>
              {summary.suggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
} 