import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { THEME } from '../../src/constants/theme';
import { apiService } from '../../src/services/api';
import { IslamicEvent } from '../../src/types';

const EventCard: React.FC<{
  item: IslamicEvent;
  index: number;
  onPress: () => void;
}> = ({ item, index, onPress }) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(50);
  const isPressed = useSharedValue(false);

  useEffect(() => {
    opacity.value = withDelay(
      index * 80,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    translateX.value = withDelay(
      index * 80,
      withSpring(0, { damping: 15, stiffness: 80 })
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      {
        scale: withSpring(isPressed.value ? 0.97 : 1, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
  }));

  const getEventIcon = (eventId: number): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<number, keyof typeof Ionicons.glyphMap> = {
      1: 'moon',        // رمضان
      2: 'gift',        // عيد الفطر
      3: 'heart',       // عيد الأضحى
      4: 'water',       // يوم عرفة
      5: 'sunny',       // المولد النبوي
      6: 'airplane',    // الإسراء
      7: 'calendar',    // العاشوراء
      8: 'star',        // ليلة القدر
      9: 'sparkles',    // النصف من شعبان
      10: 'ribbon',     // يوم الجمعة
    };
    return iconMap[eventId] || 'calendar';
  };

  const getEventGradient = (eventId: number): readonly [string, string, ...string[]] => {
    const gradients: Record<number, readonly [string, string, ...string[]]> = {
      1: ['#764BA2', '#667EEA'],
      2: ['#F093FB', '#F5576C'],
      3: ['#4FACFE', '#00F2FE'],
      4: ['#43E97B', '#38F9D7'],
      5: ['#FA709A', '#FEE140'],
      6: ['#A18CD1', '#FBC2EB'],
      7: ['#FF9A9E', '#FECFEF'],
      8: ['#667EEA', '#764BA2'],
      9: ['#F6D365', '#FDA085'],
      10: ['#11998E', '#38EF7D'],
    };
    return gradients[eventId] || THEME.gradients.primary;
  };

  return (
    <Animated.View style={containerStyle}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={() => {
          isPressed.value = true;
          Haptics.selectionAsync();
        }}
        onPressOut={() => {
          isPressed.value = false;
        }}
      >
        <View style={styles.eventCard}>
          <LinearGradient
            colors={getEventGradient(item.id)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Ionicons name={getEventIcon(item.id)} size={28} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{item.name_ar}</Text>
            <Text style={styles.eventSubtitle}>{item.name_en}</Text>
            {item.description_ar && (
              <Text style={styles.eventDescription} numberOfLines={2}>
                {item.description_ar}
              </Text>
            )}
          </View>
          <Ionicons
            name="chevron-forward"
            size={22}
            color={THEME.colors.textMuted}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function EventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<IslamicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await apiService.getIslamicEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadEvents();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={THEME.gradients.header}
          style={[styles.header, { paddingTop: insets.top + 8 }]}
        >
          <Text style={styles.headerTitle}>المناسبات الدينية</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Gradient Header */}
      <LinearGradient
        colors={THEME.gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Animated.View entering={FadeInDown.springify()}>
          <Text style={styles.headerTitle}>المناسبات الدينية</Text>
          <Text style={styles.headerSubtitle}>{events.length} مناسبة إسلامية</Text>
        </Animated.View>
      </LinearGradient>

      <FlatList
        data={events}
        renderItem={({ item, index }) => (
          <EventCard
            item={item}
            index={index}
            onPress={() => router.push(`/events/${item.id}`)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.primary}
            colors={[THEME.colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    paddingHorizontal: THEME.spacing.md,
    paddingBottom: THEME.spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
  },
  listContent: {
    padding: THEME.spacing.md,
    paddingTop: THEME.spacing.lg,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    ...THEME.shadows.small,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: 2,
  },
  eventSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 13,
    color: THEME.colors.text,
    opacity: 0.7,
    lineHeight: 18,
  },
});
