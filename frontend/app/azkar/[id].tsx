import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../src/constants/colors';
import { apiService } from '../../src/services/api';
import { Azkar } from '../../src/types';
import { Counter } from '../../src/components/Common';
import { useApp } from '../../src/contexts/AppContext';

const { width } = Dimensions.get('window');

export default function AzkarDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { refreshStats } = useApp();
  const [azkar, setAzkar] = useState<Azkar | null>(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadAzkar();
  }, [id]);

  const loadAzkar = async () => {
    try {
      const data = await apiService.getAzkarDetail(Number(id));
      setAzkar(data);
    } catch (error) {
      console.error('Error loading azkar:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!azkar || !azkar.id) return;
    try {
      const result = await apiService.toggleFavorite(azkar.id);
      setAzkar({ ...azkar, is_favorite: result.is_favorite });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleIncrement = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newCount = count + 1;
    setCount(newCount);

    if (azkar && newCount === azkar.repeat_count) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Save progress
      await apiService.recordTasbeeh({
        method: 'touch',
        count: newCount,
        zikr_id: azkar.id,
      });
      await refreshStats();
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  if (loading || !azkar) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الذكر</Text>
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Ionicons
            name={azkar.is_favorite ? 'heart' : 'heart-outline'}
            size={24}
            color={azkar.is_favorite ? COLORS.error : COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Arabic Text */}
        <View style={styles.textCard}>
          <Text style={styles.arabicText}>{azkar.arabic_text}</Text>
        </View>

        {/* Counter */}
        <View style={styles.counterSection}>
          <Counter
            count={count}
            target={azkar.repeat_count}
            onIncrement={handleIncrement}
            onReset={handleReset}
            size="medium"
          />
        </View>

        {/* Virtue */}
        {azkar.virtue_ar && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="star" size={24} color={COLORS.primary} />
              <Text style={styles.infoTitle}>الفضل</Text>
            </View>
            <Text style={styles.infoText}>{azkar.virtue_ar}</Text>
          </View>
        )}

        {/* Reference */}
        {azkar.reference_ar && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="book" size={24} color={COLORS.primary} />
              <Text style={styles.infoTitle}>المرجع</Text>
            </View>
            <Text style={styles.infoText}>{azkar.reference_ar}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  content: {
    padding: 20,
  },
  textCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 40,
    color: COLORS.text,
    textAlign: 'right',
  },
  counterSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 28,
    color: COLORS.text,
    textAlign: 'right',
  },
});