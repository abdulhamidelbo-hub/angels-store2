import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// تصميم "أذكار المسلم" الاحترافي
export const THEME = {
  // === الألوان الرئيسية ===
  colors: {
    // الخلفيات
    background: '#F9F7F0', // رمال فاتح
    backgroundDark: '#1A1F2E',
    surface: '#FFFFFF',
    surfaceDark: '#252D3D',
    
    // الألوان الأساسية
    primary: '#4A8B6F', // أخضر زيتي
    primaryLight: '#5A9B7F',
    primaryDark: '#3A7B5F',
    
    // الذهبي المميز
    gold: '#D4B483',
    goldLight: '#E4C493',
    goldDark: '#C4A473',
    
    // ألوان النصوص
    text: '#2D3436',
    textDark: '#F5F5F5',
    textSecondary: '#636E72',
    textMuted: '#B2BEC3',
    
    // ألوان التدرجات
    gradientStart: '#4A8B6F',
    gradientEnd: '#D4B483',
    
    // ألوان الحالة
    success: '#00B894',
    warning: '#FDCB6E',
    error: '#E17055',
    info: '#74B9FF',
    
    // الحدود والظلال
    border: '#E8E4DE',
    shadow: '#2D3436',
    overlay: 'rgba(0,0,0,0.5)',
    
    // ألوان الفئات
    morning: '#F6D365',
    evening: '#764BA2',
    prayer: '#4A8B6F',
    sleep: '#2C3E50',
    wakeup: '#F093FB',
    food: '#5AB9EA',
    home: '#A8E6CF',
    tasbeeh: '#D4B483',
  },
  
  // === التدرجات ===
  gradients: {
    primary: ['#4A8B6F', '#3A7B5F'] as const,
    gold: ['#D4B483', '#C4A473'] as const,
    header: ['#4A8B6F', '#5A9B7F', '#D4B483'] as const,
    sunrise: ['#F6D365', '#FDA085'] as const,
    sunset: ['#A18CD1', '#FBC2EB'] as const,
    night: ['#2C3E50', '#4CA1AF'] as const,
    success: ['#00B894', '#55EFC4'] as const,
    card: ['#FFFFFF', '#F9F7F0'] as const,
  },
  
  // === الظلال ===
  shadows: {
    small: {
      shadowColor: '#2D3436',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#2D3436',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#2D3436',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    glow: {
      shadowColor: '#4A8B6F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    goldGlow: {
      shadowColor: '#D4B483',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
  },
  
  // === الأبعاد ===
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // === الحواف المدورة ===
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
    full: 9999,
  },
  
  // === أحجام الخطوط ===
  typography: {
    // العناوين
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    
    // النصوص
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    
    // الأذكار
    azkar: {
      fontSize: 22,
      fontWeight: '400' as const,
      lineHeight: 38,
    },
    azkarLarge: {
      fontSize: 26,
      fontWeight: '400' as const,
      lineHeight: 44,
    },
    
    // الأرقام
    counter: {
      fontSize: 72,
      fontWeight: '700' as const,
      lineHeight: 80,
    },
    counterSmall: {
      fontSize: 48,
      fontWeight: '700' as const,
      lineHeight: 56,
    },
  },
  
  // === الأبعاد التفاعلية ===
  touchable: {
    minHeight: 48,
    minWidth: 48,
  },
  
  // === أبعاد الشاشة ===
  screen: {
    width,
    height,
    isSmall: width < 375,
    isMedium: width >= 375 && width < 414,
    isLarge: width >= 414,
  },
  
  // === مدة الحركات ===
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

// تصدير الألوان للتوافق مع الكود القديم
export const COLORS = THEME.colors;
export const GRADIENTS = THEME.gradients;
export const SHADOWS = THEME.shadows;
