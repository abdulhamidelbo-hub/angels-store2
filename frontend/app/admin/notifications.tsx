import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Modal, RefreshControl, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ADMIN_COLORS } from '../../src/constants/adminColors';
import { apiService } from '../../src/services/api';

const TARGET_OPTIONS = [
  { key: 'all', label: 'جميع المستخدمين' },
  { key: 'paid', label: 'المشتركين المدفوعين' },
  { key: 'active', label: 'المستخدمين النشطين' },
  { key: 'exemption', label: 'المعفيين' },
];

export default function AdminNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [autoSettings, setAutoSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [form, setForm] = useState({ title_ar: '', title_en: '', body_ar: '', body_en: '', target: 'all', link: '' });

  const loadData = useCallback(async () => {
    try {
      const [notifData, settingsData] = await Promise.all([
        apiService.adminListNotifications(),
        apiService.adminGetNotificationSettings(),
      ]);
      setNotifications(notifData.items);
      setAutoSettings(settingsData);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSend = async () => {
    if (!form.title_ar.trim() || !form.body_ar.trim()) { Alert.alert('خطأ', 'يرجى ملء العنوان والنص'); return; }
    try {
      await apiService.adminSendNotification(form);
      Alert.alert('نجاح', 'تم إرسال الإشعار بنجاح');
      setModalVisible(false); loadData();
    } catch (error) { Alert.alert('خطأ', 'حدث خطأ'); }
  };

  const handleUpdateAutoSettings = async (key: string, value: any) => {
    const updated = { ...autoSettings, [key]: value };
    setAutoSettings(updated);
    try { await apiService.adminUpdateNotificationSettings({ [key]: value }); }
    catch (error) { console.error('Error updating settings:', error); }
  };

  if (loading) return <SafeAreaView style={styles.container} edges={['top']}><View style={styles.center}><ActivityIndicator size="large" color={ADMIN_COLORS.primary} /></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>الإشعارات</Text>
        <TouchableOpacity onPress={() => { setForm({ title_ar: '', title_en: '', body_ar: '', body_en: '', target: 'all', link: '' }); setModalVisible(true); }} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
        {/* Auto Settings Card */}
        <TouchableOpacity style={styles.autoSettingsCard} onPress={() => setSettingsVisible(!settingsVisible)}>
          <View style={styles.autoSettingsHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="settings" size={20} color={ADMIN_COLORS.primary} />
              <Text style={styles.autoSettingsTitle}>الإشعارات التلقائية</Text>
            </View>
            <Ionicons name={settingsVisible ? 'chevron-up' : 'chevron-down'} size={20} color={ADMIN_COLORS.textSecondary} />
          </View>
          {settingsVisible && autoSettings && (
            <View style={styles.autoSettingsBody}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>إشعارات الصباح</Text>
                <Switch value={autoSettings.morning_enabled} onValueChange={(v) => handleUpdateAutoSettings('morning_enabled', v)} trackColor={{ true: ADMIN_COLORS.primary }} />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>إشعارات المساء</Text>
                <Switch value={autoSettings.evening_enabled} onValueChange={(v) => handleUpdateAutoSettings('evening_enabled', v)} trackColor={{ true: ADMIN_COLORS.primary }} />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>إشعارات المناسبات</Text>
                <Switch value={autoSettings.events_enabled} onValueChange={(v) => handleUpdateAutoSettings('events_enabled', v)} trackColor={{ true: ADMIN_COLORS.primary }} />
              </View>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>الإشعارات المرسلة</Text>
        {notifications.length === 0 && <Text style={styles.emptyText}>لا توجد إشعارات مرسلة</Text>}
        {notifications.map((item, index) => (
          <View key={item._id || index} style={styles.notifCard}>
            <View style={styles.notifTop}>
              <View style={[styles.targetBadge, { backgroundColor: item.target === 'all' ? ADMIN_COLORS.primary + '20' : ADMIN_COLORS.accent + '20' }]}>
                <Text style={[styles.targetBadgeText, { color: item.target === 'all' ? ADMIN_COLORS.primary : ADMIN_COLORS.accent }]}>
                  {TARGET_OPTIONS.find(t => t.key === item.target)?.label || 'الكل'}
                </Text>
              </View>
              <Text style={styles.notifDate}>{item.sent_at ? new Date(item.sent_at).toLocaleDateString('ar-SA') : '-'}</Text>
            </View>
            <Text style={styles.notifTitle}>{item.title_ar}</Text>
            <Text style={styles.notifBody} numberOfLines={3}>{item.body_ar}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Send Notification Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{ fontSize: 16, color: ADMIN_COLORS.warning }}>إلغاء</Text></TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: ADMIN_COLORS.text }}>إرسال إشعار</Text>
            <TouchableOpacity onPress={handleSend}><Text style={{ fontSize: 16, color: ADMIN_COLORS.primary, fontWeight: '600' }}>إرسال</Text></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.fieldLabel}>المستهدفون</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {TARGET_OPTIONS.map((opt) => (
                <TouchableOpacity key={opt.key} style={[styles.targetChip, form.target === opt.key && styles.targetChipActive]} onPress={() => setForm({ ...form, target: opt.key })}>
                  <Text style={[styles.targetChipText, form.target === opt.key && { color: '#fff' }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>العنوان (عربي) *</Text>
            <TextInput style={styles.input} value={form.title_ar} onChangeText={(t) => setForm({ ...form, title_ar: t })} textAlign="right" />
            <Text style={styles.fieldLabel}>العنوان (إنجليزي)</Text>
            <TextInput style={styles.input} value={form.title_en} onChangeText={(t) => setForm({ ...form, title_en: t })} />
            <Text style={styles.fieldLabel}>النص (عربي) *</Text>
            <TextInput style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]} multiline value={form.body_ar} onChangeText={(t) => setForm({ ...form, body_ar: t })} textAlign="right" />
            <Text style={styles.fieldLabel}>النص (إنجليزي)</Text>
            <TextInput style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]} multiline value={form.body_en} onChangeText={(t) => setForm({ ...form, body_en: t })} />
            <Text style={styles.fieldLabel}>رابط داخلي (اختياري)</Text>
            <TextInput style={styles.input} value={form.link} onChangeText={(t) => setForm({ ...form, link: t })} placeholder="مثل: /tasbeeh/touch" />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ADMIN_COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: ADMIN_COLORS.headerBg, paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  addBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  list: { flex: 1, padding: 12 },
  autoSettingsCard: { backgroundColor: ADMIN_COLORS.card, borderRadius: 12, padding: 14, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  autoSettingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  autoSettingsTitle: { fontSize: 16, fontWeight: '600', color: ADMIN_COLORS.text },
  autoSettingsBody: { marginTop: 12, borderTopWidth: 1, borderTopColor: ADMIN_COLORS.border, paddingTop: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  settingLabel: { fontSize: 14, color: ADMIN_COLORS.text },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: ADMIN_COLORS.text, marginBottom: 12, marginTop: 4 },
  emptyText: { textAlign: 'center', fontSize: 16, color: ADMIN_COLORS.textSecondary, marginTop: 20 },
  notifCard: { backgroundColor: ADMIN_COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  notifTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  targetBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  targetBadgeText: { fontSize: 12, fontWeight: '600' },
  notifDate: { fontSize: 12, color: ADMIN_COLORS.textSecondary },
  notifTitle: { fontSize: 16, fontWeight: '600', color: ADMIN_COLORS.text, textAlign: 'right', marginBottom: 4 },
  notifBody: { fontSize: 13, color: ADMIN_COLORS.textSecondary, textAlign: 'right', lineHeight: 20 },
  modalContainer: { flex: 1, backgroundColor: ADMIN_COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border, backgroundColor: ADMIN_COLORS.card },
  modalBody: { padding: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: ADMIN_COLORS.text, marginBottom: 6, textAlign: 'right' },
  input: { backgroundColor: ADMIN_COLORS.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: ADMIN_COLORS.border, marginBottom: 14 },
  targetChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: ADMIN_COLORS.card, borderWidth: 1, borderColor: ADMIN_COLORS.border },
  targetChipActive: { backgroundColor: ADMIN_COLORS.primary, borderColor: ADMIN_COLORS.primary },
  targetChipText: { fontSize: 13, color: ADMIN_COLORS.textSecondary },
});
