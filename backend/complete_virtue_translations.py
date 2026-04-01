"""
سكربت شامل لإضافة ترجمات الفضل لجميع الأذكار بجميع اللغات العشر
Complete script to add virtue translations for all 87 Azkar in 10 languages
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ترجمات الفضل لجميع الأذكار (87 ذكر) بجميع اللغات العشر
# Virtue translations for all 87 Azkar in 10 languages

COMPLETE_VIRTUE_TRANSLATIONS = {
    # =====================================
    # أذكار الصباح (Category 1) - IDs 1-12 (Already done) + 13-22
    # =====================================
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
    },
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
    13: {
        "ar": "دعاء جامع لخير الدنيا والآخرة",
        "en": "A comprehensive supplication for the good of this world and the hereafter",
        "fr": "Une invocation complète pour le bien de ce monde et de l'au-delà",
        "tr": "Dünya ve ahiret iyiliği için kapsamlı bir dua",
        "ur": "دنیا و آخرت کی بھلائی کے لیے جامع دعا",
        "id": "Doa yang mencakup kebaikan dunia dan akhirat",
        "bn": "দুনিয়া ও আখিরাতের কল্যাণের জন্য ব্যাপক দোয়া",
        "ms": "Doa yang menyeluruh untuk kebaikan dunia dan akhirat",
        "sw": "Dua ya kina kwa kheri ya dunia na akhera",
        "ha": "Addu'a mai girma don alherin duniya da lahira"
    },
    14: {
        "ar": "كان النبي ﷺ يستغفر الله في اليوم أكثر من سبعين مرة",
        "en": "The Prophet (peace be upon him) used to seek Allah's forgiveness more than seventy times a day",
        "fr": "Le Prophète (paix sur lui) demandait pardon à Allah plus de soixante-dix fois par jour",
        "tr": "Peygamber (s.a.v.) günde yetmişten fazla kez Allah'tan bağışlanma dilerdi",
        "ur": "نبی ﷺ دن میں ستر سے زیادہ بار استغفار کرتے تھے",
        "id": "Nabi (saw) memohon ampunan Allah lebih dari tujuh puluh kali sehari",
        "bn": "নবী (সা.) দিনে সত্তরবারের বেশি আল্লাহর কাছে ক্ষমা চাইতেন",
        "ms": "Nabi (saw) memohon keampunan Allah lebih dari tujuh puluh kali sehari",
        "sw": "Mtume (saw) aliomba msamaha wa Mwenyezi Mungu zaidi ya mara sabini kwa siku",
        "ha": "Annabi (SAW) yana roƙon gafarar Allah fiye da sau saba'in a rana"
    },
    15: {
        "ar": "من صلى على النبي صلاة صلى الله عليه بها عشراً",
        "en": "Whoever sends blessings upon the Prophet once, Allah will bless him ten times",
        "fr": "Celui qui prie sur le Prophète une fois, Allah le bénira dix fois",
        "tr": "Peygambere bir kez salât getiren kimseye Allah on kez rahmet eder",
        "ur": "جو نبی پر ایک بار درود بھیجے اللہ اس پر دس بار رحمت نازل کرے",
        "id": "Barangsiapa bershalawat kepada Nabi sekali, Allah akan memberkatinya sepuluh kali",
        "bn": "যে নবীর উপর একবার দরূদ পাঠাবে আল্লাহ তাকে দশবার রহমত করবেন",
        "ms": "Sesiapa yang berselawat kepada Nabi sekali, Allah akan memberkatinya sepuluh kali",
        "sw": "Yeyote anayemswalia Mtume mara moja, Mwenyezi Mungu atambariki mara kumi",
        "ha": "Duk wanda ya yi salati ga Annabi sau daya, Allah zai yi masa albarka sau goma"
    },
    16: {
        "ar": "من قالها عشر مرات كان كمن أعتق أربعة من ولد إسماعيل",
        "en": "Whoever says it ten times will be like one who freed four descendants of Ismail",
        "fr": "Celui qui la dit dix fois sera comme s'il avait libéré quatre descendants d'Ismail",
        "tr": "On kez okuyan İsmail'in soyundan dört kişiyi azat etmiş gibi olur",
        "ur": "جو دس بار کہے گویا اس نے اسماعیل کی اولاد سے چار غلام آزاد کیے",
        "id": "Barangsiapa mengucapkannya sepuluh kali seperti membebaskan empat keturunan Ismail",
        "bn": "যে দশবার বলবে সে যেন ইসমাইলের চার সন্তানকে মুক্ত করেছে",
        "ms": "Sesiapa yang mengucapkannya sepuluh kali seolah-olah dia telah membebaskan empat keturunan Ismail",
        "sw": "Yeyote anayesema mara kumi ni kama amewaachilia huru watoto wanne wa Ismail",
        "ha": "Duk wanda ya ce shi sau goma kamar ya 'yantar da zuriya hudu na Isma'ila"
    },
    17: {
        "ar": "أحب الكلام إلى الله",
        "en": "The most beloved words to Allah",
        "fr": "Les paroles les plus aimées par Allah",
        "tr": "Allah'a en sevimli sözler",
        "ur": "اللہ کو سب سے پیاری کلام",
        "id": "Ucapan yang paling dicintai Allah",
        "bn": "আল্লাহর কাছে সবচেয়ে প্রিয় বাণী",
        "ms": "Ucapan yang paling dicintai Allah",
        "sw": "Maneno yapendwayo zaidi na Mwenyezi Mungu",
        "ha": "Kalmomin da Allah ya fi so"
    },
    18: {
        "ar": "كنز من كنوز الجنة",
        "en": "A treasure from the treasures of Paradise",
        "fr": "Un trésor parmi les trésors du Paradis",
        "tr": "Cennet hazinelerinden bir hazine",
        "ur": "جنت کے خزانوں میں سے ایک خزانہ",
        "id": "Harta karun dari harta karun surga",
        "bn": "জান্নাতের ধনভাণ্ডার থেকে একটি ধন",
        "ms": "Harta karun dari harta karun syurga",
        "sw": "Hazina kutoka hazina za Peponi",
        "ha": "Taska daga taskokin aljanna"
    },
    19: {
        "ar": "من قالها ثلاث مرات لم يضره شيء",
        "en": "Whoever says it three times, nothing will harm him",
        "fr": "Celui qui la dit trois fois, rien ne lui nuira",
        "tr": "Üç kez okuyana hiçbir şey zarar vermez",
        "ur": "جو تین بار کہے اسے کوئی چیز نقصان نہیں پہنچائے گی",
        "id": "Barangsiapa mengucapkannya tiga kali, tidak ada yang akan membahayakannya",
        "bn": "যে তিনবার বলবে তার কোনো ক্ষতি হবে না",
        "ms": "Sesiapa yang mengucapkannya tiga kali, tiada sesuatu pun akan membahayakannya",
        "sw": "Yeyote anayesema mara tatu hakuna kitakachomdhuru",
        "ha": "Duk wanda ya ce shi sau uku ba komai zai cutar da shi ba"
    },
    20: {
        "ar": "من قالها مائة مرة حطت خطاياه وإن كانت مثل زبد البحر",
        "en": "Whoever says it 100 times, his sins will be forgiven even if they were like the foam of the sea",
        "fr": "Celui qui la dit 100 fois, ses péchés seront pardonnés même s'ils étaient comme l'écume de la mer",
        "tr": "Yüz kez okuyanın günahları denizin köpüğü kadar olsa bile bağışlanır",
        "ur": "جو سو بار کہے اس کے گناہ معاف ہوجائیں گے چاہے سمندر کی جھاگ جتنے ہوں",
        "id": "Barangsiapa mengucapkannya 100 kali, dosanya akan diampuni meski seperti buih laut",
        "bn": "যে ১০০ বার বলবে তার গুনাহ মাফ হবে সমুদ্রের ফেনার মতো হলেও",
        "ms": "Sesiapa yang mengucapkannya 100 kali, dosanya akan diampunkan walaupun seperti buih laut",
        "sw": "Yeyote anayesema mara 100, dhambi zake zitasamehewa hata kama ni kama povu la bahari",
        "ha": "Duk wanda ya ce shi sau 100, za a gafarta zunubansa ko da sun kasance kamar kumfar teku"
    },
    21: {
        "ar": "الصلاة الإبراهيمية الكاملة، أفضل صيغ الصلاة على النبي",
        "en": "The complete Ibrahimi prayer, the best form of sending blessings upon the Prophet",
        "fr": "La prière Ibrahimique complète, la meilleure forme de prière sur le Prophète",
        "tr": "Tam İbrahimi salavat, Peygambere salât getirmenin en faziletli şekli",
        "ur": "مکمل ابراہیمی درود، نبی پر درود بھیجنے کی بہترین صورت",
        "id": "Shalawat Ibrahimiyah lengkap, bentuk terbaik bershalawat kepada Nabi",
        "bn": "পূর্ণ ইব্রাহিমী দরূদ, নবীর উপর দরূদ পাঠানোর সর্বোত্তম রূপ",
        "ms": "Selawat Ibrahimiyah lengkap, bentuk terbaik berselawat kepada Nabi",
        "sw": "Swala kamili ya Ibrahimu, njia bora ya kumswalia Mtume",
        "ha": "Cikakkiyar salatin Ibrahim, mafi kyawun hanyar yin salati ga Annabi"
    },
    
    # =====================================
    # أذكار المساء (Category 2) - IDs 22-42
    # =====================================
    22: {
        "ar": "من قالها حين يمسي فقد أدى شكر ليلته، ومن قالها حين يصبح فقد أدى شكر يومه",
        "en": "Whoever says it in the evening has fulfilled thanks for that night, and whoever says it in the morning has fulfilled thanks for that day",
        "fr": "Celui qui la dit le soir a accompli sa gratitude pour cette nuit, et celui qui la dit le matin a accompli sa gratitude pour ce jour",
        "tr": "Akşam söyleyen o gecenin şükrünü eda etmiş, sabah söyleyen o günün şükrünü eda etmiş olur",
        "ur": "جو شام کو کہے اس نے اپنی رات کا شکر ادا کیا، اور جو صبح کہے اس نے اپنے دن کا شکر ادا کیا",
        "id": "Barangsiapa mengucapkannya di sore hari telah menunaikan syukur malamnya, dan di pagi hari telah menunaikan syukur harinya",
        "bn": "যে সন্ধ্যায় বলবে সে তার রাতের শুকরিয়া আদায় করেছে, এবং যে সকালে বলবে সে তার দিনের শুকরিয়া আদায় করেছে",
        "ms": "Sesiapa yang mengucapkannya pada waktu petang telah melaksanakan syukur malamnya, dan pada waktu pagi telah melaksanakan syukur harinya",
        "sw": "Yeyote anayesema jioni ametimiza shukrani ya usiku wake, na yeyote anayesema asubuhi ametimiza shukrani ya siku yake",
        "ha": "Duk wanda ya ce shi da yamma ya cika godiyar darensa, kuma wanda ya ce shi da safe ya cika godiyar ranarsa"
    },
    23: {
        "ar": "من قالها حين يمسي وحين يصبح كفته من كل شيء",
        "en": "Whoever says it morning and evening, it will suffice him from everything",
        "fr": "Celui qui la dit matin et soir, elle lui suffira contre tout",
        "tr": "Sabah akşam söyleyen kimseye her şeye karşı yeterli olur",
        "ur": "جو صبح و شام کہے اسے ہر چیز سے کافی ہوگا",
        "id": "Barangsiapa mengucapkannya pagi dan sore akan dicukupkan dari segala sesuatu",
        "bn": "যে সকাল-সন্ধ্যা বলবে তার জন্য সবকিছু থেকে যথেষ্ট হবে",
        "ms": "Sesiapa yang mengucapkannya pagi dan petang akan mencukupinya daripada segala sesuatu",
        "sw": "Yeyote anayesema asubuhi na jioni itamtosha dhidi ya kila kitu",
        "ha": "Duk wanda ya ce shi safe da yamma zai ishe shi daga komai"
    },
    24: {
        "ar": "من قالها حين يمسي حفظه الله تلك الليلة",
        "en": "Whoever says it in the evening, Allah will protect him that night",
        "fr": "Celui qui la dit le soir, Allah le protégera cette nuit",
        "tr": "Akşam okuyanı Allah o gece korur",
        "ur": "جو شام کو کہے اللہ اسے اس رات محفوظ رکھے",
        "id": "Barangsiapa mengucapkannya di sore hari, Allah akan melindunginya malam itu",
        "bn": "যে সন্ধ্যায় বলবে আল্লাহ সেই রাতে তাকে রক্ষা করবেন",
        "ms": "Sesiapa yang mengucapkannya pada waktu petang, Allah akan melindunginya pada malam itu",
        "sw": "Yeyote anayesema jioni, Mwenyezi Mungu atamlinda usiku huo",
        "ha": "Duk wanda ya ce shi da yamma Allah zai kare shi wannan dare"
    },
    25: {
        "ar": "الاستعاذة من الكفر والفقر وعذاب القبر",
        "en": "Seeking refuge from disbelief, poverty and the punishment of the grave",
        "fr": "Se réfugier contre la mécréance, la pauvreté et le châtiment de la tombe",
        "tr": "Küfürden, fakirlikten ve kabir azabından sığınma",
        "ur": "کفر، فقر اور عذاب قبر سے پناہ مانگنا",
        "id": "Berlindung dari kekufuran, kemiskinan dan siksa kubur",
        "bn": "কুফর, দারিদ্র্য ও কবরের আযাব থেকে আশ্রয় প্রার্থনা",
        "ms": "Berlindung dari kekufuran, kemiskinan dan azab kubur",
        "sw": "Kuomba hifadhi dhidi ya ukafiri, umaskini na adhabu ya kaburi",
        "ha": "Neman mafaka daga kafirci, talauci da azabar kabari"
    },
    26: {
        "ar": "دعاء للعافية في البدن والسمع والبصر",
        "en": "Supplication for well-being in body, hearing and sight",
        "fr": "Invocation pour le bien-être du corps, de l'ouïe et de la vue",
        "tr": "Beden, işitme ve görme sağlığı için dua",
        "ur": "جسم، سماعت اور بصارت میں عافیت کی دعا",
        "id": "Doa untuk kesehatan tubuh, pendengaran dan penglihatan",
        "bn": "শরীর, শ্রবণ ও দৃষ্টিতে সুস্থতার জন্য দোয়া",
        "ms": "Doa untuk kesejahteraan badan, pendengaran dan penglihatan",
        "sw": "Dua kwa ustawi wa mwili, kusikia na kuona",
        "ha": "Addu'a don lafiyar jiki, ji da gani"
    },
    27: {
        "ar": "من قالها في مساء وصباح أربع مرات أعتقه الله من النار",
        "en": "Whoever says it four times in the morning and evening, Allah will free him from the Fire",
        "fr": "Celui qui la dit quatre fois matin et soir, Allah le libérera du Feu",
        "tr": "Sabah akşam dört kez okuyanı Allah cehennemden azat eder",
        "ur": "جو صبح و شام چار بار کہے اللہ اسے جہنم سے آزاد کردے",
        "id": "Barangsiapa mengucapkannya empat kali pagi dan sore, Allah akan membebaskannya dari api neraka",
        "bn": "যে সকাল-সন্ধ্যা চারবার বলবে আল্লাহ তাকে জাহান্নাম থেকে মুক্ত করবেন",
        "ms": "Sesiapa yang mengucapkannya empat kali pagi dan petang, Allah akan membebaskannya dari api neraka",
        "sw": "Yeyote anayesema mara nne asubuhi na jioni, Mwenyezi Mungu atamwachilia huru kutoka Motoni",
        "ha": "Duk wanda ya ce shi sau hudu safe da yamma, Allah zai 'yantar da shi daga wuta"
    },
    28: {
        "ar": "من قالها ثلاث مرات حين يصبح وثلاث مرات حين يمسي لم يضره شيء",
        "en": "Whoever says it three times in the morning and three times in the evening, nothing will harm him",
        "fr": "Celui qui la dit trois fois le matin et trois fois le soir, rien ne lui nuira",
        "tr": "Sabah üç akşam üç kez okuyana hiçbir şey zarar vermez",
        "ur": "جو صبح تین بار اور شام تین بار کہے اسے کوئی چیز نقصان نہیں پہنچائے گی",
        "id": "Barangsiapa mengucapkannya tiga kali pagi dan tiga kali sore, tidak ada yang akan membahayakannya",
        "bn": "যে সকালে তিনবার এবং সন্ধ্যায় তিনবার বলবে তার কোনো ক্ষতি হবে না",
        "ms": "Sesiapa yang mengucapkannya tiga kali pagi dan tiga kali petang, tiada sesuatu pun akan membahayakannya",
        "sw": "Yeyote anayesema mara tatu asubuhi na mara tatu jioni, hakuna kitakachomdhuru",
        "ha": "Duk wanda ya ce shi sau uku da safe da sau uku da yamma ba komai zai cutar da shi ba"
    },
    29: {
        "ar": "من قالها حين يصبح وحين يمسي كان حقاً على الله أن يرضيه",
        "en": "Whoever says it morning and evening, it is Allah's right to please him",
        "fr": "Celui qui la dit matin et soir, c'est le droit d'Allah de le satisfaire",
        "tr": "Sabah akşam okuyanı memnun etmek Allah üzerine hak olur",
        "ur": "جو صبح و شام کہے اللہ پر اسے راضی کرنا حق ہے",
        "id": "Barangsiapa mengucapkannya pagi dan sore, menjadi hak Allah untuk meridhainya",
        "bn": "যে সকাল-সন্ধ্যা বলবে আল্লাহর উপর তাকে খুশি করা কর্তব্য হয়ে যায়",
        "ms": "Sesiapa yang mengucapkannya pagi dan petang, menjadi hak Allah untuk meredhainya",
        "sw": "Yeyote anayesema asubuhi na jioni, ni haki ya Mwenyezi Mungu kumridhia",
        "ha": "Duk wanda ya ce shi safe da yamma, haƙƙin Allah ne ya gamsar da shi"
    },
    30: {
        "ar": "من قالها حين يمسي ثلاث مرات لم تضره حمة تلك الليلة",
        "en": "Whoever says it three times in the evening, no poison will harm him that night",
        "fr": "Celui qui la dit trois fois le soir, aucun poison ne lui nuira cette nuit",
        "tr": "Akşam üç kez okuyana o gece hiçbir zehir zarar vermez",
        "ur": "جو شام کو تین بار کہے اسے اس رات کوئی زہر نقصان نہیں پہنچائے گا",
        "id": "Barangsiapa mengucapkannya tiga kali di sore hari, tidak ada racun yang akan membahayakannya malam itu",
        "bn": "যে সন্ধ্যায় তিনবার বলবে সেই রাতে কোনো বিষ তার ক্ষতি করবে না",
        "ms": "Sesiapa yang mengucapkannya tiga kali pada waktu petang, tiada racun yang akan membahayakannya pada malam itu",
        "sw": "Yeyote anayesema mara tatu jioni, hakuna sumu itakayomdhuru usiku huo",
        "ha": "Duk wanda ya ce shi sau uku da yamma babu dafi zai cutar da shi wannan dare"
    },
    31: {
        "ar": "الصلاة على النبي عشر مرات صباحاً ومساءً تدرك شفاعته",
        "en": "Sending blessings upon the Prophet ten times morning and evening will earn his intercession",
        "fr": "Prier sur le Prophète dix fois matin et soir lui vaudra son intercession",
        "tr": "Sabah akşam on kez Peygambere salât getiren şefaatine erer",
        "ur": "صبح و شام دس بار نبی پر درود بھیجنے والے کو ان کی شفاعت ملے گی",
        "id": "Bershalawat kepada Nabi sepuluh kali pagi dan sore akan mendapatkan syafaatnya",
        "bn": "সকাল-সন্ধ্যা দশবার নবীর উপর দরূদ পাঠালে তাঁর শাফাআত পাওয়া যাবে",
        "ms": "Berselawat kepada Nabi sepuluh kali pagi dan petang akan mendapat syafaatnya",
        "sw": "Kumswalia Mtume mara kumi asubuhi na jioni kutamfanya apate uombezi wake",
        "ha": "Yin salati ga Annabi sau goma safe da yamma zai samu ceton sa"
    },
    32: {
        "ar": "من أذكار المساء المسنونة",
        "en": "From the recommended evening remembrances",
        "fr": "Parmi les évocations du soir recommandées",
        "tr": "Akşam zikirleri arasında sünnet olan",
        "ur": "مسنون شام کے اذکار میں سے",
        "id": "Dari dzikir sore yang disunnahkan",
        "bn": "সন্ধ্যার সুন্নাহ যিকিরগুলোর মধ্যে",
        "ms": "Daripada zikir petang yang disunatkan",
        "sw": "Miongoni mwa adhkari za jioni zilizopendekezwa",
        "ha": "Daga cikin azkar da ake so da yamma"
    },
    33: {
        "ar": "من قالها حين يمسي أدركته شفاعة النبي",
        "en": "Whoever says it in the evening will be granted the Prophet's intercession",
        "fr": "Celui qui la dit le soir obtiendra l'intercession du Prophète",
        "tr": "Akşam okuyan Peygamberin şefaatine erer",
        "ur": "جو شام کو کہے اسے نبی کی شفاعت نصیب ہو",
        "id": "Barangsiapa mengucapkannya di sore hari akan mendapatkan syafaat Nabi",
        "bn": "যে সন্ধ্যায় বলবে তাকে নবীর শাফাআত দেওয়া হবে",
        "ms": "Sesiapa yang mengucapkannya pada waktu petang akan diberi syafaat Nabi",
        "sw": "Yeyote anayesema jioni atapewa uombezi wa Mtume",
        "ha": "Duk wanda ya ce shi da yamma zai sami ceton Annabi"
    },
    34: {
        "ar": "من قالها حين يصبح وحين يمسي عشراً غفرت ذنوبه",
        "en": "Whoever says it ten times morning and evening, his sins will be forgiven",
        "fr": "Celui qui la dit dix fois matin et soir, ses péchés seront pardonnés",
        "tr": "Sabah akşam on kez okuyanın günahları bağışlanır",
        "ur": "جو صبح و شام دس بار کہے اس کے گناہ معاف ہوجائیں",
        "id": "Barangsiapa mengucapkannya sepuluh kali pagi dan sore, dosanya akan diampuni",
        "bn": "যে সকাল-সন্ধ্যা দশবার বলবে তার গুনাহ মাফ হবে",
        "ms": "Sesiapa yang mengucapkannya sepuluh kali pagi dan petang, dosanya akan diampunkan",
        "sw": "Yeyote anayesema mara kumi asubuhi na jioni, dhambi zake zitasamehewa",
        "ha": "Duk wanda ya ce shi sau goma safe da yamma za a gafarta zunubansa"
    },
    35: {
        "ar": "حصن للمسلم من الشياطين",
        "en": "A fortress for the Muslim against devils",
        "fr": "Une forteresse pour le musulman contre les démons",
        "tr": "Müslüman için şeytanlara karşı kale",
        "ur": "مسلمان کے لیے شیاطین سے حفاظت کا قلعہ",
        "id": "Benteng bagi muslim dari setan",
        "bn": "শয়তান থেকে মুসলমানের জন্য দুর্গ",
        "ms": "Benteng bagi muslim daripada syaitan",
        "sw": "Ngome kwa Muislamu dhidi ya mashetani",
        "ha": "Katanga ga musulmi daga shaidan"
    },
    36: {
        "ar": "من قرأها قبل النوم حفظه الله",
        "en": "Whoever recites it before sleep, Allah will protect him",
        "fr": "Celui qui la récite avant de dormir, Allah le protégera",
        "tr": "Uyumadan önce okuyanı Allah korur",
        "ur": "جو سونے سے پہلے پڑھے اللہ اسے محفوظ رکھے",
        "id": "Barangsiapa membacanya sebelum tidur, Allah akan melindunginya",
        "bn": "যে ঘুমানোর আগে পড়বে আল্লাহ তাকে রক্ষা করবেন",
        "ms": "Sesiapa yang membacanya sebelum tidur, Allah akan melindunginya",
        "sw": "Yeyote anayesoma kabla ya kulala, Mwenyezi Mungu atamlinda",
        "ha": "Duk wanda ya karanta kafin barci Allah zai kare shi"
    },
    37: {
        "ar": "آخر آيتين من سورة البقرة، من قرأهما في ليلة كفتاه",
        "en": "The last two verses of Surah Al-Baqarah; whoever recites them at night, they will suffice him",
        "fr": "Les deux derniers versets de Sourate Al-Baqarah; celui qui les récite la nuit, ils lui suffiront",
        "tr": "Bakara suresinin son iki ayeti, gece okuyana yeterli olur",
        "ur": "سورۃ البقرۃ کی آخری دو آیات، جو رات کو پڑھے اسے کافی ہوجائیں",
        "id": "Dua ayat terakhir Surah Al-Baqarah; barangsiapa membacanya di malam hari akan mencukupinya",
        "bn": "সূরা বাকারার শেষ দুই আয়াত; যে রাতে পড়বে তার জন্য যথেষ্ট হবে",
        "ms": "Dua ayat terakhir Surah Al-Baqarah; sesiapa yang membacanya pada malam hari akan mencukupinya",
        "sw": "Aya mbili za mwisho za Surat Al-Baqarah; yeyote anayezisoma usiku zitamtosha",
        "ha": "Ayoyi biyu na ƙarshe na Suratul Baqara; duk wanda ya karanta su da dare za su ishe shi"
    },
    38: {
        "ar": "من قالها عشر مرات حين يمسي وحين يصبح كتب له عشر حسنات",
        "en": "Whoever says it ten times morning and evening, ten good deeds will be recorded for him",
        "fr": "Celui qui la dit dix fois matin et soir, dix bonnes actions lui seront inscrites",
        "tr": "Sabah akşam on kez okuyana on hasene yazılır",
        "ur": "جو صبح و شام دس بار کہے اسے دس نیکیاں لکھی جائیں",
        "id": "Barangsiapa mengucapkannya sepuluh kali pagi dan sore, sepuluh kebaikan akan dicatat untuknya",
        "bn": "যে সকাল-সন্ধ্যা দশবার বলবে তার জন্য দশটি নেকি লেখা হবে",
        "ms": "Sesiapa yang mengucapkannya sepuluh kali pagi dan petang, sepuluh kebaikan akan dicatatkan untuknya",
        "sw": "Yeyote anayesema mara kumi asubuhi na jioni, mema kumi yataandikwa kwake",
        "ha": "Duk wanda ya ce shi sau goma safe da yamma za a rubuta masa kyawawan ayyuka goma"
    },
    39: {
        "ar": "من أذكار المساء المأثورة عن النبي ﷺ",
        "en": "From the evening remembrances narrated from the Prophet (peace be upon him)",
        "fr": "Parmi les évocations du soir rapportées du Prophète (paix sur lui)",
        "tr": "Peygamber'den (s.a.v.) rivayet edilen akşam zikirleri",
        "ur": "نبی ﷺ سے مروی شام کے اذکار میں سے",
        "id": "Dari dzikir sore yang diriwayatkan dari Nabi (saw)",
        "bn": "নবী (সা.) থেকে বর্ণিত সন্ধ্যার যিকিরগুলোর মধ্যে",
        "ms": "Daripada zikir petang yang diriwayatkan daripada Nabi (saw)",
        "sw": "Kutoka adhkari za jioni zilizosimuliwa kutoka kwa Mtume (saw)",
        "ha": "Daga cikin azkar da aka ruwaito daga Annabi (SAW) da yamma"
    },
    40: {
        "ar": "دعاء للحماية من شر الليل",
        "en": "Supplication for protection from the evil of the night",
        "fr": "Invocation pour la protection contre le mal de la nuit",
        "tr": "Gecenin şerrinden korunma duası",
        "ur": "رات کے شر سے حفاظت کی دعا",
        "id": "Doa untuk perlindungan dari kejahatan malam",
        "bn": "রাতের অনিষ্ট থেকে সুরক্ষার জন্য দোয়া",
        "ms": "Doa untuk perlindungan dari kejahatan malam",
        "sw": "Dua ya kujilinda dhidi ya uovu wa usiku",
        "ha": "Addu'a don kariya daga sharrin dare"
    },
    41: {
        "ar": "من الأذكار التي تحفظ المسلم في نومه",
        "en": "From the remembrances that protect the Muslim in his sleep",
        "fr": "Parmi les évocations qui protègent le musulman dans son sommeil",
        "tr": "Müslümanı uykusunda koruyan zikirlerden",
        "ur": "وہ اذکار جو مسلمان کو نیند میں محفوظ رکھیں",
        "id": "Dari dzikir yang melindungi muslim dalam tidurnya",
        "bn": "যে যিকিরগুলো ঘুমে মুসলমানকে রক্ষা করে",
        "ms": "Daripada zikir yang melindungi muslim dalam tidurnya",
        "sw": "Kutoka adhkari zinazolinda Muislamu katika usingizi wake",
        "ha": "Daga cikin azkar da ke kare musulmi a cikin barcinsa"
    },
    42: {
        "ar": "من قرأ آية الكرسي حين يمسي لا يقربه شيطان حتى يصبح",
        "en": "Whoever recites Ayatul Kursi in the evening, no devil will come near him until morning",
        "fr": "Celui qui récite Ayatul Kursi le soir, aucun démon ne l'approchera jusqu'au matin",
        "tr": "Akşam Ayetel Kürsi okuyanı sabaha kadar hiçbir şeytan yaklaşmaz",
        "ur": "جو شام کو آیت الکرسی پڑھے صبح تک کوئی شیطان اس کے قریب نہیں آئے گا",
        "id": "Barangsiapa membaca Ayat Kursi di sore hari, tidak ada setan yang akan mendekatinya sampai pagi",
        "bn": "যে সন্ধ্যায় আয়াতুল কুরসী পড়বে সকাল পর্যন্ত কোনো শয়তান তার কাছে আসবে না",
        "ms": "Sesiapa yang membaca Ayat Kursi pada waktu petang, tiada syaitan yang akan mendekatinya sehingga pagi",
        "sw": "Yeyote anayesoma Ayatul Kursi jioni, hakuna shetani atakayemkaribia hadi asubuhi",
        "ha": "Duk wanda ya karanta Ayatul Kursi da yamma babu shaidan da zai kusance shi har safe"
    },
    
    # =====================================
    # أذكار بعد الصلاة (Category 3) - IDs 43-47
    # =====================================
    43: {
        "ar": "من سبح دبر كل صلاة ثلاثاً وثلاثين، وحمد ثلاثاً وثلاثين، وكبر ثلاثاً وثلاثين، غفرت خطاياه وإن كانت مثل زبد البحر",
        "en": "Whoever glorifies Allah 33 times, praises Him 33 times, and magnifies Him 33 times after each prayer, his sins will be forgiven even if like the foam of the sea",
        "fr": "Celui qui glorifie Allah 33 fois, Le loue 33 fois et Le magnifie 33 fois après chaque prière, ses péchés seront pardonnés même comme l'écume de la mer",
        "tr": "Her namazın ardından otuz üç kez tesbih, hamd ve tekbir getiren, günahları denizin köpüğü kadar bile olsa bağışlanır",
        "ur": "جو ہر نماز کے بعد 33 بار سبحان اللہ، 33 بار الحمد للہ، 33 بار اللہ اکبر کہے، اس کے گناہ معاف ہوجائیں چاہے سمندر کی جھاگ جتنے ہوں",
        "id": "Barangsiapa bertasbih 33 kali, bertahmid 33 kali, dan bertakbir 33 kali setelah setiap shalat, dosanya akan diampuni meskipun seperti buih laut",
        "bn": "যে প্রতি নামাযের পর ৩৩ বার তাসবীহ, ৩৩ বার তাহমীদ ও ৩৩ বার তাকবীর পড়বে, তার গুনাহ মাফ হবে সমুদ্রের ফেনার মতো হলেও",
        "ms": "Sesiapa yang bertasbih 33 kali, bertahmid 33 kali dan bertakbir 33 kali selepas setiap solat, dosanya akan diampunkan walaupun seperti buih laut",
        "sw": "Yeyote anayetukuza Mwenyezi Mungu mara 33, kumhimidi mara 33, na kumtukuza mara 33 baada ya kila swala, dhambi zake zitasamehewa hata kama ni kama povu la bahari",
        "ha": "Duk wanda ya tsarkake Allah sau 33, ya yabe shi sau 33, ya girmama shi sau 33 bayan kowace salla, za a gafarta zunubansa ko da sun kasance kamar kumfar teku"
    },
    44: {
        "ar": "أذكار تحصين المسلم بعد الصلاة",
        "en": "Remembrances for fortifying the Muslim after prayer",
        "fr": "Évocations pour fortifier le musulman après la prière",
        "tr": "Namazdan sonra müslümanı koruyan zikirler",
        "ur": "نماز کے بعد مسلمان کی حفاظت کے اذکار",
        "id": "Dzikir untuk membentengi muslim setelah shalat",
        "bn": "নামাযের পর মুসলমানকে সুরক্ষিত করার যিকির",
        "ms": "Zikir untuk membentengi muslim selepas solat",
        "sw": "Adhkari za kumlinda Muislamu baada ya swala",
        "ha": "Azkar don kare musulmi bayan salla"
    },
    45: {
        "ar": "قراءة آية الكرسي بعد كل صلاة، لم يمنعه من دخول الجنة إلا الموت",
        "en": "Reciting Ayatul Kursi after every prayer - nothing prevents him from Paradise except death",
        "fr": "Réciter Ayatul Kursi après chaque prière - rien ne l'empêche d'entrer au Paradis sauf la mort",
        "tr": "Her namazdan sonra Ayetel Kürsi okuyan, ölümden başka cennete girmesine engel yoktur",
        "ur": "ہر نماز کے بعد آیت الکرسی پڑھنا - موت کے سوا کوئی چیز جنت میں داخلے سے نہیں روکتی",
        "id": "Membaca Ayat Kursi setelah setiap shalat - tidak ada yang mencegahnya dari surga kecuali kematian",
        "bn": "প্রতি নামাযের পর আয়াতুল কুরসী পড়া - মৃত্যু ছাড়া কিছুই তাকে জান্নাতে প্রবেশে বাধা দেয় না",
        "ms": "Membaca Ayat Kursi selepas setiap solat - tiada yang menghalangnya daripada syurga kecuali kematian",
        "sw": "Kusoma Ayatul Kursi baada ya kila swala - hakuna kinachomzuia kuingia Peponi isipokuwa kifo",
        "ha": "Karanta Ayatul Kursi bayan kowace salla - babu abin da ke hana shi shiga aljanna sai mutuwa"
    },
    46: {
        "ar": "من قالها مرة بعد كل صلاة دخل الجنة",
        "en": "Whoever says it once after every prayer will enter Paradise",
        "fr": "Celui qui la dit une fois après chaque prière entrera au Paradis",
        "tr": "Her namazdan sonra bir kez okuyan cennete girer",
        "ur": "جو ہر نماز کے بعد ایک بار کہے جنت میں داخل ہوگا",
        "id": "Barangsiapa mengucapkannya sekali setelah setiap shalat akan masuk surga",
        "bn": "যে প্রতি নামাযের পর একবার বলবে জান্নাতে প্রবেশ করবে",
        "ms": "Sesiapa yang mengucapkannya sekali selepas setiap solat akan masuk syurga",
        "sw": "Yeyote anayesema mara moja baada ya kila swala ataingia Peponi",
        "ha": "Duk wanda ya ce shi sau daya bayan kowace salla zai shiga aljanna"
    },
    47: {
        "ar": "دعاء بعد السلام من الصلاة للحماية والمغفرة",
        "en": "Supplication after finishing prayer for protection and forgiveness",
        "fr": "Invocation après la prière pour la protection et le pardon",
        "tr": "Koruma ve bağışlanma için namazdan sonra dua",
        "ur": "نماز کے بعد حفاظت اور مغفرت کی دعا",
        "id": "Doa setelah salam dari shalat untuk perlindungan dan ampunan",
        "bn": "সুরক্ষা ও ক্ষমার জন্য নামায শেষে দোয়া",
        "ms": "Doa selepas salam dari solat untuk perlindungan dan keampunan",
        "sw": "Dua baada ya kumaliza swala kwa ulinzi na msamaha",
        "ha": "Addu'a bayan sallama daga salla don kariya da gafara"
    },
    
    # =====================================
    # أذكار النوم (Category 4) - IDs 48-52
    # =====================================
    48: {
        "ar": "كان النبي ﷺ يقول هذا الذكر عند النوم",
        "en": "The Prophet (peace be upon him) used to say this when going to sleep",
        "fr": "Le Prophète (paix sur lui) disait ceci en allant dormir",
        "tr": "Peygamber (s.a.v.) uyurken bunu söylerdi",
        "ur": "نبی ﷺ سوتے وقت یہ ذکر کہتے تھے",
        "id": "Nabi (saw) mengucapkan ini saat tidur",
        "bn": "নবী (সা.) ঘুমাতে যাওয়ার সময় এটি বলতেন",
        "ms": "Nabi (saw) mengucapkan ini ketika hendak tidur",
        "sw": "Mtume (saw) alisema hivi wakati wa kwenda kulala",
        "ha": "Annabi (SAW) yana cewa wannan lokacin da zai kwanta"
    },
    49: {
        "ar": "دعاء جامع للحفظ والمغفرة",
        "en": "A comprehensive supplication for protection and forgiveness",
        "fr": "Une invocation complète pour la protection et le pardon",
        "tr": "Koruma ve bağışlanma için kapsamlı dua",
        "ur": "حفاظت اور مغفرت کے لیے جامع دعا",
        "id": "Doa komprehensif untuk perlindungan dan pengampunan",
        "bn": "সুরক্ষা ও ক্ষমার জন্য ব্যাপক দোয়া",
        "ms": "Doa yang menyeluruh untuk perlindungan dan keampunan",
        "sw": "Dua ya kina kwa ulinzi na msamaha",
        "ha": "Addu'a mai girma don kariya da gafara"
    },
    50: {
        "ar": "دعاء للحماية من عذاب يوم القيامة",
        "en": "Supplication for protection from the punishment on the Day of Resurrection",
        "fr": "Invocation pour la protection contre le châtiment du Jour de la Résurrection",
        "tr": "Kıyamet günü azabından korunma duası",
        "ur": "یوم قیامت کے عذاب سے حفاظت کی دعا",
        "id": "Doa untuk perlindungan dari siksa pada Hari Kiamat",
        "bn": "কিয়ামতের দিনের আযাব থেকে রক্ষার জন্য দোয়া",
        "ms": "Doa untuk perlindungan dari azab pada Hari Kiamat",
        "sw": "Dua ya kujilinda dhidi ya adhabu Siku ya Ufufuo",
        "ha": "Addu'a don kariya daga azabar Ranar Tashin Kiyama"
    },
    51: {
        "ar": "دعاء للنوم بأمان وحفظ",
        "en": "Supplication for sleeping safely under protection",
        "fr": "Invocation pour dormir en sécurité sous protection",
        "tr": "Güvende ve koruma altında uyumak için dua",
        "ur": "محفوظ اور سکون سے سونے کی دعا",
        "id": "Doa untuk tidur dengan aman dalam perlindungan",
        "bn": "নিরাপদে ঘুমানোর জন্য দোয়া",
        "ms": "Doa untuk tidur dengan selamat dalam perlindungan",
        "sw": "Dua ya kulala salama chini ya ulinzi",
        "ha": "Addu'a don barci lafiya a ƙarƙashin kariya"
    },
    52: {
        "ar": "من قالها ومات في ليلته مات على الفطرة",
        "en": "Whoever says it and dies that night, dies upon the natural disposition (fitrah)",
        "fr": "Celui qui la dit et meurt cette nuit-là, meurt sur la disposition naturelle (fitrah)",
        "tr": "Bunu söyleyip o gece ölen fıtrat üzere ölür",
        "ur": "جو کہے اور اسی رات وفات پائے فطرت پر مرے",
        "id": "Barangsiapa mengucapkannya dan meninggal malam itu, meninggal dalam keadaan fitrah",
        "bn": "যে বলবে এবং সেই রাতে মারা যাবে, ফিতরাতের উপর মারা যাবে",
        "ms": "Sesiapa yang mengucapkannya dan meninggal malam itu, meninggal dalam keadaan fitrah",
        "sw": "Yeyote anayesema na akafa usiku huo, anakufa juu ya maumbile ya asili (fitrah)",
        "ha": "Duk wanda ya ce shi kuma ya mutu a wannan dare, ya mutu a kan halitta (fitrah)"
    },
    
    # =====================================
    # أذكار الاستيقاظ (Category 5) - IDs 53-55
    # =====================================
    53: {
        "ar": "شكر لله على نعمة الحياة وتذكير بيوم البعث",
        "en": "Gratitude to Allah for the blessing of life and a reminder of the Day of Resurrection",
        "fr": "Gratitude envers Allah pour la bénédiction de la vie et rappel du Jour de la Résurrection",
        "tr": "Hayat nimeti için Allah'a şükür ve diriliş gününü hatırlatma",
        "ur": "زندگی کی نعمت پر اللہ کا شکر اور یوم بعث کی یاددہانی",
        "id": "Syukur kepada Allah atas nikmat kehidupan dan pengingat Hari Kebangkitan",
        "bn": "জীবনের নেয়ামতের জন্য আল্লাহর প্রতি কৃতজ্ঞতা এবং পুনরুত্থান দিবসের স্মরণ",
        "ms": "Kesyukuran kepada Allah atas nikmat kehidupan dan peringatan Hari Kebangkitan",
        "sw": "Shukrani kwa Mwenyezi Mungu kwa baraka ya uhai na ukumbusho wa Siku ya Ufufuo",
        "ha": "Godiya ga Allah don ni'imar rayuwa da tunatar da Ranar Tashin Kiyama"
    },
    54: {
        "ar": "شكر لله على ثلاث نعم: العافية، والروح، وذكر الله",
        "en": "Gratitude to Allah for three blessings: health, soul, and the permission to remember Him",
        "fr": "Gratitude envers Allah pour trois bénédictions: la santé, l'âme et la permission de Le mentionner",
        "tr": "Üç nimet için Allah'a şükür: sağlık, ruh ve O'nu anma izni",
        "ur": "تین نعمتوں پر اللہ کا شکر: عافیت، روح، اور اللہ کا ذکر",
        "id": "Syukur kepada Allah atas tiga nikmat: kesehatan, jiwa, dan izin untuk mengingat-Nya",
        "bn": "তিনটি নেয়ামতের জন্য আল্লাহর প্রতি কৃতজ্ঞতা: সুস্থতা, রূহ এবং তাঁর যিকির করার অনুমতি",
        "ms": "Kesyukuran kepada Allah atas tiga nikmat: kesihatan, jiwa dan keizinan untuk mengingati-Nya",
        "sw": "Shukrani kwa Mwenyezi Mungu kwa baraka tatu: afya, roho na ruhusa ya kumkumbuka",
        "ha": "Godiya ga Allah don ni'imomi uku: lafiya, rai da izinin tunawa da Shi"
    },
    55: {
        "ar": "من قالها عند الاستيقاظ ثم دعا استجيب له",
        "en": "Whoever says it when waking up and then supplicates, his supplication will be answered",
        "fr": "Celui qui la dit au réveil puis invoque, son invocation sera exaucée",
        "tr": "Uyanınca söyleyip dua eden, duası kabul olur",
        "ur": "جو اٹھتے وقت کہے پھر دعا کرے، اس کی دعا قبول ہو",
        "id": "Barangsiapa mengucapkannya saat bangun lalu berdoa, doanya akan dikabulkan",
        "bn": "যে জেগে উঠে বলবে তারপর দোয়া করবে, তার দোয়া কবুল হবে",
        "ms": "Sesiapa yang mengucapkannya ketika bangun lalu berdoa, doanya akan dimakbulkan",
        "sw": "Yeyote anayesema wakati wa kuamka kisha akaomba, ombi lake litajibiwa",
        "ha": "Duk wanda ya ce shi lokacin da ya tashi sannan ya yi addu'a, za a amsa addu'arsa"
    },
    
    # =====================================
    # أذكار الطعام والشراب (Category 6) - IDs 56-59
    # =====================================
    56: {
        "ar": "يقال قبل الأكل، فإن نسي في أوله يقول: بسم الله أوله وآخره",
        "en": "Said before eating. If forgotten at the beginning, say: In the name of Allah at its beginning and end",
        "fr": "Dit avant de manger. Si oublié au début, dire: Au nom d'Allah au début et à la fin",
        "tr": "Yemekten önce söylenir. Başında unutulursa: Başında ve sonunda Allah'ın adıyla, denir",
        "ur": "کھانے سے پہلے کہا جائے، اگر شروع میں بھول جائے تو کہے: بسم اللہ اوله وآخره",
        "id": "Diucapkan sebelum makan. Jika lupa di awal, ucapkan: Bismillah di awal dan akhirnya",
        "bn": "খাওয়ার আগে বলা হয়। শুরুতে ভুলে গেলে বলবে: বিসমিল্লাহ শুরুতে ও শেষে",
        "ms": "Diucapkan sebelum makan. Jika terlupa di awal, ucapkan: Bismillah di awal dan akhirnya",
        "sw": "Husemwa kabla ya kula. Ikiwa umesahau mwanzoni, sema: Kwa jina la Mwenyezi Mungu mwanzoni na mwishoni",
        "ha": "Ana cewa kafin ci. Idan an manta a farko, a ce: Da sunan Allah a farko da ƙarshe"
    },
    57: {
        "ar": "من قالها غفر له ما تقدم من ذنبه",
        "en": "Whoever says it, his past sins will be forgiven",
        "fr": "Celui qui la dit, ses péchés passés seront pardonnés",
        "tr": "Bunu söyleyenin geçmiş günahları bağışlanır",
        "ur": "جو کہے اس کے پچھلے گناہ معاف ہوجائیں",
        "id": "Barangsiapa mengucapkannya, dosa-dosa lamanya akan diampuni",
        "bn": "যে বলবে তার আগের গুনাহ মাফ হবে",
        "ms": "Sesiapa yang mengucapkannya, dosa-dosa lamanya akan diampunkan",
        "sw": "Yeyote anayesema, dhambi zake za zamani zitasamehewa",
        "ha": "Duk wanda ya ce shi, za a gafarta zunubansa na baya"
    },
    58: {
        "ar": "يقال بعد شرب اللبن",
        "en": "Said after drinking milk",
        "fr": "Dit après avoir bu du lait",
        "tr": "Süt içtikten sonra söylenir",
        "ur": "دودھ پینے کے بعد کہا جائے",
        "id": "Diucapkan setelah minum susu",
        "bn": "দুধ পানের পর বলা হয়",
        "ms": "Diucapkan selepas minum susu",
        "sw": "Husemwa baada ya kunywa maziwa",
        "ha": "Ana cewa bayan shan madara"
    },
    59: {
        "ar": "دعاء شامل للحمد والشكر بعد الطعام",
        "en": "A comprehensive supplication of praise and gratitude after eating",
        "fr": "Une invocation complète de louange et de gratitude après avoir mangé",
        "tr": "Yemekten sonra hamd ve şükür için kapsamlı dua",
        "ur": "کھانے کے بعد حمد و شکر کی جامع دعا",
        "id": "Doa komprehensif pujian dan syukur setelah makan",
        "bn": "খাওয়ার পরে প্রশংসা ও কৃতজ্ঞতার ব্যাপক দোয়া",
        "ms": "Doa yang menyeluruh untuk pujian dan kesyukuran selepas makan",
        "sw": "Dua ya kina ya sifa na shukrani baada ya kula",
        "ha": "Addu'a mai girma na yabo da godiya bayan cin abinci"
    },
    
    # =====================================
    # أذكار المنزل (Category 7) - IDs 60-62
    # =====================================
    60: {
        "ar": "إذا قاله ثم سلم على أهله حفظه الله وخرج الشيطان",
        "en": "If one says it and greets his family, Allah protects him and Satan departs",
        "fr": "Si on le dit et salue sa famille, Allah le protège et Satan s'en va",
        "tr": "Bunu söyleyip ailesine selam veren, Allah tarafından korunur ve şeytan çıkar",
        "ur": "جو کہے پھر اپنے گھر والوں کو سلام کرے، اللہ اسے محفوظ رکھے اور شیطان نکل جائے",
        "id": "Jika mengucapkannya lalu memberi salam kepada keluarga, Allah melindunginya dan setan pergi",
        "bn": "যদি বলে এবং পরিবারকে সালাম দেয়, আল্লাহ তাকে রক্ষা করেন এবং শয়তান চলে যায়",
        "ms": "Jika mengucapkannya lalu memberi salam kepada keluarga, Allah melindunginya dan syaitan pergi",
        "sw": "Ikiwa anasema na kuwasilimia familia yake, Mwenyezi Mungu anamlinda na shetani anaondoka",
        "ha": "Idan ya ce shi sannan ya gaishe da iyalinsa, Allah zai kare shi kuma shaidan zai fita"
    },
    61: {
        "ar": "يقال عند الخروج من المنزل، يُكفى ويُهدى ويُوقى",
        "en": "Said when leaving home. One will be sufficed, guided, and protected",
        "fr": "Dit en quittant la maison. On sera suffisant, guidé et protégé",
        "tr": "Evden çıkarken söylenir. Yeterli olunur, hidayet ve koruma verilir",
        "ur": "گھر سے نکلتے وقت کہا جائے، اسے کافی ہوگا، ہدایت ملے گی اور محفوظ رہے گا",
        "id": "Diucapkan saat keluar rumah. Seseorang akan dicukupi, ditunjuki, dan dilindungi",
        "bn": "বাড়ি থেকে বের হওয়ার সময় বলা হয়। তাকে যথেষ্ট করা হবে, পথ দেখানো হবে এবং রক্ষা করা হবে",
        "ms": "Diucapkan ketika keluar rumah. Seseorang akan dicukupkan, dipandu dan dilindungi",
        "sw": "Husemwa unapoondoka nyumbani. Mtu atatoshelezwa, kuongozwa na kulindwa",
        "ha": "Ana cewa lokacin da za a fita daga gida. Za a ishe shi, ja-gorantar da shi da kuma kare shi"
    },
    62: {
        "ar": "دعاء للحماية من كل المخاطر عند الخروج",
        "en": "Supplication for protection from all dangers when leaving",
        "fr": "Invocation pour la protection contre tous les dangers en sortant",
        "tr": "Çıkarken tüm tehlikelerden korunma duası",
        "ur": "باہر نکلتے وقت تمام خطرات سے حفاظت کی دعا",
        "id": "Doa untuk perlindungan dari semua bahaya saat keluar",
        "bn": "বের হওয়ার সময় সব বিপদ থেকে সুরক্ষার জন্য দোয়া",
        "ms": "Doa untuk perlindungan dari semua bahaya ketika keluar",
        "sw": "Dua ya kujilinda dhidi ya hatari zote unapoondoka",
        "ha": "Addu'a don kariya daga duk haɗari lokacin da za a fita"
    },
    
    # =====================================
    # أذكار الخلاء (Category 8) - IDs 63-64
    # =====================================
    63: {
        "ar": "يقال عند دخول الخلاء للتحصين من الشياطين",
        "en": "Said when entering the restroom for protection from devils",
        "fr": "Dit en entrant aux toilettes pour se protéger des démons",
        "tr": "Tuvalete girerken şeytanlardan korunmak için söylenir",
        "ur": "بیت الخلا میں داخل ہوتے وقت شیاطین سے حفاظت کے لیے کہا جائے",
        "id": "Diucapkan saat masuk toilet untuk perlindungan dari setan",
        "bn": "শয়তান থেকে সুরক্ষার জন্য টয়লেটে প্রবেশের সময় বলা হয়",
        "ms": "Diucapkan ketika masuk tandas untuk perlindungan dari syaitan",
        "sw": "Husemwa unapoingia chooni kwa ulinzi dhidi ya mashetani",
        "ha": "Ana cewa lokacin shiga ɗakin wanka don kariya daga shaidanu"
    },
    64: {
        "ar": "يقال عند الخروج من الخلاء",
        "en": "Said when leaving the restroom",
        "fr": "Dit en sortant des toilettes",
        "tr": "Tuvaletten çıkarken söylenir",
        "ur": "بیت الخلا سے نکلتے وقت کہا جائے",
        "id": "Diucapkan saat keluar dari toilet",
        "bn": "টয়লেট থেকে বের হওয়ার সময় বলা হয়",
        "ms": "Diucapkan ketika keluar dari tandas",
        "sw": "Husemwa unapotoka chooni",
        "ha": "Ana cewa lokacin fita daga ɗakin wanka"
    },
    
    # =====================================
    # أذكار الوضوء (Category 9) - IDs 65-67
    # =====================================
    65: {
        "ar": "يقال في بداية الوضوء",
        "en": "Said at the beginning of ablution",
        "fr": "Dit au début des ablutions",
        "tr": "Abdest başlarken söylenir",
        "ur": "وضو کی شروعات میں کہا جائے",
        "id": "Diucapkan di awal wudhu",
        "bn": "ওযুর শুরুতে বলা হয়",
        "ms": "Diucapkan di awal wuduk",
        "sw": "Husemwa mwanzoni mwa udhu",
        "ha": "Ana cewa a farkon alwala"
    },
    66: {
        "ar": "يقال بعد الوضوء، تفتح له أبواب الجنة الثمانية",
        "en": "Said after ablution. The eight gates of Paradise are opened for him",
        "fr": "Dit après les ablutions. Les huit portes du Paradis lui sont ouvertes",
        "tr": "Abdestten sonra söylenir. Cennetin sekiz kapısı kendisine açılır",
        "ur": "وضو کے بعد کہا جائے، جنت کے آٹھوں دروازے کھول دیے جائیں",
        "id": "Diucapkan setelah wudhu. Delapan pintu surga dibuka untuknya",
        "bn": "ওযুর পর বলা হয়। জান্নাতের আটটি দরজা তার জন্য খুলে দেওয়া হয়",
        "ms": "Diucapkan selepas wuduk. Lapan pintu syurga dibuka untuknya",
        "sw": "Husemwa baada ya udhu. Milango minane ya Peponi inafunguliwa kwake",
        "ha": "Ana cewa bayan alwala. Ƙofofi takwas na aljanna ana buɗe masa"
    },
    67: {
        "ar": "يقال بعد الوضوء مع الشهادتين",
        "en": "Said after ablution along with the testimony of faith",
        "fr": "Dit après les ablutions avec les deux témoignages de foi",
        "tr": "Abdestten sonra şehadeteyn ile birlikte söylenir",
        "ur": "وضو کے بعد شہادتین کے ساتھ کہا جائے",
        "id": "Diucapkan setelah wudhu bersama dengan dua kalimat syahadat",
        "bn": "ওযুর পর শাহাদাতের সাথে বলা হয়",
        "ms": "Diucapkan selepas wuduk bersama dengan dua kalimah syahadah",
        "sw": "Husemwa baada ya udhu pamoja na ushahidi wa imani",
        "ha": "Ana cewa bayan alwala tare da shaida biyu"
    },
    
    # =====================================
    # أذكار الأذان (Category 10) - IDs 68-70
    # =====================================
    68: {
        "ar": "من قال مثل ما يقول المؤذن من قلبه دخل الجنة",
        "en": "Whoever says what the muezzin says from his heart will enter Paradise",
        "fr": "Celui qui dit ce que dit le muezzin du fond de son cœur entrera au Paradis",
        "tr": "Müezzinin söylediklerini kalbinden söyleyen cennete girer",
        "ur": "جو دل سے مؤذن کی طرح کہے جنت میں داخل ہوگا",
        "id": "Barangsiapa mengucapkan seperti yang diucapkan muadzin dari hatinya akan masuk surga",
        "bn": "যে মুয়াযযিনের মতো অন্তর থেকে বলবে জান্নাতে প্রবেশ করবে",
        "ms": "Sesiapa yang mengucapkan seperti yang diucapkan muazzin dari hatinya akan masuk syurga",
        "sw": "Yeyote anayesema kama anavyosema muadhini kutoka moyoni mwake ataingia Peponi",
        "ha": "Duk wanda ya ce kamar yadda mai kiran salla yake cewa daga zuciyarsa zai shiga aljanna"
    },
    69: {
        "ar": "من قالها بعد الأذان حلت له شفاعة النبي ﷺ يوم القيامة",
        "en": "Whoever says it after the Adhan, the Prophet's intercession becomes lawful for him on the Day of Resurrection",
        "fr": "Celui qui la dit après l'Adhan, l'intercession du Prophète lui sera permise le Jour de la Résurrection",
        "tr": "Ezandan sonra okuyanın kıyamet günü Peygamberin şefaati helal olur",
        "ur": "جو اذان کے بعد کہے، قیامت کے دن نبی کی شفاعت اس کے لیے حلال ہوجائے",
        "id": "Barangsiapa mengucapkannya setelah adzan, syafaat Nabi menjadi halal baginya pada Hari Kiamat",
        "bn": "যে আযানের পর বলবে, কিয়ামতের দিন নবীর শাফাআত তার জন্য বৈধ হবে",
        "ms": "Sesiapa yang mengucapkannya selepas azan, syafaat Nabi menjadi halal baginya pada Hari Kiamat",
        "sw": "Yeyote anayesema baada ya Adhana, uombezi wa Mtume utakuwa halali kwake Siku ya Ufufuo",
        "ha": "Duk wanda ya ce shi bayan adhan, ceton Annabi zai zama halal a gare shi a Ranar Tashin Kiyama"
    },
    70: {
        "ar": "من قالها بعد الشهادتين في الأذان غفرت له ذنوبه",
        "en": "Whoever says it after the testimony in the Adhan, his sins are forgiven",
        "fr": "Celui qui la dit après le témoignage dans l'Adhan, ses péchés sont pardonnés",
        "tr": "Ezandaki şehadetten sonra okuyanın günahları bağışlanır",
        "ur": "جو اذان میں شہادتین کے بعد کہے اس کے گناہ معاف ہوجائیں",
        "id": "Barangsiapa mengucapkannya setelah syahadat dalam adzan, dosanya diampuni",
        "bn": "যে আযানে শাহাদাতের পর বলবে তার গুনাহ মাফ হবে",
        "ms": "Sesiapa yang mengucapkannya selepas syahadah dalam azan, dosanya diampunkan",
        "sw": "Yeyote anayesema baada ya ushahidi katika Adhana, dhambi zake zinasamehewa",
        "ha": "Duk wanda ya ce shi bayan shaida a cikin adhan, za a gafarta zunubansa"
    },
    
    # =====================================
    # أذكار المسجد (Category 11) - IDs 71-73
    # =====================================
    71: {
        "ar": "يقال عند دخول المسجد، يحفظه الله من الشيطان سائر اليوم",
        "en": "Said when entering the mosque. Allah protects him from Satan for the rest of the day",
        "fr": "Dit en entrant dans la mosquée. Allah le protège de Satan pour le reste de la journée",
        "tr": "Mescide girerken söylenir. Allah onu günün geri kalanında şeytandan korur",
        "ur": "مسجد میں داخل ہوتے وقت کہا جائے، اللہ دن بھر شیطان سے محفوظ رکھے",
        "id": "Diucapkan saat masuk masjid. Allah melindunginya dari setan sepanjang hari",
        "bn": "মসজিদে প্রবেশের সময় বলা হয়। আল্লাহ তাকে সারাদিন শয়তান থেকে রক্ষা করেন",
        "ms": "Diucapkan ketika masuk masjid. Allah melindunginya dari syaitan sepanjang hari",
        "sw": "Husemwa unapoingia msikitini. Mwenyezi Mungu anamlinda dhidi ya shetani kwa siku nzima",
        "ha": "Ana cewa lokacin shiga masallaci. Allah zai kare shi daga shaidan sauran ranar"
    },
    72: {
        "ar": "يقال عند دخول المسجد",
        "en": "Said when entering the mosque",
        "fr": "Dit en entrant dans la mosquée",
        "tr": "Mescide girerken söylenir",
        "ur": "مسجد میں داخل ہوتے وقت کہا جائے",
        "id": "Diucapkan saat masuk masjid",
        "bn": "মসজিদে প্রবেশের সময় বলা হয়",
        "ms": "Diucapkan ketika masuk masjid",
        "sw": "Husemwa unapoingia msikitini",
        "ha": "Ana cewa lokacin shiga masallaci"
    },
    73: {
        "ar": "يقال عند الخروج من المسجد",
        "en": "Said when leaving the mosque",
        "fr": "Dit en sortant de la mosquée",
        "tr": "Mescidden çıkarken söylenir",
        "ur": "مسجد سے نکلتے وقت کہا جائے",
        "id": "Diucapkan saat keluar dari masjid",
        "bn": "মসজিদ থেকে বের হওয়ার সময় বলা হয়",
        "ms": "Diucapkan ketika keluar dari masjid",
        "sw": "Husemwa unapotoka msikitini",
        "ha": "Ana cewa lokacin fita daga masallaci"
    },
    
    # =====================================
    # التسبيحات العامة (Category 12) - IDs 74-81
    # =====================================
    74: {
        "ar": "من قالها دبر كل صلاة غفرت خطاياه",
        "en": "Whoever says it after every prayer will have his sins forgiven",
        "fr": "Celui qui la dit après chaque prière aura ses péchés pardonnés",
        "tr": "Her namazdan sonra okuyanın günahları bağışlanır",
        "ur": "جو ہر نماز کے بعد کہے اس کے گناہ معاف ہوں",
        "id": "Barangsiapa mengucapkannya setelah setiap shalat akan diampuni dosanya",
        "bn": "যে প্রতি নামাযের পর বলবে তার গুনাহ মাফ হবে",
        "ms": "Sesiapa yang mengucapkannya selepas setiap solat akan diampunkan dosanya",
        "sw": "Yeyote anayesema baada ya kila swala dhambi zake zitasamehewa",
        "ha": "Duk wanda ya ce shi bayan kowace salla za a gafarta zunubansa"
    },
    75: {
        "ar": "تملأ الميزان",
        "en": "It fills the scale",
        "fr": "Elle remplit la balance",
        "tr": "Teraziyi doldurur",
        "ur": "میزان کو بھر دے",
        "id": "Memenuhi timbangan",
        "bn": "মীযান পূর্ণ করে দেয়",
        "ms": "Memenuhi timbangan",
        "sw": "Inajaza mizani",
        "ha": "Tana cika ma'auni"
    },
    76: {
        "ar": "من قالها دبر كل صلاة غفرت خطاياه وإن كانت مثل زبد البحر",
        "en": "Whoever says it after every prayer, his sins will be forgiven even if like the foam of the sea",
        "fr": "Celui qui la dit après chaque prière, ses péchés seront pardonnés même comme l'écume de la mer",
        "tr": "Her namazdan sonra okuyanın günahları denizin köpüğü kadar bile olsa bağışlanır",
        "ur": "جو ہر نماز کے بعد کہے اس کے گناہ معاف ہوں چاہے سمندر کی جھاگ جتنے ہوں",
        "id": "Barangsiapa mengucapkannya setelah setiap shalat, dosanya akan diampuni meskipun seperti buih laut",
        "bn": "যে প্রতি নামাযের পর বলবে তার গুনাহ মাফ হবে সমুদ্রের ফেনার মতো হলেও",
        "ms": "Sesiapa yang mengucapkannya selepas setiap solat, dosanya akan diampunkan walaupun seperti buih laut",
        "sw": "Yeyote anayesema baada ya kila swala, dhambi zake zitasamehewa hata kama ni kama povu la bahari",
        "ha": "Duk wanda ya ce shi bayan kowace salla, za a gafarta zunubansa ko da sun kasance kamar kumfar teku"
    },
    77: {
        "ar": "أفضل ما قلت أنا والنبيون من قبلي",
        "en": "The best that I and the prophets before me have said",
        "fr": "Le meilleur de ce que moi et les prophètes avant moi avons dit",
        "tr": "Ben ve benden önceki peygamberlerin söylediği en faziletli söz",
        "ur": "سب سے افضل جو میں نے اور مجھ سے پہلے انبیاء نے کہا",
        "id": "Yang terbaik yang aku dan para nabi sebelumku ucapkan",
        "bn": "আমি এবং আমার আগের নবীগণ যা বলেছেন তার মধ্যে সর্বোত্তম",
        "ms": "Yang terbaik yang aku dan para nabi sebelumku ucapkan",
        "sw": "Bora zaidi niliyosema mimi na manabii kabla yangu",
        "ha": "Mafi kyawun abin da na faɗa ni da annabawan da suka gabata ni"
    },
    78: {
        "ar": "كنز من كنوز الجنة",
        "en": "A treasure from the treasures of Paradise",
        "fr": "Un trésor parmi les trésors du Paradis",
        "tr": "Cennet hazinelerinden bir hazine",
        "ur": "جنت کے خزانوں میں سے ایک خزانہ",
        "id": "Harta karun dari harta karun surga",
        "bn": "জান্নাতের ধনভাণ্ডার থেকে একটি ধন",
        "ms": "Harta karun dari harta karun syurga",
        "sw": "Hazina kutoka hazina za Peponi",
        "ha": "Taska daga taskokin aljanna"
    },
    79: {
        "ar": "من لزم الاستغفار جعل الله له من كل ضيق مخرجاً",
        "en": "Whoever maintains seeking forgiveness, Allah will make for him a way out of every difficulty",
        "fr": "Celui qui persévère dans le pardon, Allah lui fera une sortie de toute difficulté",
        "tr": "İstiğfara devam edenin Allah her sıkıntısına çıkış yolu yapar",
        "ur": "جو استغفار کو لازم پکڑے اللہ اس کے لیے ہر تنگی سے نکلنے کا راستہ بنائے",
        "id": "Barangsiapa terus beristighfar, Allah akan menjadikan jalan keluar dari setiap kesulitan",
        "bn": "যে ইস্তিগফার করতে থাকে আল্লাহ তার জন্য প্রতিটি সংকট থেকে পথ বের করে দেন",
        "ms": "Sesiapa yang terus beristighfar, Allah akan menjadikan jalan keluar dari setiap kesulitan",
        "sw": "Yeyote anayeendelea kuomba msamaha, Mwenyezi Mungu atamfanyia njia ya kutoka katika kila shida",
        "ha": "Duk wanda ya dawwama kan neman gafarar, Allah zai yi masa hanyar fita daga kowace wahala"
    },
    80: {
        "ar": "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن",
        "en": "Two phrases light on the tongue, heavy in the scales, beloved to the Most Merciful",
        "fr": "Deux phrases légères sur la langue, lourdes dans la balance, aimées du Très Miséricordieux",
        "tr": "Dilde hafif, mizanda ağır, Rahman'a sevimli iki kelime",
        "ur": "دو کلمے زبان پر ہلکے، میزان میں بھاری، رحمان کو پیارے",
        "id": "Dua kalimat ringan di lidah, berat di timbangan, dicintai Yang Maha Pengasih",
        "bn": "দুটি বাক্য জিহ্বায় হালকা, মীযানে ভারী, রহমানের কাছে প্রিয়",
        "ms": "Dua kalimah ringan di lidah, berat di timbangan, dicintai Yang Maha Pemurah",
        "sw": "Maneno mawili mepesi ulimini, mazito katika mizani, yapendwayo kwa Mwingi wa Rehema",
        "ha": "Kalmomi biyu masu sauƙi a harshe, masu nauyi a ma'auni, ƙaunatattu ga Mai Rahama"
    },
    81: {
        "ar": "من قالها في يوم عشر مرات كان كمن أعتق أربعة أنفس من ولد إسماعيل",
        "en": "Whoever says it ten times in a day will be like one who freed four souls from the descendants of Ismail",
        "fr": "Celui qui la dit dix fois par jour sera comme s'il avait libéré quatre âmes des descendants d'Ismail",
        "tr": "Günde on kez okuyan İsmail'in soyundan dört köle azat etmiş gibi olur",
        "ur": "جو دن میں دس بار کہے گویا اس نے اسماعیل کی اولاد سے چار غلام آزاد کیے",
        "id": "Barangsiapa mengucapkannya sepuluh kali dalam sehari seperti membebaskan empat jiwa dari keturunan Ismail",
        "bn": "যে দিনে দশবার বলবে সে যেন ইসমাইলের চার সন্তানকে মুক্ত করেছে",
        "ms": "Sesiapa yang mengucapkannya sepuluh kali dalam sehari seolah-olah membebaskan empat jiwa dari keturunan Ismail",
        "sw": "Yeyote anayesema mara kumi kwa siku ni kama amewaachilia huru watu wanne wa wazao wa Ismail",
        "ha": "Duk wanda ya ce shi sau goma a rana kamar ya 'yantar da mutane hudu daga zuriyar Isma'ila"
    },
    
    # =====================================
    # جوامع الدعاء (Category 13) - IDs 82-86
    # =====================================
    82: {
        "ar": "أكثر دعاء كان النبي ﷺ يدعو به",
        "en": "The supplication the Prophet (peace be upon him) made most frequently",
        "fr": "L'invocation que le Prophète (paix sur lui) faisait le plus souvent",
        "tr": "Peygamberin (s.a.v.) en çok yaptığı dua",
        "ur": "نبی ﷺ سب سے زیادہ یہ دعا کرتے تھے",
        "id": "Doa yang paling sering dipanjatkan Nabi (saw)",
        "bn": "নবী (সা.) সবচেয়ে বেশি এই দোয়া করতেন",
        "ms": "Doa yang paling kerap dipanjatkan Nabi (saw)",
        "sw": "Dua ambayo Mtume (saw) alifanya mara nyingi zaidi",
        "ha": "Addu'a da Annabi (SAW) ya fi yawancin yi"
    },
    83: {
        "ar": "دعاء جامع لخير الدنيا والآخرة",
        "en": "A comprehensive supplication for the good of this world and the hereafter",
        "fr": "Une invocation complète pour le bien de ce monde et de l'au-delà",
        "tr": "Dünya ve ahiret iyiliği için kapsamlı bir dua",
        "ur": "دنیا و آخرت کی بھلائی کے لیے جامع دعا",
        "id": "Doa yang mencakup kebaikan dunia dan akhirat",
        "bn": "দুনিয়া ও আখিরাতের কল্যাণের জন্য ব্যাপক দোয়া",
        "ms": "Doa yang menyeluruh untuk kebaikan dunia dan akhirat",
        "sw": "Dua ya kina kwa kheri ya dunia na akhera",
        "ha": "Addu'a mai girma don alherin duniya da lahira"
    },
    84: {
        "ar": "ما سئل الله شيئاً أحب إليه من العافية",
        "en": "Nothing is more beloved to Allah to be asked for than well-being",
        "fr": "Rien n'est plus aimé d'Allah que d'être demandé pour le bien-être",
        "tr": "Allah'tan istenilen en sevimli şey afiyettir",
        "ur": "اللہ سے عافیت سے زیادہ پیاری کوئی چیز نہیں مانگی جاتی",
        "id": "Tidak ada yang lebih dicintai Allah untuk diminta selain kesehatan",
        "bn": "আল্লাহর কাছে সুস্থতার চেয়ে প্রিয় কিছু চাওয়া হয় না",
        "ms": "Tiada yang lebih dicintai Allah untuk diminta selain kesejahteraan",
        "sw": "Hakuna kinachopendwa zaidi na Mwenyezi Mungu kuombwa kuliko ustawi",
        "ha": "Babu abin da Allah ya fi so a roƙa daga lafiya"
    },
    85: {
        "ar": "دعاء جامع لإصلاح الدين والدنيا والآخرة",
        "en": "A comprehensive supplication for rectifying religion, worldly life, and the hereafter",
        "fr": "Une invocation complète pour rectifier la religion, la vie mondaine et l'au-delà",
        "tr": "Din, dünya ve ahireti düzeltmek için kapsamlı dua",
        "ur": "دین، دنیا اور آخرت کی اصلاح کے لیے جامع دعا",
        "id": "Doa komprehensif untuk memperbaiki agama, kehidupan dunia, dan akhirat",
        "bn": "দীন, দুনিয়া ও আখিরাত সংশোধনের জন্য ব্যাপক দোয়া",
        "ms": "Doa yang menyeluruh untuk memperbaiki agama, kehidupan dunia dan akhirat",
        "sw": "Dua ya kina kwa kusahihisha dini, maisha ya dunia na akhera",
        "ha": "Addu'a mai girma don gyara addini, rayuwar duniya da lahira"
    },
    86: {
        "ar": "دعاء للحفاظ على النعم والحماية من غضب الله",
        "en": "A supplication for preserving blessings and protection from Allah's wrath",
        "fr": "Une invocation pour préserver les bénédictions et se protéger de la colère d'Allah",
        "tr": "Nimetleri korumak ve Allah'ın gazabından korunmak için dua",
        "ur": "نعمتوں کی حفاظت اور اللہ کے غضب سے پناہ کی دعا",
        "id": "Doa untuk menjaga nikmat dan perlindungan dari murka Allah",
        "bn": "নেয়ামত সংরক্ষণ এবং আল্লাহর ক্রোধ থেকে সুরক্ষার জন্য দোয়া",
        "ms": "Doa untuk memelihara nikmat dan perlindungan dari kemurkaan Allah",
        "sw": "Dua ya kuhifadhi baraka na ulinzi dhidi ya ghadhabu ya Mwenyezi Mungu",
        "ha": "Addu'a don kiyaye ni'imomi da kariya daga fushin Allah"
    },
    
    # =====================================
    # سيد الاستغفار (Category 14) - ID 87
    # =====================================
    87: {
        "ar": "من قالها من النهار موقنًا بها فمات من يومه قبل أن يمسي فهو من أهل الجنة",
        "en": "Whoever says it with conviction during the day and dies before evening will be among the people of Paradise",
        "fr": "Celui qui la dit avec conviction pendant la journée et meurt avant le soir sera parmi les gens du Paradis",
        "tr": "Gündüz inanarak söyleyip akşam olmadan ölen cennet ehlindendir",
        "ur": "جو دن میں یقین کے ساتھ کہے اور شام سے پہلے وفات پائے وہ جنتیوں میں سے ہے",
        "id": "Barangsiapa mengucapkannya dengan yakin di siang hari dan meninggal sebelum sore akan termasuk penghuni surga",
        "bn": "যে দিনে বিশ্বাসের সাথে বলবে এবং সন্ধ্যার আগে মারা যাবে সে জান্নাতীদের অন্তর্ভুক্ত হবে",
        "ms": "Sesiapa yang mengucapkannya dengan yakin pada siang hari dan meninggal sebelum petang akan termasuk penghuni syurga",
        "sw": "Yeyote anayesema kwa yakini wakati wa mchana na akafa kabla ya jioni atakuwa miongoni mwa watu wa Peponi",
        "ha": "Duk wanda ya ce shi da yakini cikin rana kuma ya mutu kafin yamma zai kasance cikin mutanen aljanna"
    }
}


async def update_all_virtue_translations():
    """تحديث ترجمات الفضل لجميع الأذكار في قاعدة البيانات"""
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'adkar_app')]
    
    print("=" * 60)
    print("🔄 جاري تحديث ترجمات الفضل لجميع الأذكار...")
    print("=" * 60)
    
    updated_count = 0
    not_found_count = 0
    
    for azkar_id, translations in COMPLETE_VIRTUE_TRANSLATIONS.items():
        # Check if azkar exists
        existing = await db.azkar.find_one({"id": azkar_id})
        
        if not existing:
            # Try to find by different ID patterns
            existing = await db.azkar.find_one({"id": str(azkar_id)})
        
        if existing:
            # تحديث الذكر بالترجمات الجديدة
            result = await db.azkar.update_one(
                {"id": existing["id"]},
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
            else:
                print(f"⏭️  الذكر رقم {azkar_id} محدث مسبقاً")
        else:
            not_found_count += 1
            print(f"⚠️  لم يتم العثور على الذكر رقم {azkar_id}")
    
    print("\n" + "=" * 60)
    print(f"🎉 تم الانتهاء!")
    print(f"   ✅ تم تحديث: {updated_count} ذكر")
    print(f"   ⚠️  لم يتم العثور على: {not_found_count} ذكر")
    print("=" * 60)
    
    # Verify results
    print("\n📊 التحقق من النتائج:")
    languages = ['ar', 'en', 'fr', 'tr', 'ur', 'id', 'bn', 'ms', 'sw', 'ha']
    total = await db.azkar.count_documents({})
    
    for lang in languages:
        field = f'virtue_{lang}'
        count = await db.azkar.count_documents({field: {"$exists": True, "$ne": "", "$ne": None}})
        percentage = (count / total * 100) if total > 0 else 0
        status = "✅" if count >= 80 else "⚠️"
        print(f"   {status} {lang}: {count}/{total} ({percentage:.1f}%)")
    
    client.close()
    return updated_count


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("سكربت تحديث ترجمات الفضل الشامل")
    print("Complete Virtue Translations Update Script")
    print("=" * 60 + "\n")
    
    asyncio.run(update_all_virtue_translations())
