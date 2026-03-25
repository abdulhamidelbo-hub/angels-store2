import React from 'react';
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F9F7F0' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="azkar" />
      <Stack.Screen name="events" />
      <Stack.Screen name="challenges" />
      <Stack.Screen name="users" />
      <Stack.Screen name="exemptions" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="admin-settings" />
      <Stack.Screen name="revenue" />
    </Stack>
  );
}
