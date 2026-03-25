import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '../src/constants/colors';
import { apiService } from '../src/services/api';
import { PrayerTimes } from '../src/types';

export default function PrayerTimesScreen() {
  const router = useRouter();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState('');

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const loadPrayerTimes = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('تنبيه', 'يحتاج التطبيق إلى إذن الوصول للموقع لحساب مواقيت الصلاة');
        setLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Get prayer times
      const times = await apiService.getPrayerTimes(latitude, longitude);
      setPrayerTimes(times);

      // Get city name
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (geocode.length > 0) {
        setCityName(geocode[0].city || geocode[0].region || 'الموقع الحالي');
      }
    } catch (error) {
      console.error('Error loading prayer times:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل مواقيت الصلاة');
    } finally {
      setLoading(false);
    }
  };

  const prayers = [
    { name: 'الفجر', key: 'fajr', icon: 'sunrise' },
    { name: 'الظهر', key: 'dhuhr', icon: 'sunny' },
    { name: 'العصر', key: 'asr', icon: 'partly-sunny' },
    { name: 'المغرب', key: 'maghrib', icon: 'sunset' },
    { name: 'العشاء', key: 'isha', icon: 'moon' },
  ];

  const getCurrentPrayer = () => {
    if (!prayerTimes) return null;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const times = [
      { name: 'الفجر', time: prayerTimes.fajr },
      { name: 'الظهر', time: prayerTimes.dhuhr },
      { name: 'العصر', time: prayerTimes.asr },
      { name: 'المغرب', time: prayerTimes.maghrib },
      { name: 'العشاء', time: prayerTimes.isha },
    ];

    for (let i = 0; i < times.length; i++) {
      const [hours, minutes] = times[i].time.split(':');
      const prayerTime = parseInt(hours) * 60 + parseInt(minutes);
      if (currentTime < prayerTime) {
        return times[i];
      }
    }

    return times[0]; // Next day Fajr
  };

  const nextPrayer = getCurrentPrayer();

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري تحميل مواقيت الصلاة...</Text>
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
        <Text style={styles.headerTitle}>مواقيت الصلاة</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadPrayerTimes}>
          <Ionicons name="refresh" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Location */}
        <View style={styles.locationCard}>
          <Ionicons name="location" size={24} color={COLORS.primary} />
          <Text style={styles.locationText}>{cityName || 'الموقع الحالي'}</Text>
        </View>

        {/* Next Prayer */}
        {nextPrayer && (
          <View style={styles.nextPrayerCard}>
            <Text style={styles.nextPrayerLabel}>الصلاة القادمة</Text>
            <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
            <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
          </View>
        )}

        {/* Prayer Times List */}
        {prayerTimes && prayers.map((prayer, index) => (
          <View key={index} style={styles.prayerCard}>
            <View style={styles.prayerLeft}>
              <View style={styles.prayerIcon}>
                <Ionicons
                  name={prayer.icon as any}
                  size={28}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.prayerName}>{prayer.name}</Text>
            </View>
            <Text style={styles.prayerTime}>
              {prayerTimes[prayer.key as keyof PrayerTimes] || '--:--'}
            </Text>
          </View>
        ))}

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>
            يتم حساب مواقيت الصلاة بناءً على موقعك الحالي.
            يمكنك تفعيل الإشعارات من الإعدادات.
          </Text>
        </View>
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
  refreshButton: {
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
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
    fontWeight: '600',
  },
  nextPrayerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextPrayerLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  nextPrayerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  nextPrayerTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  prayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  prayerName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  prayerTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 20,
  },
});