# 📋 دليل إعداد نظام الدفع - أذكار المسلم
## RevenueCat + Stripe + App Store + Google Play

---

## 📌 المتطلبات الأساسية

| المتطلب | التكلفة | الرابط |
|---------|---------|--------|
| حساب Apple Developer | $99/سنة | https://developer.apple.com |
| حساب Google Play Console | $25 مرة واحدة | https://play.google.com/console |
| حساب RevenueCat | مجاني (حتى $2,500/شهر) | https://revenuecat.com |
| حساب Stripe | مجاني (رسوم 2.9%+$0.30/عملية) | https://stripe.com |

---

## المرحلة 1: إنشاء حساب RevenueCat

### الخطوة 1: التسجيل
1. اذهب إلى https://app.revenuecat.com/signup
2. سجل حساب جديد (يمكنك استخدام حساب Google)
3. أنشئ مشروع جديد باسم: **"Adkar Al Muslim"**

### الخطوة 2: إنشاء تطبيق iOS
1. في لوحة RevenueCat → Apps → **New App**
2. اختر **Apple App Store**
3. أدخل **App Bundle ID**: `com.yourname.adkaralmuslim` (نفس الموجود في app.json)
4. أدخل **App Store Connect Shared Secret**:
   - اذهب إلى App Store Connect → Apps → اختر التطبيق → App Information
   - Shared Secret → Generate
   - انسخ المفتاح وضعه في RevenueCat

### الخطوة 3: إنشاء تطبيق Android
1. في لوحة RevenueCat → Apps → **New App**
2. اختر **Google Play Store**
3. أدخل **Package Name**: `com.yourname.adkaralmuslim`
4. ارفع **Service Account JSON** من Google Cloud Console

### الخطوة 4: نسخ مفاتيح API
1. في RevenueCat → Project → API Keys
2. انسخ **iOS Public API Key**: `appl_xxxxxxxxxxxxxxxx`
3. انسخ **Android Public API Key**: `goog_xxxxxxxxxxxxxxxx`

---

## المرحلة 2: إعداد منتج الاشتراك

### في App Store Connect (iOS):
1. اذهب إلى App Store Connect → My Apps → اختر التطبيق
2. Subscriptions → Subscription Groups → **Create Subscription Group**
   - اسم المجموعة: **Adkar Premium**
3. أنشئ اشتراك جديد:
   - **Reference Name**: Yearly Subscription
   - **Product ID**: `yearly_subscription_0_50`
   - **Subscription Duration**: 1 Year
   - **Price**: $0.49 (أقرب سعر متاح لـ $0.50)
4. أضف الوصف:
   - عربي: "اشتراك سنوي - جميع الميزات بدون إعلانات"
   - English: "Yearly subscription - All features, no ads"

### في Google Play Console (Android):
1. اذهب إلى Google Play Console → اختر التطبيق
2. Monetize → Products → Subscriptions
3. **Create Subscription**:
   - **Product ID**: `yearly_subscription_0_50`
   - **Name**: Yearly Subscription / اشتراك سنوي
   - **Description**: جميع الميزات بدون إعلانات
4. **Add Base Plan**:
   - **Billing Period**: 1 Year
   - **Price**: $0.49

### في RevenueCat:
1. Products → **New Product**:
   - **App Store Product ID**: `yearly_subscription_0_50`
   - **Play Store Product ID**: `yearly_subscription_0_50`
2. Entitlements → **New Entitlement**:
   - **Identifier**: `premium_access`
   - Attach the product
3. Offerings → **Default Offering**:
   - **Package**: Annual
   - Attach the product

---

## المرحلة 3: إعداد Stripe لاستلام الأموال

### الخطوة 1: إنشاء حساب Stripe
1. اذهب إلى https://dashboard.stripe.com/register
2. أنشئ حساب جديد
3. أكمل التحقق من الهوية (Stripe يدعم معظم دول العالم)

### الخطوة 2: إضافة الحساب المصرفي
1. Stripe Dashboard → Settings → Business settings → Bank accounts
2. أضف حسابك البنكي:
   - اسم البنك
   - رقم الحساب / IBAN
   - العملة المحلية

### الخطوة 3: ربط Stripe مع الإيرادات
> **ملاحظة مهمة**: الأموال من App Store/Play Store تصل مباشرة إلى:
> - **Apple**: حساب Apple Developer (يحتاج ربط حساب بنكي في App Store Connect)
> - **Google**: حساب Google Play Console (يحتاج ربط حساب بنكي في Payments Profile)
> 
> Stripe يُستخدم كبديل للدفع عبر الويب أو كخدمة لتتبع الإيرادات.

### طريقة استلام الأموال:
| المتجر | طريقة الاستلام | الرسوم | وقت التحويل |
|--------|---------------|--------|-------------|
| App Store | تحويل بنكي شهري | 30% عمولة Apple | بعد 33 يوم |
| Play Store | تحويل بنكي شهري | 15% عمولة Google* | بعد 30 يوم |
| Stripe (ويب) | تحويل بنكي | 2.9% + $0.30 | 2-7 أيام |

*Google تأخذ 15% فقط على أول مليون دولار سنوياً

---

## المرحلة 4: إضافة المفاتيح في التطبيق

### الخطوة 1: تحديث ملف RevenueCat
افتح الملف: `frontend/src/services/revenueCat.ts`
وغيّر المفاتيح:

```typescript
const REVENUECAT_API_KEY_IOS = 'appl_xxxxxxxxxxxxx'; // من RevenueCat
const REVENUECAT_API_KEY_ANDROID = 'goog_xxxxxxxxxxxxx'; // من RevenueCat
```

### الخطوة 2: إعداد Webhook
1. في RevenueCat → Project → Integrations → Webhooks
2. أضف Webhook URL: `https://your-server-url/api/subscription/revenuecat-webhook`
3. هذا سيُعلمك تلقائياً عند كل عملية شراء

---

## المرحلة 5: اختبار الدفع

### اختبار iOS (Sandbox):
1. في App Store Connect → Users → Sandbox Testers
2. أنشئ Sandbox Tester
3. على الجهاز: Settings → App Store → Sandbox Account
4. جرب الشراء من التطبيق

### اختبار Android (Test Tracks):
1. في Google Play Console → Testing → Internal testing
2. أضف بريدك الإلكتروني كـ Tester
3. جرب الشراء من التطبيق

---

## 📊 ملخص سريع

### بعد الإعداد، هذا ما سيحدث:

1. **المستخدم يضغط "اشترك الآن"** →
2. **تظهر نافذة Apple Pay / Google Pay** →
3. **يتم الدفع عبر المتجر** →
4. **RevenueCat يستقبل التأكيد** →
5. **RevenueCat يرسل Webhook لخادمك** →
6. **الخادم يُحدّث حالة الاشتراك** →
7. **المستخدم يحصل على الميزات المدفوعة** →
8. **الأموال تصل لحسابك البنكي شهرياً** ✅

### الميزة العبقرية (الإعفاء):
1. **المستخدم يضغط الزر الذهبي** →
2. **يكتب دعاءه لصانع البرنامج** →
3. **يُسجل في قاعدة البيانات** →
4. **تظهر لك في لوحة التحكم** →
5. **يمكنك الموافقة أو الرفض** →
6. **المستخدم يحصل على سنة مجانية** ✅

---

## 🔒 الأمان

- جميع المدفوعات تمر عبر Apple/Google (لا تلمس خوادمنا أبداً)
- بيانات البطاقات لا تُخزن في التطبيق
- RevenueCat يتعامل مع التحقق من صحة الإيصالات
- Webhook مشفر بين RevenueCat والخادم

---

## 💱 العملات المدعومة

- RevenueCat يدعم جميع العملات المتاحة في App Store/Play Store
- المستخدم يرى السعر بالعملة المحلية تلقائياً
- التحويل يتم بواسطة Apple/Google
- يمكنك تحديد أسعار مختلفة لكل دولة

---

وفقنا الله وإياكم لما يحبه ويرضاه 🤲
