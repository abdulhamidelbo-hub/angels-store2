import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  LANGUAGE: '@adkar_language',
  THEME: '@adkar_theme',
  ONBOARDING_COMPLETE: '@adkar_onboarding',
  USER_ID: '@adkar_user_id',
  FAVORITES: '@adkar_favorites',
};

export const storage = {
  async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error('Error storing data:', e);
    }
  },

  async getItem(key: string): Promise<any> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error reading data:', e);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing data:', e);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Error clearing data:', e);
    }
  },
};
