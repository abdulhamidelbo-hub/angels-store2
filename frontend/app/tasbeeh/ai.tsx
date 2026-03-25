import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Pressable,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { THEME } from '../../src/constants/theme';
import { apiService } from '../../src/services/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const TypingIndicator: React.FC = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1
    );
    dot2.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 150 }),
        withTiming(-5, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1
    );
    dot3.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 300 }),
        withTiming(-5, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }));
  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }));
  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }));

  return (
    <View style={styles.typingContainer}>
      <View style={styles.aiAvatar}>
        <Ionicons name="sparkles" size={18} color="#FFFFFF" />
      </View>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.dot, dot1Style]} />
        <Animated.View style={[styles.dot, dot2Style]} />
        <Animated.View style={[styles.dot, dot3Style]} />
      </View>
    </View>
  );
};

const MessageBubble: React.FC<{ message: Message; index: number }> = ({ message, index }) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {!message.isUser && (
        <LinearGradient
          colors={THEME.gradients.primary}
          style={styles.aiAvatar}
        >
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
        </LinearGradient>
      )}
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {message.isUser ? (
          <LinearGradient
            colors={THEME.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userBubbleGradient}
          >
            <Text style={styles.userText}>{message.text}</Text>
          </LinearGradient>
        ) : (
          <Text style={styles.aiText}>{message.text}</Text>
        )}
      </View>
    </Animated.View>
  );
};

export default function AITasbeehScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'السلام عليكم! أنا مساعدك الذكي للأذكار. يمكنني مساعدتك في:\n\n• البحث عن أذكار معينة\n• شرح معاني الأدعية\n• ترجمة الأذكار\n• إرشادك للأذكار المناسبة\n\nكيف يمكنني مساعدتك اليوم؟',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await apiService.sendAIMessage(inputText);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(response.timestamp),
      };

      setMessages((prev) => [...prev, aiMessage]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الإرسال');
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const clearChat = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setMessages([
      {
        id: '1',
        text: 'السلام عليكم! كيف يمكنني مساعدتك؟',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Animated.View
          entering={FadeIn.springify()}
          style={styles.headerContent}
        >
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={styles.aiIconHeader}>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>المساعد الذكي</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={clearChat}
          >
            <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}
          {loading && <TypingIndicator />}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {['أذكار الصباح', 'أذكار المساء', 'دعاء الاستخارة'].map((action) => (
            <Pressable
              key={action}
              style={({ pressed }) => [
                styles.quickAction,
                pressed && styles.quickActionPressed,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setInputText(action);
              }}
            >
              <Text style={styles.quickActionText}>{action}</Text>
            </Pressable>
          ))}
        </View>

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Pressable
            style={({ pressed }) => [
              styles.micButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              Alert.alert('قريباً', 'سيتم إضافة الإدخال الصوتي قريباً');
            }}
          >
            <Ionicons name="mic" size={22} color={THEME.colors.primary} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="اكتب رسالتك..."
            placeholderTextColor={THEME.colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            multiline
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
              pressed && inputText.trim() && styles.sendButtonPressed,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            <LinearGradient
              colors={inputText.trim() ? ['#667EEA', '#764BA2'] : [THEME.colors.border, THEME.colors.border]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButtonGradient}
            >
              <Ionicons
                name="send"
                size={18}
                color={inputText.trim() ? '#FFFFFF' : THEME.colors.textMuted}
              />
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    paddingHorizontal: THEME.spacing.md,
    paddingBottom: THEME.spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconHeader: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: THEME.spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.sm,
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  userBubbleGradient: {
    padding: THEME.spacing.md,
  },
  aiBubble: {
    backgroundColor: THEME.colors.surface,
    borderBottomLeftRadius: 4,
    padding: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  userText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  aiText: {
    fontSize: 16,
    lineHeight: 24,
    color: THEME.colors.text,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    ...THEME.shadows.small,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.textMuted,
    marginHorizontal: 3,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    gap: THEME.spacing.sm,
  },
  quickAction: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  quickActionPressed: {
    backgroundColor: THEME.colors.background,
  },
  quickActionText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: THEME.colors.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: THEME.spacing.sm,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
});
