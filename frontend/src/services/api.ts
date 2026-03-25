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

  // ============ ADMIN API ============

  // Admin Stats
  async getAdminStats(): Promise<any> {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getAdminCharts(): Promise<any> {
    const response = await api.get('/admin/stats/charts');
    return response.data;
  },

  // Admin Azkar
  async adminListAzkar(params?: { category_id?: number; search?: string; page?: number }): Promise<any> {
    const response = await api.get('/admin/azkar', { params });
    return response.data;
  },

  async adminCreateAzkar(data: any): Promise<any> {
    const response = await api.post('/admin/azkar', data);
    return response.data;
  },

  async adminUpdateAzkar(id: number, data: any): Promise<any> {
    const response = await api.put(`/admin/azkar/${id}`, data);
    return response.data;
  },

  async adminDeleteAzkar(id: number): Promise<any> {
    const response = await api.delete(`/admin/azkar/${id}`);
    return response.data;
  },

  async adminImportAzkar(data: any): Promise<any> {
    const response = await api.post('/admin/azkar/import', data);
    return response.data;
  },

  async adminExportAzkar(categoryId?: number): Promise<any> {
    const response = await api.get('/admin/azkar/export', { params: categoryId ? { category_id: categoryId } : {} });
    return response.data;
  },

  // Admin Events
  async adminListEvents(): Promise<any> {
    const response = await api.get('/admin/events');
    return response.data;
  },

  async adminCreateEvent(data: any): Promise<any> {
    const response = await api.post('/admin/events', data);
    return response.data;
  },

  async adminUpdateEvent(id: number, data: any): Promise<any> {
    const response = await api.put(`/admin/events/${id}`, data);
    return response.data;
  },

  async adminDeleteEvent(id: number): Promise<any> {
    const response = await api.delete(`/admin/events/${id}`);
    return response.data;
  },

  async adminGetEventAzkar(eventId: number): Promise<any> {
    const response = await api.get(`/admin/events/${eventId}/azkar`);
    return response.data;
  },

  async adminAddEventAzkar(eventId: number, data: any): Promise<any> {
    const response = await api.post(`/admin/events/${eventId}/azkar`, data);
    return response.data;
  },

  async adminDeleteEventAzkar(eventId: number, azkarId: number): Promise<any> {
    const response = await api.delete(`/admin/events/${eventId}/azkar/${azkarId}`);
    return response.data;
  },

  // Admin Challenges
  async adminListChallenges(): Promise<any> {
    const response = await api.get('/admin/challenges');
    return response.data;
  },

  async adminCreateChallenge(data: any): Promise<any> {
    const response = await api.post('/admin/challenges', data);
    return response.data;
  },

  async adminUpdateChallenge(id: number, data: any): Promise<any> {
    const response = await api.put(`/admin/challenges/${id}`, data);
    return response.data;
  },

  async adminDeleteChallenge(id: number): Promise<any> {
    const response = await api.delete(`/admin/challenges/${id}`);
    return response.data;
  },

  // Admin Users
  async adminListUsers(params?: { search?: string; status?: string; page?: number }): Promise<any> {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async adminGetUser(userId: string): Promise<any> {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  async adminUpdateUserSubscription(userId: string, data: any): Promise<any> {
    const response = await api.put(`/admin/users/${userId}/subscription`, data);
    return response.data;
  },

  async adminBanUser(userId: string, data: any): Promise<any> {
    const response = await api.put(`/admin/users/${userId}/ban`, data);
    return response.data;
  },

  // Admin Exemptions
  async adminListExemptions(params?: { status?: string; page?: number }): Promise<any> {
    const response = await api.get('/admin/exemptions', { params });
    return response.data;
  },

  async adminProcessExemption(id: string, data: any): Promise<any> {
    const response = await api.put(`/admin/exemptions/${id}`, data);
    return response.data;
  },

  async adminExemptionStats(): Promise<any> {
    const response = await api.get('/admin/exemptions/stats');
    return response.data;
  },

  // Admin Notifications
  async adminSendNotification(data: any): Promise<any> {
    const response = await api.post('/admin/notifications/send', data);
    return response.data;
  },

  async adminListNotifications(page?: number): Promise<any> {
    const response = await api.get('/admin/notifications', { params: { page } });
    return response.data;
  },

  async adminGetNotificationSettings(): Promise<any> {
    const response = await api.get('/admin/notifications/auto-settings');
    return response.data;
  },

  async adminUpdateNotificationSettings(data: any): Promise<any> {
    const response = await api.put('/admin/notifications/auto-settings', data);
    return response.data;
  },

  // Admin Settings
  async adminGetSettings(): Promise<any> {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  async adminUpdateSettings(data: any): Promise<any> {
    const response = await api.put('/admin/settings', data);
    return response.data;
  },

  // Admin Backup
  async adminBackup(): Promise<any> {
    const response = await api.get('/admin/backup');
    return response.data;
  },

  async adminRestore(data: any): Promise<any> {
    const response = await api.post('/admin/backup/restore', data);
    return response.data;
  },

  // Admin Logs
  async adminGetLogs(page?: number): Promise<any> {
    const response = await api.get('/admin/logs', { params: { page } });
    return response.data;
  },

  // Admin Categories
  async adminListCategories(): Promise<any> {
    const response = await api.get('/admin/categories');
    return response.data;
  },
};
