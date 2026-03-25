export interface Category {
  id: number;
  name_ar: string;
  name_en: string;
  icon_name?: string;
  display_order: number;
  color_hex: string;
}

export interface Azkar {
  id?: number;
  category_id: number;
  arabic_text: string;
  transliteration?: string;
  repeat_count: number;
  virtue_ar?: string;
  virtue_en?: string;
  reference_ar?: string;
  reference_en?: string;
  is_favorite: boolean;
}

export interface IslamicEvent {
  id: number;
  name_ar: string;
  name_en: string;
  hijri_month?: number;
  hijri_day?: number;
  description_ar?: string;
  description_en?: string;
  notification_days: number;
  is_active: boolean;
}

export interface TasbeehCount {
  method: 'touch' | 'voice' | 'ai';
  count: number;
  zikr_id?: number;
  timestamp?: string;
}

export interface DailyStats {
  date: string;
  total_tasbeeh: number;
  voice_tasbeeh_count: number;
  touch_tasbeeh_count: number;
  ai_tasbeeh_count: number;
  completed_azkar_count: number;
  xp_earned: number;
}

export interface Challenge {
  id: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  required_count: number;
  reward_xp: number;
  reward_badge?: string;
  is_active: boolean;
}

export interface PrayerTimes {
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface SubscriptionInfo {
  user_id?: string;
  install_date: string;
  subscription_status: 'trial' | 'active' | 'exemption' | 'expired';
  trial_end_date: string;
  subscription_end_date?: string;
  is_lifetime: boolean;
  exemption_used: boolean;
  exemption_date?: string;
}
