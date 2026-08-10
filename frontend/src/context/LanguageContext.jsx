import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const dictionary = {
  hi: {
    // Categories
    "Prescriptions & Pharmacy": "प्रिस्क्रिप्शन एवं फार्मेसी",
    "Nutrition & Health": "पोषण और स्वास्थ्य",
    "Medical Devices": "चिकित्सा उपकरण",
    "Kid's Essentials": "बच्चों की आवश्यकताएं",
    "Baby & Kids": "शिशु और बच्चे",
    "Baby Needs and Pediatric Needs": "शिशु और बाल चिकित्सा आवश्यकताएं",
    "Dermocosmetics (Skin Care)": "त्वचा की देखभाल (डर्मोकोस्मेटिक्स)",
    "Skin Care": "त्वचा की देखभाल",
    "Personal Care": "व्यक्तिगत देखभाल",
    "Baby Care": "शिशु देखभाल",
    "Ayurvedic & Herbal": "आयुर्वेदिक और हर्बल",

    // UI Header & Dashboard Strings
    "Shop by Category": "श्रेणी के अनुसार खरीदारी करें",
    "Explore our curated healthcare product categories": "हमारे क्यूरेटेड स्वास्थ्य उत्पाद श्रेणियों का अन्वेषण करें",
    "All Products": "सभी उत्पाद",
    "Search Results": "खोज परिणाम",
    "Page": "पृष्ठ",
    "of": "का",
    "Total Items": "कुल वस्तुएं",
    "See All": "सभी देखें",
    "Change Password": "पासवर्ड बदलें",
    "Logout": "लॉगआउट",
    "Categories": "श्रेणियां",

    // Product Title Translations
    "Vitamin D3 Drops": "विटामिन D3 ड्रॉप्स",
    "Pediatric Probiotic Sachets": "पीडियाट्रिक प्रोबायोटिक पाउच",
    "Pediatric ORS Powder": "पीडियाट्रिक ओआरएस पाउडर",
    "Pediatric Multivitamin Syrup": "बच्चों का मल्टीविटामिन सिरप",
    "Pediatric Fever Syrup": "बच्चों का बुखार सिरप",
    "Pediatric Electrolyte Drink": "बच्चों का इलेक्ट्रोलाइट पेय",
    "Pediatric Cough Syrup": "बच्चों का खांसी सिरप",
    "Pediatric Cold Syrup": "बच्चों का सर्दी-जुकाम सिरप",
    "Pampers Baby Diapers (Small Pack)": "पैम्पर्स बेबी डायपर (छोटा पैक)",
    "Mamy Poko Baby Wipes (72 Sheets)": "मैमी पोको बेबी वाइप्स (72 शीट्स)",
    "Iron Syrup": "आयरन सिरप",
    "Diaper Rash Cream": "डायपर रैश क्रीम",
    "Children's Sunscreen SPF 50": "बच्चों की सनस्क्रीन एसपीएफ़ 50",
    "Children's Multivitamin Gummies": "बच्चों की मल्टीविटामिन गमीज़",
    "Children's Mosquito Repellent Cream": "बच्चों की मच्छर भगाने की क्रीम",
    "Children's Moisturizing Cream": "बच्चों की मॉइस्चराइजिंग क्रीम",
    "Children's Lip Balm": "बच्चों का लिप बाम",
    "Children's Antiseptic Cream": "बच्चों की एंटीसेप्टिक क्रीम",
    "Calcium Syrup": "कैल्शियम सिरप",
    "Baby Toothpaste": "बेबी टूथपेस्ट",
    "Baby Toothbrush": "बेबी टूथब्रश",
    "Baby Soap": "बेबी सोप (साबुन)",
    "Baby Shampoo": "बेबी शैम्पू",
    "Baby Powder": "बेबी पाउडर",
    "Baby Pacifier": "बेबी पैसिफायर",
    "Baby Oil": "बेबी ऑयल (तेल)",
    "Baby Mosquito Patch": "बेबी मॉस्किटो पैच",
    "Baby Lotion": "बेबी लोशन",
    "Baby Laundry Detergent": "बेबी लांड्री डिटर्जेंट",
    "Baby Formula Milk": "बेबी फार्मूला दूध",
    "Baby Feeding Bottle": "बेबी फीडिंग बोतल",
    "Baby Cereal": "बेबी सेरिअल",
    "Baby Bottle Cleaner": "बेबी बोतल क्लीनर",
    "Baby Body Wash": "बेबी बॉडी वॉश",
    "Baby Bib": "बेबी बिब",

    // Common Medical Terms
    "Paracetamol": "पैरासिटामोल",
    "Dolo": "डोलो 650",
    "Vitamin": "विटामिन",
    "Multivitamin": "मल्टीविटामिन",
    "Tablets": "गोलियां (टैबलेट)",
    "Capsules": "कैप्सूल",
    "Syrup": "सिरप",
    "Ointment": "मलहम (ऑइंटमेंट)",
    "Gel": "जेल",
    "Pain Relief": "दर्द निवारक",
    "Fever": "बुखार",
    "Cough": "खांसी",
    "Cold": "सर्दी जुकाम",
    "Antibiotic": "एंटीबायोटिक",
    "Supplement": "सप्लीमेंट",
    "Health": "स्वास्थ्य",
    "Care": "देखभाल",
    "Blood Pressure Monitor": "बीपी मॉनिटर (रक्तचाप माप यंत्र)",
    "Thermometer": "थर्मामीटर (तापमान माप यंत्र)",
    "Pulse Oximeter": "पल्स ऑक्सीमीटर",
    "First Aid Kit": "प्राथमिक चिकित्सा किट",
    "Sanitizer": "सैनिटाइजर",
    "Face Mask": "फेस मास्क",
    "Dettol": "डेटॉल",
    "Vicks": "विक्स",
    "Volini": "वोलिनी",
    "Horlicks": "हॉर्लिक्स",
    "Bournvita": "बॉर्नविटा",
    "Protinex": "प्रोटीनैक्स",
    "Chyawanprash": "च्यवनप्राश",
    "Authentic": "प्रामाणिक",
    "Safe": "सुरक्षित",
    "Quality": "गुणवत्ता",
  },
  te: {
    // Categories
    "Prescriptions & Pharmacy": "ప్రిస్క్రిప్షన్ & ఫార్మసీ",
    "Nutrition & Health": "పోషణ & ఆరోగ్యం",
    "Medical Devices": "వైద్య పరికరాలు",
    "Kid's Essentials": "పిల్లల అవసరాలు",
    "Baby & Kids": "శిశువులు & పిల్లలు",
    "Baby Needs and Pediatric Needs": "శిశువు మరియు పిల్లల వైద్య అవసరాలు",
    "Dermocosmetics (Skin Care)": "చర్మ సంరక్షణ (డెర్మోకోస్మెటిక్స్)",
    "Skin Care": "చర్మ సంరక్షణ",
    "Personal Care": "వ్యక్తిగత సంరక్షణ",
    "Baby Care": "శిశు సంరక్షణ",
    "Ayurvedic & Herbal": "ఆయుర్వేద & మూలికా",

    // UI Header & Dashboard Strings
    "Shop by Category": "కేటగిరీ వారీగా షాపింగ్ చేయండి",
    "Explore our curated healthcare product categories": "మా ఆరోగ్య సంరక్షణ ఉత్పత్తుల కేటగిరీలను అన్వేషించండి",
    "All Products": "అన్ని ఉత్పత్తులు",
    "Search Results": "శోధన ఫలితాలు",
    "Page": "పేజీ",
    "of": "యొక్క",
    "Total Items": "మొత్తం వస్తువులు",
    "See All": "అన్నీ చూడండి",
    "Change Password": "పాస్‌వర్డ్ మార్చండి",
    "Logout": "లాగౌట్",
    "Categories": "కేటగిరీలు",

    // Product Title Translations
    "Vitamin D3 Drops": "విటమిన్ D3 చుక్కలు",
    "Pediatric Probiotic Sachets": "పిల్లల ప్రోబయోటిక్ ప్యాకెట్లు",
    "Pediatric ORS Powder": "పిల్లల ఓఆర్‌ఎస్ పొడి",
    "Pediatric Multivitamin Syrup": "పిల్లల మల్టీవిటమిన్ సిరప్",
    "Pediatric Fever Syrup": "పిల్లల జ్వరం సిరప్",
    "Pediatric Electrolyte Drink": "పిల్లల ఎలక్ట్రోలైట్ పానీయం",
    "Pediatric Cough Syrup": "పిల్లల దగ్గు సిరప్",
    "Pediatric Cold Syrup": "పిల్లల జలుబు సిరప్",
    "Pampers Baby Diapers (Small Pack)": "ప్యాంపర్స్ బేబీ డైపర్లు",
    "Mamy Poko Baby Wipes (72 Sheets)": "మామీ పోకో బేబీ వైప్స్",
    "Iron Syrup": "ఐరన్ సిరప్",
    "Diaper Rash Cream": "డైపర్ రాష్ క్రీమ్",
    "Children's Sunscreen SPF 50": "పిల్లల సన్‌స్క్రీన్ ఎస్‌పిఎఫ్ 50",
    "Children's Multivitamin Gummies": "పిల్లల మల్టీవిటమిన్ గమ్మీస్",
    "Children's Mosquito Repellent Cream": "పిల్లల దోమల నివారణ క్రీమ్",
    "Children's Moisturizing Cream": "పిల్లల మోయిశ్చరైజింగ్ క్రీమ్",
    "Children's Lip Balm": "పిల్లల లిప్ బామ్",
    "Children's Antiseptic Cream": "పిల్లల యాంటిసెప్టిక్ క్రీమ్",
    "Calcium Syrup": "కాల్షియం సిరప్",
    "Baby Toothpaste": "బేబీ టూత్‌పేస్ట్",
    "Baby Toothbrush": "బేబీ టూత్‌బ్రష్",
    "Baby Soap": "బేబీ సబ్బు",
    "Baby Shampoo": "బేబీ షాంపూ",
    "Baby Powder": "బేబీ పౌడర్",
    "Baby Pacifier": "బేబీ ప్యాసిఫైయర్",
    "Baby Oil": "బేబీ ఆయిల్ (నూనె)",
    "Baby Mosquito Patch": "బేబీ దోమల ప్యాచ్",
    "Baby Lotion": "బేబీ లోషన్",
    "Baby Laundry Detergent": "బేబీ లాండ్రీ డిటర్జెంట్",
    "Baby Formula Milk": "బేబీ ఫార్ములా పాలు",
    "Baby Feeding Bottle": "బేబీ ఫీడింగ్ సీసా",
    "Baby Cereal": "బేబీ సీరియల్",
    "Baby Bottle Cleaner": "బేబీ బాటిల్ క్లీనర్",
    "Baby Body Wash": "బేబీ బాడీ వాష్",
    "Baby Bib": "బేబీ బిబ్",

    // Common Medical Terms
    "Paracetamol": "పారాసిటమాల్",
    "Dolo": "డోలో 650",
    "Vitamin": "విటమిన్",
    "Multivitamin": "మల్టీవిటమిన్",
    "Tablets": "మాత్రలు (టాబ్లెట్లు)",
    "Capsules": "క్యాప్సూల్స్",
    "Syrup": "సిరప్",
    "Ointment": "మయిన్మెంట్",
    "Gel": "జెల్",
    "Pain Relief": "నొప్పి నివారిణి",
    "Fever": "జ్వరం",
    "Cough": "దగ్గు",
    "Cold": "జలుబు",
    "Antibiotic": "యాంటీబయోటిక్",
    "Supplement": "సప్లిమెంట్",
    "Health": "ఆరోగ్యం",
    "Care": "సంరక్షణ",
    "Blood Pressure Monitor": "బిపి మానిటర్ (బిపి పరీక్ష యంత్రం)",
    "Thermometer": "థర్మామీటర్",
    "Pulse Oximeter": "పల్స్ ఆక్సిమీటర్",
    "First Aid Kit": "ప్రథమ చికిత్స కిట్",
    "Sanitizer": "సానిటైజర్",
    "Face Mask": "ఫేస్ మాస్క్",
    "Dettol": "డెట్టాల్",
    "Vicks": "విక్స్",
    "Volini": "వోలిని",
    "Horlicks": "హార్లిక్స్",
    "Bournvita": "బోర్న్విటా",
    "Protinex": "ప్రోటీనెక్స్",
    "Chyawanprash": "చ్యవన్‌ప్రాష్",
    "Authentic": "అసలైనది",
    "Safe": "సురక్షితమైనది",
    "Quality": "నాణ్యత",
  },
  kn: {
    // Categories
    "Prescriptions & Pharmacy": "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಮತ್ತು ಫಾರ್ಮಸಿ",
    "Nutrition & Health": "ಪೌಷ್ಟಿಕಾಂಶ ಮತ್ತು ಆರೋಗ್ಯ",
    "Medical Devices": "ವೈದ್ಯಕೀಯ ಉಪಕರಣಗಳು",
    "Kid's Essentials": "ಮಕ್ಕಳ ಅಗತ್ಯ ವಸ್ತುಗಳು",
    "Baby & Kids": "ಮಕ್ಕಳು ಮತ್ತು ಶಿಶುಗಳು",
    "Baby Needs and Pediatric Needs": "ಶಿಶು ಮತ್ತು ಮಕ್ಕಳ ವೈದ್ಯಕೀಯ ಅಗತ್ಯಗಳು",
    "Dermocosmetics (Skin Care)": "ಚರ್ಮದ ರಕ್ಷಣೆ",
    "Skin Care": "ಚರ್ಮದ ರಕ್ಷಣೆ",
    "Personal Care": "ವೈಯಕ್ತಿಕ ರಕ್ಷಣೆ",
    "Baby Care": "ಮಗುವಿನ ರಕ್ಷಣೆ",
    "Ayurvedic & Herbal": "ಆಯುರ್ವೇದ ಮತ್ತು ಮೂಲಿಕೆ",

    // UI Header & Dashboard Strings
    "Shop by Category": "ವರ್ಗದ ಪ್ರಕಾರ ખરીದಿಸಿ",
    "Explore our curated healthcare product categories": "ನಮ್ಮ ಆರೋಗ್ಯ ರಕ್ಷಣಾ ಉತ್ಪನ್ನಗಳ ವರ್ಗಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    "All Products": "ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳು",
    "Search Results": "ಹುಡುಕಾಟ ಫಲಿತಾಂಶಗಳು",
    "Page": "ಪುಟ",
    "of": "ನ",
    "Total Items": "ಒಟ್ಟು ವಸ್ತುಗಳು",
    "See All": "ಎಲ್ಲವನ್ನೂ ನೋಡಿ",
    "Change Password": "ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ",
    "Logout": "ಲಾಗ್‌ಔಟ್",
    "Categories": "ವರ್ಗಗಳು",

    // Product Title Translations
    "Vitamin D3 Drops": "ವಿಟಮಿನ್ D3 ಹನಿಗಳು",
    "Pediatric Probiotic Sachets": "ಮಕ್ಕಳ ಪ್ರೊಬಯೋಟಿಕ್ ಪ್ಯಾಕೆಟ್",
    "Pediatric ORS Powder": "ಮಕ್ಕಳ ಒಆರ್‌ಎಸ್ ಪೌಡರ್",
    "Pediatric Multivitamin Syrup": "ಮಕ್ಕಳ ಮಲ್ಟಿವಿಟಮಿನ್ ಸಿರಾಪ್",
    "Pediatric Fever Syrup": "ಮಕ್ಕಳ ಜ್ವರದ ಸಿರಾಪ್",
    "Pediatric Electrolyte Drink": "ಮಕ್ಕಳ ಎಲೆಕ್ಟ್ರೋಲೈಟ್ ಪಾನೀಯ",
    "Pediatric Cough Syrup": "ಮಕ್ಕಳ ಕೆಮ್ಮಿನ ಸಿರಾಪ್",
    "Pediatric Cold Syrup": "ಮಕ್ಕಳ ನೆಗಡಿಯ ಸಿರಾಪ್",
    "Pampers Baby Diapers (Small Pack)": "ಪ್ಯಾಂಪರ್ಸ್ ಬೇಬಿ ಡೈಪರ್ಸ್",
    "Mamy Poko Baby Wipes (72 Sheets)": "ಮ್ಯಾಮಿ ಪೋಕೋ ಬೇಬಿ ವೈಪ್ಸ್",
    "Iron Syrup": "ಐರನ್ ಸಿರಾಪ್",
    "Diaper Rash Cream": "ಡೈಪರ್ ರಾಶ್ ಕ್ರೀಮ್",
    "Children's Sunscreen SPF 50": "ಮಕ್ಕಳ ಸನ್‌ಸ್ಕ್ರೀನ್ SPF 50",
    "Children's Multivitamin Gummies": "ಮಕ್ಕಳ ಮಲ್ಟಿವಿಟಮಿನ್ ಗಮ್ಮೀಸ್",
    "Children's Mosquito Repellent Cream": "ಮಕ್ಕಳ ಸೊಳ್ಳೆ ನಿವಾರಕ ಕ್ರೀಮ್",
    "Children's Moisturizing Cream": "ಮಕ್ಕಳ ಮೊಯಿಶ್ಚರೈಸಿಂಗ್ ಕ್ರೀಮ್",
    "Children's Lip Balm": "ಮಕ್ಕಳ ಲಿಪ್ ಬಾಮ್",
    "Children's Antiseptic Cream": "ಮಕ್ಕಳ ಆಂಟಿಸೆಪ್ಟಿಕ್ ಕ್ರೀಮ್",
    "Calcium Syrup": "ಕ್ಯಾಲ್ಸಿಯಂ ಸಿರಾಪ್",
    "Baby Toothpaste": "ಬೇಬಿ ಟೂತ್‌ಪೇಸ್ಟ್",
    "Baby Toothbrush": "ಬೇಬಿ ಟೂತ್‌ಬ್ರಷ್",
    "Baby Soap": "ಬೇಬಿ ಸೋಪ್ (ಸೋಪು)",
    "Baby Shampoo": "ಬೇಬಿ ಶ್ಯಾಂಪೂ",
    "Baby Powder": "ಬೇಬಿ ಪೌಡರ್",
    "Baby Pacifier": "ಬೇಬಿ ಪ್ಯಾಸಿಫೈಯರ್",
    "Baby Oil": "ಬೇಬಿ ಆಯಿಲ್ (ಎಣ್ಣೆ)",
    "Baby Mosquito Patch": "ಬೇಬಿ ಸೊಳ್ಳೆ ಪ್ಯಾಚ್",
    "Baby Lotion": "ಬೇಬಿ ಲೋಷನ್",
    "Baby Laundry Detergent": "ಬೇಬಿ ಲಾಂಡ್ರಿ ಡಿಟರ್ಜೆಂಟ್",
    "Baby Formula Milk": "ಬೇಬಿ ಫಾರ್ಮುಲಾ ಹಾಲು",
    "Baby Feeding Bottle": "ಬೇಬಿ ಫೀಡಿಂಗ್ ಬಾಟಲಿ",
    "Baby Cereal": "ಬೇಬಿ ಸೀರಿಯಲ್",
    "Baby Bottle Cleaner": "ಬೇಬಿ ಬಾಟಲ್ ಕ್ಲೀನರ್",
    "Baby Body Wash": "ಬೇಬಿ ಬಾಡಿ ವಾಶ್",
    "Baby Bib": "ಬೇಬಿ ಬಿಬ್",

    // Common Medical Terms
    "Paracetamol": "ಪ್ಯಾರಾಸಿಟಮಾಲ್",
    "Dolo": "ಡೋಲೋ 650",
    "Vitamin": "ವಿಟಮಿನ್",
    "Multivitamin": "ಮಲ್ಟಿವಿಟಮಿನ್",
    "Tablets": "ಮಾತ್ರೆಗಳು (ಟ್ಯಾಬ್ಲೆಟ್)",
    "Capsules": "ಕ್ಯಾಪ್ಸುಲ್ಗಳು",
    "Syrup": "ಸಿರಪ್",
    "Ointment": "ಮಲಂ",
    "Gel": "ಜೆಲ್",
    "Pain Relief": "ನೋವು ನಿವಾರಕ",
    "Fever": "ಜ್ವರ",
    "Cough": "ಕೆಮ್ಮು",
    "Cold": "ನೆಗಡಿ",
    "Antibiotic": "ಆಂಟಿಬಯೋಟಿಕ್",
    "Supplement": "ಸಪ್ಲಿಮೆಂಟ್",
    "Health": "ಆರೋಗ್ಯ",
    "Care": "ರಕ್ಷಣೆ",
    "Blood Pressure Monitor": "ಬಿಪಿ ಮಾನಿಟರ್",
    "Thermometer": "ಥರ್ಮಾಮೀಟರ್",
    "Pulse Oximeter": "ಪಲ್ಸ್ ಆಕ್ಸಿಮೀಟರ್",
    "First Aid Kit": "ಪ್ರಥಮ ಚಿಕಿತ್ಸಾ ಕಿಟ್",
    "Sanitizer": "ಸ್ಯಾನಿಟೈಸರ್",
    "Face Mask": "ಫೇಸ್ ಮಾಸ್ಕ್",
    "Dettol": "ಡೆಟ್ಟಾಲ್",
    "Vicks": "ವಿಕ್ಸ್",
    "Volini": "ವೋಲಿನಿ",
    "Horlicks": "ಹಾರ್ಲಿಕ್ಸ್",
    "Bournvita": "ಬೋರ್ನ್‌ವಿಟಾ",
    "Protinex": "ಪ್ರೋಟೀನೆಕ್ಸ್",
    "Chyawanprash": "ಚ್ಯವನ್‌ಪ್ರಾಶ್",
    "Authentic": "ಅಧಿಕೃತ",
    "Safe": "ಸುರಕ್ಷಿತ",
    "Quality": "ಗುಣಮಟ್ಟ",
  }
};

export const translations = {
  en: {
    storeName: "Sanjeevani",
    tagline: "24/7 Healthcare & Pharmacy",
    searchPlaceholder: "Search medicines, healthcare products, wellness items...",
    cart: "Cart",
    favorites: "Favorites",
    myOrders: "My Orders",
    account: "Account",
    logout: "Logout",
    login: "Login / Register",

    price: "Price",
    mrp: "MRP",
    inclusiveTaxes: "Inclusive of all taxes",
    rating: "Rating",
    verifiedReviews: "Verified Customer Reviews",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    quantity: "Quantity",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    addedToCart: "Added to Cart!",
    descriptionTab: "Description & Overview",
    usageTab: "Dosage & Instructions",
    keyBenefits: "Key Benefits:",
  },
  hi: {
    storeName: "संजीवनी",
    tagline: "24/7 स्वास्थ्य सेवा एवं फार्मेसी",
    searchPlaceholder: "दवाइयां, स्वास्थ्य उत्पाद, वेलनेस आइटम खोजें...",
    cart: "कार्ट",
    favorites: "पसंदीदा",
    myOrders: "मेरे ऑर्डर",
    account: "खाता",
    logout: "लॉगआउट",
    login: "लॉगिन / पंजीकरण",

    price: "मूल्य",
    mrp: "एमआरपी",
    inclusiveTaxes: "सभी कर शामिल",
    rating: "रेटिंग",
    verifiedReviews: "सत्यापित ग्राहक समीक्षाएं",
    inStock: "स्टॉक में उपलब्ध",
    outOfStock: "आउट ऑफ स्टॉक",
    quantity: "मात्रा",
    addToCart: "कार्ट में जोड़ें",
    buyNow: "अभी खरीदें",
    addedToCart: "कार्ट में जोड़ा गया!",
    descriptionTab: "विवरण और विवरण",
    usageTab: "खुराक और निर्देश",
    keyBenefits: "मुख्य लाभ:",
  },
  te: {
    storeName: "సంజీవని",
    tagline: "24/7 హెల్త్‌కేర్ & ఫార్మసీ",
    searchPlaceholder: "మందులు, ఆరోగ్య ఉత్పత్తులు, వెల్నెస్ ఐటమ్స్ శోధించండి...",
    cart: "కార్ట్",
    favorites: "ఇష్టమైనవి",
    myOrders: "నా ఆర్డర్‌లు",
    account: "ఖాతా",
    logout: "లాగౌట్",
    login: "లాగిన్ / రిజిస్టర్",

    price: "ధర",
    mrp: "ఎమ్‌ఆర్‌పి",
    inclusiveTaxes: "అన్ని పన్నులతో సహా",
    rating: "రేటింగ్",
    verifiedReviews: "ధృవీకరించబడిన కస్టమర్ సమీక్షలు",
    inStock: "స్టాక్‌లో ఉంది",
    outOfStock: "స్టాక్ లేదు",
    quantity: "పరిమాణం",
    addToCart: "కార్ట్‌కు జోడించండి",
    buyNow: "ఇప్పుడే కొనండి",
    addedToCart: "కార్ట్‌కు జోడించబడింది!",
    descriptionTab: "వివరణ & అవలోకనం",
    usageTab: "మోతాదు & సూచనలు",
    keyBenefits: "ముఖ్యమైన ప్రయోజనాలు:",
  },
  kn: {
    storeName: "ಸಂಜೀವನಿ",
    tagline: "24/7 ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಮತ್ತು ಫಾರ್ಮಸಿ",
    searchPlaceholder: "ಔಷಧಿಗಳು, ಆರೋಗ್ಯ ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ...",
    cart: "ಕಾರ್ಟ್",
    favorites: "ಮೆಚ್ಚಿನವುಗಳು",
    myOrders: "ನನ್ನ ಆರ್ಡರ್‌ಗಳು",
    account: "ಖಾತೆ",
    logout: "ಲಾಗ್‌ಔಟ್",
    login: "ಲಾಗಿನ್ / ನೋಂದಣಿ",

    price: "ಬೆಲೆ",
    mrp: "ಎಮ್‌ಆರ್‌ಪಿ",
    inclusiveTaxes: "ಎಲ್ಲಾ ತೆರಿಗೆಗಳು ಸೇರಿವೆ",
    rating: "ರೇಟಿಂಗ್",
    verifiedReviews: "ಖಚಿತಪಡಿಸಿದ ಗ್ರಾಹಕರ ವಿಮರ್ಶೆಗಳು",
    inStock: "ಸ್ಟಾಕ್‌ನಲ್ಲಿದೆ",
    outOfStock: "ಸ್ಟಾಕ್ ಮುಗಿದಿದೆ",
    quantity: "ಪ್ರಮಾಣ",
    addToCart: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
    buyNow: "ಈಗಲೇ ಖರೀದಿಸಿ",
    addedToCart: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ!",
    descriptionTab: "ವಿವರಣೆ ಮತ್ತು ಅವಲೋಕನ",
    usageTab: "ಪ್ರಮಾಣ ಮತ್ತು ಸೂಚನೆಗಳು",
    keyBenefits: "ಮುಖ್ಯ ಪ್ರಯೋಜನಗಳು:",
  }
};

export const fetchTranslation = async (text, targetLang) => {
  if (!text || typeof text !== 'string' || targetLang === 'en') return text;
  const clean = text.trim();
  if (!clean) return text;

  if (!window.translationMemoryCache) {
    window.translationMemoryCache = new Map();
  }

  // 1. Check In-Memory Cache
  const cacheKey = `tr_${targetLang}_${clean}`;
  if (window.translationMemoryCache.has(cacheKey)) {
    return window.translationMemoryCache.get(cacheKey);
  }

  // 2. Optional Hugging Face Inference API check if token provided in env or window
  const hfToken = typeof window !== 'undefined' ? (window.HUGGINGFACE_TOKEN || import.meta.env?.VITE_HUGGINGFACE_TOKEN) : null;
  if (hfToken) {
    try {
      const hfModelMap = { hi: 'Helsinki-NLP/opus-mt-en-hi', te: 'Helsinki-NLP/opus-mt-en-dra', kn: 'Helsinki-NLP/opus-mt-en-dra' };
      const model = hfModelMap[targetLang];
      if (model) {
        const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          headers: { Authorization: `Bearer ${hfToken}`, 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify({ inputs: clean }),
        });
        const hfData = await hfRes.json();
        if (Array.isArray(hfData) && hfData[0] && hfData[0].translation_text) {
          const resText = hfData[0].translation_text;
          window.translationMemoryCache.set(cacheKey, resText);
          return resText;
        }
      }
    } catch (e) {}
  }

  // 3. Ultra-fast Free Translation API (Google Translate GTX Client Service - 100% Coverage)
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(clean)}`);
    const data = await res.json();
    if (data && data[0] && Array.isArray(data[0])) {
      const translatedStr = data[0].map(item => item && item[0] ? item[0] : '').join('');
      if (translatedStr) {
        window.translationMemoryCache.set(cacheKey, translatedStr);
        return translatedStr;
      }
    }
  } catch (err) {
    // 4. Backup Fallback: MyMemory API
    try {
      const res2 = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|${targetLang}`);
      const data2 = await res2.json();
      if (data2 && data2.responseData && data2.responseData.translatedText) {
        const translated2 = data2.responseData.translatedText;
        window.translationMemoryCache.set(cacheKey, translated2);
        return translated2;
      }
    } catch (e2) {}
  }

  return text;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      changeLanguage: () => {},
      t: (key) => translations['en']?.[key] || key,
      translateData: (text) => text,
      fetchTranslation: (text) => Promise.resolve(text),
      trVersion: 0
    };
  }
  return context;
};

export const TranslatedText = ({ text }) => {
  const { language, translateData } = useLanguage();
  const [translated, setTranslated] = React.useState(() => translateData(text));

  React.useEffect(() => {
    let isMounted = true;
    if (!text || language === 'en') {
      setTranslated(text);
      return;
    }

    const instant = translateData(text);
    if (instant && instant !== text) {
      setTranslated(instant);
    }

    fetchTranslation(text, language).then(res => {
      if (isMounted && res) {
        setTranslated(res);
      }
    });

    return () => { isMounted = false; };
  }, [text, language, translateData]);

  return <>{translated || text}</>;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sanjeevani_lang') || 'en';
  });
  const [trVersion, setTrVersion] = useState(0);

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('sanjeevani_lang', langCode);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const translateData = (text) => {
    if (!text || typeof text !== 'string' || language === 'en') return text;
    const clean = text.trim();
    if (!clean) return text;

    // 1. Direct dictionary exact match
    if (dictionary[language]?.[clean]) {
      return dictionary[language][clean];
    }

    // 2. Case-insensitive dictionary match
    const langDict = dictionary[language];
    if (langDict) {
      const lowerClean = clean.toLowerCase();
      const dictKey = Object.keys(langDict).find(k => k.toLowerCase() === lowerClean);
      if (dictKey) {
        return langDict[dictKey];
      }
    }

    // 3. Check in-memory translation cache (window.translationMemoryCache)
    if (!window.translationMemoryCache) {
      window.translationMemoryCache = new Map();
    }
    const memKey = `tr_${language}_${clean}`;
    if (window.translationMemoryCache.has(memKey)) {
      return window.translationMemoryCache.get(memKey);
    }

    // 4. Phrase / Keyword replacement fallback
    let translated = clean;
    if (langDict) {
      Object.keys(langDict).forEach(key => {
        if (key.length > 2 && translated.toLowerCase().includes(key.toLowerCase())) {
          const reg = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          translated = translated.replace(reg, langDict[key]);
        }
      });
    }

    // 5. Trigger live background translation & force app re-render on completion
    fetchTranslation(clean, language).then((resText) => {
      if (resText && resText !== clean && resText !== translated) {
        setTrVersion(v => v + 1);
      }
    });

    return translated;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, translateData, fetchTranslation, trVersion }}>
      {children}
    </LanguageContext.Provider>
  );
};
