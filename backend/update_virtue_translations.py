"""
سكربت لإضافة ترجمات الفضل بجميع اللغات المدعومة
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# ترجمات الفضل لكل ذكر بجميع اللغات
VIRTUE_TRANSLATIONS = {
    1: {
        "ar": "من قالها حين يصبح أجير من الجن حتى يمسى",
        "en": "Whoever recites it in the morning will be protected from jinn until evening",
        "fr": "Celui qui la récite le matin sera protégé des djinns jusqu'au soir",
        "tr": "Sabahleyin okuyan kimse akşama kadar cinlerden korunur",
        "ur": "جو صبح کے وقت پڑھے گا شام تک جنوں سے محفوظ رہے گا",
        "id": "Barangsiapa membacanya di pagi hari akan dilindungi dari jin sampai sore",
        "bn": "যে সকালে এটি পাঠ করবে সে সন্ধ্যা পর্যন্ত জিন থেকে সুরক্ষিত থাকবে",
        "ms": "Sesiapa yang membacanya pada waktu pagi akan dilindungi dari jin sehingga petang",
        "sw": "Yeyote anayesoma asubuhi atalindwa dhidi ya majini hadi jioni",
        "ha": "Duk wanda ya karanta shi da safe za a kare shi daga aljanu har zuwa yamma"
    },
    2: {
        "ar": "من قالها حين يصبح وحين يمسى كفته من كل شيء",
        "en": "Whoever recites it morning and evening, it will suffice him against everything",
        "fr": "Celui qui la récite matin et soir, elle lui suffira contre tout",
        "tr": "Sabah akşam okuyan kimseye her şeye karşı yeterli olur",
        "ur": "جو صبح و شام پڑھے گا اسے ہر چیز سے کافی ہوگا",
        "id": "Barangsiapa membacanya pagi dan sore akan dicukupkan dari segala sesuatu",
        "bn": "যে সকাল-সন্ধ্যা পাঠ করবে তার জন্য সবকিছু থেকে যথেষ্ট হবে",
        "ms": "Sesiapa yang membacanya pagi dan petang akan mencukupinya daripada segala sesuatu",
        "sw": "Yeyote anayesoma asubuhi na jioni itamtosha dhidi ya kila kitu",
        "ha": "Duk wanda ya karanta shi safe da yamma zai ishe shi daga komai"
    },
    3: {
        "ar": "من قالها حين يصبح فقد أدى شكر يومه",
        "en": "Whoever says it in the morning has fulfilled his thanks for that day",
        "fr": "Celui qui la dit le matin a accompli sa gratitude pour ce jour",
        "tr": "Sabahleyin söyleyen o günün şükrünü eda etmiş olur",
        "ur": "جو صبح کہے اس نے اپنے دن کا شکر ادا کر دیا",
        "id": "Barangsiapa mengucapkannya di pagi hari telah menunaikan syukur harinya",
        "bn": "যে সকালে বলবে সে তার দিনের শুকরিয়া আদায় করেছে",
        "ms": "Sesiapa yang mengucapkannya pada waktu pagi telah melaksanakan syukur harinya",
        "sw": "Yeyote anayesema asubuhi ametimiza shukrani yake kwa siku hiyo",
        "ha": "Duk wanda ya ce shi da safe ya cika godiya ga ranarsa"
    },
    4: {
        "ar": "من قالها ثلاثاً حين يصبح وحين يمسي كفاه الله ما أهمه",
        "en": "Whoever says it three times morning and evening, Allah will suffice him in whatever concerns him",
        "fr": "Celui qui la dit trois fois matin et soir, Allah lui suffira en tout ce qui le préoccupe",
        "tr": "Sabah akşam üç kez okuyana Allah onu endişelendiren her şeye karşı yeterli olur",
        "ur": "جو صبح و شام تین بار کہے اللہ اس کی ہر پریشانی کے لیے کافی ہوگا",
        "id": "Barangsiapa mengucapkannya tiga kali pagi dan sore, Allah akan mencukupkannya dari apa yang mengkhawatirkannya",
        "bn": "যে সকাল-সন্ধ্যা তিনবার বলবে, আল্লাহ তার সব চিন্তা থেকে যথেষ্ট হবেন",
        "ms": "Sesiapa yang mengucapkannya tiga kali pagi dan petang, Allah akan mencukupinya dalam apa yang membimbangkannya",
        "sw": "Yeyote anayesema mara tatu asubuhi na jioni, Mwenyezi Mungu atamtosha katika linalomhangaisha",
        "ha": "Duk wanda ya ce shi sau uku safe da yamma, Allah zai ishe shi daga abin da ke damunsa"
    },
    5: {
        "ar": "من قالها عشر مرات كان كمن أعتق أربعة من ولد إسماعيل",
        "en": "Whoever says it ten times will be as if he freed four descendants of Ismail",
        "fr": "Celui qui la dit dix fois sera comme s'il avait libéré quatre descendants d'Ismail",
        "tr": "On kez okuyan İsmail'in soyundan dört kişiyi azat etmiş gibi olur",
        "ur": "جو دس بار کہے گویا اس نے اسماعیل کی اولاد میں سے چار غلام آزاد کیے",
        "id": "Barangsiapa mengucapkannya sepuluh kali seperti membebaskan empat keturunan Ismail",
        "bn": "যে দশবার বলবে সে যেন ইসমাইলের চার সন্তানকে মুক্ত করেছে",
        "ms": "Sesiapa yang mengucapkannya sepuluh kali seolah-olah dia telah membebaskan empat keturunan Ismail",
        "sw": "Yeyote anayesema mara kumi ni kama amewaachilia huru watoto wanne wa Ismail",
        "ha": "Duk wanda ya ce shi sau goma kamar ya 'yantar da zuriya hudu na Isma'ila"
    },
    6: {
        "ar": "من قالها مائة مرة حين يصبح وحين يمسي لم يأت أحد بأفضل مما جاء به",
        "en": "Whoever says it 100 times morning and evening, no one will come with better than what he brought",
        "fr": "Celui qui la dit 100 fois matin et soir, personne ne viendra avec mieux que ce qu'il a apporté",
        "tr": "Sabah akşam yüz kez okuyan kimseden daha faziletli bir amel getiren olmaz",
        "ur": "جو صبح و شام سو بار کہے کوئی اس سے افضل عمل نہیں لائے گا",
        "id": "Barangsiapa mengucapkannya 100 kali pagi dan sore, tidak ada yang datang dengan lebih baik darinya",
        "bn": "যে সকাল-সন্ধ্যা ১০০ বার বলবে, কেউ তার চেয়ে উত্তম আমল নিয়ে আসবে না",
        "ms": "Sesiapa yang mengucapkannya 100 kali pagi dan petang, tiada sesiapa yang datang dengan lebih baik daripadanya",
        "sw": "Yeyote anayesema mara 100 asubuhi na jioni, hakuna atakayekuja na bora zaidi ya alicholeta",
        "ha": "Duk wanda ya ce shi sau 100 safe da yamma babu wanda zai zo da abin da ya fi"
    },
    7: {
        "ar": "من قالها حين يصبح وحين يمسي سبع مرات كفاه الله ما أهمه من أمر الدنيا والآخرة",
        "en": "Whoever says it seven times morning and evening, Allah will suffice him in matters of this world and the hereafter",
        "fr": "Celui qui la dit sept fois matin et soir, Allah lui suffira dans les affaires de ce monde et de l'au-delà",
        "tr": "Sabah akşam yedi kez okuyana Allah dünya ve ahiret işlerinde yeterli olur",
        "ur": "جو صبح و شام سات بار کہے اللہ دنیا و آخرت کی تمام پریشانیوں میں کافی ہوگا",
        "id": "Barangsiapa mengucapkannya tujuh kali pagi dan sore, Allah akan mencukupinya dalam urusan dunia dan akhirat",
        "bn": "যে সকাল-সন্ধ্যা সাতবার বলবে, আল্লাহ তার দুনিয়া ও আখিরাতের বিষয়ে যথেষ্ট হবেন",
        "ms": "Sesiapa yang mengucapkannya tujuh kali pagi dan petang, Allah akan mencukupinya dalam urusan dunia dan akhirat",
        "sw": "Yeyote anayesema mara saba asubuhi na jioni, Mwenyezi Mungu atamtosha katika mambo ya dunia na akhera",
        "ha": "Duk wanda ya ce shi sau bakwai safe da yamma Allah zai ishe shi a al'amuran duniya da lahira"
    },
    8: {
        "ar": "من قالها موقناً بها حين يمسي ومات من ليلته دخل الجنة",
        "en": "Whoever says it with certainty in the evening and dies that night will enter Paradise",
        "fr": "Celui qui la dit avec certitude le soir et meurt cette nuit-là entrera au Paradis",
        "tr": "Akşamleyin inanarak okuyan ve o gece ölen cennete girer",
        "ur": "جو شام کو یقین کے ساتھ کہے اور اسی رات وفات پائے جنت میں داخل ہوگا",
        "id": "Barangsiapa mengucapkannya dengan yakin di sore hari dan meninggal malam itu akan masuk surga",
        "bn": "যে সন্ধ্যায় বিশ্বাসের সাথে বলবে এবং সে রাতে মারা যাবে জান্নাতে প্রবেশ করবে",
        "ms": "Sesiapa yang mengucapkannya dengan yakin pada waktu petang dan meninggal malam itu akan masuk syurga",
        "sw": "Yeyote anayesema kwa yakini jioni na akafa usiku huo ataingia Peponi",
        "ha": "Duk wanda ya ce shi da yakini a maraice kuma ya mutu a wannan dare zai shiga aljanna"
    },
    9: {
        "ar": "من قالها حين يصبح وحين يمسي حفظه الله من كل شيء",
        "en": "Whoever says it morning and evening, Allah will protect him from everything",
        "fr": "Celui qui la dit matin et soir, Allah le protégera de tout",
        "tr": "Sabah akşam okuyanı Allah her şeyden korur",
        "ur": "جو صبح و شام کہے اللہ اسے ہر چیز سے محفوظ رکھے گا",
        "id": "Barangsiapa mengucapkannya pagi dan sore, Allah akan melindunginya dari segala sesuatu",
        "bn": "যে সকাল-সন্ধ্যা বলবে, আল্লাহ তাকে সবকিছু থেকে রক্ষা করবেন",
        "ms": "Sesiapa yang mengucapkannya pagi dan petang, Allah akan melindunginya daripada segala sesuatu",
        "sw": "Yeyote anayesema asubuhi na jioni, Mwenyezi Mungu atamlinda dhidi ya kila kitu",
        "ha": "Duk wanda ya ce shi safe da yamma Allah zai kare shi daga komai"
    },
    10: {
        "ar": "من قالها أربع مرات كان كمن أعتق نسمة من ولد إسماعيل",
        "en": "Whoever says it four times will be as if he freed a soul from the descendants of Ismail",
        "fr": "Celui qui la dit quatre fois sera comme s'il avait libéré une âme des descendants d'Ismail",
        "tr": "Dört kez okuyan İsmail'in soyundan bir köle azat etmiş gibi olur",
        "ur": "جو چار بار کہے گویا اس نے اسماعیل کی اولاد سے ایک غلام آزاد کیا",
        "id": "Barangsiapa mengucapkannya empat kali seperti membebaskan seorang jiwa dari keturunan Ismail",
        "bn": "যে চারবার বলবে সে যেন ইসমাইলের বংশ থেকে একজনকে মুক্ত করেছে",
        "ms": "Sesiapa yang mengucapkannya empat kali seolah-olah dia telah membebaskan seorang jiwa daripada keturunan Ismail",
        "sw": "Yeyote anayesema mara nne ni kama ameachilia huru nafsi moja kutoka kwa wazao wa Ismail",
        "ha": "Duk wanda ya ce shi sau hudu kamar ya 'yantar da rai daya daga zuriyar Isma'ila"
    }
}

# ترجمات إضافية للأذكار الأخرى (11-87)
ADDITIONAL_VIRTUE_TRANSLATIONS = {
    11: {
        "ar": "التعوذ بكلمات الله التامات من شر ما خلق",
        "en": "Seeking refuge in Allah's perfect words from the evil of what He created",
        "fr": "Se réfugier dans les paroles parfaites d'Allah contre le mal de ce qu'Il a créé",
        "tr": "Allah'ın tam kelimeleriyle yarattıklarının şerrinden sığınmak",
        "ur": "اللہ کے کامل کلمات سے مخلوقات کے شر سے پناہ مانگنا",
        "id": "Berlindung dengan kalimat Allah yang sempurna dari kejahatan makhluk-Nya",
        "bn": "আল্লাহর পরিপূর্ণ বাণীতে তাঁর সৃষ্টির অনিষ্ট থেকে আশ্রয় প্রার্থনা",
        "ms": "Berlindung dengan kalimat Allah yang sempurna dari kejahatan makhluk-Nya",
        "sw": "Kuomba hifadhi katika maneno kamili ya Mwenyezi Mungu dhidi ya uovu wa viumbe vyake",
        "ha": "Neman mafaka da cikakkun kalmomin Allah daga sharrin halittunSa"
    },
    12: {
        "ar": "من قالها لم يضره شيء",
        "en": "Whoever says it, nothing will harm him",
        "fr": "Celui qui la dit, rien ne lui nuira",
        "tr": "Bunu okuyana hiçbir şey zarar vermez",
        "ur": "جو کہے اسے کوئی چیز نقصان نہیں پہنچائے گی",
        "id": "Barangsiapa mengucapkannya tidak akan ada yang membahayakannya",
        "bn": "যে বলবে তার কোনো ক্ষতি হবে না",
        "ms": "Sesiapa yang mengucapkannya tiada sesuatu pun akan membahayakannya",
        "sw": "Yeyote anayesema hakuna kitakachomdhuru",
        "ha": "Duk wanda ya fadi ba komai zai cutar da shi ba"
    },
    # يمكن إضافة المزيد من الترجمات هنا
}

async def update_virtue_translations():
    """تحديث ترجمات الفضل في قاعدة البيانات"""
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'tasbeeh_app')]
    
    print("🔄 جاري تحديث ترجمات الفضل...")
    
    # دمج جميع الترجمات
    all_translations = {**VIRTUE_TRANSLATIONS, **ADDITIONAL_VIRTUE_TRANSLATIONS}
    
    updated_count = 0
    
    for azkar_id, translations in all_translations.items():
        # تحديث الذكر بالترجمات الجديدة
        result = await db.azkar.update_one(
            {"id": azkar_id},
            {
                "$set": {
                    "virtue_ar": translations.get("ar", ""),
                    "virtue_en": translations.get("en", ""),
                    "virtue_fr": translations.get("fr", ""),
                    "virtue_tr": translations.get("tr", ""),
                    "virtue_ur": translations.get("ur", ""),
                    "virtue_id": translations.get("id", ""),
                    "virtue_bn": translations.get("bn", ""),
                    "virtue_ms": translations.get("ms", ""),
                    "virtue_sw": translations.get("sw", ""),
                    "virtue_ha": translations.get("ha", ""),
                }
            }
        )
        if result.modified_count > 0:
            updated_count += 1
            print(f"✅ تم تحديث الذكر رقم {azkar_id}")
    
    print(f"\n🎉 تم تحديث {updated_count} ذكر بنجاح!")
    
    # إغلاق الاتصال
    client.close()

if __name__ == "__main__":
    asyncio.run(update_virtue_translations())
