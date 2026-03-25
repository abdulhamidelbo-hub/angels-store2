import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/colors';
import { apiService } from '../../src/services/api';
import { useApp } from '../../src/contexts/AppContext';

export default function VoiceTasbeehScreen() {
  const router = useRouter();
  const { refreshStats } = useApp();
  const [count, setCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  const startListening = () => {
    Alert.alert(
      'العد بالصوت',
      'هذه الميزة تحت التطوير. ستكون جاهزة قريباً إن شاء الله.\n\nفي الوقت الحالي، يمكنك استخدام طريقة العد باللمس.',
      [
        { text: 'حسناً', style: 'default' },
      ]
    );
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const saveProgress = async () => {
    if (count === 0) return;
    
    try {
      await apiService.recordTasbeeh({
        method: 'voice',
        count: count,
      });
      await refreshStats();
      Alert.alert('تم الحفظ', `تم حفظ ${count} تسبيحة`);
      setCount(0);
    } catch (error) {
      console.error('Error saving progress:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>العد بالصوت</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.counterDisplay}>
          <Text style={styles.counterText}>{count}</Text>
          <Text style={styles.counterLabel}>تسبيحة</Text>
        </View>

        {recognizedText && (
          <View style={styles.recognizedContainer}>
            <Text style={styles.recognizedText}>{recognizedText}</Text>
          </View>
        )}

        {/* Microphone Button */}
        <TouchableOpacity
          style={[
            styles.micButton,
            isListening && styles.micButtonActive,
          ]}
          onPress={isListening ? stopListening : startListening}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isListening ? 'stop-circle' : 'mic'}
            size={64}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.statusText}>
          {isListening ? 'جاري الاستماع...' : 'اضغط للبدء'}
        </Text>

        {/* Instructions */}
        <View style={styles.instructions}>
          <View style={styles.instructionItem}>
            <Ionicons name="mic" size={24} color={COLORS.primary} />
            <Text style={styles.instructionText}>
              اضغط على الميكروفون للبدء
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="chatbubble" size={24} color={COLORS.primary} />
            <Text style={styles.instructionText}>
              قل التسبيح بوضوح
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            <Text style={styles.instructionText}>
              سيتم العد تلقائياً
            </Text>
          </View>
        </View>

        {count > 0 && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveProgress}
          >
            <Text style={styles.saveButtonText}>حفظ التقدم</Text>
          </TouchableOpacity>
        )}
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  counterDisplay: {
    alignItems: 'center',
    marginBottom: 48,
  },
  counterText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  counterLabel: {
    fontSize: 20,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  recognizedContainer: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  recognizedText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
  },
  micButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 24,
  },
  micButtonActive: {
    backgroundColor: COLORS.error,
  },
  statusText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 48,
  },
  instructions: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 16,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
