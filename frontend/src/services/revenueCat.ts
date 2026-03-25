import { Platform, Alert } from 'react-native';

// RevenueCat configuration
const REVENUECAT_API_KEY_IOS = 'YOUR_REVENUECAT_IOS_API_KEY';
const REVENUECAT_API_KEY_ANDROID = 'YOUR_REVENUECAT_ANDROID_API_KEY';
const PRODUCT_ID = 'yearly_subscription_0_50';
const ENTITLEMENT_ID = 'premium_access';

let Purchases: any = null;
let isConfigured = false;

/**
 * Initialize RevenueCat SDK
 * Call this once when the app starts
 */
export const initializeRevenueCat = async (userId?: string): Promise<boolean> => {
  try {
    // Dynamic import - only load if available (won't work in Expo Go)
    const RNPurchases = require('react-native-purchases');
    Purchases = RNPurchases.default || RNPurchases;
    
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
    
    if (apiKey === 'YOUR_REVENUECAT_IOS_API_KEY' || apiKey === 'YOUR_REVENUECAT_ANDROID_API_KEY') {
      console.log('[RevenueCat] Not configured - using mock mode');
      isConfigured = false;
      return false;
    }
    
    await Purchases.configure({
      apiKey,
      appUserID: userId || null,
    });
    
    isConfigured = true;
    console.log('[RevenueCat] Configured successfully');
    return true;
  } catch (error) {
    console.log('[RevenueCat] Not available in this environment:', error);
    isConfigured = false;
    return false;
  }
};

/**
 * Check if RevenueCat is configured and available
 */
export const isRevenueCatAvailable = (): boolean => {
  return isConfigured && Purchases !== null;
};

/**
 * Get available offerings/packages
 */
export const getOfferings = async (): Promise<any> => {
  if (!isRevenueCatAvailable()) {
    return {
      current: {
        identifier: 'default',
        availablePackages: [{
          identifier: 'yearly',
          product: {
            title: '\u0627\u0634\u062a\u0631\u0627\u0643 \u0633\u0646\u0648\u064a',
            description: '\u0627\u0634\u062a\u0631\u0627\u0643 \u0633\u0646\u0648\u064a \u0628\u0646\u0635\u0641 \u062f\u0648\u0644\u0627\u0631',
            priceString: '$0.50',
            price: 0.50,
            currencyCode: 'USD',
            identifier: PRODUCT_ID,
          },
          packageType: 'ANNUAL',
        }],
      },
    };
  }
  
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('[RevenueCat] Error fetching offerings:', error);
    return null;
  }
};

/**
 * Purchase a subscription package
 */
export const purchaseSubscription = async (): Promise<{
  success: boolean;
  customerInfo?: any;
  error?: string;
  transactionId?: string;
}> => {
  if (!isRevenueCatAvailable()) {
    return {
      success: false,
      error: 'NOT_CONFIGURED',
    };
  }
  
  try {
    const offerings = await Purchases.getOfferings();
    
    if (!offerings?.current?.availablePackages?.length) {
      return { success: false, error: 'NO_PACKAGES' };
    }
    
    const annualPackage = offerings.current.availablePackages[0];
    const { customerInfo } = await Purchases.purchasePackage(annualPackage);
    
    // Check if premium entitlement is active
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    
    return {
      success: isPremium,
      customerInfo,
      transactionId: customerInfo.originalAppUserId,
    };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, error: 'USER_CANCELLED' };
    }
    console.error('[RevenueCat] Purchase error:', error);
    return { success: false, error: error.message || 'PURCHASE_FAILED' };
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<{
  success: boolean;
  customerInfo?: any;
  error?: string;
}> => {
  if (!isRevenueCatAvailable()) {
    return { success: false, error: 'NOT_CONFIGURED' };
  }
  
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: isPremium, customerInfo };
  } catch (error: any) {
    console.error('[RevenueCat] Restore error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check current subscription status via RevenueCat
 */
export const checkSubscriptionStatus = async (): Promise<{
  isActive: boolean;
  expirationDate?: string;
  productId?: string;
}> => {
  if (!isRevenueCatAvailable()) {
    return { isActive: false };
  }
  
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    
    return {
      isActive: !!entitlement,
      expirationDate: entitlement?.expirationDate,
      productId: entitlement?.productIdentifier,
    };
  } catch (error) {
    console.error('[RevenueCat] Status check error:', error);
    return { isActive: false };
  }
};

/**
 * Log in user to RevenueCat (sync user ID)
 */
export const loginUser = async (userId: string): Promise<void> => {
  if (!isRevenueCatAvailable()) return;
  
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error('[RevenueCat] Login error:', error);
  }
};

export default {
  initializeRevenueCat,
  isRevenueCatAvailable,
  getOfferings,
  purchaseSubscription,
  restorePurchases,
  checkSubscriptionStatus,
  loginUser,
};
