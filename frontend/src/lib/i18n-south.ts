/** Telugu and Tamil names and labels for panchang pages (keys = English/transliterated names used by the engine). */

const k = (keys: string[], vals: string[]) => Object.fromEntries(keys.map((x, i) => [x, vals[i]]));

const TITHI_KEYS = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Amavasya"];
const NAK_KEYS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
const YOGA_KEYS = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
const KARANA_KEYS = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"];
const SIGN_KEYS = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
const MONTH_KEYS = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashwin", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"];
const WD_KEYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PLANET_KEYS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const TAMIL_MONTH_KEYS = ["Chithirai", "Vaikasi", "Aani", "Aadi", "Avani", "Purattasi", "Aippasi", "Karthigai", "Margazhi", "Thai", "Maasi", "Panguni"];
const SAMV_KEYS = ["Vishvavasu", "Parabhava", "Plavanga", "Kilaka"];

export const TE = {
  tithi: k(TITHI_KEYS, ["పాడ్యమి", "విదియ", "తదియ", "చవితి", "పంచమి", "షష్ఠి", "సప్తమి", "అష్టమి", "నవమి", "దశమి", "ఏకాదశి", "ద్వాదశి", "త్రయోదశి", "చతుర్దశి", "పౌర్ణమి", "అమావాస్య"]),
  nakshatra: k(NAK_KEYS, ["అశ్విని", "భరణి", "కృత్తిక", "రోహిణి", "మృగశిర", "ఆర్ద్ర", "పునర్వసు", "పుష్యమి", "ఆశ్లేష", "మఖ", "పుబ్బ", "ఉత్తర", "హస్త", "చిత్త", "స్వాతి", "విశాఖ", "అనూరాధ", "జ్యేష్ఠ", "మూల", "పూర్వాషాఢ", "ఉత్తరాషాఢ", "శ్రవణం", "ధనిష్ఠ", "శతభిషం", "పూర్వాభాద్ర", "ఉత్తరాభాద్ర", "రేవతి"]),
  yoga: k(YOGA_KEYS, ["విష్కంభ", "ప్రీతి", "ఆయుష్మాన్", "సౌభాగ్య", "శోభన", "అతిగండ", "సుకర్మ", "ధృతి", "శూల", "గండ", "వృద్ధి", "ధ్రువ", "వ్యాఘాత", "హర్షణ", "వజ్ర", "సిద్ధి", "వ్యతీపాత", "వరీయాన్", "పరిఘ", "శివ", "సిద్ధ", "సాధ్య", "శుభ", "శుక్ల", "బ్రహ్మ", "ఇంద్ర", "వైధృతి"]),
  karana: k(KARANA_KEYS, ["బవ", "బాలవ", "కౌలవ", "తైతుల", "గరజ", "వణిజ", "విష్టి (భద్ర)", "శకుని", "చతుష్పాద", "నాగవ", "కింస్తుఘ్న"]),
  sign: k(SIGN_KEYS, ["మేషం", "వృషభం", "మిథునం", "కర్కాటకం", "సింహం", "కన్య", "తుల", "వృశ్చికం", "ధనుస్సు", "మకరం", "కుంభం", "మీనం"]),
  month: k(MONTH_KEYS, ["చైత్రం", "వైశాఖం", "జ్యేష్ఠం", "ఆషాఢం", "శ్రావణం", "భాద్రపదం", "ఆశ్వయుజం", "కార్తీకం", "మార్గశిరం", "పుష్యం", "మాఘం", "ఫాల్గుణం"]),
  weekday: k(WD_KEYS, ["ఆదివారం", "సోమవారం", "మంగళవారం", "బుధవారం", "గురువారం", "శుక్రవారం", "శనివారం"]),
  planet: k(PLANET_KEYS, ["సూర్యుడు", "చంద్రుడు", "కుజుడు", "బుధుడు", "గురుడు", "శుక్రుడు", "శని"]),
  paksha: { Shukla: "శుక్ల", Krishna: "బహుళ" } as Record<string, string>,
  tamilMonth: k(TAMIL_MONTH_KEYS, TAMIL_MONTH_KEYS),
  samvatsara: k(SAMV_KEYS, ["విశ్వావసు", "పరాభవ", "ప్లవంగ", "కీలక"]),
  greg: ["జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్", "జూలై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్"],
};

export const TA = {
  tithi: k(TITHI_KEYS, ["பிரதமை", "துவிதியை", "திருதியை", "சதுர்த்தி", "பஞ்சமி", "சஷ்டி", "சப்தமி", "அஷ்டமி", "நவமி", "தசமி", "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்த்தசி", "பௌர்ணமி", "அமாவாசை"]),
  nakshatra: k(NAK_KEYS, ["அசுவினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்", "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை", "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"]),
  yoga: k(YOGA_KEYS, ["விஷ்கம்பம்", "ப்ரீதி", "ஆயுஷ்மான்", "சௌபாக்யம்", "சோபனம்", "அதிகண்டம்", "சுகர்மம்", "திருதி", "சூலம்", "கண்டம்", "விருத்தி", "துருவம்", "வியாகாதம்", "ஹர்ஷணம்", "வஜ்ரம்", "சித்தி", "வியதீபாதம்", "வரீயான்", "பரிகம்", "சிவம்", "சித்தம்", "சாத்தியம்", "சுபம்", "சுக்லம்", "பிரம்மம்", "இந்திரம்", "வைதிருதி"]),
  karana: k(KARANA_KEYS, ["பவம்", "பாலவம்", "கௌலவம்", "தைதுலம்", "கரசை", "வணிசை", "பத்திரை (விஷ்டி)", "சகுனி", "சதுஷ்பாதம்", "நாகவம்", "கிம்ஸ்துக்னம்"]),
  sign: k(SIGN_KEYS, ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"]),
  month: k(MONTH_KEYS, ["சைத்ரம்", "வைசாகம்", "ஜ்யேஷ்டம்", "ஆஷாடம்", "ஸ்ராவணம்", "பாத்ரபதம்", "ஆஸ்வயுஜம்", "கார்த்திகம்", "மார்கசீர்ஷம்", "பௌஷம்", "மாகம்", "பால்குனம்"]),
  weekday: k(WD_KEYS, ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"]),
  planet: k(PLANET_KEYS, ["சூரியன்", "சந்திரன்", "செவ்வாய்", "புதன்", "குரு", "சுக்கிரன்", "சனி"]),
  paksha: { Shukla: "வளர்பிறை", Krishna: "தேய்பிறை" } as Record<string, string>,
  tamilMonth: k(TAMIL_MONTH_KEYS, ["சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி", "ஐப்பசி", "கார்த்திகை", "மார்கழி", "தை", "மாசி", "பங்குனி"]),
  samvatsara: k(SAMV_KEYS, ["விசுவாவசு", "பராபவ", "பிலவங்க", "கீலக"]),
  greg: ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"],
};

export const L_TE = {
  until: "వరకు", then: ", తర్వాత ", thereafter: "ఆ తర్వాత", allDay: "రోజంతా",
  tithi: "తిథి", nakshatra: "నక్షత్రం", yoga: "యోగం", karana: "కరణం", vara: "వారం", paksha: "పక్షం",
  pakshaWord: "పక్షం", lunarMonth: "మాసం", amanta: "అమాంత", purnimanta: "పూర్ణిమాంత", adhika: "అధిక ",
  samvat: "శక సంవత్సరం", vikram: "విక్రమ సంవత్", shaka: "శక", moonSign: "చంద్ర రాశి", sunSign: "సూర్య రాశి",
  sunrise: "సూర్యోదయం", sunset: "సూర్యాస్తమయం", moonrise: "చంద్రోదయం", moonset: "చంద్రాస్తమయం", dayLen: "పగటి సమయం", nightLen: "రాత్రి సమయం",
  noMoonrise: "తదుపరి సూర్యోదయానికి ముందు చంద్రోదయం లేదు", noMoonset: "తదుపరి సూర్యోదయానికి ముందు చంద్రాస్తమయం లేదు",
  rahu: "రాహుకాలం", yama: "యమగండం", gulika: "గుళిక కాలం", abhijit: "అభిజిత్ ముహూర్తం", brahma: "బ్రహ్మ ముహూర్తం",
  notWed: "బుధవారం వర్తించదు", chogCol: "చోఘడియా", time: "సమయం", nature: "స్వభావం", horaCol: "హోర (గ్రహం)",
  good: "శుభం", neutral: "సామాన్యం", bad: "అశుభం", h: "గం", min: "ని",
  dur: "దుర్ముహూర్తం", varjyam: "వర్జ్యం", amrit: "అమృత కాలం", samvatsara: "సంవత్సరం", tamilDate: "తమిళ తేదీ",
};

export const L_TA = {
  until: "வரை", then: ", பின்னர் ", thereafter: "அதன் பிறகு", allDay: "நாள் முழுவதும்",
  tithi: "திதி", nakshatra: "நட்சத்திரம்", yoga: "யோகம்", karana: "கரணம்", vara: "கிழமை", paksha: "பட்சம்",
  pakshaWord: "", lunarMonth: "சந்திர மாதம்", amanta: "அமாந்த", purnimanta: "பூர்ணிமாந்த", adhika: "அதிக ",
  samvat: "சக ஆண்டு", vikram: "விக்ரம சம்வத்", shaka: "சக", moonSign: "சந்திர ராசி", sunSign: "சூரிய ராசி",
  sunrise: "சூரிய உதயம்", sunset: "சூரிய அஸ்தமனம்", moonrise: "சந்திர உதயம்", moonset: "சந்திர அஸ்தமனம்", dayLen: "பகல் நேரம்", nightLen: "இரவு நேரம்",
  noMoonrise: "அடுத்த சூரிய உதயத்திற்கு முன் சந்திர உதயம் இல்லை", noMoonset: "அடுத்த சூரிய உதயத்திற்கு முன் சந்திர அஸ்தமனம் இல்லை",
  rahu: "ராகு காலம்", yama: "எமகண்டம்", gulika: "குளிகை", abhijit: "அபிஜித் முகூர்த்தம்", brahma: "பிரம்ம முகூர்த்தம்",
  notWed: "புதன்கிழமை பொருந்தாது", chogCol: "சோகடியா", time: "நேரம்", nature: "தன்மை", horaCol: "ஹோரை (கிரகம்)",
  good: "சுபம்", neutral: "சாதாரணம்", bad: "அசுபம்", h: "மணி", min: "நிமி",
  dur: "துர்முகூர்த்தம்", varjyam: "தியாஜ்யம் (வர்ஜ்யம்)", amrit: "அமிர்த காலம்", samvatsara: "தமிழ் ஆண்டு", tamilDate: "தமிழ் தேதி",
};

export const TE_CITY: Record<string, string> = {
  hyderabad: "హైదరాబాద్", visakhapatnam: "విశాఖపట్నం", vijayawada: "విజయవాడ", bengaluru: "బెంగళూరు", chennai: "చెన్నై",
  mumbai: "ముంబై", delhi: "ఢిల్లీ", pune: "పుణె", dallas: "డల్లాస్", "san-jose": "శాన్ హోసే", edison: "ఎడిసన్ (న్యూజెర్సీ)",
  chicago: "చికాగో", atlanta: "అట్లాంటా", seattle: "సియాటిల్", houston: "హ్యూస్టన్", austin: "ఆస్టిన్", fremont: "ఫ్రీమాంట్",
  "new-york": "న్యూయార్క్", toronto: "టొరంటో", london: "లండన్", sydney: "సిడ్నీ", melbourne: "మెల్బోర్న్", singapore: "సింగపూర్", dubai: "దుబాయ్",
};

export const TA_CITY: Record<string, string> = {
  chennai: "சென்னை", coimbatore: "கோயம்புத்தூர்", madurai: "மதுரை", bengaluru: "பெங்களூரு", kochi: "கொச்சி",
  thiruvananthapuram: "திருவனந்தபுரம்", hyderabad: "ஹைதராபாத்", mumbai: "மும்பை", delhi: "டெல்லி", singapore: "சிங்கப்பூர்",
  london: "லண்டன்", toronto: "டொரன்டோ", sydney: "சிட்னி", melbourne: "மெல்போர்ன்", dubai: "துபாய்", "new-york": "நியூயார்க்",
  edison: "எடிசன் (நியூ ஜெர்சி)", "san-jose": "சான் ஹோசே", dallas: "டல்லாஸ்", houston: "ஹூஸ்டன்", chicago: "சிகாகோ", atlanta: "அட்லாண்டா",
};
