# app/backend/azkar_multilingual_data.py
# قاعدة بيانات الأذكار مع دعم الترجمة وفضل الذكر
# اللغتان: العربية والإنجليزية

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ============================================================
# البيانات الكاملة للأذكار مع الترجمات
# ============================================================

azkar_data = {
    "categories": [
        {
            "id": 1,
            "title": {"ar": "أذكار الصباح", "en": "Morning Adhkar"},
            "icon": "sunny",
            "color": "4A8B6F",
            "items": [
                {
                    "id": 101,
                    "arabic": "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
                    "translation": {"en": "We have entered the morning and the entire kingdom belongs to Allah. Praise is to Allah. There is no god but Allah alone, without partner. To Him belongs dominion and to Him belongs praise, and He is over all things competent. My Lord, I ask You for the good of this day and the good of what follows it, and I seek refuge in You from the evil of this day and the evil of what follows it. My Lord, I seek refuge in You from laziness and senility. My Lord, I seek refuge in You from punishment in the Fire and punishment in the grave."},
                    "count": 1,
                    "reference": "مسلم 2723",
                    "counterType": "once",
                    "virtue": {
                        "ar": "من قالها حين يصبح فقد أدى شكر يومه، ومن قالها حين يمسي فقد أدى شكر ليلته.",
                        "en": "Whoever says it in the morning has fulfilled his thanks for the day, and whoever says it in the evening has fulfilled his thanks for the night."
                    }
                },
                {
                    "id": 102,
                    "arabic": "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.",
                    "translation": {"en": "O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection."},
                    "count": 1,
                    "reference": "الترمذي 3391",
                    "counterType": "once",
                    "virtue": {
                        "ar": "إقرار بتوحيد الله والاعتماد عليه في كل شؤون الحياة والموت، وأن المرجع إليه وحده.",
                        "en": "An affirmation of Allah's oneness and dependence on Him in all matters of life and death, and that the return is to Him alone."
                    }
                },
                {
                    "id": 103,
                    "arabic": "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.",
                    "translation": {"en": "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant. I am faithful to my covenant and promise to You as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge before You all Your blessings upon me, and I confess to You my sins. So forgive me, for none forgives sins but You."},
                    "count": 1,
                    "reference": "البخاري 6306",
                    "counterType": "once",
                    "virtue": {
                        "ar": "سيد الاستغفار، من قالها موقنًا بها في النهار فمات من يومه دخل الجنة، ومن قالها موقنًا بها في الليل فمات من ليلته دخل الجنة.",
                        "en": "The master of supplication for forgiveness. Whoever says it with certainty during the day and dies that day will enter Paradise, and whoever says it with certainty at night and dies that night will enter Paradise."
                    }
                },
                {
                    "id": 104,
                    "arabic": "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.",
                    "translation": {"en": "O Allah, verily I have reached the morning and call on You, the bearers of Your throne, Your angels, and all of Your creation to witness that You are Allah, none has the right to be worshipped except You alone, without partner, and that Muhammad is Your servant and Messenger."},
                    "count": 4,
                    "reference": "أبو داود 5069",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "من قالها أربع مرات أعتقه الله من النار.",
                        "en": "Whoever says it four times, Allah will free him from the Fire."
                    }
                },
                {
                    "id": 105,
                    "arabic": "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.",
                    "translation": {"en": "O Allah, whatever blessing has been received by me or anyone of Your creation is from You alone, without partner. So for You is all praise and unto You all thanks."},
                    "count": 1,
                    "reference": "أبو داود 5075",
                    "counterType": "once",
                    "virtue": {
                        "ar": "من قالها حين يصبح فقد أدى شكر يومه، ومن قالها حين يمسي فقد أدى شكر ليلته.",
                        "en": "Whoever says it in the morning has fulfilled his thanks for the day, and whoever says it in the evening has fulfilled his thanks for the night."
                    }
                },
                {
                    "id": 106,
                    "arabic": "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ.",
                    "translation": {"en": "O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health. None has the right to be worshipped except You. O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. None has the right to be worshipped except You."},
                    "count": 3,
                    "reference": "أبو داود 5090",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "دعاء جامع للعافية في الجسد والحواس والحماية من الكفر والفقر وعذاب القبر.",
                        "en": "A comprehensive supplication for well-being in body and senses, and protection from disbelief, poverty, and the punishment of the grave."
                    }
                },
                {
                    "id": 107,
                    "arabic": "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.",
                    "translation": {"en": "Allah is sufficient for me, none has the right to be worshipped except Him. Upon Him I rely and He is Lord of the exalted throne."},
                    "count": 7,
                    "reference": "ابن السني 71",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "من قالها حين يصبح وحين يمسي سبع مرات كفاه الله ما أهمه من أمر الدنيا والآخرة.",
                        "en": "Whoever says it seven times in the morning and evening, Allah will suffice him in all matters of this world and the hereafter."
                    }
                },
                {
                    "id": 108,
                    "arabic": "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
                    "translation": {"en": "In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Hearing, The All-Knowing."},
                    "count": 3,
                    "reference": "أبو داود 5088",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "من قالها ثلاث مرات حين يصبح وحين يمسي لم تصبه فجأة بلاء.",
                        "en": "Whoever says it three times in the morning and evening will not be afflicted by sudden calamity."
                    }
                },
                {
                    "id": 109,
                    "arabic": "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.",
                    "translation": {"en": "I am pleased with Allah as a Lord, Islam as a religion and Muhammad (peace be upon him) as a Prophet."},
                    "count": 3,
                    "reference": "أبو داود 5073",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "من قالها حين يصبح وحين يمسي كان حقاً على الله أن يرضيه يوم القيامة.",
                        "en": "Whoever says it in the morning and evening, it becomes a right upon Allah to please him on the Day of Resurrection."
                    }
                },
                {
                    "id": 110,
                    "arabic": "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
                    "translation": {"en": "O Ever-Living, O Self-Subsisting and Supporter of all, by Your mercy I seek assistance. Rectify for me all of my affairs and do not leave me to myself, even for the blink of an eye."},
                    "count": 1,
                    "reference": "النسائي 10469",
                    "counterType": "once",
                    "virtue": {
                        "ar": "دعاء عظيم للتوكل على الله والاستعانة به في جميع الأمور.",
                        "en": "A great supplication for relying on Allah and seeking His help in all affairs."
                    }
                },
                {
                    "id": 111,
                    "arabic": "أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.",
                    "translation": {"en": "We have entered the morning upon the fitrah (natural disposition) of Islam, upon the word of sincerity, upon the religion of our Prophet Muhammad (peace be upon him), and upon the creed of our father Ibrahim, inclining toward truth, a Muslim, and he was not of those who associate others with Allah."},
                    "count": 1,
                    "reference": "أحمد 3/406",
                    "counterType": "once",
                    "virtue": {
                        "ar": "تجديد للإيمان بالله والثبات على دين الإسلام.",
                        "en": "A renewal of faith in Allah and steadfastness upon the religion of Islam."
                    }
                },
                {
                    "id": 112,
                    "arabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.",
                    "translation": {"en": "Glory be to Allah and His is the praise, equal to the number of His creation, in accordance with His good pleasure, equal to the weight of His throne, and equal to the ink that may be used in recording the words (for His praises)."},
                    "count": 3,
                    "reference": "مسلم 2726",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "أفضل من قول سبحان الله العادي بأضعاف مضاعفة.",
                        "en": "Better than simply saying 'Glory be to Allah' by many times over."
                    }
                },
                {
                    "id": 113,
                    "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً.",
                    "translation": {"en": "O Allah, I ask You for beneficial knowledge, goodly provision, and accepted deeds."},
                    "count": 1,
                    "reference": "ابن ماجه 925",
                    "counterType": "once",
                    "virtue": {
                        "ar": "دعاء جامع لخير الدنيا والآخرة: العلم النافع والرزق الحلال والعمل المقبول.",
                        "en": "A comprehensive supplication for the good of this world and the hereafter: beneficial knowledge, lawful provision, and accepted deeds."
                    }
                },
                {
                    "id": 114,
                    "arabic": "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.",
                    "translation": {"en": "I seek forgiveness from Allah and repent to Him."},
                    "count": 100,
                    "reference": "البخاري 6307",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "كان النبي صلى الله عليه وسلم يستغفر الله في اليوم أكثر من سبعين مرة.",
                        "en": "The Prophet (peace be upon him) used to seek forgiveness from Allah more than seventy times a day."
                    }
                },
                {
                    "id": 115,
                    "arabic": "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.",
                    "translation": {"en": "O Allah, send prayers and peace upon our Prophet Muhammad."},
                    "count": 10,
                    "reference": "تخريج الألباني",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "من صلى على النبي صلاة واحدة صلى الله عليه بها عشراً.",
                        "en": "Whoever sends one prayer upon the Prophet, Allah will send ten prayers upon him."
                    }
                },
                {
                    "id": 116,
                    "arabic": "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
                    "translation": {"en": "None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent."},
                    "count": 10,
                    "reference": "البخاري 6403",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "من قالها في يوم عشر مرات كان كمن أعتق أربعة أنفس من ولد إسماعيل.",
                        "en": "Whoever says it ten times in a day will be like one who freed four souls from the descendants of Ismail."
                    }
                },
                {
                    "id": 117,
                    "arabic": "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلاَ إِلَهَ إِلاَّ اللَّهُ وَاللَّهُ أَكْبَرُ.",
                    "translation": {"en": "Glory be to Allah, praise be to Allah, there is no god but Allah, and Allah is the Greatest."},
                    "count": 100,
                    "reference": "مسلم 2077",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "أحب الكلام إلى الله: سبحان الله والحمد لله ولا إله إلا الله والله أكبر.",
                        "en": "The most beloved words to Allah: Glory be to Allah, praise be to Allah, there is no god but Allah, and Allah is the Greatest."
                    }
                },
                {
                    "id": 118,
                    "arabic": "لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ.",
                    "translation": {"en": "There is no might nor power except with Allah, the Most High, the Most Great."},
                    "count": 10,
                    "reference": "البخاري 6384",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "كنز من كنوز الجنة.",
                        "en": "A treasure from the treasures of Paradise."
                    }
                },
                {
                    "id": 119,
                    "arabic": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
                    "translation": {"en": "I seek refuge in the perfect words of Allah from the evil of what He has created."},
                    "count": 3,
                    "reference": "مسلم 2709",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "من قالها حين يمسي ثلاث مرات لم يضره شيء في تلك الليلة.",
                        "en": "Whoever says it three times in the evening, nothing will harm him that night."
                    }
                },
                {
                    "id": 120,
                    "arabic": "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، وَبَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ.",
                    "translation": {"en": "O Allah, send prayers upon Muhammad and upon the family of Muhammad, as You sent prayers upon Ibrahim and upon the family of Ibrahim. Verily, You are full of praise and majesty. O Allah, send blessings upon Muhammad and upon the family of Muhammad, as You sent blessings upon Ibrahim and upon the family of Ibrahim. Verily, You are full of praise and majesty."},
                    "count": 1,
                    "reference": "البخاري 3370",
                    "counterType": "once",
                    "virtue": {
                        "ar": "الصلاة الإبراهيمية كاملة، أفضل صيغ الصلاة على النبي.",
                        "en": "The complete Ibrahimic prayer, the best formula for sending prayers upon the Prophet."
                    }
                },
                {
                    "id": 121,
                    "arabic": "اللَّهُمَّ إِنِّي أَصْبَحْتُ فِي نِعْمَةٍ وَعَافِيَةٍ وَسِتْرٍ، فَأَتِمَّ نِعْمَتَكَ عَلَيَّ وَعَافِيَتَكَ وَسَتْرَكَ فِي الدُّنْيَا وَالآخِرَةِ.",
                    "translation": {"en": "O Allah, I have entered the morning with blessings, health, and concealment (of my faults). So complete Your blessings upon me, Your health, and Your concealment in this world and the hereafter."},
                    "count": 1,
                    "reference": "ابن السني 71",
                    "counterType": "once",
                    "virtue": {
                        "ar": "دعاء شامل لطلب استمرار النعم والعافية والستر.",
                        "en": "A comprehensive supplication asking for the continuation of blessings, health, and concealment of faults."
                    }
                },
                {
                    "id": 122,
                    "arabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
                    "translation": {"en": "Glory be to Allah and His is the praise."},
                    "count": 100,
                    "reference": "مسلم 2692",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "من قالها حين يصبح وحين يمسي مائة مرة لم يأت أحد يوم القيامة بأفضل مما جاء به، إلا من قال مثل ما قال أو زاد عليه.",
                        "en": "Whoever says it one hundred times in the morning and evening, no one will come on the Day of Resurrection with anything better than what he has brought, except for one who has said the same or more."
                    }
                }
            ]
        },
        {
            "id": 2,
            "title": {"ar": "أذكار المساء", "en": "Evening Adhkar"},
            "icon": "moon",
            "color": "5A4A8B",
            "items": []  # سيتم ملؤها تلقائياً من أذكار الصباح
        },
        {
            "id": 3,
            "title": {"ar": "أذكار بعد الصلاة", "en": "After Prayer Adhkar"},
            "icon": "book",
            "color": "8B6A4A",
            "items": [
                {
                    "id": 301,
                    "arabic": "أَسْتَغْفِرُ اللهَ (ثلاثاً)، اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ.",
                    "translation": {"en": "I seek forgiveness from Allah (three times). O Allah, You are Peace and from You is peace. Blessed are You, O Owner of majesty and honor."},
                    "count": 1,
                    "reference": "مسلم 591",
                    "counterType": "once",
                    "virtue": {
                        "ar": "كان النبي صلى الله عليه وسلم إذا انصرف من صلاته استغفر ثلاثاً وقال هذا الذكر.",
                        "en": "The Prophet (peace be upon him) used to seek forgiveness three times after prayer and say this remembrance."
                    }
                },
                {
                    "id": 302,
                    "arabic": "آية الكرسي: اللهُ لا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلاَّ بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ.",
                    "translation": {"en": "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His throne extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great."},
                    "count": 1,
                    "reference": "النسائي - صحيح",
                    "counterType": "once",
                    "virtue": {
                        "ar": "من قرأ آية الكرسي دبر كل صلاة لم يمنعه من دخول الجنة إلا الموت.",
                        "en": "Whoever recites Ayat al-Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death."
                    }
                },
                {
                    "id": 303,
                    "arabic": "سُبْحَانَ اللهِ (33)، الْحَمْدُ لِلَّهِ (33)، اللهُ أَكْبَرُ (33)، لا إِلَهَ إِلَّا اللهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
                    "translation": {"en": "Glory be to Allah (33 times), Praise be to Allah (33 times), Allah is the Greatest (33 times), then say: None has the right to be worshipped except Allah, alone, without partner. To Him belongs dominion and to Him belongs praise, and He is over all things omnipotent."},
                    "count": 1,
                    "reference": "مسلم 597",
                    "counterType": "once",
                    "virtue": {
                        "ar": "من سبح الله في دبر كل صلاة ثلاثاً وثلاثين وحمد الله ثلاثاً وثلاثين وكبر الله ثلاثاً وثلاثين فتلك تسعة وتسعون ثم قال تمام المائة لا إله إلا الله... غفرت خطاياه وإن كانت مثل زبد البحر.",
                        "en": "Whoever glorifies Allah 33 times, praises Allah 33 times, and magnifies Allah 33 times after each prayer, that makes 99, then completes the hundred by saying 'None has the right to be worshipped except Allah...' - his sins will be forgiven even if they are like the foam of the sea."
                    }
                },
                {
                    "id": 304,
                    "arabic": "قُلْ هُوَ اللَّهُ أَحَدٌ، وَقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، وَقُلْ أَعُوذُ بِرَبِّ النَّاسِ.",
                    "translation": {"en": "Say: He is Allah, the One (Surah Al-Ikhlas), Say: I seek refuge in the Lord of daybreak (Surah Al-Falaq), Say: I seek refuge in the Lord of mankind (Surah An-Nas)."},
                    "count": 3,
                    "reference": "أبو داود 1523",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "تقرأ مرة واحدة بعد كل صلاة، وثلاث مرات بعد صلاتي الفجر والمغرب.",
                        "en": "To be recited once after each prayer, and three times after Fajr and Maghrib prayers."
                    }
                },
                {
                    "id": 305,
                    "arabic": "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ.",
                    "translation": {"en": "O Allah, help me to remember You, to thank You, and to worship You in the best manner."},
                    "count": 1,
                    "reference": "أبو داود 1522",
                    "counterType": "once",
                    "virtue": {
                        "ar": "أوصى النبي صلى الله عليه وسلم معاذاً بهذا الدعاء دبر كل صلاة.",
                        "en": "The Prophet (peace be upon him) advised Muadh to say this supplication after every prayer."
                    }
                }
            ]
        },
        {
            "id": 12,
            "title": {"ar": "التسبيحات العامة", "en": "General Tasbeeh"},
            "icon": "repeat",
            "color": "4A5A8B",
            "items": [
                {
                    "id": 1201,
                    "arabic": "سُبْحَانَ اللَّهِ",
                    "translation": {"en": "Glory be to Allah"},
                    "count": 33,
                    "reference": "متفق عليه",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "التسبيح تنزيه لله عن كل نقص، وهو من أحب الكلام إلى الله.",
                        "en": "Tasbeeh is exalting Allah from any imperfection, and it is among the most beloved words to Allah."
                    }
                },
                {
                    "id": 1202,
                    "arabic": "الْحَمْدُ لِلَّهِ",
                    "translation": {"en": "Praise be to Allah"},
                    "count": 33,
                    "reference": "متفق عليه",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "الحمد لله تملأ الميزان.",
                        "en": "Praise be to Allah fills the scale."
                    }
                },
                {
                    "id": 1203,
                    "arabic": "اللَّهُ أَكْبَرُ",
                    "translation": {"en": "Allah is the Greatest"},
                    "count": 33,
                    "reference": "متفق عليه",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "التكبير إقرار بعظمة الله وأنه أكبر من كل شيء.",
                        "en": "Takbir is an acknowledgment of Allah's greatness and that He is greater than everything."
                    }
                },
                {
                    "id": 1204,
                    "arabic": "لا إِلَهَ إِلَّا اللَّهُ",
                    "translation": {"en": "There is no god but Allah"},
                    "count": 100,
                    "reference": "متفق عليه",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "أفضل ما قلت أنا والنبيون من قبلي: لا إله إلا الله.",
                        "en": "The best that I and the prophets before me have said: There is no god but Allah."
                    }
                },
                {
                    "id": 1205,
                    "arabic": "لا حَوْلَ وَلا قُوَّةَ إِلاَّ بِاللَّهِ",
                    "translation": {"en": "There is no might nor power except with Allah"},
                    "count": 100,
                    "reference": "متفق عليه",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "كنز من كنوز الجنة.",
                        "en": "A treasure from the treasures of Paradise."
                    }
                },
                {
                    "id": 1206,
                    "arabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
                    "translation": {"en": "Glory be to Allah and His is the praise"},
                    "count": 100,
                    "reference": "مسلم 2692",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "من قالها مائة مرة حطت خطاياه وإن كانت مثل زبد البحر.",
                        "en": "Whoever says it one hundred times will have his sins forgiven even if they are like the foam of the sea."
                    }
                },
                {
                    "id": 1207,
                    "arabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
                    "translation": {"en": "Glory be to Allah and His is the praise, Glory be to Allah the Most Great"},
                    "count": 100,
                    "reference": "البخاري 6406",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن.",
                        "en": "Two phrases that are light on the tongue, heavy in the scale, and beloved to the Most Merciful."
                    }
                },
                {
                    "id": 1208,
                    "arabic": "أَسْتَغْفِرُ اللَّهَ",
                    "translation": {"en": "I seek forgiveness from Allah"},
                    "count": 100,
                    "reference": "مسلم 2702",
                    "counterType": "incremental",
                    "virtue": {
                        "ar": "من لزم الاستغفار جعل الله له من كل هم فرجاً ومن كل ضيق مخرجاً.",
                        "en": "Whoever maintains seeking forgiveness, Allah will make for him a relief from every distress and a way out from every difficulty."
                    }
                }
            ]
        },
        {
            "id": 14,
            "title": {"ar": "سيد الاستغفار", "en": "Sayyid al-Istighfar"},
            "icon": "heart",
            "color": "8B4A5A",
            "items": [
                {
                    "id": 1401,
                    "arabic": "اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
                    "translation": {"en": "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant. I am faithful to my covenant and promise to You as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge before You all Your blessings upon me, and I confess to You my sins. So forgive me, for none forgives sins but You."},
                    "count": 1,
                    "reference": "البخاري 6306",
                    "counterType": "once",
                    "virtue": {
                        "ar": "سيد الاستغفار، من قالها موقنًا بها في النهار فمات من يومه قبل أن يمسي دخل الجنة، ومن قالها موقنًا بها في الليل فمات من ليلته قبل أن يصبح دخل الجنة.",
                        "en": "The master of supplication for forgiveness. Whoever says it with certainty during the day and dies before evening will enter Paradise, and whoever says it with certainty at night and dies before morning will enter Paradise."
                    }
                }
            ]
        }
    ]
}


def convert_morning_to_evening(morning_items):
    """تحويل أذكار الصباح إلى أذكار المساء"""
    evening_items = []
    evening_id_start = 201
    
    for item in morning_items:
        new_item = item.copy()
        new_item["id"] = evening_id_start
        
        # تحويل النص العربي
        arabic = item["arabic"]
        arabic = arabic.replace("أَصْبَحْنَا", "أَمْسَيْنَا")
        arabic = arabic.replace("أَصْبَحَ", "أَمْسَى")
        arabic = arabic.replace("أَصْبَحْتُ", "أَمْسَيْتُ")
        arabic = arabic.replace("هَذَا الْيَوْمِ", "هَذِهِ اللَّيْلَةِ")
        arabic = arabic.replace("النُّشُورُ", "الْمَصِيرُ")
        new_item["arabic"] = arabic
        
        # تحويل الترجمة الإنجليزية
        if "translation" in item:
            en_trans = item["translation"].get("en", "")
            en_trans = en_trans.replace("morning", "evening")
            en_trans = en_trans.replace("day", "night")
            en_trans = en_trans.replace("resurrection", "return")
            new_item["translation"] = {"en": en_trans}
        
        # تحويل نص الفضل
        if "virtue" in item:
            virtue = item["virtue"].copy()
            virtue_ar = virtue.get("ar", "")
            virtue_ar = virtue_ar.replace("يصبح", "يمسي")
            virtue_ar = virtue_ar.replace("يومه", "ليلته")
            virtue["ar"] = virtue_ar
            
            virtue_en = virtue.get("en", "")
            virtue_en = virtue_en.replace("morning", "evening")
            virtue_en = virtue_en.replace("day", "night")
            virtue["en"] = virtue_en
            new_item["virtue"] = virtue
        
        evening_items.append(new_item)
        evening_id_start += 1
    
    return evening_items


# تعيين أذكار المساء من أذكار الصباح
azkar_data["categories"][1]["items"] = convert_morning_to_evening(azkar_data["categories"][0]["items"])


async def seed_multilingual_database():
    """تعبئة قاعدة البيانات بالأذكار متعددة اللغات"""
    
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'adkar_app')
    
    if not mongo_url:
        print("خطأ: MONGO_URL غير موجود")
        return False
    
    print("جاري الاتصال بقاعدة البيانات...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # حذف البيانات القديمة
        print("حذف البيانات القديمة...")
        await db.categories.delete_many({})
        await db.azkar.delete_many({})
        
        # إضافة التصنيفات والأذكار
        print("إضافة البيانات الجديدة...")
        
        total_azkar = 0
        
        for cat in azkar_data["categories"]:
            # إضافة التصنيف
            category_doc = {
                "id": cat["id"],
                "name_ar": cat["title"]["ar"],
                "name_en": cat["title"]["en"],
                "title": cat["title"],  # للدعم متعدد اللغات
                "icon_name": cat["icon"],
                "color_hex": cat["color"],
                "display_order": cat["id"]
            }
            await db.categories.insert_one(category_doc)
            
            # إضافة الأذكار
            for item in cat["items"]:
                azkar_doc = {
                    "id": item["id"],
                    "category_id": cat["id"],
                    "arabic_text": item["arabic"],
                    "translation": item.get("translation", {}),
                    "repeat_count": item["count"],
                    "reference_ar": item["reference"],
                    "counter_type": item["counterType"],
                    "virtue": item.get("virtue", {}),
                    "is_favorite": False
                }
                await db.azkar.insert_one(azkar_doc)
                total_azkar += 1
        
        print(f"تم إضافة {len(azkar_data['categories'])} تصنيف")
        print(f"تم إضافة {total_azkar} ذكر")
        
        # التحقق
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
    print("تعبئة قاعدة البيانات بالأذكار متعددة اللغات")
    print("=" * 50)
    asyncio.run(seed_multilingual_database())
