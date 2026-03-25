import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput, ActivityIndicator, Platform, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/constants/colors';
import { apiService } from '../src/services/api';
import { useApp } from '../src/contexts/AppContext';
import {
  isRevenueCatAvailable,
  purchaseSubscription,
  restorePurchases,
  getOfferings,
} from '../src/services/revenueCat';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { userId } = useApp();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [prayerText, setPrayerText] = useState('اللهم بارك في صانع البرنامج وارزقه من حيث لا يحتسب');
  const [showPrayerInput, setShowPrayerInput] = useState(false);
  const [offerings, setOfferings] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const rcAvailable = isRevenueCatAvailable();

  const loadData = useCallback(async () => {
    try {
      const [subData, offeringsData] = await Promise.all([
        apiService.getSubscriptionStatus(userId),
        getOfferings(),
      ]);
      setSubscription(subData);
      setOfferings(offeringsData);
      const endDate = new Date(subData.trial_end_date || subData.subscription_end_date || '');
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      setDaysRemaining(Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePurchase = async () => {
    if (!rcAvailable) {
      Alert.alert(
        'نظام الدفع',
        'نظام الدفع سيكون متاحاً بعد نشر التطبيق على App Store / Play Store.\n\nفي الوقت الحالي، يمكنك استخدام زر الإعفاء للحصول على سنة مجانية.',
        [{ text: 'حسناً' }]
      );
      return;
    }
    setPurchasing(true);
    try {
      const result = await purchaseSubscription();
      if (result.success) {
        await apiService.recordPurchase({
          user_id: userId,
          product_id: 'yearly_subscription_0_50',
          transaction_id: result.transactionId || 'rc_' + Date.now(),
          price: 0.50,
          currency: 'USD',
          store: Platform.OS === 'ios' ? 'app_store' : 'play_store',
        });
        Alert.alert('تم الاشتراك بنجاح! ✨', 'جزاك الله خيراً! تم تفعيل اشتراكك لمدة سنة كاملة.', [{ text: 'الحمد لله', onPress: loadData }]);
      } else if (result.error === 'USER_CANCELLED') {
        // cancelled
      } else {
        Alert.alert('خطأ', 'حدث خطأ أثناء عملية الدفع. حاول مرة أخرى.');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ غير متوقع');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!rcAvailable) {
      Alert.alert('ملاحظة', 'استعادة المشتريات متاحة فقط عند نشر التطبيق على المتاجر.');
      return;
    }
    setPurchasing(true);
    try {
      const result = await restorePurchases();
      if (result.success) {
        Alert.alert('نجاح', 'تم استعادة اشتراكك بنجاح!', [{ text: 'حسناً', onPress: loadData }]);
      } else {
        Alert.alert('ملاحظة', 'لم يتم العثور على مشتريات سابقة.');
      }
    } catch (e) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الاستعادة');
    } finally {
      setPurchasing(false);
    }
  };

  const handleExemption = async () => {
    if (!subscription) return;
    if (subscription.exemption_used) {
      Alert.alert('تم الاستخدام', 'لقد استخدمت هذه الميزة مسبقاً. جزاك الله خيراً على دعائك.');
      return;
    }
    setShowPrayerInput(true);
  };

  const submitExemption = async () => {
    if (!prayerText.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة دعائك لصانع البرنامج');
      return;
    }
    try {
      await apiService.requestExemption(userId, prayerText);
      setShowPrayerInput(false);
      Alert.alert(
        '✨ بارك الله فيك',
        'تقبل الله دعاءك! تم تفعيل اشتراك مجاني لمدة سنة كاملة.\n\nنسأل الله أن يفرج همك ويرزقك من حيث لا تحتسب.',
        [{ text: 'الحمد لله', onPress: loadData }]
      );
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ. حاول مرة أخرى.');
    }
  };

  const getStatusColor = () => {
    if (subscription?.subscription_status === 'exemption') return '#FFD700';
    if (subscription?.is_lifetime) return COLORS.primary;
    if (daysRemaining > 90) return COLORS.success || '#4CAF50';
    if (daysRemaining > 30) return COLORS.warning || '#FF9800';
    return COLORS.error || '#F44336';
  };

  const getStatusText = () => {
    if (subscription?.is_lifetime) return 'اشتراك مدى الحياة';
    if (subscription?.subscription_status === 'exemption') return 'إعفاء نشط';
    if (subscription?.subscription_status === 'trial') return 'فترة تجريبية';
    if (subscription?.subscription_status === 'active') return 'اشتراك نشط';
    return 'منتهي';
  };

  const getStatusIcon = () => {
    if (subscription?.subscription_status === 'exemption') return 'star';
    if (subscription?.is_lifetime) return 'diamond';
    if (subscription?.subscription_status === 'active') return 'checkmark-circle';
    return 'time';
  };

  const packageInfo = offerings?.current?.availablePackages?.[0];
  const priceString = packageInfo?.product?.priceString || '$0.50';

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الاشتراك</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
            <Ionicons name={getStatusIcon() as any} size={36} color={getStatusColor()} />
          </View>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
          <Text style={styles.daysText}>
            {daysRemaining > 99999 ? 'غير محدود' : `${daysRemaining} يوم متبقي`}
          </Text>
          {subscription?.subscription_status === 'exemption' && (
            <View style={styles.exemptionActiveBadge}>
              <Ionicons name="heart" size={14} color="#FFD700" />
              <Text style={styles.exemptionActiveText}>معفى - جزاك الله خيراً</Text>
            </View>
          )}
        </View>

        {/* Features */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>مميزات التطبيق الكاملة</Text>
          {[
            'جميع الأذكار الصحيحة مع مصادرها',
            'ثلاث طرق للتسبيح (لمس، صوت، ذكاء اصطناعي)',
            'مواقيت الصلاة الدقيقة',
            'تحديات وإنجازات يومية',
            '15 مناسبة دينية مع أذكارها',
            'بدون إعلانات مزعجة نهائياً',
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Purchase Options */}
        {!subscription?.is_lifetime && daysRemaining < 30 && (
          <>
            {/* Pay Button */}
            <TouchableOpacity
              style={[styles.subscribeButton, purchasing && { opacity: 0.7 }]}
              onPress={handlePurchase}
              activeOpacity={0.8}
              disabled={purchasing}
            >
              {purchasing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={styles.subscribeContent}>
                  <View>
                    <Text style={styles.subscribeTitle}>اشترك الآن</Text>
                    <Text style={styles.subscribePrice}>نصف دولار فقط ({priceString}) لمدة سنة</Text>
                  </View>
                  <Ionicons name="card" size={32} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* Restore Purchases */}
            <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
              <Ionicons name="refresh" size={18} color={COLORS.primary} />
              <Text style={styles.restoreText}>استعادة المشتريات السابقة</Text>
            </TouchableOpacity>

            {/* Exemption Button */}
            {!subscription?.exemption_used && !showPrayerInput && (
              <TouchableOpacity style={styles.exemptionButton} onPress={handleExemption} activeOpacity={0.8}>
                <View style={styles.exemptionHeader}>
                  <Ionicons name="star" size={24} color="#FFD700" />
                  <Text style={styles.exemptionBadge}>الميزة الخاصة</Text>
                </View>
                <Text style={styles.exemptionTitle}>ليس عندي مال</Text>
                <Text style={styles.exemptionSubtitle}>
                  {'سأدعو لصانع البرنامج هذه السنة\nوسأشترك السنة القادمة إن شاء الله'}
                </Text>
                <View style={styles.exemptionFooter}>
                  <Ionicons name="heart" size={20} color="#FFD700" />
                  <Text style={styles.exemptionNote}>اضغط هنا للحصول على سنة مجانية</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Prayer Input */}
            {showPrayerInput && (
              <View style={styles.prayerInputCard}>
                <Text style={styles.prayerInputTitle}>اكتب دعاءك لصانع البرنامج</Text>
                <Text style={styles.prayerInputHint}>هذا الدعاء سيُسجل ويصل لصانع البرنامج</Text>
                <TextInput
                  style={styles.prayerInput}
                  multiline
                  value={prayerText}
                  onChangeText={setPrayerText}
                  placeholder="اللهم بارك في صانع البرنامج..."
                  textAlign="right"
                />
                <View style={styles.prayerBtnRow}>
                  <TouchableOpacity style={styles.prayerSubmitBtn} onPress={submitExemption}>
                    <Ionicons name="heart" size={18} color="#fff" />
                    <Text style={styles.prayerSubmitText}>أرسل الدعاء وفعّل الإعفاء</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.prayerCancelBtn} onPress={() => setShowPrayerInput(false)}>
                    <Text style={styles.prayerCancelText}>إلغاء</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {subscription?.exemption_used && (
              <View style={styles.exemptionUsedCard}>
                <Ionicons name="checkmark-circle" size={32} color={COLORS.success || '#4CAF50'} />
                <Text style={styles.exemptionUsedText}>
                  {'تم استخدام ميزة الإعفاء\nجزاك الله خيراً على دعائك'}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Security Notice */}
        <View style={styles.securityCard}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.securityTitle}>دفع آمن</Text>
            <Text style={styles.securityText}>
              جميع عمليات الدفع تتم عبر {Platform.OS === 'ios' ? 'Apple' : 'Google'} بشكل آمن ومشفر. لا يتم تخزين بيانات بطاقتك في التطبيق.
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>
            جميع الأموال المستلمة تُستخدم في تطوير التطبيق. نسأل الله أن يتقبل هذا العمل ويجعله خالصاً لوجهه الكريم.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#888', marginTop: 12 },
  content: { padding: 20, paddingBottom: 40 },
  statusCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32, alignItems: 'center',
    marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  statusBadge: {
    width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  statusText: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  daysText: { fontSize: 18, color: '#888' },
  exemptionActiveBadge: {
    flexDirection: 'row', alignItems: 'center', marginTop: 12,
    paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#FFD70020', borderRadius: 20,
  },
  exemptionActiveText: { fontSize: 13, color: '#8B4513', marginLeft: 6, fontWeight: '600' },
  featuresCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  featuresTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureText: { flex: 1, fontSize: 16, color: '#333', marginLeft: 12 },
  subscribeButton: {
    backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, marginBottom: 12,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, minHeight: 70, justifyContent: 'center',
  },
  subscribeContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subscribeTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  subscribePrice: { fontSize: 15, color: '#FFFFFF', opacity: 0.9 },
  restoreButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginBottom: 16,
  },
  restoreText: { fontSize: 14, color: COLORS.primary, marginLeft: 6, fontWeight: '500' },
  exemptionButton: {
    backgroundColor: '#FFD700', borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, borderWidth: 2, borderColor: '#FFA500',
  },
  exemptionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  exemptionBadge: { fontSize: 14, fontWeight: 'bold', color: '#8B4513', marginLeft: 8 },
  exemptionTitle: { fontSize: 22, fontWeight: 'bold', color: '#8B4513', marginBottom: 8, textAlign: 'center' },
  exemptionSubtitle: { fontSize: 16, color: '#8B4513', textAlign: 'center', marginBottom: 16, lineHeight: 24 },
  exemptionFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: '#FFA500',
  },
  exemptionNote: { fontSize: 14, color: '#8B4513', marginLeft: 8, fontWeight: '600' },
  prayerInputCard: {
    backgroundColor: '#FFF8E1', borderRadius: 16, padding: 20, marginBottom: 16,
    borderWidth: 2, borderColor: '#FFD700',
  },
  prayerInputTitle: { fontSize: 18, fontWeight: 'bold', color: '#8B4513', textAlign: 'center', marginBottom: 6 },
  prayerInputHint: { fontSize: 13, color: '#A0855A', textAlign: 'center', marginBottom: 14 },
  prayerInput: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, minHeight: 100,
    fontSize: 16, color: '#333', textAlignVertical: 'top', borderWidth: 1,
    borderColor: '#E0D8C8', lineHeight: 26, marginBottom: 14,
  },
  prayerBtnRow: { flexDirection: 'row', gap: 10 },
  prayerSubmitBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFD700', paddingVertical: 14, borderRadius: 12, gap: 6,
  },
  prayerSubmitText: { fontSize: 15, fontWeight: 'bold', color: '#8B4513' },
  prayerCancelBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F5F5F5', paddingVertical: 14, borderRadius: 12,
  },
  prayerCancelText: { fontSize: 14, color: '#888' },
  exemptionUsedCard: {
    backgroundColor: '#E8F5E9', borderRadius: 16, padding: 20, alignItems: 'center',
    marginBottom: 16, borderWidth: 2, borderColor: '#C8E6C9',
  },
  exemptionUsedText: { fontSize: 16, color: '#4CAF50', textAlign: 'center', marginTop: 12, lineHeight: 24 },
  securityCard: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#E8F5E9',
    borderRadius: 12, padding: 16, marginBottom: 12,
  },
  securityTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  securityText: { fontSize: 13, color: '#666', lineHeight: 20 },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '10', borderRadius: 12, padding: 16,
  },
  infoText: { flex: 1, fontSize: 14, color: '#333', marginLeft: 12, lineHeight: 20 },
});
