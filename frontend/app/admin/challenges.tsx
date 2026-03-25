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

const CHALLENGE_TYPES = [
  { key: 'daily', label: 'يومي' },
  { key: 'weekly', label: 'أسبوعي' },
  { key: 'monthly', label: 'شهري' },
  { key: 'event', label: 'مناسبة' },
];

export default function AdminChallenges() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [form, setForm] = useState({
    title_ar: '', title_en: '', description_ar: '', description_en: '',
    required_count: '100', reward_xp: '50', reward_badge: '', challenge_type: 'daily',
  });

  const loadData = useCallback(async () => {
    try {
      const data = await apiService.adminListChallenges();
      setChallenges(data.items);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openAddModal = () => {
    setEditingChallenge(null);
    setForm({ title_ar: '', title_en: '', description_ar: '', description_en: '', required_count: '100', reward_xp: '50', reward_badge: '', challenge_type: 'daily' });
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEditingChallenge(item);
    setForm({
      title_ar: item.title_ar || '', title_en: item.title_en || '',
      description_ar: item.description_ar || '', description_en: item.description_en || '',
      required_count: String(item.required_count || 100), reward_xp: String(item.reward_xp || 50),
      reward_badge: item.reward_badge || '', challenge_type: item.challenge_type || 'daily',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title_ar.trim()) { Alert.alert('خطأ', 'يرجى إدخال عنوان التحدي'); return; }
    try {
      const data = { ...form, required_count: parseInt(form.required_count) || 100, reward_xp: parseInt(form.reward_xp) || 50 };
      if (editingChallenge) {
        await apiService.adminUpdateChallenge(editingChallenge.id, data);
        Alert.alert('نجاح', 'تم تحديث التحدي');
      } else {
        await apiService.adminCreateChallenge(data);
        Alert.alert('نجاح', 'تم إضافة التحدي');
      }
      setModalVisible(false); loadData();
    } catch (error) { Alert.alert('خطأ', 'حدث خطأ'); }
  };

  const handleDelete = (item: any) => {
    Alert.alert('تأكيد الحذف', `هل تريد حذف "${item.title_ar}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try { await apiService.adminDeleteChallenge(item.id); loadData(); } catch (e) { Alert.alert('خطأ', 'حدث خطأ'); }
      }},
    ]);
  };

  const handleToggle = async (item: any) => {
    try {
      await apiService.adminUpdateChallenge(item.id, { is_active: !item.is_active });
      loadData();
    } catch (e) { Alert.alert('خطأ', 'حدث خطأ'); }
  };

  if (loading) return <SafeAreaView style={styles.container} edges={['top']}><View style={styles.center}><ActivityIndicator size="large" color={ADMIN_COLORS.primary} /></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة التحديات</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}><Ionicons name="add" size={24} color="#fff" /></TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
        {challenges.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{CHALLENGE_TYPES.find(t => t.key === (item.challenge_type || 'daily'))?.label || 'يومي'}</Text>
              </View>
              <TouchableOpacity onPress={() => handleToggle(item)}>
                <Ionicons name={item.is_active ? 'toggle' : 'toggle-outline'} size={32} color={item.is_active ? ADMIN_COLORS.success : ADMIN_COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardTitle}>{item.title_ar}</Text>
            <Text style={styles.cardSubtitle}>{item.description_ar}</Text>
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}><Ionicons name="repeat" size={16} color={ADMIN_COLORS.accent} /><Text style={styles.metaText}>{item.required_count} مرة</Text></View>
              <View style={styles.metaItem}><Ionicons name="star" size={16} color="#FF9800" /><Text style={styles.metaText}>{item.reward_xp} XP</Text></View>
              {item.reward_badge ? <View style={styles.metaItem}><Ionicons name="ribbon" size={16} color="#9C27B0" /><Text style={styles.metaText}>{item.reward_badge}</Text></View> : null}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                <Ionicons name="create" size={18} color={ADMIN_COLORS.primary} /><Text style={[styles.actionText, { color: ADMIN_COLORS.primary }]}>تعديل</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Ionicons name="trash" size={18} color={ADMIN_COLORS.warning} /><Text style={[styles.actionText, { color: ADMIN_COLORS.warning }]}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{ fontSize: 16, color: ADMIN_COLORS.warning }}>إلغاء</Text></TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: ADMIN_COLORS.text }}>{editingChallenge ? 'تعديل تحدي' : 'إضافة تحدي'}</Text>
            <TouchableOpacity onPress={handleSave}><Text style={{ fontSize: 16, color: ADMIN_COLORS.primary, fontWeight: '600' }}>حفظ</Text></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.fieldLabel}>نوع التحدي</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {CHALLENGE_TYPES.map((type) => (
                <TouchableOpacity key={type.key} style={[styles.typeChip, form.challenge_type === type.key && styles.typeChipActive]} onPress={() => setForm({ ...form, challenge_type: type.key })}>
                  <Text style={[styles.typeChipText, form.challenge_type === type.key && { color: '#fff' }]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>العنوان العربي *</Text>
            <TextInput style={styles.input} value={form.title_ar} onChangeText={(t) => setForm({ ...form, title_ar: t })} textAlign="right" />
            <Text style={styles.fieldLabel}>العنوان الإنجليزي</Text>
            <TextInput style={styles.input} value={form.title_en} onChangeText={(t) => setForm({ ...form, title_en: t })} />
            <Text style={styles.fieldLabel}>الوصف العربي</Text>
            <TextInput style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]} multiline value={form.description_ar} onChangeText={(t) => setForm({ ...form, description_ar: t })} textAlign="right" />
            <Text style={styles.fieldLabel}>الوصف الإنجليزي</Text>
            <TextInput style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]} multiline value={form.description_en} onChangeText={(t) => setForm({ ...form, description_en: t })} />
            <Text style={styles.fieldLabel}>العدد المطلوب</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={form.required_count} onChangeText={(t) => setForm({ ...form, required_count: t })} />
            <Text style={styles.fieldLabel}>مكافأة XP</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={form.reward_xp} onChangeText={(t) => setForm({ ...form, reward_xp: t })} />
            <Text style={styles.fieldLabel}>اسم الوسام</Text>
            <TextInput style={styles.input} value={form.reward_badge} onChangeText={(t) => setForm({ ...form, reward_badge: t })} textAlign="right" />
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
  card: { backgroundColor: ADMIN_COLORS.card, borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeBadge: { backgroundColor: ADMIN_COLORS.primary + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  typeBadgeText: { fontSize: 12, color: ADMIN_COLORS.primary, fontWeight: '600' },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: ADMIN_COLORS.text, textAlign: 'right', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: ADMIN_COLORS.textSecondary, textAlign: 'right', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: ADMIN_COLORS.textSecondary },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  editBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: ADMIN_COLORS.primary + '15', borderRadius: 8, gap: 4 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: ADMIN_COLORS.warning + '15', borderRadius: 8, gap: 4 },
  actionText: { fontSize: 13, fontWeight: '500' },
  modalContainer: { flex: 1, backgroundColor: ADMIN_COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border, backgroundColor: ADMIN_COLORS.card },
  modalBody: { padding: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: ADMIN_COLORS.text, marginBottom: 6, textAlign: 'right' },
  input: { backgroundColor: ADMIN_COLORS.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: ADMIN_COLORS.border, marginBottom: 14 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: ADMIN_COLORS.card, borderWidth: 1, borderColor: ADMIN_COLORS.border },
  typeChipActive: { backgroundColor: ADMIN_COLORS.primary, borderColor: ADMIN_COLORS.primary },
  typeChipText: { fontSize: 13, color: ADMIN_COLORS.textSecondary },
});
