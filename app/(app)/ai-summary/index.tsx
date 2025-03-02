import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAppContext } from '../../../store/AppContext';
import type { Transaction } from '../../../store/AppContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

type MonthlyTransactions = {
  [key: string]: Transaction[];
};

export default function AISummary() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { transactions, groups } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');

  const generateSummary = async () => {
    setLoading(true);
    try {
      // Prepare data for AI analysis
      const individualData = {
        transactions: transactions.map(t => ({
          name: t.name,
          amount: t.amount,
          type: t.type,
          date: new Date(t.date).toISOString().split('T')[0],
        })),
        totalExpense: transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
        totalCredit: transactions
          .filter(t => t.type === 'credit')
          .reduce((sum, t) => sum + t.amount, 0),
      };

      // Group transactions by month
      const monthlyTransactions = transactions.reduce<MonthlyTransactions>((acc, t) => {
        const month = new Date(t.date).toISOString().split('T')[0].substring(0, 7);
        if (!acc[month]) acc[month] = [];
        acc[month].push(t);
        return acc;
      }, {});

      // Calculate monthly trends
      const monthlyTotals = Object.entries(monthlyTransactions).map(([month, txns]) => ({
        month,
        expense: txns
          .filter((t: Transaction) => t.type === 'expense')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
        credit: txns
          .filter((t: Transaction) => t.type === 'credit')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
      }));

      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      // Prepare prompt for AI analysis
      const prompt = `
        As a financial advisor, please analyze this financial data and provide detailed insights:
        
        Individual Finance Summary:
        - Total Expenses: ₹${individualData.totalExpense}
        - Total Credits: ₹${individualData.totalCredit}
        - Net Balance: ₹${individualData.totalCredit - individualData.totalExpense}
        
        Monthly Trends:
        ${monthlyTotals.map(m => 
          `${m.month}: Expense ₹${m.expense}, Credit ₹${m.credit}, Balance ₹${m.credit - m.expense}`
        ).join('\n')}
        
        Recent Transactions:
        ${individualData.transactions.slice(0, 10).map(t => 
          `- ${t.name}: ₹${t.amount} (${t.type})`
        ).join('\n')}
        
        Please provide a detailed analysis including:
        1. What is my total expense and credit.
        2. Where I have spent the most and the least.
        3. What Can I do to save more money.
        Format the response with clear sections and bullet points for better readability.
      `;

      // Get AI response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();

      setSummary(aiResponse);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Failed to generate AI analysis. Please try again later.');
    } finally {
      setLoading(false);
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
    header: {
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? 'white' : 'black',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#aaa' : '#666',
      marginBottom: 20,
    },
    generateButton: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
      marginBottom: 20,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    summaryText: {
      fontSize: 16,
      color: isDark ? '#ddd' : '#333',
      lineHeight: 24,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? 'white' : 'black',
      marginBottom: 10,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Financial Analysis</Text>
          <Text style={styles.subtitle}>
            Get AI-powered insights about your spending patterns and recommendations
            for better financial management.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateSummary}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Analyzing...' : 'Generate Analysis'}
          </Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#007AFF" />}

        {summary && (
          <View style={styles.section}>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
} 