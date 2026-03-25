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
import { COLORS } from '../src/constants/colors';
import { apiService } from '../src/services/api';
import { useApp } from '../src/contexts/AppContext';
import { SubscriptionInfo } from '../src/types';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { userId } = useApp();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const data = await apiService.getSubscriptionStatus(userId);
      setSubscription(data);
      
      // Calculate days remaining
      const endDate = new Date(data.trial_end_date || data.subscription_end_date || '');
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(Math.max(0, diffDays));
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExemption = async () => {
    if (!subscription) return;

    // Check if already used
    if (subscription.exemption_used) {
      Alert.alert(
        'تم الاستخدام',
        'لقد استخدمت هذه الميزة مسبقاً. جزاك الله خيراً على دعائك.'
      );
      return;
    }

    Alert.alert(
      'طلب إعفاء من الاشتراك',
      'أنت على وشك طلب إعفاء من الاشتراك لمدة سنة إضافية. نسأل الله أن يتقبل دعاءك ويفرج همك.\\n\\nهل تريد المتابعة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم، سأدعو لصانع البرنامج',
          onPress: async () => {
            try {
              const result = await apiService.requestExemption(userId);
              
              Alert.alert(
                '✨ بارك الله فيك',
                'تقبل الله دعاءك! تم تفعيل اشتراك مجاني لمدة سنة كاملة.\\n\\nنسأل الله أن يفرج همك ويرزقك من حيث لا تحتسب.',
                [
                  {
                    text: 'الحمد لله',
                    onPress: () => loadSubscription(),
                  },
                ]
              );
            } catch (error) {
              console.error('Error requesting exemption:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء طلب الإعفاء. حاول مرة أخرى.');
            }
          },
        },
      ]
    );
  };

  const handleSubscribe = () => {
    Alert.alert(
      'الاشتراك',
      'سيتم إضافة نظام الدفع قريباً إن شاء الله.\\n\\nفي الوقت الحالي، يمكنك استخدام زر الإعفاء للحصول على سنة مجانية.',
      [{ text: 'حسناً' }]
    );
  };

  const getStatusColor = () => {
    if (subscription?.subscription_status === 'exemption') return '#FFD700';
    if (daysRemaining > 90) return COLORS.success;
    if (daysRemaining > 30) return COLORS.warning;
    return COLORS.error;
  };

  const getStatusText = () => {
    if (subscription?.is_lifetime) return 'اشتراك مدى الحياة';
    if (subscription?.subscription_status === 'exemption') return 'إعفاء نشط';
    if (subscription?.subscription_status === 'trial') return 'فترة تجريبية';
    if (subscription?.subscription_status === 'active') return 'اشتراك نشط';
    return 'منتهي';
  };

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
        <Text style={styles.headerTitle}>الاشتراك</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
            <Ionicons
              name={subscription?.subscription_status === 'exemption' ? 'star' : 'checkmark-circle'}
              size={32}
              color={getStatusColor()}
            />
          </View>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          <Text style={styles.daysText}>
            {daysRemaining} يوم متبقي
          </Text>
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
            'إحصائيات مفصلة لتقدمك',
            'بدون إعلانات مزعجة نهائياً',
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Subscription Options */}
        {!subscription?.is_lifetime && daysRemaining < 30 && (
          <>
            {/* Pay Option */}
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={handleSubscribe}
              activeOpacity={0.8}
            >
              <View style={styles.subscribeContent}>
                <View>
                  <Text style={styles.subscribeTitle}>اشترك الآن</Text>
                  <Text style={styles.subscribePrice}>نصف دولار لمدة سنة كاملة</Text>
                </View>
                <Ionicons name="card" size={32} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* Exemption Option (الميزة العبقرية) */}
            {!subscription?.exemption_used && (
              <TouchableOpacity
                style={styles.exemptionButton}
                onPress={handleExemption}
                activeOpacity={0.8}
              >
                <View style={styles.exemptionHeader}>
                  <Ionicons name="star" size={24} color="#FFD700" />
                  <Text style={styles.exemptionBadge}>الميزة الخاصة</Text>
                </View>
                <Text style={styles.exemptionTitle}>
                  ليس عندي مال
                </Text>
                <Text style={styles.exemptionSubtitle}>
                  سأدعو لصانع البرنامج هذه السنة{`\n`}
                  وسأشترك السنة القادمة إن شاء الله
                </Text>
                <View style={styles.exemptionFooter}>
                  <Ionicons name="heart" size={20} color="#FFD700" />
                  <Text style={styles.exemptionNote}>
                    اضغط هنا للحصول على سنة مجانية
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {subscription?.exemption_used && (
              <View style={styles.exemptionUsedCard}>
                <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
                <Text style={styles.exemptionUsedText}>
                  تم استخدام ميزة الإعفاء{`\n`}
                  جزاك الله خيراً على دعائك
                </Text>
              </View>
            )}
          </>
        )}

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>
            جميع الأموال المستلمة تُستخدم في تطوير التطبيق وإضافة مزايا جديدة.
            نسأل الله أن يتقبل هذا العمل ويجعله خالصاً لوجهه الكريم.
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
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  daysText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  subscribeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  subscribeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscribeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subscribePrice: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  exemptionButton: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  exemptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exemptionBadge: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    marginLeft: 8,
  },
  exemptionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
    textAlign: 'center',
  },
  exemptionSubtitle: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  exemptionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFA500',
  },
  exemptionNote: {
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 8,
    fontWeight: '600',
  },
  exemptionUsedCard: {
    backgroundColor: COLORS.success + '10',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.success + '30',
  },
  exemptionUsedText: {
    fontSize: 16,
    color: COLORS.success,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 20,
  },
});
