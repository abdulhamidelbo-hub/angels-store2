import axios from 'axios';
import { Category, Azkar, IslamicEvent, TasbeehCount, DailyStats, Challenge, PrayerTimes, SubscriptionInfo } from '../types';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  // Azkar
  async getAzkarByCategory(categoryId: number): Promise<Azkar[]> {
    const response = await api.get(`/azkar/category/${categoryId}`);
    return response.data;
  },

  async getAzkarDetail(azkarId: number): Promise<Azkar> {
    const response = await api.get(`/azkar/${azkarId}`);
    return response.data;
  },

  async toggleFavorite(azkarId: number): Promise<{ success: boolean; is_favorite: boolean }> {
    const response = await api.post(`/azkar/favorite/${azkarId}`);
    return response.data;
  },

  // Tasbeeh
  async recordTasbeeh(data: TasbeehCount): Promise<{ success: boolean; xp_earned: number; total_today: number }> {
    const response = await api.post('/tasbeeh/count', data);
    return response.data;
  },

  async getTodayStats(): Promise<DailyStats> {
    const response = await api.get('/stats/today');
    return response.data;
  },

  async getWeeklyStats(): Promise<DailyStats[]> {
    const response = await api.get('/stats/weekly');
    return response.data;
  },

  // Events
  async getIslamicEvents(): Promise<IslamicEvent[]> {
    const response = await api.get('/events');
    return response.data;
  },

  async getEventDetails(eventId: number): Promise<IslamicEvent & { azkar: Azkar[] }> {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  },

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    const response = await api.get('/challenges');
    return response.data;
  },

  // Prayer Times
  async getPrayerTimes(latitude: number, longitude: number): Promise<PrayerTimes> {
    const response = await api.post('/prayer-times', { latitude, longitude });
    return response.data;
  },

  // Subscription
  async getSubscriptionStatus(userId: string = 'default'): Promise<SubscriptionInfo> {
    const response = await api.get(`/subscription/status?user_id=${userId}`);
    return response.data;
  },

  async requestExemption(userId: string, prayerText?: string): Promise<{ success: boolean; message: string; expiry_date: string }> {
    const response = await api.post('/subscription/exemption', {
      user_id: userId,
      prayer_text: prayerText,
    });
    return response.data;
  },

  // AI Chat
  async sendAIMessage(message: string): Promise<{ response: string; timestamp: string }> {
    const response = await api.post('/ai/chat', { user_message: message });
    return response.data;
  },
};
