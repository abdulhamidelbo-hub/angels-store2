import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, RefreshControl, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ADMIN_COLORS } from '../../src/constants/adminColors';
import { apiService } from '../../src/services/api';

export default function AdminSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [price, setPrice] = useState('0.50');
  const [trialDays, setTrialDays] = useState('365');
  const [tapCount, setTapCount] = useState('5');

  const loadData = useCallback(async () => {
    try {
      const data = await apiService.adminGetSettings();
      setSettings(data);
      setPrice(String(data.subscription_price || 0.50));
      setTrialDays(String(data.free_trial_days || 365));
      setTapCount(String(data.admin_tap_count || 5));
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (key: string, value: any) => {
    setSaving(true);
    try {
      await apiService.adminUpdateSettings({ [key]: value });
      setSettings({ ...settings, [key]: value });
    } catch (error) { Alert.alert('خطأ', 'حدث خطأ في الحفظ'); }
    finally { setSaving(false); }
  };

  const handleBackup = async () => {
    Alert.alert('نسخ احتياطي', 'هل تريد تصدير نسخة احتياطية كاملة؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تصدير', onPress: async () => {
        try {
          const data = await apiService.adminBackup();
          Alert.alert('نجاح', `تم تصدير النسخة الاحتياطية\n${data.total_documents} وثيقة من ${data.collections?.length} مجموعة`);
        } catch (error) { Alert.alert('خطأ', 'حدث خطأ'); }
      }},
    ]);
  };

  if (loading) return <SafeAreaView style={styles.container} edges={['top']}><View style={styles.center}><ActivityIndicator size="large" color={ADMIN_COLORS.primary} /></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>إعدادات المالك</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* App Settings */}
        <Text style={styles.sectionTitle}>إعدادات التطبيق</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>الوضع المجاني للجميع</Text>
            <Switch value={settings?.free_mode_enabled || false} onValueChange={(v) => handleSave('free_mode_enabled', v)} trackColor={{ true: ADMIN_COLORS.primary }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>سعر الاشتراك (دولار)</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.smallInput} keyboardType="decimal-pad" value={price} onChangeText={setPrice}
                onBlur={() => handleSave('subscription_price', parseFloat(price) || 0.50)} />
              <Text style={styles.currency}>$</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>مدة الفترة المجانية (أيام)</Text>
            <TextInput style={styles.smallInput} keyboardType="numeric" value={trialDays} onChangeText={setTrialDays}
              onBlur={() => handleSave('free_trial_days', parseInt(trialDays) || 365)} />
          </View>
        </View>

        {/* Security Settings */}
        <Text style={styles.sectionTitle}>إعدادات الأمان</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>تفعيل لوحة المالك</Text>
            <Switch value={settings?.admin_enabled !== false} onValueChange={(v) => handleSave('admin_enabled', v)} trackColor={{ true: ADMIN_COLORS.primary }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>عدد الضغطات للدخول</Text>
            <View style={styles.tapCountRow}>
              {[3, 5, 7, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.tapCountBtn, parseInt(tapCount) === num && styles.tapCountBtnActive]}
                  onPress={() => { setTapCount(String(num)); handleSave('admin_tap_count', num); }}
                >
                  <Text style={[styles.tapCountText, parseInt(tapCount) === num && { color: '#fff' }]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Backup */}
        <Text style={styles.sectionTitle}>النسخ الاحتياطي</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.backupBtn} onPress={handleBackup}>
            <Ionicons name="cloud-download" size={22} color={ADMIN_COLORS.primary} />
            <Text style={styles.backupBtnText}>تصدير نسخة احتياطية</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Logs Link */}
        <Text style={styles.sectionTitle}>سجل النشاط</Text>
        <View style={styles.card}>
          <Text style={styles.logsInfo}>جميع الإجراءات التي تتم من خلال لوحة التحكم يتم تسجيلها تلقائياً</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ADMIN_COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: ADMIN_COLORS.headerBg, paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  list: { flex: 1, padding: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: ADMIN_COLORS.text, marginBottom: 10, marginTop: 16 },
  card: { backgroundColor: ADMIN_COLORS.card, borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  settingLabel: { fontSize: 15, color: ADMIN_COLORS.text, flex: 1 },
  divider: { height: 1, backgroundColor: ADMIN_COLORS.border, marginVertical: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  smallInput: { width: 80, backgroundColor: ADMIN_COLORS.background, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, textAlign: 'center', borderWidth: 1, borderColor: ADMIN_COLORS.border },
  currency: { fontSize: 16, color: ADMIN_COLORS.textSecondary },
  tapCountRow: { flexDirection: 'row', gap: 8 },
  tapCountBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: ADMIN_COLORS.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: ADMIN_COLORS.border },
  tapCountBtnActive: { backgroundColor: ADMIN_COLORS.primary, borderColor: ADMIN_COLORS.primary },
  tapCountText: { fontSize: 14, fontWeight: '600', color: ADMIN_COLORS.textSecondary },
  backupBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  backupBtnText: { fontSize: 16, color: ADMIN_COLORS.primary, fontWeight: '600' },
  logsInfo: { fontSize: 14, color: ADMIN_COLORS.textSecondary, textAlign: 'center', paddingVertical: 8 },
});
