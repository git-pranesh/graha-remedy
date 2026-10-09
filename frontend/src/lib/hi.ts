/** Hindi (Devanagari) names and UI labels for panchang pages. Numerals stay Latin. */

export type Lang = "en" | "hi";

const TITHI: Record<string, string> = {
  Pratipada: "प्रतिपदा", Dwitiya: "द्वितीया", Tritiya: "तृतीया", Chaturthi: "चतुर्थी", Panchami: "पंचमी",
  Shashthi: "षष्ठी", Saptami: "सप्तमी", Ashtami: "अष्टमी", Navami: "नवमी", Dashami: "दशमी", Ekadashi: "एकादशी",
  Dwadashi: "द्वादशी", Trayodashi: "त्रयोदशी", Chaturdashi: "चतुर्दशी", Purnima: "पूर्णिमा", Amavasya: "अमावस्या",
};
const NAKSHATRA: Record<string, string> = {
  Ashwini: "अश्विनी", Bharani: "भरणी", Krittika: "कृत्तिका", Rohini: "रोहिणी", Mrigashira: "मृगशिरा", Ardra: "आर्द्रा",
  Punarvasu: "पुनर्वसु", Pushya: "पुष्य", Ashlesha: "आश्लेषा", Magha: "मघा", "Purva Phalguni": "पूर्वा फाल्गुनी",
  "Uttara Phalguni": "उत्तरा फाल्गुनी", Hasta: "हस्त", Chitra: "चित्रा", Swati: "स्वाति", Vishakha: "विशाखा",
  Anuradha: "अनुराधा", Jyeshtha: "ज्येष्ठा", Mula: "मूल", "Purva Ashadha": "पूर्वाषाढ़ा", "Uttara Ashadha": "उत्तराषाढ़ा",
  Shravana: "श्रवण", Dhanishtha: "धनिष्ठा", Shatabhisha: "शतभिषा", "Purva Bhadrapada": "पूर्वाभाद्रपद",
  "Uttara Bhadrapada": "उत्तराभाद्रपद", Revati: "रेवती",
};
const YOGA: Record<string, string> = {
  Vishkambha: "विष्कम्भ", Priti: "प्रीति", Ayushman: "आयुष्मान", Saubhagya: "सौभाग्य", Shobhana: "शोभन",
  Atiganda: "अतिगण्ड", Sukarma: "सुकर्मा", Dhriti: "धृति", Shula: "शूल", Ganda: "गण्ड", Vriddhi: "वृद्धि",
  Dhruva: "ध्रुव", Vyaghata: "व्याघात", Harshana: "हर्षण", Vajra: "वज्र", Siddhi: "सिद्धि", Vyatipata: "व्यतीपात",
  Variyana: "वरीयान", Parigha: "परिघ", Shiva: "शिव", Siddha: "सिद्ध", Sadhya: "साध्य", Shubha: "शुभ",
  Shukla: "शुक्ल", Brahma: "ब्रह्म", Indra: "इन्द्र", Vaidhriti: "वैधृति",
};
const KARANA: Record<string, string> = {
  Bava: "बव", Balava: "बालव", Kaulava: "कौलव", Taitila: "तैतिल", Garaja: "गर", Vanija: "वणिज", Vishti: "विष्टि (भद्रा)",
  Shakuni: "शकुनि", Chatushpada: "चतुष्पद", Naga: "नाग", Kimstughna: "किंस्तुघ्न",
};
const SIGN: Record<string, string> = {
  Mesha: "मेष", Vrishabha: "वृषभ", Mithuna: "मिथुन", Karka: "कर्क", Simha: "सिंह", Kanya: "कन्या",
  Tula: "तुला", Vrishchika: "वृश्चिक", Dhanu: "धनु", Makara: "मकर", Kumbha: "कुंभ", Meena: "मीन",
};
const MONTH: Record<string, string> = {
  Chaitra: "चैत्र", Vaishakha: "वैशाख", Jyeshtha: "ज्येष्ठ", Ashadha: "आषाढ़", Shravana: "श्रावण", Bhadrapada: "भाद्रपद",
  Ashwin: "आश्विन", Kartika: "कार्तिक", Margashirsha: "मार्गशीर्ष", Pausha: "पौष", Magha: "माघ", Phalguna: "फाल्गुन",
};
const WEEKDAY: Record<string, string> = {
  Sunday: "रविवार", Monday: "सोमवार", Tuesday: "मंगलवार", Wednesday: "बुधवार", Thursday: "गुरुवार",
  Friday: "शुक्रवार", Saturday: "शनिवार",
};
const PLANET: Record<string, string> = {
  Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि",
};
const CHOG: Record<string, string> = {
  Udveg: "उद्वेग", Char: "चर", Labh: "लाभ", Amrit: "अमृत", Kaal: "काल", Shubh: "शुभ", Rog: "रोग",
};
const CHOG_MEANING: Record<string, string> = {
  Anxiety: "चिंता", Moving: "गतिशील", Gain: "लाभ", Nectar: "अमृत", Loss: "हानि", Auspicious: "शुभ", Illness: "रोग",
};
const EKADASHI: Record<string, string> = {
  Shattila: "षट्तिला", Jaya: "जया", Vijaya: "विजया", Amalaki: "आमलकी", Papamochani: "पापमोचिनी", Kamada: "कामदा",
  Varuthini: "वरुथिनी", Mohini: "मोहिनी", Apara: "अपरा", Padmini: "पद्मिनी", Parama: "परमा", Nirjala: "निर्जला",
  Yogini: "योगिनी", Devshayani: "देवशयनी", Kamika: "कामिका", "Shravana Putrada": "श्रावण पुत्रदा", Aja: "अजा",
  Parsva: "परिवर्तिनी (पार्श्व)", Indira: "इन्दिरा", Papankusha: "पापांकुशा", Rama: "रमा", Devutthana: "देवउठनी",
  Utpanna: "उत्पन्ना", Mokshada: "मोक्षदा", Saphala: "सफला", "Pausha Putrada": "पौष पुत्रदा",
};
const PAKSHA: Record<string, string> = { Shukla: "शुक्ल", Krishna: "कृष्ण" };

export const HI_MONTHS_GREG = [
  "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर",
];

const TABLES = {
  tithi: TITHI, nakshatra: NAKSHATRA, yoga: YOGA, karana: KARANA, sign: SIGN, month: MONTH, weekday: WEEKDAY,
  planet: PLANET, chog: CHOG, chogMeaning: CHOG_MEANING, ekadashi: EKADASHI, paksha: PAKSHA,
};
export type NameKind = keyof typeof TABLES;

/** Translate a single English/Sanskrit-transliterated name; returns the input if lang is "en" or unknown. */
export function tr(lang: Lang, kind: NameKind, name: string): string {
  return lang === "hi" ? (TABLES[kind][name] ?? name) : name;
}

/** "Krishna Trayodashi" -> "कृष्ण त्रयोदशी". */
export function trTithi(lang: Lang, full: string): string {
  if (lang === "en") return full;
  const [p, t] = full.split(" ");
  return `${PAKSHA[p] ?? p} ${TITHI[t] ?? t}`;
}

export const HI_CITY: Record<string, string> = {
  mumbai: "मुंबई", delhi: "दिल्ली", bengaluru: "बेंगलुरु", pune: "पुणे", ahmedabad: "अहमदाबाद", jaipur: "जयपुर",
  kolkata: "कोलकाता", surat: "सूरत", hyderabad: "हैदराबाद", gurugram: "गुरुग्राम", noida: "नोएडा", lucknow: "लखनऊ",
  vadodara: "वडोदरा", indore: "इंदौर", ludhiana: "लुधियाना", jammu: "जम्मू", jodhpur: "जोधपुर", thane: "ठाणे",
  ghaziabad: "गाज़ियाबाद", chandigarh: "चंडीगढ़", nagpur: "नागपुर", nashik: "नासिक", bhopal: "भोपाल", rajkot: "राजकोट",
  patna: "पटना", chennai: "चेन्नई", faridabad: "फरीदाबाद", kanpur: "कानपुर", udaipur: "उदयपुर", jalandhar: "जालंधर",
  dehradun: "देहरादून", raipur: "रायपुर", bikaner: "बीकानेर", varanasi: "वाराणसी", meerut: "मेरठ", agra: "आगरा",
  kolhapur: "कोल्हापुर", guwahati: "गुवाहाटी", shimla: "शिमला", amritsar: "अमृतसर", mysuru: "मैसूर", solapur: "सोलापुर",
  ranchi: "रांची", kota: "कोटा", mohali: "मोहाली", ajmer: "अजमेर", bhubaneswar: "भुवनेश्वर", jabalpur: "जबलपुर",
  jamnagar: "जामनगर", panchkula: "पंचकूला", gwalior: "ग्वालियर", prayagraj: "प्रयागराज", mathura: "मथुरा",
  bareilly: "बरेली", gandhinagar: "गांधीनगर", visakhapatnam: "विशाखापत्तनम", vijayawada: "विजयवाड़ा",
  coimbatore: "कोयंबटूर", madurai: "मदुरै", kochi: "कोच्चि", thiruvananthapuram: "तिरुवनंतपुरम", ujjain: "उज्जैन",
  haridwar: "हरिद्वार", dallas: "डलास", toronto: "टोरंटो", atlanta: "अटलांटा", "san-jose": "सैन होज़े",
  edison: "एडिसन (न्यू जर्सी)", seattle: "सिएटल", chicago: "शिकागो", austin: "ऑस्टिन", houston: "ह्यूस्टन",
  boston: "बोस्टन", "los-angeles": "लॉस एंजिल्स", fremont: "फ्रीमॉन्ट", "new-york": "न्यूयॉर्क", london: "लंदन",
  leicester: "लेस्टर", sydney: "सिडनी", melbourne: "मेलबर्न", singapore: "सिंगापुर", dubai: "दुबई",
};

export const HI_COUNTRY: Record<string, string> = {
  IN: "भारत", US: "अमेरिका", CA: "कनाडा", GB: "यूनाइटेड किंगडम", AU: "ऑस्ट्रेलिया", SG: "सिंगापुर", AE: "संयुक्त अरब अमीरात",
};

/** UI labels. */
export const L = {
  en: {
    until: "until", then: ", then ", thereafter: "thereafter", allDay: "all day",
    tithi: "Tithi", nakshatra: "Nakshatra", yoga: "Yoga", karana: "Karana", vara: "Vara (weekday)", paksha: "Paksha",
    pakshaWord: "Paksha", lunarMonth: "Lunar month", amanta: "amanta", purnimanta: "purnimanta", adhika: "Adhika ",
    samvat: "Samvat", vikram: "Vikram Samvat", shaka: "Shaka", moonSign: "Moon sign", sunSign: "Sun sign",
    sunrise: "Sunrise", sunset: "Sunset", moonrise: "Moonrise", moonset: "Moonset", dayLen: "Day length", nightLen: "Night length",
    noMoonrise: "No moonrise before next sunrise", noMoonset: "No moonset before next sunrise",
    rahu: "Rahu Kalam", yama: "Yamaganda", gulika: "Gulika Kalam", abhijit: "Abhijit Muhurta", brahma: "Brahma Muhurta",
    notWed: "Not observed on Wednesdays", chogCol: "Choghadiya", time: "Time", nature: "Nature", horaCol: "Hora (planet)",
    good: "Auspicious", neutral: "Neutral (good for travel)", bad: "Inauspicious",
    h: "h", min: "min",
  },
  hi: {
    until: "तक", then: ", फिर ", thereafter: "उसके बाद", allDay: "पूरे दिन",
    tithi: "तिथि", nakshatra: "नक्षत्र", yoga: "योग", karana: "करण", vara: "वार", paksha: "पक्ष",
    pakshaWord: "पक्ष", lunarMonth: "चंद्र मास", amanta: "अमांत", purnimanta: "पूर्णिमांत", adhika: "अधिक ",
    samvat: "संवत", vikram: "विक्रम संवत", shaka: "शक संवत", moonSign: "चंद्र राशि", sunSign: "सूर्य राशि",
    sunrise: "सूर्योदय", sunset: "सूर्यास्त", moonrise: "चंद्रोदय", moonset: "चंद्रास्त", dayLen: "दिनमान", nightLen: "रात्रिमान",
    noMoonrise: "अगले सूर्योदय से पहले चंद्रोदय नहीं", noMoonset: "अगले सूर्योदय से पहले चंद्रास्त नहीं",
    rahu: "राहु काल", yama: "यमगण्ड", gulika: "गुलिक काल", abhijit: "अभिजित मुहूर्त", brahma: "ब्रह्म मुहूर्त",
    notWed: "बुधवार को मान्य नहीं", chogCol: "चौघड़िया", time: "समय", nature: "प्रकृति", horaCol: "होरा (ग्रह)",
    good: "शुभ", neutral: "सामान्य (यात्रा के लिए अच्छा)", bad: "अशुभ",
    h: "घंटे", min: "मिनट",
  },
} as const;
