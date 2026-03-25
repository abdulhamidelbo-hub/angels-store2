import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, RefreshControl, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ADMIN_COLORS } from '../../src/constants/adminColors';
import { apiService } from '../../src/services/api';

export default function AdminAzkar() {
  const router = useRouter();
  const [azkar, setAzkar] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAzkar, setEditingAzkar] = useState<any>(null);
  const [form, setForm] = useState({
    category_id: 1, arabic_text: '', repeat_count: '1',
    virtue_ar: '', virtue_en: '', reference_ar: '', reference_en: '', transliteration: '',
  });

  const loadData = useCallback(async () => {
    try {
      const [azkarData, catData] = await Promise.all([
        apiService.adminListAzkar({ category_id: selectedCategory || undefined, search: search || undefined, page }),
        apiService.adminListCategories(),
      ]);
      setAzkar(azkarData.items);
      setTotalPages(azkarData.pages);
      setCategories(catData.items);
    } catch (error) {
      console.error('Error loading azkar:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, search, page]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const openAddModal = () => {
    setEditingAzkar(null);
    setForm({ category_id: 1, arabic_text: '', repeat_count: '1', virtue_ar: '', virtue_en: '', reference_ar: '', reference_en: '', transliteration: '' });
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEditingAzkar(item);
    setForm({
      category_id: item.category_id, arabic_text: item.arabic_text,
      repeat_count: String(item.repeat_count || 1), virtue_ar: item.virtue_ar || '',
      virtue_en: item.virtue_en || '', reference_ar: item.reference_ar || '',
      reference_en: item.reference_en || '', transliteration: item.transliteration || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.arabic_text.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال النص العربي');
      return;
    }
    try {
      const data = { ...form, repeat_count: parseInt(form.repeat_count) || 1 };
      if (editingAzkar) {
        await apiService.adminUpdateAzkar(editingAzkar.id, data);
        Alert.alert('نجاح', 'تم تحديث الذكر بنجاح');
      } else {
        await apiService.adminCreateAzkar(data);
        Alert.alert('نجاح', 'تم إضافة الذكر بنجاح');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert('تأكيد الحذف', `هل تريد حذف هذا الذكر؟\n\nتحذير: لا يمكن التراجع عن هذا الإجراء`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            await apiService.adminDeleteAzkar(item.id);
            Alert.alert('نجاح', 'تم حذف الذكر');
            loadData();
          } catch (error) {
            Alert.alert('خطأ', 'حدث خطأ أثناء الحذف');
          }
        },
      },
    ]);
  };

  const getCategoryName = (catId: number) => {
    const cat = categories.find(c => c.id === catId);
    return cat?.name_ar || `تصنيف ${catId}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة الأذكار</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={ADMIN_COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="بحث في الأذكار..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => { setPage(1); loadData(); }}
          />
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
          onPress={() => { setSelectedCategory(null); setPage(1); }}
        >
          <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextActive]}>الكل</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.filterChip, selectedCategory === cat.id && styles.filterChipActive]}
            onPress={() => { setSelectedCategory(cat.id); setPage(1); }}
          >
            <Text style={[styles.filterChipText, selectedCategory === cat.id && styles.filterChipTextActive]}>
              {cat.name_ar} ({cat.azkar_count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {azkar.map((item, index) => (
          <View key={item.id || index} style={styles.azkarCard}>
            <View style={styles.azkarHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{getCategoryName(item.category_id)}</Text>
              </View>
              <Text style={styles.repeatBadge}>×{item.repeat_count}</Text>
            </View>
            <Text style={styles.arabicText} numberOfLines={3}>{item.arabic_text}</Text>
            {item.virtue_ar ? <Text style={styles.virtueText} numberOfLines={2}>{item.virtue_ar}</Text> : null}
            {item.reference_ar ? <Text style={styles.referenceText}>{item.reference_ar}</Text> : null}
            <View style={styles.azkarActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                <Ionicons name="create" size={18} color={ADMIN_COLORS.primary} />
                <Text style={styles.editBtnText}>تعديل</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Ionicons name="trash" size={18} color={ADMIN_COLORS.warning} />
                <Text style={styles.deleteBtnText}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
              onPress={() => page > 1 && setPage(page - 1)}
              disabled={page <= 1}
            >
              <Text style={styles.pageBtnText}>السابق</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
            <TouchableOpacity
              style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
              onPress={() => page < totalPages && setPage(page + 1)}
              disabled={page >= totalPages}
            >
              <Text style={styles.pageBtnText}>التالي</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>إلغاء</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingAzkar ? 'تعديل ذكر' : 'إضافة ذكر جديد'}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>حفظ</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.fieldLabel}>التصنيف</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.filterChip, form.category_id === cat.id && styles.filterChipActive, { marginRight: 8 }]}
                  onPress={() => setForm({ ...form, category_id: cat.id })}
                >
                  <Text style={[styles.filterChipText, form.category_id === cat.id && styles.filterChipTextActive]}>{cat.name_ar}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>النص العربي *</Text>
            <TextInput style={[styles.input, styles.textArea]} multiline value={form.arabic_text} onChangeText={(t) => setForm({ ...form, arabic_text: t })} placeholder="أدخل نص الذكر بالعربية" textAlign="right" />

            <Text style={styles.fieldLabel}>عدد التكرار</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={form.repeat_count} onChangeText={(t) => setForm({ ...form, repeat_count: t })} placeholder="1" />

            <Text style={styles.fieldLabel}>الفضل (عربي)</Text>
            <TextInput style={[styles.input, styles.textArea]} multiline value={form.virtue_ar} onChangeText={(t) => setForm({ ...form, virtue_ar: t })} placeholder="فضل هذا الذكر" textAlign="right" />

            <Text style={styles.fieldLabel}>الفضل (إنجليزي)</Text>
            <TextInput style={[styles.input, styles.textArea]} multiline value={form.virtue_en} onChangeText={(t) => setForm({ ...form, virtue_en: t })} placeholder="Virtue in English" />

            <Text style={styles.fieldLabel}>المرجع (عربي)</Text>
            <TextInput style={styles.input} value={form.reference_ar} onChangeText={(t) => setForm({ ...form, reference_ar: t })} placeholder="مثل: رواه البخاري" textAlign="right" />

            <Text style={styles.fieldLabel}>المرجع (إنجليزي)</Text>
            <TextInput style={styles.input} value={form.reference_en} onChangeText={(t) => setForm({ ...form, reference_en: t })} placeholder="e.g., Narrated by Al-Bukhari" />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ADMIN_COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: ADMIN_COLORS.headerBg, paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  addBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  searchContainer: { padding: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: ADMIN_COLORS.card, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: ADMIN_COLORS.border },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, textAlign: 'right' },
  filterScroll: { maxHeight: 44, marginBottom: 8 },
  filterContent: { paddingHorizontal: 12, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: ADMIN_COLORS.card, borderWidth: 1, borderColor: ADMIN_COLORS.border, marginRight: 8 },
  filterChipActive: { backgroundColor: ADMIN_COLORS.primary, borderColor: ADMIN_COLORS.primary },
  filterChipText: { fontSize: 13, color: ADMIN_COLORS.textSecondary },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  list: { flex: 1, paddingHorizontal: 12 },
  azkarCard: { backgroundColor: ADMIN_COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  azkarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { backgroundColor: ADMIN_COLORS.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryBadgeText: { fontSize: 11, color: ADMIN_COLORS.primary, fontWeight: '600' },
  repeatBadge: { fontSize: 14, fontWeight: 'bold', color: ADMIN_COLORS.accent },
  arabicText: { fontSize: 16, color: ADMIN_COLORS.text, lineHeight: 28, textAlign: 'right', marginBottom: 6 },
  virtueText: { fontSize: 13, color: ADMIN_COLORS.textSecondary, textAlign: 'right', marginBottom: 4 },
  referenceText: { fontSize: 12, color: ADMIN_COLORS.accent, textAlign: 'right', fontStyle: 'italic' },
  azkarActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 12 },
  editBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: ADMIN_COLORS.primary + '15', borderRadius: 8 },
  editBtnText: { fontSize: 13, color: ADMIN_COLORS.primary, marginLeft: 4 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: ADMIN_COLORS.warning + '15', borderRadius: 8 },
  deleteBtnText: { fontSize: 13, color: ADMIN_COLORS.warning, marginLeft: 4 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, gap: 16 },
  pageBtn: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: ADMIN_COLORS.primary, borderRadius: 8 },
  pageBtnDisabled: { backgroundColor: ADMIN_COLORS.border },
  pageBtnText: { color: '#fff', fontWeight: '600' },
  pageInfo: { fontSize: 14, color: ADMIN_COLORS.textSecondary },
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
