import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
  ar: {
    translation: {
      // Common
      'app_name': 'أذكار المسلم',
      'back': 'رجوع',
      'next': 'التالي',
      'skip': 'تخطي',
      'done': 'تم',
      'close': 'إغلاق',
      'loading': 'جاري التحميل...',
      
      // Home
      'home': 'الرئيسية',
      'categories': 'التصنيفات',
      'challenges': 'التحديات',
      'stats': 'الإحصائيات',
      'settings': 'الإعدادات',
      
      // Tasbeeh
      'tasbeeh_touch': 'العد باللمس',
      'tasbeeh_voice': 'العد بالصوت',
      'tasbeeh_ai': 'المساعد الذكي',
      'count': 'العدد',
      'reset': 'إعادة',
      'target': 'الهدف',
      
      // Categories
      'morning_adhkar': 'أذكار الصباح',
      'evening_adhkar': 'أذكار المساء',
      'after_prayer': 'أذكار بعد الصلاة',
      'sleeping': 'أذكار النوم',
      'waking_up': 'أذكار الاستيقاظ',
      'eating_drinking': 'أذكار الطعام والشراب',
      'home_adhkar': 'أذكار المنزل',
      'restroom': 'أذكار الخلاء',
      'ablution': 'أذكار الوضوء',
      'adhan': 'أذكار الأذان',
      'mosque': 'أذكار المسجد',
      'general_tasbeeh': 'التسبيحات العامة',
      'comprehensive_duas': 'جوامع الدعاء',
      'master_istighfar': 'سيد الاستغفار',
      
      // Subscription
      'subscription': 'الاشتراك',
      'exemption_button': 'ليس عندي مال - سأدعو لصانع البرنامج',
      'exemption_granted': 'بارك الله فيك، تقبل الله دعاءك',
      
      // Prayer Times
      'prayer_times': 'مواقيت الصلاة',
      'fajr': 'الفجر',
      'dhuhr': 'الظهر',
      'asr': 'العصر',
      'maghrib': 'المغرب',
      'isha': 'العشاء',
    },
  },
  en: {
    translation: {
      // Common
      'app_name': 'Muslim Adhkar',
      'back': 'Back',
      'next': 'Next',
      'skip': 'Skip',
      'done': 'Done',
      'close': 'Close',
      'loading': 'Loading...',
      
      // Home
      'home': 'Home',
      'categories': 'Categories',
      'challenges': 'Challenges',
      'stats': 'Statistics',
      'settings': 'Settings',
      
      // Tasbeeh
      'tasbeeh_touch': 'Touch Count',
      'tasbeeh_voice': 'Voice Count',
      'tasbeeh_ai': 'AI Assistant',
      'count': 'Count',
      'reset': 'Reset',
      'target': 'Target',
      
      // Categories
      'morning_adhkar': 'Morning Adhkar',
      'evening_adhkar': 'Evening Adhkar',
      'after_prayer': 'After Prayer Adhkar',
      'sleeping': 'Sleeping Adhkar',
      'waking_up': 'Waking Up Adhkar',
      'eating_drinking': 'Eating & Drinking Adhkar',
      'home_adhkar': 'Home Adhkar',
      'restroom': 'Restroom Adhkar',
      'ablution': 'Ablution Adhkar',
      'adhan': 'Adhan Adhkar',
      'mosque': 'Mosque Adhkar',
      'general_tasbeeh': 'General Tasbeeh',
      'comprehensive_duas': 'Comprehensive Duas',
      'master_istighfar': 'Master of Istighfar',
      
      // Subscription
      'subscription': 'Subscription',
      'exemption_button': 'I cannot pay - I will pray for the developer',
      'exemption_granted': 'May Allah bless you, your prayer is accepted',
      
      // Prayer Times
      'prayer_times': 'Prayer Times',
      'fajr': 'Fajr',
      'dhuhr': 'Dhuhr',
      'asr': 'Asr',
      'maghrib': 'Maghrib',
      'isha': 'Isha',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: (() => {
      try {
        const locale = Localization.locale;
        return locale ? locale.split('-')[0] : 'ar';
      } catch {
        return 'ar';
      }
    })(),
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
