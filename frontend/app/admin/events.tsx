import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Modal, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ADMIN_COLORS } from '../../src/constants/adminColors';
import { apiService } from '../../src/services/api';

const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

export default function AdminEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [form, setForm] = useState({
    name_ar: '', name_en: '', hijri_month: '1', hijri_day: '1',
    description_ar: '', description_en: '', notification_days: '3',
  });

  const loadData = useCallback(async () => {
    try {
      const data = await apiService.adminListEvents();
      setEvents(data.items);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openAddModal = () => {
    setEditingEvent(null);
    setForm({ name_ar: '', name_en: '', hijri_month: '1', hijri_day: '1', description_ar: '', description_en: '', notification_days: '3' });
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEditingEvent(item);
    setForm({
      name_ar: item.name_ar || '', name_en: item.name_en || '',
      hijri_month: String(item.hijri_month || 1), hijri_day: String(item.hijri_day || 1),
      description_ar: item.description_ar || '', description_en: item.description_en || '',
      notification_days: String(item.notification_days || 3),
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name_ar.trim()) { Alert.alert('خطأ', 'يرجى إدخال اسم المناسبة'); return; }
    try {
      const data = {
        ...form,
        hijri_month: parseInt(form.hijri_month) || 1,
        hijri_day: parseInt(form.hijri_day) || 1,
        notification_days: parseInt(form.notification_days) || 3,
      };
      if (editingEvent) {
        await apiService.adminUpdateEvent(editingEvent.id, data);
        Alert.alert('نجاح', 'تم تحديث المناسبة');
      } else {
        await apiService.adminCreateEvent(data);
        Alert.alert('نجاح', 'تم إضافة المناسبة');
      }
      setModalVisible(false);
      loadData();
    } catch (error) { Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ'); }
  };

  const handleDelete = (item: any) => {
    Alert.alert('تأكيد الحذف', `هل تريد حذف "${item.name_ar}" وجميع أذكارها؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try { await apiService.adminDeleteEvent(item.id); Alert.alert('نجاح', 'تم حذف المناسبة'); loadData(); }
          catch (error) { Alert.alert('خطأ', 'حدث خطأ'); }
        },
      },
    ]);
  };

  if (loading) {
    return <SafeAreaView style={styles.container} edges={['top']}><View style={styles.center}><ActivityIndicator size="large" color={ADMIN_COLORS.primary} /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة المناسبات</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}><Ionicons name="add" size={24} color="#fff" /></TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
        {events.map((item) => (
          <View key={item.id} style={styles.eventCard}>
            <View style={styles.eventTop}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{item.hijri_day} {HIJRI_MONTHS[(item.hijri_month || 1) - 1]}</Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: item.is_active ? ADMIN_COLORS.success : ADMIN_COLORS.warning }]} />
            </View>
            <Text style={styles.eventName}>{item.name_ar}</Text>
            <Text style={styles.eventNameEn}>{item.name_en}</Text>
            {item.description_ar ? <Text style={styles.eventDesc} numberOfLines={2}>{item.description_ar}</Text> : null}
            <View style={styles.eventActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
                <Ionicons name="create" size={18} color={ADMIN_COLORS.primary} />
                <Text style={[styles.actionBtnText, { color: ADMIN_COLORS.primary }]}>تعديل</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: ADMIN_COLORS.warning + '15' }]} onPress={() => handleDelete(item)}>
                <Ionicons name="trash" size={18} color={ADMIN_COLORS.warning} />
                <Text style={[styles.actionBtnText, { color: ADMIN_COLORS.warning }]}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.modalCancel}>إلغاء</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>{editingEvent ? 'تعديل مناسبة' : 'إضافة مناسبة'}</Text>
            <TouchableOpacity onPress={handleSave}><Text style={styles.modalSave}>حفظ</Text></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.fieldLabel}>الاسم العربي *</Text>
            <TextInput style={styles.input} value={form.name_ar} onChangeText={(t) => setForm({ ...form, name_ar: t })} placeholder="مثل: ليلة القدر" textAlign="right" />
            <Text style={styles.fieldLabel}>الاسم الإنجليزي</Text>
            <TextInput style={styles.input} value={form.name_en} onChangeText={(t) => setForm({ ...form, name_en: t })} placeholder="e.g., Laylat al-Qadr" />
            <Text style={styles.fieldLabel}>الشهر الهجري (1-12)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={form.hijri_month} onChangeText={(t) => setForm({ ...form, hijri_month: t })} />
            <Text style={styles.fieldLabel}>اليوم الهجري (1-30)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={form.hijri_day} onChangeText={(t) => setForm({ ...form, hijri_day: t })} />
            <Text style={styles.fieldLabel}>الوصف العربي</Text>
            <TextInput style={[styles.input, styles.textArea]} multiline value={form.description_ar} onChangeText={(t) => setForm({ ...form, description_ar: t })} textAlign="right" />
            <Text style={styles.fieldLabel}>الوصف الإنجليزي</Text>
            <TextInput style={[styles.input, styles.textArea]} multiline value={form.description_en} onChangeText={(t) => setForm({ ...form, description_en: t })} />
            <Text style={styles.fieldLabel}>أيام الإشعار المسبق</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={form.notification_days} onChangeText={(t) => setForm({ ...form, notification_days: t })} />
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
  eventCard: { backgroundColor: ADMIN_COLORS.card, borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  eventTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateBadge: { backgroundColor: ADMIN_COLORS.accent + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  dateBadgeText: { fontSize: 12, color: ADMIN_COLORS.accent, fontWeight: '600' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  eventName: { fontSize: 18, fontWeight: 'bold', color: ADMIN_COLORS.text, textAlign: 'right', marginBottom: 2 },
  eventNameEn: { fontSize: 14, color: ADMIN_COLORS.textSecondary, marginBottom: 6 },
  eventDesc: { fontSize: 13, color: ADMIN_COLORS.textSecondary, textAlign: 'right', lineHeight: 20 },
  eventActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: ADMIN_COLORS.primary + '15', borderRadius: 8, gap: 4 },
  actionBtnText: { fontSize: 13, fontWeight: '500' },
  // Modal
  modalContainer: { flex: 1, backgroundColor: ADMIN_COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border, backgroundColor: ADMIN_COLORS.card },
  modalCancel: { fontSize: 16, color: ADMIN_COLORS.warning },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: ADMIN_COLORS.text },
  modalSave: { fontSize: 16, color: ADMIN_COLORS.primary, fontWeight: '600' },
  modalBody: { padding: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: ADMIN_COLORS.text, marginBottom: 6, textAlign: 'right' },
  input: { backgroundColor: ADMIN_COLORS.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: ADMIN_COLORS.border, marginBottom: 14 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});
