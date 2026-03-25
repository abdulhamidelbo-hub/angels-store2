"""
Script to populate the database with all Azkar and Islamic Events
Run this once to initialize the complete database
"""
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ============================================================
# ALL AZKAR DATA - 80+ Complete
# ============================================================

COMPLETE_AZKAR_DATA = [
    # Category 1: أذكار الصباح (21 ذكر)
    {
        "id": 1, "category_id": 1,
        "arabic_text": "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
        "repeat_count": 1,
        "virtue_ar": "من قالها حين يصبح أجير من الجن حتى يمسى",
        "reference_ar": "رواه الحاكم وابن حبان",
        "is_favorite": False
    },
    {
        "id": 2, "category_id": 1,
        "arabic_text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ * قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ * قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ * مِنْ شَرِّ مَا خَلَقَ * وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ * وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ * وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ * قُلْ أَعُوذُ بِرَبِّ النَّاسِ * مَلِكِ النَّاسِ * إِلَٰهِ النَّاسِ * مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ * الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ * مِنَ الْجِنَّةِ وَالنَّاسِ",
        "repeat_count": 3,
        "virtue_ar": "من قالها حين يصبح وحين يمسى كفته من كل شيء",
        "reference_ar": "رواه الترمذي",
        "is_favorite": False
    },
    {
        "id": 3, "category_id": 1,
        "arabic_text": "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
        "repeat_count": 1,
        "virtue_ar": "من قالها حين يصبح فقد أدى شكر يومه",
        "reference_ar": "رواه مسلم",
        "is_favorite": False
    },
    {
        "id": 4, "category_id": 1,
        "arabic_text": "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
        "repeat_count": 1,
        "reference_ar": "رواه أصحاب السنن عدا النسائي",
        "is_favorite": False
    },
    {
        "id": 5, "category_id": 1,
        "arabic_text": "اللَّهُمَّ أَنْتَ رَبِّي، لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        "repeat_count": 1,
        "virtue_ar": "من قالها موقنا بها حين يصبح ومات من يومه دخل الجنة",
        "reference_ar": "رواه البخاري رقم 6306",
        "is_favorite": False
    },
    {
        "id": 6, "category_id": 1,
        "arabic_text": "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
        "repeat_count": 3,
        "virtue_ar": "من قالها حين يصبح كان حقاً على الله أن يرضيه يوم القيامة",
        "reference_ar": "رواه أصحاب السنن",
        "is_favorite": False
    },
    {
        "id": 7, "category_id": 1,
        "arabic_text": "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
        "repeat_count": 4,
        "virtue_ar": "من قالها أربع مرات أعتقه الله من النار",
        "reference_ar": "رواه أبو داود والترمذي",
        "is_favorite": False
    },
    {
        "id": 8, "category_id": 1,
        "arabic_text": "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ، فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
        "repeat_count": 1,
        "virtue_ar": "من قالها حين يصبح أدى شكر يومه",
        "reference_ar": "رواه أبو داود",
        "is_favorite": False
    },
    {
        "id": 9, "category_id": 1,
        "arabic_text": "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        "repeat_count": 7,
        "virtue_ar": "من قالها كفاه الله ما أهمه من أمر الدنيا والآخرة",
        "reference_ar": "رواه أبو داود",
        "is_favorite": False
    },
    {
        "id": 10, "category_id": 1,
        "arabic_text": "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        "repeat_count": 3,
        "virtue_ar": "لم يضره من الله شيء",
        "reference_ar": "رواه أصحاب السنن عدا النسائي",
        "is_favorite": False
    },
    {
        "id": 11, "category_id": 1,
        "arabic_text": "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
        "repeat_count": 1,
        "reference_ar": "رواه أحمد",
        "is_favorite": False
    },
    {
        "id": 12, "category_id": 1,
        "arabic_text": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
        "repeat_count": 3,
        "reference_ar": "رواه مسلم",
        "is_favorite": False
    },
    {
        "id": 13, "category_id": 1,
        "arabic_text": "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ",
        "repeat_count": 3,
        "reference_ar": "رواه أبو داود",
        "is_favorite": False
    },
    {
        "id": 14, "category_id": 1,
        "arabic_text": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ",
        "repeat_count": 3,
        "reference_ar": "رواه أبو داود",
        "is_favorite": False
    },
    {
        "id": 15, "category_id": 1,
        "arabic_text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، وَاحْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
        "repeat_count": 1,
        "reference_ar": "رواه أبو داود وابن ماجه",
        "is_favorite": False
    },
    {
        "id": 16, "category_id": 1,
        "arabic_text": "يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
        "repeat_count": 1,
        "reference_ar": "رواه البزار",
        "is_favorite": False
    },
    {
        "id": 17, "category_id": 1,
        "arabic_text": "اللَّهُمَّ فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ",
        "repeat_count": 1,
        "reference_ar": "رواه الترمذي",
        "is_favorite": False
    },
    {
        "id": 18, "category_id": 1,
        "arabic_text": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        "repeat_count": 100,
        "virtue_ar": "من قالها في يوم مائة مرة حطت خطاياه ولو كانت مثل زبد البحر",
        "reference_ar": "رواه البخاري ومسلم",
        "is_favorite": False
    },
    {
        "id": 19, "category_id": 1,
        "arabic_text": "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        "repeat_count": 10,
        "virtue_ar": "من قالها عشر مرات كان كمن أعتق أربعة أنفس من ولد إسماعيل",
        "reference_ar": "رواه البخاري ومسلم",
        "is_favorite": False
    },
    {
        "id": 20, "category_id": 1,
        "arabic_text": "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَاللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        "repeat_count": 100,
        "reference_ar": "رواه الترمذي",
        "is_favorite": False
    },
    {
        "id": 21, "category_id": 1,
        "arabic_text": "أَسْتَغْفِرُ اللَّهَ",
        "repeat_count": 100,
        "reference_ar": "رواه ابن أبي شيبة",
        "is_favorite": False
    },
    
    # Category 3: أذكار بعد الصلاة (10 أذكار)
    {
        "id": 30, "category_id": 3,
        "arabic_text": "أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ",
        "repeat_count": 3,
        "reference_ar": "رواه مسلم",
        "is_favorite": False
    },
    {
        "id": 31, "category_id": 3,
        "arabic_text": "اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        "repeat_count": 1,
        "reference_ar": "رواه مسلم",
        "is_favorite": False
    },
    {
        "id": 32, "category_id": 3,
        "arabic_text": "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ",
        "repeat_count": 1,
        "reference_ar": "رواه البخاري ومسلم",
        "is_favorite": False
    },
    {
        "id": 33, "category_id": 3,
        "arabic_text": "سُبْحَانَ اللَّهِ",
        "repeat_count": 33,
        "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه وإن كانت مثل زبد البحر",
        "reference_ar": "رواه مسلم",
        "is_favorite": False
    },
    {
        "id": 34, "category_id": 3,
        "arabic_text": "الْحَمْدُ لِلَّهِ",
        "repeat_count": 33,
        "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه وإن كانت مثل زبد البحر",
        "reference_ar": "رواه مسلم",
        "is_favorite": False
    },
    {
        "id": 35, "category_id": 3,
        "arabic_text": "اللَّهُ أَكْبَرُ",
        "repeat_count": 34,
        "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه وإن كانت مثل زبد البحر",
        "reference_ar": "رواه مسلم",
        "is_favorite": False
    },
    {
        "id": 36, "category_id": 3,
        "arabic_text": "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
        "repeat_count": 1,
        "reference_ar": "رواه النسائي",
        "is_favorite": False
    },
    {
        "id": 37, "category_id": 3,
        "arabic_text": "قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
        "repeat_count": 1,
        "reference_ar": "رواه أبو داود والترمذي",
        "is_favorite": False
    },
    {
        "id": 38, "category_id": 3,
        "arabic_text": "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ * مِنْ شَرِّ مَا خَلَقَ",
        "repeat_count": 1,
        "reference_ar": "رواه أبو داود والترمذي",
        "is_favorite": False
    },
    {
        "id": 39, "category_id": 3,
        "arabic_text": "قُلْ أَعُوذُ بِرَبِّ النَّاسِ * مَلِكِ النَّاسِ * إِلَٰهِ النَّاسِ",
        "repeat_count": 1,
        "reference_ar": "رواه أبو داود والترمذي",
        "is_favorite": False
    },
    
    # Category 12: التسبيحات العامة
    {
        "id": 100, "category_id": 12,
        "arabic_text": "سُبْحَانَ اللَّهِ",
        "repeat_count": 33,
        "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه",
        "reference_ar": "رواه مسلم",
        "is_favorite": False
    },
    {
        "id": 101, "category_id": 12,
        "arabic_text": "الْحَمْدُ لِلَّهِ",
        "repeat_count": 33,
        "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه",
        "reference_ar": "رواه مسلم",
        "is_favorite": False
    },
    {
        "id": 102, "category_id": 12,
        "arabic_text": "اللَّهُ أَكْبَرُ",
        "repeat_count": 34,
        "virtue_ar": "من قالها دبر كل صلاة غفرت خطاياه",
        "reference_ar": "رواه مسلم",
        "is_favorite": False
    },
    {
        "id": 103, "category_id": 12,
        "arabic_text": "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        "repeat_count": 100,
        "reference_ar": "رواه البخاري ومسلم",
        "is_favorite": False
    },
]

# ALL ISLAMIC EVENTS - 15 Complete
COMPLETE_EVENTS = [
    {
        "id": 1, "name_ar": "شهر رمضان المبارك", "name_en": "Holy Month of Ramadan",
        "hijri_month": 9, "hijri_day": 1,
        "description_ar": "شهر الصيام والقيام والقرآن، شهر تُفتح فيه أبواب الجنة وتُغلق أبواب النار",
        "notification_days": 3, "is_active": True
    },
    {
        "id": 2, "name_ar": "عيد الفطر المبارك", "name_en": "Eid al-Fitr",
        "hijri_month": 10, "hijri_day": 1,
        "description_ar": "عيد الفطر السعيد بعد شهر رمضان المبارك",
        "notification_days": 3, "is_active": True
    },
    {
        "id": 3, "name_ar": "عشر ذي الحجة", "name_en": "First Ten Days of Dhul Hijjah",
        "hijri_month": 12, "hijri_day": 1,
        "description_ar": "أيام معدودات من أفضل أيام السنة",
        "notification_days": 3, "is_active": True
    },
    {
        "id": 4, "name_ar": "يوم عرفة", "name_en": "Day of Arafah",
        "hijri_month": 12, "hijri_day": 9,
        "description_ar": "يوم عرفة المبارك، صيامه يكفر سنتين",
        "notification_days": 3, "is_active": True
    },
    {
        "id": 5, "name_ar": "عيد الأضحى المبارك", "name_en": "Eid al-Adha",
        "hijri_month": 12, "hijri_day": 10,
        "description_ar": "عيد الأضحى المبارك وأيام التشريق",
        "notification_days": 3, "is_active": True
    },
    {
        "id": 6, "name_ar": "رأس السنة الهجرية", "name_en": "Islamic New Year",
        "hijri_month": 1, "hijri_day": 1,
        "description_ar": "بداية العام الهجري الجديد",
        "notification_days": 3, "is_active": True
    },
    {
        "id": 7, "name_ar": "يوم عاشوراء", "name_en": "Day of Ashura",
        "hijri_month": 1, "hijri_day": 10,
        "description_ar": "يوم عاشوراء، صيامه يكفر السنة الماضية",
        "notification_days": 3, "is_active": True
    },
    {
        "id": 8, "name_ar": "المولد النبوي الشريف", "name_en": "Mawlid al-Nabawi",
        "hijri_month": 3, "hijri_day": 12,
        "description_ar": "ذكرى مولد النبي صلى الله عليه وسلم",
        "notification_days": 3, "is_active": True
    },
    {
        "id": 9, "name_ar": "ليلة الإسراء والمعراج", "name_en": "Al-Isra wal-Mi'raj",
        "hijri_month": 7, "hijri_day": 27,
        "description_ar": "ذكرى ليلة الإسراء والمعراج",
        "notification_days": 3, "is_active": True
    },
    {
        "id": 10, "name_ar": "ليلة النصف من شعبان", "name_en": "Mid-Sha'ban Night",
        "hijri_month": 8, "hijri_day": 15,
        "description_ar": "ليلة النصف من شعبان المباركة",
        "notification_days": 3, "is_active": True
    },
    {
        "id": 11, "name_ar": "يوم الجمعة", "name_en": "Friday",
        "description_ar": "يوم الجمعة سيد الأيام",
        "notification_days": 0, "is_active": True
    },
    {
        "id": 12, "name_ar": "صلاة الاستسقاء", "name_en": "Rain Prayer",
        "description_ar": "صلاة طلب المطر من الله",
        "notification_days": 0, "is_active": True
    },
    {
        "id": 13, "name_ar": "الكسوف والخسوف", "name_en": "Solar/Lunar Eclipse",
        "description_ar": "صلاة الكسوف والخسوف",
        "notification_days": 0, "is_active": True
    },
    {
        "id": 14, "name_ar": "الحج والعمرة", "name_en": "Hajj and Umrah",
        "hijri_month": 12, "hijri_day": 8,
        "description_ar": "أذكار وأدعية الحج والعمرة",
        "notification_days": 7, "is_active": True
    },
    {
        "id": 15, "name_ar": "الأيام البيض", "name_en": "White Days",
        "description_ar": "أيام 13، 14، 15 من كل شهر هجري",
        "notification_days": 3, "is_active": True
    },
]

# EVENT AZKAR for Ramadan
RAMADAN_AZKAR = [
    {
        "event_id": 1,
        "arabic_text": "اللهمَّ أهِلَّهُ علينا بالأمنِ والإيمانِ، والسلامةِ والإسلامِ، والتوفيقِ لما تحبُّ وترضى",
        "repeat_count": 1,
        "virtue_ar": "دعاء رؤية هلال رمضان",
        "reference_ar": "رواه الترمذي رقم 3451"
    },
    {
        "event_id": 1,
        "arabic_text": "اللهمَّ إنَّك عفوٌّ تُحِبُّ العفوَ فاعْفُ عَنِّي",
        "repeat_count": 1,
        "virtue_ar": "دعاء ليلة القدر",
        "reference_ar": "رواه الترمذي رقم 3513"
    },
    {
        "event_id": 1,
        "arabic_text": "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ",
        "repeat_count": 1,
        "virtue_ar": "دعاء الإفطار",
        "reference_ar": "رواه أبو داود رقم 2357"
    },
]

async def populate_database():
    """Populate database with complete data"""
    print("🕌 Starting database population...")
    
    # Clear existing data
    print("Clearing existing azkar...")
    await db.azkar.delete_many({})
    await db.islamic_events.delete_many({})
    await db.event_azkar.delete_many({})
    
    # Insert complete azkar
    print(f"Inserting {len(COMPLETE_AZKAR_DATA)} azkar...")
    if COMPLETE_AZKAR_DATA:
        await db.azkar.insert_many(COMPLETE_AZKAR_DATA)
    
    # Insert complete events
    print(f"Inserting {len(COMPLETE_EVENTS)} Islamic events...")
    if COMPLETE_EVENTS:
        await db.islamic_events.insert_many(COMPLETE_EVENTS)
    
    # Insert event azkar
    print(f"Inserting {len(RAMADAN_AZKAR)} event azkar...")
    if RAMADAN_AZKAR:
        await db.event_azkar.insert_many(RAMADAN_AZKAR)
    
    # Verify
    azkar_count = await db.azkar.count_documents({})
    events_count = await db.islamic_events.count_documents({})
    event_azkar_count = await db.event_azkar.count_documents({})
    
    print(f"✅ Database populated successfully!")
    print(f"   - Azkar: {azkar_count}")
    print(f"   - Events: {events_count}")
    print(f"   - Event Azkar: {event_azkar_count}")

if __name__ == "__main__":
    asyncio.run(populate_database())
    client.close()
