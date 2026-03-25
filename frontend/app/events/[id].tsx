import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/colors';
import { apiService } from '../../src/services/api';
import { IslamicEvent, Azkar } from '../../src/types';

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<IslamicEvent | null>(null);
  const [azkar, setAzkar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const data = await apiService.getEventDetails(Number(id));
      setEvent(data);
      setAzkar(data.azkar || []);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAzkar = ({ item }: { item: any }) => (
    <View style={styles.azkarCard}>
      <View style={styles.repeatBadge}>
        <Text style={styles.repeatText}>×{item.repeat_count}</Text>
      </View>
      <Text style={styles.arabicText}>{item.arabic_text}</Text>
      {item.virtue_ar && (
        <View style={styles.virtueContainer}>
          <Ionicons name="star" size={16} color={COLORS.primary} />
          <Text style={styles.virtueText}>{item.virtue_ar}</Text>
        </View>
      )}
      {item.reference_ar && (
        <Text style={styles.reference}>{item.reference_ar}</Text>
      )}
    </View>
  );

  if (loading || !event) {
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {event.name_ar}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Event Info */}
        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="calendar" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.eventTitle}>{event.name_ar}</Text>
          <Text style={styles.eventSubtitle}>{event.name_en}</Text>
          {event.description_ar && (
            <Text style={styles.eventDescription}>{event.description_ar}</Text>
          )}
          {event.hijri_month && event.hijri_day && (
            <View style={styles.dateContainer}>
              <Ionicons name="time" size={20} color={COLORS.primary} />
              <Text style={styles.dateText}>
                {event.hijri_day} من شهر {event.hijri_month}
              </Text>
            </View>
          )}
        </View>

        {/* Azkar Section */}
        {azkar.length > 0 && (
          <View style={styles.azkarSection}>
            <Text style={styles.sectionTitle}>أذكار وأدعية المناسبة</Text>
            {azkar.map((item, index) => (
              <View key={index}>{renderAzkar({ item })}</View>
            ))}
          </View>
        )}

        {azkar.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>لا توجد أذكار خاصة بهذه المناسبة حالياً</Text>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
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
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  eventSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  eventDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  azkarSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  azkarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  repeatBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  repeatText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  arabicText: {
    fontSize: 18,
    lineHeight: 32,
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
    marginBottom: 8,
  },
  virtueText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    lineHeight: 20,
  },
  reference: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});