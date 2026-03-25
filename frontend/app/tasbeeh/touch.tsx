import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../src/constants/colors';
import { apiService } from '../../src/services/api';
import { useApp } from '../../src/contexts/AppContext';
import { Counter } from '../../src/components/Common';

const { width, height } = Dimensions.get('window');

export default function TouchTasbeehScreen() {
  const router = useRouter();
  const { refreshStats } = useApp();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [isSaving, setIsSaving] = useState(false);

  const handleIncrement = async () => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const newCount = count + 1;
    setCount(newCount);

    // Save to backend every 10 counts
    if (newCount % 10 === 0) {
      saveProgress(10);
    }

    // Celebration haptic on target
    if (newCount === target) {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    }
  };

  const handleReset = () => {
    if (count > 0) {
      saveProgress(count);
    }
    setCount(0);
  };

  const saveProgress = async (countToSave: number) => {
    if (isSaving || countToSave === 0) return;
    
    setIsSaving(true);
    try {
      await apiService.recordTasbeeh({
        method: 'touch',
        count: countToSave,
      });
      await refreshStats();
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save progress when leaving screen
  useEffect(() => {
    return () => {
      if (count > 0) {
        saveProgress(count);
      }
    };
  }, [count]);

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
        <Text style={styles.headerTitle}>العد باللمس</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            // Show target picker
          }}
        >
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.counterContainer}>
          <Counter
            count={count}
            target={target}
            onIncrement={handleIncrement}
            onReset={handleReset}
            size="large"
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.tipsText}>
            اضغط على الدائرة للتسبيح • سيهتز الهاتف مع كل ضغطة
          </Text>
        </View>

        {/* Quick Targets */}
        <View style={styles.quickTargets}>
          <Text style={styles.quickTargetsTitle}>أهداف سريعة:</Text>
          <View style={styles.targetsRow}>
            {[33, 100, 300, 1000].map((targetValue) => (
              <TouchableOpacity
                key={targetValue}
                style={[
                  styles.targetButton,
                  target === targetValue && styles.targetButtonActive,
                ]}
                onPress={() => setTarget(targetValue)}
              >
                <Text
                  style={[
                    styles.targetButtonText,
                    target === targetValue && styles.targetButtonTextActive,
                  ]}
                >
                  {targetValue}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  counterContainer: {
    marginBottom: 48,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  tipsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  quickTargets: {
    width: '100%',
  },
  quickTargetsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  targetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  targetButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  targetButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  targetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  targetButtonTextActive: {
    color: '#FFFFFF',
  },
});
