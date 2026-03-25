import React from 'react';
import { Stack } from 'expo-router';
import { AppProvider } from '../src/contexts/AppContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../src/utils/i18n';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#F5F5F5' },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="tasbeeh/touch" />
            <Stack.Screen name="tasbeeh/voice" />
            <Stack.Screen name="tasbeeh/ai" />
            <Stack.Screen name="azkar/[id]" />
            <Stack.Screen name="categories/[id]" />
            <Stack.Screen name="events/[id]" />
          </Stack>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
