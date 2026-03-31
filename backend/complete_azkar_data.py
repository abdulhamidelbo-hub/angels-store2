# app/backend/complete_azkar_data.py
# قاعدة بيانات كاملة للأذكار مع الترجمات (العربية والإنجليزية) وفضل الذكر

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ============================================================
# البيانات الكاملة للأذكار - 14 فئة
# ============================================================

categories_data = [
    {"id": 1, "title": {"ar": "أذكار الصباح", "en": "Morning Adhkar"}, "icon": "sunny", "color": "4A8B6F"},
    {"id": 2, "title": {"ar": "أذكار المساء", "en": "Evening Adhkar"}, "icon": "moon", "color": "5A4A8B"},
    {"id": 3, "title": {"ar": "أذكار بعد الصلاة", "en": "After Prayer Adhkar"}, "icon": "book", "color": "8B6A4A"},
    {"id": 4, "title": {"ar": "أذكار النوم", "en": "Sleeping Adhkar"}, "icon": "bed", "color": "4A6A8B"},
    {"id": 5, "title": {"ar": "أذكار الاستيقاظ", "en": "Waking Up Adhkar"}, "icon": "alarm", "color": "8B4A6A"},
    {"id": 6, "title": {"ar": "أذكار الطعام والشراب", "en": "Eating & Drinking Adhkar"}, "icon": "restaurant", "color": "6A8B4A"},
    {"id": 7, "title": {"ar": "أذكار المنزل", "en": "Home Adhkar"}, "icon": "home", "color": "4A8B8B"},
    {"id": 8, "title": {"ar": "أذكار الخلاء", "en": "Restroom Adhkar"}, "icon": "water", "color": "8B8B4A"},
    {"id": 9, "title": {"ar": "أذكار الوضوء", "en": "Ablution Adhkar"}, "icon": "water-outline", "color": "4A8B5A"},
    {"id": 10, "title": {"ar": "أذكار الأذان", "en": "Adhan Adhkar"}, "icon": "megaphone", "color": "5A8B4A"},
    {"id": 11, "title": {"ar": "أذكار المسجد", "en": "Mosque Adhkar"}, "icon": "business", "color": "8B5A4A"},
    {"id": 12, "title": {"ar": "التسبيحات العامة", "en": "General Tasbeeh"}, "icon": "repeat", "color": "4A5A8B"},
    {"id": 13, "title": {"ar": "جوامع الدعاء", "en": "Comprehensive Duas"}, "icon": "hand-right", "color": "6A4A8B"},
    {"id": 14, "title": {"ar": "سيد الاستغفار", "en": "Sayyid al-Istighfar"}, "icon": "heart", "color": "8B4A5A"},
]

# أذكار الصباح (22 ذكر)
morning_azkar = [
    {
        "arabic": "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
        "translation_en": "We have entered the morning and the entire kingdom belongs to Allah. Praise is to Allah. There is no god but Allah alone, without partner. To Him belongs dominion and praise, and He is over all things competent. My Lord, I ask You for the good of this day and what follows it, and I seek refuge in You from the evil of this day and what follows it. My Lord, I seek refuge in You from laziness and senility. My Lord, I seek refuge in You from the punishment of Fire and the grave.",
        "count": 1, "reference": "مسلم 2723", "counterType": "once",
        "virtue_ar": "من قالها حين يصبح فقد أدى شكر يومه، ومن قالها حين يمسي فقد أدى شكر ليلته.",
        "virtue_en": "Whoever says it in the morning has fulfilled his thanks for the day, and whoever says it in the evening has fulfilled his thanks for the night."
    },
    {
        "arabic": "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.",
        "translation_en": "O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.",
        "count": 1, "reference": "الترمذي 3391", "counterType": "once",
        "virtue_ar": "إقرار بتوحيد الله والاعتماد عليه في كل شؤون الحياة والموت.",
        "virtue_en": "An affirmation of Allah's oneness and reliance on Him in all matters of life and death."
    },
    {
        "arabic": "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.",
        "translation_en": "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant. I am faithful to my covenant and promise as much as I am able. I seek refuge in You from the evil I have done. I acknowledge Your blessings upon me and I confess my sins. Forgive me, for none forgives sins but You.",
        "count": 1, "reference": "البخاري 6306", "counterType": "once",
        "virtue_ar": "سيد الاستغفار، من قالها موقنًا بها في النهار فمات دخل الجنة، ومن قالها في الليل فمات دخل الجنة.",
        "virtue_en": "The master of forgiveness. Whoever says it with certainty during the day and dies will enter Paradise, and likewise at night."
    },
    {
        "arabic": "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.",
        "translation_en": "O Allah, I have reached the morning and I call You, the bearers of Your throne, Your angels, and all Your creation to witness that You are Allah, none has the right to be worshipped except You alone, without partner, and that Muhammad is Your servant and Messenger.",
        "count": 4, "reference": "أبو داود 5069", "counterType": "incremental",
        "virtue_ar": "من قالها أربع مرات أعتقه الله من النار.",
        "virtue_en": "Whoever says it four times, Allah will free him from the Fire."
    },
    {
        "arabic": "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.",
        "translation_en": "O Allah, whatever blessing has been received by me or anyone of Your creation is from You alone, without partner. So for You is all praise and unto You all thanks.",
        "count": 1, "reference": "أبو داود 5075", "counterType": "once",
        "virtue_ar": "من قالها حين يصبح فقد أدى شكر يومه.",
        "virtue_en": "Whoever says it in the morning has fulfilled his thanks for that day."
    },
    {
        "arabic": "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ.",
        "translation_en": "O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health. None has the right to be worshipped except You.",
        "count": 3, "reference": "أبو داود 5090", "counterType": "incremental",
        "virtue_ar": "دعاء جامع للعافية في الجسد والحواس.",
        "virtue_en": "A comprehensive supplication for well-being in body and senses."
    },
    {
        "arabic": "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.",
        "translation_en": "Allah is sufficient for me, none has the right to be worshipped except Him. Upon Him I rely and He is Lord of the exalted throne.",
        "count": 7, "reference": "ابن السني 71", "counterType": "incremental",
        "virtue_ar": "من قالها سبع مرات كفاه الله ما أهمه من أمر الدنيا والآخرة.",
        "virtue_en": "Whoever says it seven times, Allah will suffice him in all matters."
    },
    {
        "arabic": "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
        "translation_en": "In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Hearing, The All-Knowing.",
        "count": 3, "reference": "أبو داود 5088", "counterType": "incremental",
        "virtue_ar": "من قالها ثلاث مرات لم تصبه فجأة بلاء.",
        "virtue_en": "Whoever says it three times will not be afflicted by sudden calamity."
    },
    {
        "arabic": "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.",
        "translation_en": "I am pleased with Allah as a Lord, Islam as a religion and Muhammad (peace be upon him) as a Prophet.",
        "count": 3, "reference": "أبو داود 5073", "counterType": "incremental",
        "virtue_ar": "من قالها كان حقاً على الله أن يرضيه يوم القيامة.",
        "virtue_en": "Whoever says it, it becomes a right upon Allah to please him on the Day of Resurrection."
    },
    {
        "arabic": "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
        "translation_en": "O Ever-Living, O Self-Subsisting, by Your mercy I seek assistance. Rectify for me all of my affairs and do not leave me to myself, even for the blink of an eye.",
        "count": 1, "reference": "النسائي 10469", "counterType": "once",
        "virtue_ar": "دعاء عظيم للتوكل على الله والاستعانة به.",
        "virtue_en": "A great supplication for relying on Allah and seeking His help."
    },
    {
        "arabic": "أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.",
        "translation_en": "We have entered the morning upon the fitrah of Islam, upon the word of sincerity, upon the religion of our Prophet Muhammad, and upon the creed of our father Ibrahim.",
        "count": 1, "reference": "أحمد 3/406", "counterType": "once",
        "virtue_ar": "تجديد للإيمان بالله والثبات على الإسلام.",
        "virtue_en": "A renewal of faith in Allah and steadfastness upon Islam."
    },
    {
        "arabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.",
        "translation_en": "Glory be to Allah and His is the praise, equal to the number of His creation, in accordance with His good pleasure, equal to the weight of His throne, and equal to the ink for His words.",
        "count": 3, "reference": "مسلم 2726", "counterType": "incremental",
        "virtue_ar": "أفضل من قول سبحان الله العادي بأضعاف مضاعفة.",
        "virtue_en": "Better than simply saying 'Glory be to Allah' by many times over."
    },
    {
        "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً.",
        "translation_en": "O Allah, I ask You for beneficial knowledge, goodly provision, and accepted deeds.",
        "count": 1, "reference": "ابن ماجه 925", "counterType": "once",
        "virtue_ar": "دعاء جامع لخير الدنيا والآخرة.",
        "virtue_en": "A comprehensive supplication for the good of this world and the hereafter."
    },
    {
        "arabic": "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.",
        "translation_en": "I seek forgiveness from Allah and repent to Him.",
        "count": 100, "reference": "البخاري 6307", "counterType": "incremental",
        "virtue_ar": "كان النبي ﷺ يستغفر الله في اليوم أكثر من سبعين مرة.",
        "virtue_en": "The Prophet used to seek forgiveness more than seventy times a day."
    },
    {
        "arabic": "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.",
        "translation_en": "O Allah, send prayers and peace upon our Prophet Muhammad.",
        "count": 10, "reference": "تخريج الألباني", "counterType": "incremental",
        "virtue_ar": "من صلى على النبي صلاة صلى الله عليه بها عشراً.",
        "virtue_en": "Whoever sends one prayer upon the Prophet, Allah will send ten upon him."
    },
    {
        "arabic": "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
        "translation_en": "None has the right to be worshipped except Allah alone, without partner. To Him belongs sovereignty and praise, and He is over all things omnipotent.",
        "count": 10, "reference": "البخاري 6403", "counterType": "incremental",
        "virtue_ar": "من قالها عشر مرات كان كمن أعتق أربعة من ولد إسماعيل.",
        "virtue_en": "Whoever says it ten times will be like one who freed four souls."
    },
    {
        "arabic": "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلاَ إِلَهَ إِلاَّ اللَّهُ وَاللَّهُ أَكْبَرُ.",
        "translation_en": "Glory be to Allah, praise be to Allah, there is no god but Allah, and Allah is the Greatest.",
        "count": 100, "reference": "مسلم 2077", "counterType": "incremental",
        "virtue_ar": "أحب الكلام إلى الله.",
        "virtue_en": "The most beloved words to Allah."
    },
    {
        "arabic": "لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ.",
        "translation_en": "There is no might nor power except with Allah.",
        "count": 10, "reference": "البخاري 6384", "counterType": "incremental",
        "virtue_ar": "كنز من كنوز الجنة.",
        "virtue_en": "A treasure from the treasures of Paradise."
    },
    {
        "arabic": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
        "translation_en": "I seek refuge in the perfect words of Allah from the evil of what He has created.",
        "count": 3, "reference": "مسلم 2709", "counterType": "incremental",
        "virtue_ar": "من قالها ثلاث مرات لم يضره شيء.",
        "virtue_en": "Whoever says it three times will not be harmed."
    },
    {
        "arabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
        "translation_en": "Glory be to Allah and His is the praise.",
        "count": 100, "reference": "مسلم 2692", "counterType": "incremental",
        "virtue_ar": "من قالها مائة مرة حطت خطاياه وإن كانت مثل زبد البحر.",
        "virtue_en": "Whoever says it 100 times will have his sins forgiven even if they are like the foam of the sea."
    },
    {
        "arabic": "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، وَبَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ.",
        "translation_en": "O Allah, send prayers upon Muhammad and the family of Muhammad as You sent prayers upon Ibrahim and the family of Ibrahim. Verily You are full of praise and majesty. And send blessings upon Muhammad and the family of Muhammad as You sent blessings upon Ibrahim and the family of Ibrahim. Verily You are full of praise and majesty.",
        "count": 1, "reference": "البخاري 3370", "counterType": "once",
        "virtue_ar": "الصلاة الإبراهيمية الكاملة، أفضل صيغ الصلاة على النبي.",
        "virtue_en": "The complete Ibrahimic prayer, the best formula for sending prayers upon the Prophet."
    }
]

# أذكار بعد الصلاة
after_prayer_azkar = [
    {
        "arabic": "أَسْتَغْفِرُ اللهَ، أَسْتَغْفِرُ اللهَ، أَسْتَغْفِرُ اللهَ. اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ.",
        "translation_en": "I seek forgiveness from Allah (three times). O Allah, You are Peace and from You is peace. Blessed are You, O Owner of majesty and honor.",
        "count": 1, "reference": "مسلم 591", "counterType": "once",
        "virtue_ar": "كان النبي ﷺ إذا انصرف من صلاته استغفر ثلاثاً وقال هذا الذكر.",
        "virtue_en": "The Prophet used to seek forgiveness three times after prayer and say this remembrance."
    },
    {
        "arabic": "آية الكرسي: اللهُ لا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ...",
        "translation_en": "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence...",
        "count": 1, "reference": "النسائي", "counterType": "once",
        "virtue_ar": "من قرأها دبر كل صلاة لم يمنعه من دخول الجنة إلا الموت.",
        "virtue_en": "Whoever recites it after every prayer, nothing prevents him from entering Paradise except death."
    },
    {
        "arabic": "سُبْحَانَ اللهِ (33)، الْحَمْدُ لِلَّهِ (33)، اللهُ أَكْبَرُ (33)، لا إِلَهَ إِلَّا اللهُ وَحْدَهُ لا شَرِيكَ لَهُ...",
        "translation_en": "Glory be to Allah (33), Praise be to Allah (33), Allah is the Greatest (33), then: None has the right to be worshipped except Allah alone...",
        "count": 1, "reference": "مسلم 597", "counterType": "once",
        "virtue_ar": "غفرت خطاياه وإن كانت مثل زبد البحر.",
        "virtue_en": "His sins will be forgiven even if they are like the foam of the sea."
    },
    {
        "arabic": "قُلْ هُوَ اللَّهُ أَحَدٌ، قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، قُلْ أَعُوذُ بِرَبِّ النَّاسِ.",
        "translation_en": "Surah Al-Ikhlas, Surah Al-Falaq, Surah An-Nas.",
        "count": 1, "reference": "أبو داود 1523", "counterType": "once",
        "virtue_ar": "تقرأ مرة بعد كل صلاة، وثلاث مرات بعد الفجر والمغرب.",
        "virtue_en": "To be recited once after each prayer, and three times after Fajr and Maghrib."
    },
    {
        "arabic": "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ.",
        "translation_en": "O Allah, help me to remember You, to thank You, and to worship You in the best manner.",
        "count": 1, "reference": "أبو داود 1522", "counterType": "once",
        "virtue_ar": "أوصى النبي ﷺ معاذاً بهذا الدعاء دبر كل صلاة.",
        "virtue_en": "The Prophet advised Muadh to say this after every prayer."
    }
]

# التسبيحات العامة
general_tasbeeh = [
    {"arabic": "سُبْحَانَ اللَّهِ", "translation_en": "Glory be to Allah", "count": 33, "reference": "متفق عليه", "counterType": "incremental", "virtue_ar": "التسبيح تنزيه لله عن كل نقص.", "virtue_en": "Tasbeeh is exalting Allah from any imperfection."},
    {"arabic": "الْحَمْدُ لِلَّهِ", "translation_en": "Praise be to Allah", "count": 33, "reference": "متفق عليه", "counterType": "incremental", "virtue_ar": "الحمد لله تملأ الميزان.", "virtue_en": "Praise be to Allah fills the scale."},
    {"arabic": "اللَّهُ أَكْبَرُ", "translation_en": "Allah is the Greatest", "count": 33, "reference": "متفق عليه", "counterType": "incremental", "virtue_ar": "التكبير إقرار بعظمة الله.", "virtue_en": "Takbir is an acknowledgment of Allah's greatness."},
    {"arabic": "لا إِلَهَ إِلَّا اللَّهُ", "translation_en": "There is no god but Allah", "count": 100, "reference": "متفق عليه", "counterType": "incremental", "virtue_ar": "أفضل ما قلت أنا والنبيون من قبلي.", "virtue_en": "The best that I and the prophets before me have said."},
    {"arabic": "لا حَوْلَ وَلا قُوَّةَ إِلاَّ بِاللَّهِ", "translation_en": "There is no might nor power except with Allah", "count": 100, "reference": "متفق عليه", "counterType": "incremental", "virtue_ar": "كنز من كنوز الجنة.", "virtue_en": "A treasure from the treasures of Paradise."},
    {"arabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", "translation_en": "Glory be to Allah and His is the praise", "count": 100, "reference": "مسلم 2692", "counterType": "incremental", "virtue_ar": "من قالها مائة مرة حطت خطاياه.", "virtue_en": "Whoever says it 100 times will have his sins forgiven."},
    {"arabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ", "translation_en": "Glory be to Allah and His praise, Glory be to Allah the Most Great", "count": 100, "reference": "البخاري 6406", "counterType": "incremental", "virtue_ar": "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان.", "virtue_en": "Two phrases light on the tongue, heavy in the scale."},
    {"arabic": "أَسْتَغْفِرُ اللَّهَ", "translation_en": "I seek forgiveness from Allah", "count": 100, "reference": "مسلم 2702", "counterType": "incremental", "virtue_ar": "من لزم الاستغفار جعل الله له من كل هم فرجاً.", "virtue_en": "Whoever maintains seeking forgiveness, Allah will make for him a relief from every distress."}
]

# سيد الاستغفار
sayyid_istighfar = [
    {
        "arabic": "اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
        "translation_en": "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant. I am faithful to my covenant and promise as much as I am able. I seek refuge in You from the evil I have done. I acknowledge Your blessings upon me and I confess my sins. Forgive me, for none forgives sins but You.",
        "count": 1, "reference": "البخاري 6306", "counterType": "once",
        "virtue_ar": "سيد الاستغفار، من قالها موقنًا بها في النهار فمات دخل الجنة، ومن قالها في الليل فمات دخل الجنة.",
        "virtue_en": "The master of forgiveness. Whoever says it with certainty during the day and dies will enter Paradise, and likewise at night."
    }
]


def convert_morning_to_evening(morning_items):
    """تحويل أذكار الصباح إلى أذكار المساء"""
    evening_items = []
    for item in morning_items:
        new_item = item.copy()
        arabic = item["arabic"]
        arabic = arabic.replace("أَصْبَحْنَا", "أَمْسَيْنَا")
        arabic = arabic.replace("أَصْبَحَ", "أَمْسَى")
        arabic = arabic.replace("أَصْبَحْتُ", "أَمْسَيْتُ")
        arabic = arabic.replace("هَذَا الْيَوْمِ", "هَذِهِ اللَّيْلَةِ")
        arabic = arabic.replace("النُّشُورُ", "الْمَصِيرُ")
        new_item["arabic"] = arabic
        
        if "translation_en" in item:
            en_trans = item["translation_en"]
            en_trans = en_trans.replace("morning", "evening")
            en_trans = en_trans.replace("day", "night")
            new_item["translation_en"] = en_trans
        
        if "virtue_ar" in item:
            virtue_ar = item["virtue_ar"]
            virtue_ar = virtue_ar.replace("يصبح", "يمسي")
            virtue_ar = virtue_ar.replace("يومه", "ليلته")
            new_item["virtue_ar"] = virtue_ar
        
        if "virtue_en" in item:
            virtue_en = item["virtue_en"]
            virtue_en = virtue_en.replace("morning", "evening")
            virtue_en = virtue_en.replace("day", "night")
            new_item["virtue_en"] = virtue_en
            
        evening_items.append(new_item)
    return evening_items


async def seed_complete_database():
    """تعبئة قاعدة البيانات الكاملة"""
    
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'adkar_app')
    
    if not mongo_url:
        print("خطأ: MONGO_URL غير موجود")
        return False
    
    print("جاري الاتصال بقاعدة البيانات...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        print("حذف البيانات القديمة...")
        await db.categories.delete_many({})
        await db.azkar.delete_many({})
        
        print("إضافة التصنيفات...")
        for cat in categories_data:
            await db.categories.insert_one({
                "id": cat["id"],
                "name_ar": cat["title"]["ar"],
                "name_en": cat["title"]["en"],
                "title": cat["title"],
                "icon_name": cat["icon"],
                "color_hex": cat["color"],
                "display_order": cat["id"]
            })
        
        print("إضافة الأذكار...")
        azkar_id = 1
        
        # Category 1: أذكار الصباح
        for item in morning_azkar:
            await db.azkar.insert_one({
                "id": azkar_id, "category_id": 1,
                "arabic_text": item["arabic"],
                "translation_en": item.get("translation_en"),
                "repeat_count": item["count"],
                "reference_ar": item["reference"],
                "counter_type": item["counterType"],
                "virtue_ar": item.get("virtue_ar"),
                "virtue_en": item.get("virtue_en"),
                "is_favorite": False
            })
            azkar_id += 1
        
        # Category 2: أذكار المساء
        for item in convert_morning_to_evening(morning_azkar):
            await db.azkar.insert_one({
                "id": azkar_id, "category_id": 2,
                "arabic_text": item["arabic"],
                "translation_en": item.get("translation_en"),
                "repeat_count": item["count"],
                "reference_ar": item["reference"],
                "counter_type": item["counterType"],
                "virtue_ar": item.get("virtue_ar"),
                "virtue_en": item.get("virtue_en"),
                "is_favorite": False
            })
            azkar_id += 1
        
        # Category 3: أذكار بعد الصلاة
        for item in after_prayer_azkar:
            await db.azkar.insert_one({
                "id": azkar_id, "category_id": 3,
                "arabic_text": item["arabic"],
                "translation_en": item.get("translation_en"),
                "repeat_count": item["count"],
                "reference_ar": item["reference"],
                "counter_type": item["counterType"],
                "virtue_ar": item.get("virtue_ar"),
                "virtue_en": item.get("virtue_en"),
                "is_favorite": False
            })
            azkar_id += 1
        
        # Category 12: التسبيحات العامة
        for item in general_tasbeeh:
            await db.azkar.insert_one({
                "id": azkar_id, "category_id": 12,
                "arabic_text": item["arabic"],
                "translation_en": item.get("translation_en"),
                "repeat_count": item["count"],
                "reference_ar": item["reference"],
                "counter_type": item["counterType"],
                "virtue_ar": item.get("virtue_ar"),
                "virtue_en": item.get("virtue_en"),
                "is_favorite": False
            })
            azkar_id += 1
        
        # Category 14: سيد الاستغفار
        for item in sayyid_istighfar:
            await db.azkar.insert_one({
                "id": azkar_id, "category_id": 14,
                "arabic_text": item["arabic"],
                "translation_en": item.get("translation_en"),
                "repeat_count": item["count"],
                "reference_ar": item["reference"],
                "counter_type": item["counterType"],
                "virtue_ar": item.get("virtue_ar"),
                "virtue_en": item.get("virtue_en"),
                "is_favorite": False
            })
            azkar_id += 1
        
        cat_count = await db.categories.count_documents({})
        azkar_count = await db.azkar.count_documents({})
        print(f"\n=== ملخص التعبئة ===")
        print(f"عدد التصنيفات: {cat_count}")
        print(f"عدد الأذكار: {azkar_count}")
        
        return True
        
    except Exception as e:
        print(f"خطأ: {e}")
        return False
    finally:
        client.close()


if __name__ == "__main__":
    print("=" * 50)
    print("تعبئة قاعدة البيانات الكاملة")
    print("=" * 50)
    asyncio.run(seed_complete_database())
