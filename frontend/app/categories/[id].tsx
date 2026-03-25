import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/colors';
import { apiService } from '../../src/services/api';
import { Azkar } from '../../src/types';

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [azkar, setAzkar] = useState<Azkar[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    loadAzkar();
  }, [id]);

  const loadAzkar = async () => {
    try {
      const data = await apiService.getAzkarByCategory(Number(id));
      setAzkar(data);
      
      // Get category name
      const categories = await apiService.getCategories();
      const category = categories.find((c) => c.id === Number(id));
      if (category) {
        setCategoryName(category.name_ar);
      }
    } catch (error) {
      console.error('Error loading azkar:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAzkar();
    setRefreshing(false);
  };

  const toggleFavorite = async (azkarId: number) => {
    try {
      const result = await apiService.toggleFavorite(azkarId);
      // Update local state
      setAzkar((prev) =>
        prev.map((item) =>
          item.id === azkarId
            ? { ...item, is_favorite: result.is_favorite }
            : item
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderAzkar = ({ item }: { item: Azkar }) => (
    <TouchableOpacity
      style={styles.azkarCard}
      onPress={() => router.push(`/azkar/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.azkarHeader}>
        <View style={styles.repeatBadge}>
          <Text style={styles.repeatText}>×{item.repeat_count}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id!)}
        >
          <Ionicons
            name={item.is_favorite ? 'heart' : 'heart-outline'}
            size={24}
            color={item.is_favorite ? COLORS.error : COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.arabicText} numberOfLines={3}>
        {item.arabic_text}
      </Text>

      {item.virtue_ar && (
        <View style={styles.virtueContainer}>
          <Ionicons name="star" size={16} color={COLORS.primary} />
          <Text style={styles.virtueText} numberOfLines={2}>
            {item.virtue_ar}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.reference}>{item.reference_ar || 'مصدر موثوق'}</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
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
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* List */}
      <FlatList
        data={azkar}
        renderItem={renderAzkar}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>لا توجد أذكار في هذا التصنيف</Text>
          </View>
        }
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: 20,
  },
  azkarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  azkarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  repeatBadge: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  repeatText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicText: {
    fontSize: 20,
    lineHeight: 36,
    color: COLORS.text,
    textAlign: 'right',
    marginBottom: 12,
  },
  virtueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  virtueText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reference: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
});
