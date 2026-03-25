// قائمة اللغات المدعومة (30 لغة)
export interface Language {
  code: string;
  nameNative: string;
  nameEn: string;
  nameAr: string;
  flag: string;
  isRTL: boolean;
  speechCode: string; // For Text-to-Speech
}

export const LANGUAGES: Language[] = [
  { code: 'ar', nameNative: 'العربية', nameEn: 'Arabic', nameAr: 'العربية', flag: '🇸🇦', isRTL: true, speechCode: 'ar-SA' },
  { code: 'en', nameNative: 'English', nameEn: 'English', nameAr: 'الإنجليزية', flag: '🇺🇸', isRTL: false, speechCode: 'en-US' },
  { code: 'tr', nameNative: 'Türkçe', nameEn: 'Turkish', nameAr: 'التركية', flag: '🇹🇷', isRTL: false, speechCode: 'tr-TR' },
  { code: 'fr', nameNative: 'Français', nameEn: 'French', nameAr: 'الفرنسية', flag: '🇫🇷', isRTL: false, speechCode: 'fr-FR' },
  { code: 'de', nameNative: 'Deutsch', nameEn: 'German', nameAr: 'الألمانية', flag: '🇩🇪', isRTL: false, speechCode: 'de-DE' },
  { code: 'es', nameNative: 'Español', nameEn: 'Spanish', nameAr: 'الإسبانية', flag: '🇪🇸', isRTL: false, speechCode: 'es-ES' },
  { code: 'it', nameNative: 'Italiano', nameEn: 'Italian', nameAr: 'الإيطالية', flag: '🇮🇹', isRTL: false, speechCode: 'it-IT' },
  { code: 'pt', nameNative: 'Português', nameEn: 'Portuguese', nameAr: 'البرتغالية', flag: '🇧🇷', isRTL: false, speechCode: 'pt-BR' },
  { code: 'ru', nameNative: 'Русский', nameEn: 'Russian', nameAr: 'الروسية', flag: '🇷🇺', isRTL: false, speechCode: 'ru-RU' },
  { code: 'zh', nameNative: '中文', nameEn: 'Chinese', nameAr: 'الصينية', flag: '🇨🇳', isRTL: false, speechCode: 'zh-CN' },
  { code: 'ja', nameNative: '日本語', nameEn: 'Japanese', nameAr: 'اليابانية', flag: '🇯🇵', isRTL: false, speechCode: 'ja-JP' },
  { code: 'ko', nameNative: '한국어', nameEn: 'Korean', nameAr: 'الكورية', flag: '🇰🇷', isRTL: false, speechCode: 'ko-KR' },
  { code: 'hi', nameNative: 'हिन्दी', nameEn: 'Hindi', nameAr: 'الهندية', flag: '🇮🇳', isRTL: false, speechCode: 'hi-IN' },
  { code: 'bn', nameNative: 'বাংলা', nameEn: 'Bengali', nameAr: 'البنغالية', flag: '🇧🇩', isRTL: false, speechCode: 'bn-BD' },
  { code: 'ur', nameNative: 'اردو', nameEn: 'Urdu', nameAr: 'الأردية', flag: '🇵🇰', isRTL: true, speechCode: 'ur-PK' },
  { code: 'fa', nameNative: 'فارسی', nameEn: 'Persian', nameAr: 'الفارسية', flag: '🇮🇷', isRTL: true, speechCode: 'fa-IR' },
  { code: 'id', nameNative: 'Indonesia', nameEn: 'Indonesian', nameAr: 'الإندونيسية', flag: '🇮🇩', isRTL: false, speechCode: 'id-ID' },
  { code: 'ms', nameNative: 'Melayu', nameEn: 'Malay', nameAr: 'الماليزية', flag: '🇲🇾', isRTL: false, speechCode: 'ms-MY' },
  { code: 'sw', nameNative: 'Kiswahili', nameEn: 'Swahili', nameAr: 'السواحيلية', flag: '🇰🇪', isRTL: false, speechCode: 'sw-KE' },
  { code: 'ha', nameNative: 'Hausa', nameEn: 'Hausa', nameAr: 'الهوسا', flag: '🇳🇬', isRTL: false, speechCode: 'ha-NG' },
  { code: 'yo', nameNative: 'Yorùbá', nameEn: 'Yoruba', nameAr: 'اليوروبا', flag: '🇳🇬', isRTL: false, speechCode: 'yo-NG' },
  { code: 'am', nameNative: 'አማርኛ', nameEn: 'Amharic', nameAr: 'الأمهرية', flag: '🇪🇹', isRTL: false, speechCode: 'am-ET' },
  { code: 'si', nameNative: 'සිංහල', nameEn: 'Sinhala', nameAr: 'السنهالية', flag: '🇱🇰', isRTL: false, speechCode: 'si-LK' },
  { code: 'th', nameNative: 'ไทย', nameEn: 'Thai', nameAr: 'التايلاندية', flag: '🇹🇭', isRTL: false, speechCode: 'th-TH' },
  { code: 'vi', nameNative: 'Tiếng Việt', nameEn: 'Vietnamese', nameAr: 'الفيتنامية', flag: '🇻🇳', isRTL: false, speechCode: 'vi-VN' },
  { code: 'pl', nameNative: 'Polski', nameEn: 'Polish', nameAr: 'البولندية', flag: '🇵🇱', isRTL: false, speechCode: 'pl-PL' },
  { code: 'nl', nameNative: 'Nederlands', nameEn: 'Dutch', nameAr: 'الهولندية', flag: '🇳🇱', isRTL: false, speechCode: 'nl-NL' },
  { code: 'sv', nameNative: 'Svenska', nameEn: 'Swedish', nameAr: 'السويدية', flag: '🇸🇪', isRTL: false, speechCode: 'sv-SE' },
  { code: 'el', nameNative: 'Ελληνικά', nameEn: 'Greek', nameAr: 'اليونانية', flag: '🇬🇷', isRTL: false, speechCode: 'el-GR' },
  { code: 'he', nameNative: 'עברית', nameEn: 'Hebrew', nameAr: 'العبرية', flag: '🇮🇱', isRTL: true, speechCode: 'he-IL' },
];

export const POPULAR_LANGUAGES = ['ar', 'en', 'tr', 'fr', 'ur', 'id', 'ms', 'hi', 'bn'];

export const RTL_LANGUAGES = LANGUAGES.filter(lang => lang.isRTL).map(lang => lang.code);

export const getLanguageByCode = (code: string): Language | undefined => {
  return LANGUAGES.find(lang => lang.code === code);
};

export const isRTLLanguage = (code: string): boolean => {
  return RTL_LANGUAGES.includes(code);
};
