# تطبيق أذكار المسلم - وثيقة المتطلبات والتوثيق الشامل

═══════════════════════════════════════════════════════════════════
## تأكيد حفظ العمل - مشروع الأذكار اليومية
═══════════════════════════════════════════════════════════════════

**التاريخ:** 1 أبريل 2026

### ✅ تم حفظ جميع التعديلات التالية:
- **قاعدة البيانات:** تم الحفظ / الموقع: `/app/database_backup_20260401/`
- **المستودع:** يرجى استخدام زر "Save to GitHub" في واجهة Emergent
- **التوثيق:** تم (هذا الملف)

### 📊 حالة المشروع:
| العنصر | المكتمل | الإجمالي |
|--------|---------|----------|
| الفئات | 14 | 14 ✅ |
| الأذكار | 87 | 87 ✅ |
| ترجمات الفضل | 87 | 87 ✅ |
| اللغات المدعومة | 10 | 10 ✅ |

### 📋 المهام المتبقية للعودة:
1. ~~إضافة ترجمات الفضل لجميع الأذكار~~ ✅ (مكتمل)
2. دمج إعلانات AdMob
3. إنشاء التوثيق الشامل
4. التسبيح الصوتي المستمر

---

## 1. نظرة عامة على المشروع

### 1.1 اسم التطبيق
**أذكار المسلم (Adkar Al Muslim)**

### 1.2 الوصف
تطبيق إسلامي شامل للأذكار اليومية يدعم 10 لغات عالمية، مع الحفاظ على النص الأصلي للأذكار بالعربية.

### 1.3 القاعدة الدينية الصارمة ⚠️
**النص الأساسي للذكر يجب أن يبقى بالعربية فقط** - لا تترجم نص الذكر الفعلي أبداً.

---

## 2. المتطلبات التقنية

### 2.1 التقنيات المستخدمة
```
Frontend:
├── React Native + Expo
├── Expo Router (file-based routing)
├── react-i18next (الترجمة)
├── react-native-reanimated (الحركات)
├── expo-speech (النطق الصوتي)
└── Web Speech API (للمتصفح)

Backend:
├── FastAPI (Python)
├── Motor (MongoDB async driver)
└── MongoDB

Database:
└── MongoDB (test_database)
```

### 2.2 هيكل الملفات الرئيسية
```
/app
├── backend/
│   ├── server.py                    # الخادم الرئيسي
│   ├── complete_virtue_translations.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx          # تخطيط التبويبات
│   │   │   ├── categories.tsx       # شاشة الفئات
│   │   │   ├── index.tsx            # الصفحة الرئيسية
│   │   │   └── settings.tsx         # الإعدادات
│   │   └── azkar/[id].tsx           # تفاصيل الذكر
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/ListenButton.tsx  # زر الاستماع
│   │   │   └── ads/AdManager.tsx    # مدير الإعلانات
│   │   ├── services/
│   │   │   └── speechService.ts     # خدمة النطق
│   │   └── i18n/
│   │       ├── index.ts
│   │       ├── languages.ts
│   │       └── locales/             # ملفات الترجمة
│   │           ├── ar.json
│   │           ├── en.json
│   │           ├── fr.json
│   │           ├── tr.json
│   │           ├── ur.json
│   │           ├── id.json
│   │           ├── bn.json
│   │           ├── ms.json
│   │           ├── sw.json
│   │           └── ha.json
│   └── package.json
├── database_backup_20260401/        # النسخة الاحتياطية
└── memory/
    └── PRD.md                       # هذا الملف
```

---

## 3. قاعدة البيانات

### 3.1 المجموعات (Collections)

#### categories
```javascript
{
  _id: ObjectId,
  name_ar: String,      // الاسم بالعربية
  name_en: String,      // الاسم بالإنجليزية
  name_fr: String,      // الاسم بالفرنسية
  name_tr: String,      // الاسم بالتركية
  name_ur: String,      // الاسم بالأردية
  name_id: String,      // الاسم بالإندونيسية
  name_bn: String,      // الاسم بالبنغالية
  name_ms: String,      // الاسم بالملايوية
  name_sw: String,      // الاسم بالسواحيلية
  name_ha: String,      // الاسم بالهوسا
  icon: String,
  order: Number
}
```

#### azkar
```javascript
{
  _id: ObjectId,
  category_id: Number,   // رقم الفئة (1-14)
  text_ar: String,       // نص الذكر بالعربية (لا يُترجم!)
  count: Number,         // عدد التكرار
  virtue_ar: String,     // فضل الذكر بالعربية
  virtue_en: String,     // فضل الذكر بالإنجليزية
  virtue_fr: String,     // فضل الذكر بالفرنسية
  virtue_tr: String,     // فضل الذكر بالتركية
  virtue_ur: String,     // فضل الذكر بالأردية
  virtue_id: String,     // فضل الذكر بالإندونيسية
  virtue_bn: String,     // فضل الذكر بالبنغالية
  virtue_ms: String,     // فضل الذكر بالملايوية
  virtue_sw: String,     // فضل الذكر بالسواحيلية
  virtue_ha: String,     // فضل الذكر بالهوسا
  source: String,        // المصدر (البخاري، مسلم، إلخ)
  order: Number
}
```

### 3.2 إحصائيات قاعدة البيانات
| الفئة | عدد الأذكار |
|-------|-------------|
| أذكار الصباح | 21 |
| أذكار المساء | 21 |
| أذكار بعد الصلاة | 5 |
| أذكار النوم | 5 |
| أذكار الاستيقاظ | 3 |
| أذكار الطعام والشراب | 4 |
| أذكار المنزل | 3 |
| أذكار الخلاء | 2 |
| أذكار الوضوء | 3 |
| أذكار الأذان | 3 |
| أذكار المسجد | 3 |
| التسبيحات العامة | 8 |
| جوامع الدعاء | 5 |
| سيد الاستغفار | 1 |
| **الإجمالي** | **87** |

---

## 4. واجهات API

### 4.1 نقاط النهاية (Endpoints)

```
GET  /api/categories              # جلب جميع الفئات
GET  /api/categories/{id}         # جلب فئة محددة
GET  /api/azkar/category/{id}     # جلب أذكار فئة معينة
GET  /api/azkar/{id}              # جلب ذكر محدد
GET  /api/languages               # جلب اللغات المدعومة
POST /api/stats/tasbeeh           # حفظ إحصائيات التسبيح
GET  /api/stats/daily             # جلب الإحصائيات اليومية
```

---

## 5. اللغات المدعومة

| الرمز | اللغة | الاتجاه | رمز النطق |
|-------|-------|---------|-----------|
| ar | العربية | RTL | ar-SA |
| en | English | LTR | en-US |
| fr | Français | LTR | fr-FR |
| tr | Türkçe | LTR | tr-TR |
| ur | اردو | RTL | ur-PK |
| id | Bahasa Indonesia | LTR | id-ID |
| bn | বাংলা | LTR | bn-BD |
| ms | Bahasa Melayu | LTR | ms-MY |
| sw | Kiswahili | LTR | sw-KE |
| ha | Hausa | LTR | ha-NG |

---

## 6. المهام المكتملة ✅

1. ✅ إنشاء قاعدة البيانات مع 14 فئة و87 ذكر
2. ✅ دعم 10 لغات عالمية
3. ✅ نظام i18n متكامل
4. ✅ تصميم متجاوب لشاشة تفاصيل الذكر
5. ✅ خاصية الاستماع للأذكار (TTS)
6. ✅ دعم Web Speech API للمتصفح
7. ✅ ترجمة فضل الذكر لجميع الـ 87 ذكر بـ 10 لغات
8. ✅ شاشة اختيار اللغة
9. ✅ دعم RTL للغات العربية والأردية

---

## 7. المهام المتبقية (للمتابعة)

### 🔴 الأولوية القصوى (P0):
1. **دمج إعلانات AdMob:**
   - Banner في أسفل شاشة الفئات
   - Native في شاشة الإعدادات
   - Interstitial كل 3 فئات
   - ⚠️ **قاعدة صارمة:** لا إعلانات في صفحات قراءة الأذكار

   **معرفات اختبار AdMob:**
   - Banner: `ca-app-pub-3940256099942544/6300978111`
   - Interstitial: `ca-app-pub-3940256099942544/1033173712`
   - Native: `ca-app-pub-3940256099942544/2247696110`

### 🟡 الأولوية المتوسطة (P1):
2. إنشاء توثيق شامل للمستخدم النهائي

### 🟢 الأولوية المنخفضة (P2):
3. التسبيح الصوتي المستمر والانتقال التلقائي

---

## 8. ملاحظات مهمة للمطور

### 8.1 قاعدة البيانات
- اسم قاعدة البيانات: `test_database`
- النسخة الاحتياطية: `/app/database_backup_20260401/`

### 8.2 تشغيل المشروع
```bash
# Backend
cd /app/backend
sudo supervisorctl restart backend

# Frontend
cd /app/frontend
sudo supervisorctl restart expo
```

### 8.3 روابط المعاينة
- Frontend: `https://tasbeeh-mobile-1.preview.emergentagent.com`
- Backend API: `https://tasbeeh-mobile-1.preview.emergentagent.com/api/`

---

## 9. تعليمات العودة للمشروع

1. **افتح المحادثة السابقة** من حساب Emergent
2. **أو استورد من GitHub** إذا تم الحفظ هناك
3. **استعد قاعدة البيانات** (إذا لزم الأمر):
   ```bash
   mongorestore --db=test_database /app/database_backup_20260401/test_database/
   ```
4. **أعد تشغيل الخدمات:**
   ```bash
   sudo supervisorctl restart backend
   sudo supervisorctl restart expo
   ```

---

**آخر تحديث:** 1 أبريل 2026
**الإصدار:** 1.0.0
