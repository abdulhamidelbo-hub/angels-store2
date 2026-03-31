# app/backend/seed_remaining_azkar.py
# تعبئة باقي الأذكار الناقصة (الفئات 4-11 و 13)

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# أذكار النوم (Category 4)
sleeping_azkar = [
    {
        "arabic": "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.",
        "translation_en": "In Your name, O Allah, I die and I live.",
        "count": 1, "reference": "البخاري 6324", "counterType": "once",
        "virtue_ar": "كان النبي ﷺ يقول هذا الذكر عند النوم.",
        "virtue_en": "The Prophet (peace be upon him) used to say this when going to sleep."
    },
    {
        "arabic": "اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا. اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ.",
        "translation_en": "O Allah, You have created my soul and You take it. To You belongs its death and life. If You give it life, protect it, and if You cause it to die, forgive it. O Allah, I ask You for well-being.",
        "count": 1, "reference": "مسلم 2712", "counterType": "once",
        "virtue_ar": "دعاء جامع للحفظ والمغفرة.",
        "virtue_en": "A comprehensive supplication for protection and forgiveness."
    },
    {
        "arabic": "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.",
        "translation_en": "O Allah, protect me from Your punishment on the Day You resurrect Your servants.",
        "count": 3, "reference": "أبو داود 5045", "counterType": "incremental",
        "virtue_ar": "دعاء للحماية من عذاب يوم القيامة.",
        "virtue_en": "A supplication for protection from the punishment on the Day of Resurrection."
    },
    {
        "arabic": "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.",
        "translation_en": "In Your name, my Lord, I lie down, and in Your name I rise. If You take my soul, then have mercy on it, and if You return it, protect it as You protect Your righteous servants.",
        "count": 1, "reference": "البخاري 6320", "counterType": "once",
        "virtue_ar": "دعاء للنوم بأمان وحفظ.",
        "virtue_en": "A supplication for sleeping safely under Allah's protection."
    },
    {
        "arabic": "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لاَ مَلْجَأَ وَلاَ مَنْجَا مِنْكَ إِلاَّ إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَنَبِيِّكَ الَّذِي أَرْسَلْتَ.",
        "translation_en": "O Allah, I submit myself to You, and entrust my affair to You, and turn my face to You, and depend upon You, hoping in You and fearing You. There is no refuge or escape from You except to You. I believe in Your Book which You revealed, and Your Prophet whom You sent.",
        "count": 1, "reference": "البخاري 6313", "counterType": "once",
        "virtue_ar": "من قالها ومات في ليلته مات على الفطرة.",
        "virtue_en": "Whoever says it and dies that night, dies upon the fitrah (natural disposition)."
    },
]

# أذكار الاستيقاظ (Category 5)
waking_azkar = [
    {
        "arabic": "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.",
        "translation_en": "All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.",
        "count": 1, "reference": "البخاري 6312", "counterType": "once",
        "virtue_ar": "شكر لله على نعمة الحياة وتذكير بيوم البعث.",
        "virtue_en": "Gratitude to Allah for the blessing of life and a reminder of the Day of Resurrection."
    },
    {
        "arabic": "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ.",
        "translation_en": "All praise is for Allah who restored to me my health and returned my soul and permitted me to remember Him.",
        "count": 1, "reference": "الترمذي 3401", "counterType": "once",
        "virtue_ar": "شكر لله على ثلاث نعم: العافية، والروح، وذكر الله.",
        "virtue_en": "Gratitude to Allah for three blessings: health, soul, and the permission to remember Him."
    },
    {
        "arabic": "لا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلا حَوْلَ وَلا قُوَّةَ إِلَّا بِاللَّهِ.",
        "translation_en": "None has the right to be worshipped except Allah alone, without partner. To Him belongs dominion and praise, and He is over all things competent. Glory be to Allah, praise be to Allah, there is no god but Allah, Allah is the Greatest, and there is no might nor power except with Allah.",
        "count": 1, "reference": "البخاري 1154", "counterType": "once",
        "virtue_ar": "من قالها عند الاستيقاظ ثم دعا استجيب له.",
        "virtue_en": "Whoever says it when waking up and then supplicates, his supplication will be answered."
    },
]

# أذكار الطعام والشراب (Category 6)
eating_azkar = [
    {
        "arabic": "بِسْمِ اللَّهِ.",
        "translation_en": "In the name of Allah.",
        "count": 1, "reference": "أبو داود 3767", "counterType": "once",
        "virtue_ar": "يقال قبل الأكل، فإن نسي في أوله يقول: بسم الله أوله وآخره.",
        "virtue_en": "Said before eating. If forgotten at the beginning, say: In the name of Allah at its beginning and end."
    },
    {
        "arabic": "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ.",
        "translation_en": "All praise is for Allah who fed me this and provided it for me, without any power or might from myself.",
        "count": 1, "reference": "أبو داود 4023", "counterType": "once",
        "virtue_ar": "من قالها غفر له ما تقدم من ذنبه.",
        "virtue_en": "Whoever says it, his past sins will be forgiven."
    },
    {
        "arabic": "اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَأَطْعِمْنَا خَيْرًا مِنْهُ.",
        "translation_en": "O Allah, bless it for us and feed us better than it.",
        "count": 1, "reference": "الترمذي 3455", "counterType": "once",
        "virtue_ar": "يقال بعد شرب اللبن.",
        "virtue_en": "Said after drinking milk."
    },
    {
        "arabic": "الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ، غَيْرَ مَكْفِيٍّ وَلاَ مُوَدَّعٍ وَلاَ مُسْتَغْنًى عَنْهُ رَبَّنَا.",
        "translation_en": "All praise is for Allah, much praise, pure and blessed. Never enough, nor bidding farewell, nor can be dispensed with, O our Lord.",
        "count": 1, "reference": "البخاري 5458", "counterType": "once",
        "virtue_ar": "دعاء شامل للحمد والشكر بعد الطعام.",
        "virtue_en": "A comprehensive supplication of praise and gratitude after eating."
    },
]

# أذكار المنزل (Category 7)
home_azkar = [
    {
        "arabic": "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا.",
        "translation_en": "In the name of Allah we enter, and in the name of Allah we leave, and upon Allah our Lord we rely.",
        "count": 1, "reference": "أبو داود 5096", "counterType": "once",
        "virtue_ar": "إذا قاله ثم سلم على أهله حفظه الله وخرج الشيطان.",
        "virtue_en": "If one says it and greets his family, Allah protects him and Satan departs."
    },
    {
        "arabic": "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ.",
        "translation_en": "In the name of Allah, I rely upon Allah. There is no might nor power except with Allah.",
        "count": 1, "reference": "أبو داود 5095", "counterType": "once",
        "virtue_ar": "يقال عند الخروج من المنزل، يُكفى ويُهدى ويُوقى.",
        "virtue_en": "Said when leaving home. One will be sufficed, guided, and protected."
    },
    {
        "arabic": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ.",
        "translation_en": "O Allah, I seek refuge in You from going astray or being led astray, from slipping or being caused to slip, from wronging or being wronged, from behaving ignorantly or being treated ignorantly.",
        "count": 1, "reference": "أبو داود 5094", "counterType": "once",
        "virtue_ar": "دعاء للحماية من كل المخاطر عند الخروج.",
        "virtue_en": "A supplication for protection from all dangers when leaving."
    },
]

# أذكار الخلاء (Category 8)
restroom_azkar = [
    {
        "arabic": "بِسْمِ اللَّهِ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ.",
        "translation_en": "In the name of Allah. O Allah, I seek refuge in You from the male and female evil spirits.",
        "count": 1, "reference": "البخاري 6322", "counterType": "once",
        "virtue_ar": "يقال عند دخول الخلاء للتحصين من الشياطين.",
        "virtue_en": "Said when entering the restroom for protection from devils."
    },
    {
        "arabic": "غُفْرَانَكَ.",
        "translation_en": "I seek Your forgiveness.",
        "count": 1, "reference": "أبو داود 30", "counterType": "once",
        "virtue_ar": "يقال عند الخروج من الخلاء.",
        "virtue_en": "Said when leaving the restroom."
    },
]

# أذكار الوضوء (Category 9)
ablution_azkar = [
    {
        "arabic": "بِسْمِ اللَّهِ.",
        "translation_en": "In the name of Allah.",
        "count": 1, "reference": "أبو داود 101", "counterType": "once",
        "virtue_ar": "يقال في بداية الوضوء.",
        "virtue_en": "Said at the beginning of ablution."
    },
    {
        "arabic": "أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ.",
        "translation_en": "I bear witness that there is no god but Allah alone, without partner, and I bear witness that Muhammad is His servant and messenger.",
        "count": 1, "reference": "مسلم 234", "counterType": "once",
        "virtue_ar": "يقال بعد الوضوء، تفتح له أبواب الجنة الثمانية.",
        "virtue_en": "Said after ablution. The eight gates of Paradise are opened for him."
    },
    {
        "arabic": "اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ.",
        "translation_en": "O Allah, make me among those who repent and make me among those who purify themselves.",
        "count": 1, "reference": "الترمذي 55", "counterType": "once",
        "virtue_ar": "يقال بعد الوضوء مع الشهادتين.",
        "virtue_en": "Said after ablution along with the testimony of faith."
    },
]

# أذكار الأذان (Category 10)
adhan_azkar = [
    {
        "arabic": "يقول مثل ما يقول المؤذن، إلا في حي على الصلاة وحي على الفلاح فيقول: لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ.",
        "translation_en": "One should repeat what the muezzin says, except when he says 'Hayya 'alas-Salah' and 'Hayya 'alal-Falah', one should say: 'La hawla wa la quwwata illa billah'.",
        "count": 1, "reference": "البخاري 611", "counterType": "once",
        "virtue_ar": "من قال مثل ما يقول المؤذن من قلبه دخل الجنة.",
        "virtue_en": "Whoever says what the muezzin says from his heart will enter Paradise."
    },
    {
        "arabic": "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاَةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ.",
        "translation_en": "O Allah, Lord of this perfect call and established prayer, grant Muhammad the intercession and honor, and raise him to the praiseworthy station which You have promised him.",
        "count": 1, "reference": "البخاري 614", "counterType": "once",
        "virtue_ar": "من قالها بعد الأذان حلت له شفاعة النبي ﷺ يوم القيامة.",
        "virtue_en": "Whoever says it after the Adhan, the Prophet's intercession becomes lawful for him on the Day of Resurrection."
    },
    {
        "arabic": "رَضِيتُ بِاللَّهِ رَبًّا، وَبِمُحَمَّدٍ رَسُولاً، وَبِالإِسْلاَمِ دِينًا.",
        "translation_en": "I am pleased with Allah as a Lord, with Muhammad as a Messenger, and with Islam as a religion.",
        "count": 1, "reference": "مسلم 386", "counterType": "once",
        "virtue_ar": "من قالها بعد الشهادتين في الأذان غفرت له ذنوبه.",
        "virtue_en": "Whoever says it after the testimony in the Adhan, his sins are forgiven."
    },
]

# أذكار المسجد (Category 11)
mosque_azkar = [
    {
        "arabic": "أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ.",
        "translation_en": "I seek refuge with Allah the Almighty, by His noble face, and His eternal authority, from the accursed Satan.",
        "count": 1, "reference": "أبو داود 466", "counterType": "once",
        "virtue_ar": "يقال عند دخول المسجد، يحفظه الله من الشيطان سائر اليوم.",
        "virtue_en": "Said when entering the mosque. Allah protects him from Satan for the rest of the day."
    },
    {
        "arabic": "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.",
        "translation_en": "O Allah, open for me the doors of Your mercy.",
        "count": 1, "reference": "مسلم 713", "counterType": "once",
        "virtue_ar": "يقال عند دخول المسجد.",
        "virtue_en": "Said when entering the mosque."
    },
    {
        "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ.",
        "translation_en": "O Allah, I ask You of Your bounty.",
        "count": 1, "reference": "مسلم 713", "counterType": "once",
        "virtue_ar": "يقال عند الخروج من المسجد.",
        "virtue_en": "Said when leaving the mosque."
    },
]

# جوامع الدعاء (Category 13)
comprehensive_duas = [
    {
        "arabic": "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.",
        "translation_en": "Our Lord, give us in this world good and in the Hereafter good and protect us from the punishment of the Fire.",
        "count": 1, "reference": "البقرة 201", "counterType": "once",
        "virtue_ar": "أكثر دعاء كان النبي ﷺ يدعو به.",
        "virtue_en": "The supplication the Prophet (peace be upon him) made most frequently."
    },
    {
        "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى.",
        "translation_en": "O Allah, I ask You for guidance, piety, chastity, and richness.",
        "count": 1, "reference": "مسلم 2721", "counterType": "once",
        "virtue_ar": "دعاء جامع لخير الدنيا والآخرة.",
        "virtue_en": "A comprehensive supplication for the good of this world and the hereafter."
    },
    {
        "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ.",
        "translation_en": "O Allah, I ask You for pardon and well-being in this life and the next.",
        "count": 1, "reference": "ابن ماجه 3871", "counterType": "once",
        "virtue_ar": "ما سئل الله شيئاً أحب إليه من العافية.",
        "virtue_en": "Nothing is more beloved to Allah to be asked for than well-being."
    },
    {
        "arabic": "اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي.",
        "translation_en": "O Allah, rectify for me my religion which is the safeguard of my affairs, rectify for me my worldly life wherein is my living, and rectify for me my hereafter to which is my return.",
        "count": 1, "reference": "مسلم 2720", "counterType": "once",
        "virtue_ar": "دعاء جامع لإصلاح الدين والدنيا والآخرة.",
        "virtue_en": "A comprehensive supplication for rectifying religion, worldly life, and the hereafter."
    },
    {
        "arabic": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ، وَتَحَوُّلِ عَافِيَتِكَ، وَفُجَاءَةِ نِقْمَتِكَ، وَجَمِيعِ سَخَطِكَ.",
        "translation_en": "O Allah, I seek refuge in You from the decline of Your blessing, from the withdrawal of Your protection, from the sudden onset of Your punishment, and from all Your wrath.",
        "count": 1, "reference": "مسلم 2739", "counterType": "once",
        "virtue_ar": "دعاء للحفاظ على النعم والحماية من غضب الله.",
        "virtue_en": "A supplication for preserving blessings and protection from Allah's wrath."
    },
]


async def seed_remaining_azkar():
    """تعبئة الأذكار الناقصة"""
    
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'adkar_app')
    
    if not mongo_url:
        print("خطأ: MONGO_URL غير موجود")
        return False
    
    print("جاري الاتصال بقاعدة البيانات...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Get max ID
        max_doc = await db.azkar.find_one(sort=[("id", -1)])
        azkar_id = (max_doc["id"] + 1) if max_doc else 100
        
        categories_data = [
            (4, sleeping_azkar, "أذكار النوم"),
            (5, waking_azkar, "أذكار الاستيقاظ"),
            (6, eating_azkar, "أذكار الطعام"),
            (7, home_azkar, "أذكار المنزل"),
            (8, restroom_azkar, "أذكار الخلاء"),
            (9, ablution_azkar, "أذكار الوضوء"),
            (10, adhan_azkar, "أذكار الأذان"),
            (11, mosque_azkar, "أذكار المسجد"),
            (13, comprehensive_duas, "جوامع الدعاء"),
        ]
        
        for cat_id, azkar_list, cat_name in categories_data:
            print(f"إضافة {cat_name}...")
            for item in azkar_list:
                doc = {
                    "id": azkar_id,
                    "category_id": cat_id,
                    "arabic_text": item["arabic"],
                    "translation_en": item.get("translation_en"),
                    "repeat_count": item["count"],
                    "reference_ar": item["reference"],
                    "counter_type": item["counterType"],
                    "virtue_ar": item.get("virtue_ar"),
                    "virtue_en": item.get("virtue_en"),
                    "is_favorite": False
                }
                await db.azkar.insert_one(doc)
                azkar_id += 1
        
        # Verify
        print("\n=== ملخص التعبئة ===")
        for cat_id, _, cat_name in categories_data:
            count = await db.azkar.count_documents({"category_id": cat_id})
            print(f"  {cat_name}: {count} ذكر")
        
        total = await db.azkar.count_documents({})
        print(f"\nإجمالي الأذكار: {total}")
        
        return True
        
    except Exception as e:
        print(f"خطأ: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        client.close()


if __name__ == "__main__":
    print("=" * 50)
    print("تعبئة الأذكار الناقصة")
    print("=" * 50)
    asyncio.run(seed_remaining_azkar())
