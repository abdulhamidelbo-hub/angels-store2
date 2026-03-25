import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import { AppProvider } from '../src/contexts/AppContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import i18n, { initI18n } from '../src/i18n';
import { THEME } from '../src/constants/theme';

export default function RootLayout() {
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => {
      setIsI18nReady(true);
    });
  }, []);

  if (!isI18nReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <LanguageProvider>
            <AppProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: THEME.colors.background },
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="language-selection" options={{ presentation: 'modal' }} />
                <Stack.Screen name="tasbeeh/touch" />
                <Stack.Screen name="tasbeeh/voice" />
                <Stack.Screen name="tasbeeh/ai" />
                <Stack.Screen name="azkar/[id]" />
                <Stack.Screen name="categories/[id]" />
                <Stack.Screen name="events/[id]" />
                <Stack.Screen name="admin" />
              </Stack>
            </AppProvider>
          </LanguageProvider>
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
