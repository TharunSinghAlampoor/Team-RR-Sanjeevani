import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, X, Send, Sparkles, ShoppingBag, Truck, FileText, 
  HelpCircle, RefreshCw, ChevronRight, MessageSquare, ShieldCheck, 
  ArrowRight, HeartPulse, Mic, MicOff, Volume2, VolumeX, LayoutGrid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import shopService from '../api/shopService';
import ProductImage from './ProductImage';

const SPEECH_LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
};

const CATEGORIES = [
  { name: 'Prescriptions & Pharmacy', slug: 'prescriptions-pharmacy', icon: '💊', action: 'cat_prescriptions' },
  { name: 'Nutrition & Health', slug: 'nutrition-health', icon: '🏋️', action: 'cat_nutrition' },
  { name: 'Medical Devices', slug: 'medical-devices', icon: '🩺', action: 'cat_devices' },
  { name: 'Baby & Kids', slug: 'baby-kids', icon: '👶', action: 'cat_baby' },
  { name: 'Skin Care', slug: 'skin-care', icon: '✨', action: 'cat_skin' },
];

/* ── VIBRANT HIGH-CONTRAST ANIMATED ROBO ICON (METALLIC SILVER HEAD, DARK CONTOURS, ELECTRIC BLUE BODY, NEON CYAN VISOR EYES) ── */
const AnimatedDoctorRoboIcon = ({ size = 68, style = {} }) => {
  const sizeStyle = typeof size === 'number' ? `${size}px` : size;
  return (
    <motion.div
      animate={{
        y: [0, -5, 0],
        rotate: [0, -1.5, 1.5, 0],
      }}
      transition={{
        duration: 2.8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        position: 'relative',
        width: sizeStyle,
        height: sizeStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        willChange: 'transform',
        transform: 'translateZ(0)',
        filter: 'drop-shadow(0 6px 16px rgba(13, 92, 117, 0.4))',
        ...style
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Head Metallic Gloss Gradient with Dark Contour */}
          <linearGradient id="roboHeadGrad" x1="20" y1="12" x2="80" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Visor Jet-Black Glass */}
          <linearGradient id="roboVisorGrad" x1="28" y1="20" x2="72" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* High-Contrast Sanjeevani Electric Blue Body Gradient */}
          <linearGradient id="roboBodyGrad" x1="30" y1="46" x2="70" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="45%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* Chest Screen Dark Navy Gradient */}
          <linearGradient id="roboChestGrad" x1="34" y1="56" x2="66" y2="84" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          {/* Eye Glow Filter */}
          <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. TOP ANTENNAE */}
        <line x1="33" y1="18" x2="31" y2="6" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="30.5" cy="5" r="2.8" fill="#10B981" stroke="#0F172A" strokeWidth="1.2" />

        <line x1="67" y1="18" x2="69" y2="6" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="69.5" cy="5" r="2.8" fill="#10B981" stroke="#0F172A" strokeWidth="1.2" />

        {/* 2. HELMET HEAD */}
        {/* Helmet Shadow Base Rim */}
        <ellipse cx="50" cy="46" rx="27" ry="6" fill="#0F172A" opacity="0.4" />

        {/* High-Contrast Helmet Outer Shell with Bold Dark Stroke */}
        <path
          d="M 22 28 C 22 13, 78 13, 78 28 C 78 41, 68 46, 50 46 C 32 46, 22 41, 22 28 Z"
          fill="url(#roboHeadGrad)"
          stroke="#0F172A"
          strokeWidth="2.2"
        />

        {/* Side Ear Caps */}
        <rect x="18" y="23" width="4.5" height="11" rx="2" fill="#0EA5E9" stroke="#0F172A" strokeWidth="1.2" />
        <rect x="77.5" y="23" width="4.5" height="11" rx="2" fill="#0EA5E9" stroke="#0F172A" strokeWidth="1.2" />

        {/* Dark Visor Screen */}
        <rect x="27" y="19.5" width="46" height="21" rx="9" fill="url(#roboVisorGrad)" stroke="#38BDF8" strokeWidth="1.6" />

        {/* Glowing Cyan Eyes ("|" and "-") */}
        <motion.g
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          filter="url(#cyanGlow)"
        >
          <rect x="36.5" y="24" width="4.8" height="11.8" rx="1.5" fill="#00F0FF" />
          <rect x="48.5" y="28" width="13" height="4.5" rx="1.5" fill="#00F0FF" />
        </motion.g>

        {/* 3. VIBRANT HIGH-CONTRAST BODY POD */}
        {/* Neck Pedestal Joint */}
        <ellipse cx="50" cy="48.5" rx="12" ry="3.5" fill="#38BDF8" stroke="#0F172A" strokeWidth="1" />

        {/* High Contrast Blue/Teal Body */}
        <path
          d="M 31 50 C 27 70, 31 92, 50 98 C 69 92, 73 70, 69 50 Z"
          fill="url(#roboBodyGrad)"
          stroke="#0F172A"
          strokeWidth="2"
        />

        {/* Bottom Base */}
        <ellipse cx="50" cy="98" rx="12" ry="4" fill="#0284C7" stroke="#0F172A" strokeWidth="1.2" />

        {/* 4. CHEST DISPLAY SCREEN */}
        <rect x="33" y="55" width="34" height="27" rx="7.5" fill="url(#roboChestGrad)" stroke="#38BDF8" strokeWidth="1.5" />

        {/* 4 Glowing White LED Dots */}
        <motion.g
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <circle cx="40.5" cy="63" r="2.3" fill="#00F0FF" />
          <circle cx="46.8" cy="63" r="2.3" fill="#00F0FF" />
          <circle cx="53.2" cy="63" r="2.3" fill="#00F0FF" />
          <circle cx="59.5" cy="63" r="2.3" fill="#00F0FF" />
        </motion.g>

        {/* "HELP" Text */}
        <text
          x="50"
          y="76"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="6.8"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
          letterSpacing="0.8"
        >
          HELP
        </text>

        {/* 5. ARMS & HANDS WITH HIGH CONTRAST OUTLINES */}
        {/* RIGHT ARM (Viewer's Left) - WAVING HAND 👋 */}
        <motion.g
          style={{ transformOrigin: '31px 54px' }}
          animate={{
            rotate: [0, 20, -8, 20, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <path
            d="M 31 54 C 23 50, 15 44, 12 34"
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 31 54 C 23 50, 15 44, 12 34"
            stroke="#0F172A"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="12" cy="34" r="3" fill="#0EA5E9" stroke="#0F172A" strokeWidth="1" />

          {/* Waving Palm & Fingers */}
          <circle cx="10" cy="28" r="3.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.2" />
          <path d="M 12 30 L 16 28" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 12 30 L 16 28" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
          <path d="M 10 26 L 8 19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M 10 26 L 8 19" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
          <path d="M 8 27 L 4 20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M 8 27 L 4 20" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
          <path d="M 6 29 L 1 23" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M 6 29 L 1 23" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
          <path d="M 6 31 L 2 27" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        </motion.g>

        {/* LEFT ARM (Viewer's Right) - GESTURING OUT */}
        <motion.g
          style={{ transformOrigin: '69px 54px' }}
          animate={{
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <path
            d="M 69 54 C 77 56, 84 62, 87 70"
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 69 54 C 77 56, 84 62, 87 70"
            stroke="#0F172A"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="87" cy="70" r="3" fill="#0EA5E9" stroke="#0F172A" strokeWidth="1" />

          <circle cx="91" cy="73" r="3.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.2" />
          <path d="M 93 71 L 98 69" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M 93 71 L 98 69" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
          <path d="M 94 74 L 99 73" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M 94 74 L 99 73" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
          <path d="M 93 76 L 97 77" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M 91 76 L 94 80" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        </motion.g>
      </svg>
    </motion.div>
  );
};

export const SanjeevaniBot = ({ onOpenCart, onOpenOrders }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(true);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { language, changeLanguage, t, translateData, fetchTranslation } = useLanguage();

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = SPEECH_LANG_MAP[language] || 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          handleSendWithText(transcript);
        }
      };
      recognitionRef.current = recognition;
    }
  }, [language]);

  // Text-to-Speech Function (Strictly in Selected Language)
  const speakText = (text) => {
    if (!isVoiceOutputEnabled || !('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const translatedText = translateData(text);
      const utterance = new SpeechSynthesisUtterance(translatedText);
      const targetLangTag = SPEECH_LANG_MAP[language] || 'en-IN';
      utterance.lang = targetLangTag;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang === targetLangTag || v.lang.startsWith(language));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };



  // Toggle Voice Input (Microphone)
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Please try Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.lang = SPEECH_LANG_MAP[language] || 'en-IN';
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current.stop();
      }
    }
  };

  // Initial Welcome Message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: 'Hello! I am Sanjeevani AI Assistant — your healthcare guide. Ask me about medicines for any symptom (fever, cold, pain, etc.), browse products, track orders, payment options, refunds, or store offers!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: [
          { label: '💊 Browse Medicines', action: 'show_categories' },
          { label: '🤒 Medicine for Fever', action: 'symptom_fever' },
          { label: '🤧 Medicine for Cold & Cough', action: 'symptom_cold' },
          { label: '📦 Track My Order', action: 'track_order' },
          { label: '💳 Payment & Razorpay Options', action: 'payment_info' },
          { label: '🔄 Return & Refund Policy', action: 'return_policy' },
          { label: '🏷️ Store Offers & Coupons', action: 'offers' },
          { label: '📞 24/7 Support Agent', action: 'contact_support' }
        ]
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Handle Category Filtering & Browsing Response
  const handleCategorySelection = async (catItem) => {
    setIsTyping(true);
    await new Promise(res => setTimeout(res, 500));

    let botResponse = {
      id: Date.now(),
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const res = await shopService.getProducts();
      const allProds = (res && res.success && Array.isArray(res.data)) ? res.data : [];
      
      const filtered = allProds.filter(p => {
        const pCat = (p.categoryName || p.category || '').toLowerCase();
        const targetName = catItem.name.toLowerCase();
        if (targetName.includes('prescription') && (pCat.includes('prescription') || pCat.includes('pharmacy') || pCat.includes('medicine'))) return true;
        if (targetName.includes('nutrition') && (pCat.includes('nutrition') || pCat.includes('health') || pCat.includes('supplement'))) return true;
        if (targetName.includes('device') && (pCat.includes('device') || pCat.includes('equipment'))) return true;
        if (targetName.includes('baby') && (pCat.includes('baby') || pCat.includes('kid') || pCat.includes('pediatric'))) return true;
        if (targetName.includes('skin') && (pCat.includes('skin') || pCat.includes('dermo'))) return true;
        return false;
      });

      const displayList = filtered.length > 0 ? filtered : allProds.slice(0, 3);

      botResponse.text = `${catItem.icon} Here are top verified products in ${catItem.name}:`;
      botResponse.products = displayList.slice(0, 3);
      botResponse.actionBtn = {
        label: `Browse All ${catItem.name} Products ➔`,
        onClick: () => {
          setIsOpen(false);
          navigate(`/category/${catItem.slug}`);
        }
      };
    } catch (e) {
      botResponse.text = `Browse top products in ${catItem.name} directly on Sanjeevani Store.`;
      botResponse.actionBtn = {
        label: `Go to ${catItem.name}`,
        onClick: () => {
          setIsOpen(false);
          navigate(`/category/${catItem.slug}`);
        }
      };
    }

    setIsTyping(false);
    setMessages(prev => [...prev, botResponse]);
    if (botResponse.text) speakText(botResponse.text);
  };

  // ── SYMPTOM → MEDICINE RECOMMENDATION KNOWLEDGE BASE ──────────────────
  const SYMPTOM_MEDICINE_MAP = [
    {
      symptomName: 'Fever',
      emoji: '🤒',
      triggers: ['fever', 'temperature', 'bukhar', 'बुखार', 'ज्वर', 'జ్వరం', 'ಜ್ವರ', 'tapman'],
      medicineKeywords: ['paracetamol', 'dolo', 'crocin', 'calpol', 'acetaminophen', 'ibuprofen', 'meftal', 'combiflam', 'disprin', 'aspirin', 'antipyretic', 'fever'],
      advice: 'For fever, commonly recommended OTC medicines include Paracetamol (Dolo 650, Crocin), Ibuprofen, or Meftal-Spas. Stay hydrated and rest. Consult a doctor if fever persists beyond 3 days or exceeds 103°F.',
    },
    {
      symptomName: 'Cold & Flu',
      emoji: '🤧',
      triggers: ['cold', 'flu', 'cough', 'sneez', 'runny nose', 'sardi', 'सर्दी', 'खांसी', 'जुकाम', 'నీళ్ళు', 'జలుబు', 'దగ్గు', 'ಶೀತ', 'ಕೆಮ್ಮು', 'nasal', 'congestion', 'blocked nose', 'sinus'],
      medicineKeywords: ['cetirizine', 'sinarest', 'vicks', 'benadryl', 'cough syrup', 'levocetrizine', 'montelu', 'montelukast', 'allegra', 'cold', 'flu', 'cough', 'nasal', 'otrivin', 'nasivion', 'strepsils', 'honitus', 'cheston'],
      advice: 'For cold & flu, try Cetirizine, Sinarest, or Vicks Action 500. For cough, Benadryl or Honitus syrup can help. Steam inhalation and warm fluids provide relief. See a doctor if symptoms last more than 7 days.',
    },
    {
      symptomName: 'Headache & Migraine',
      emoji: '🤕',
      triggers: ['headache', 'head ache', 'migraine', 'head pain', 'sir dard', 'सिरदर्द', 'सिर दर्द', 'తలనొప్పి', 'ಹೆಡೆನೋವು', 'ತಲೆನೋವು'],
      medicineKeywords: ['paracetamol', 'dolo', 'saridon', 'disprin', 'crocin', 'ibuprofen', 'migraine', 'headache', 'sumatriptan', 'combiflam', 'dart', 'nise'],
      advice: 'For headaches, Paracetamol (Dolo 650), Saridon, Disprin, or Ibuprofen are commonly used. For migraines, consult a doctor for Sumatriptan or specialized treatment. Avoid screen time and rest in a dark room.',
    },
    {
      symptomName: 'Body Pain & Muscle Pain',
      emoji: '💪',
      triggers: ['body pain', 'muscle pain', 'back pain', 'joint pain', 'pain', 'ache', 'dard', 'दर्द', 'कमर दर्द', 'जोड़ों का दर्द', 'నొప్పి', 'ನೋವು', 'sprain', 'strain', 'leg pain', 'knee pain', 'shoulder pain', 'neck pain'],
      medicineKeywords: ['ibuprofen', 'diclofenac', 'combiflam', 'volini', 'moov', 'flexon', 'pain relief', 'muscle', 'pain', 'spray', 'gel', 'ointment', 'move', 'brufen', 'meftal', 'nise', 'aceclofenac', 'thiocolchicoside', 'relaxant'],
      advice: 'For body & muscle pain, try Ibuprofen, Combiflam, or Diclofenac tablets. For topical relief, Volini Spray or Moov cream work well. Apply ice for acute injuries. See a doctor for persistent or severe pain.',
    },
    {
      symptomName: 'Stomach & Digestion Issues',
      emoji: '🤢',
      triggers: ['stomach', 'gastric', 'acidity', 'gas', 'bloating', 'indigestion', 'nausea', 'vomit', 'diarrhea', 'loose motion', 'constipation', 'pet dard', 'पेट दर्द', 'गैस', 'एसिडिटी', 'కడుపు', 'ಹೊಟ್ಟೆ', 'digestion', 'heartburn', 'ulcer'],
      medicineKeywords: ['antacid', 'omeprazole', 'pantoprazole', 'eno', 'gelusil', 'digene', 'ranitidine', 'domperidone', 'ondansetron', 'ors', 'electrolyte', 'loperamide', 'isabgol', 'dulcolax', 'lactulose', 'stomach', 'gastric', 'acidity', 'probiotic', 'gut'],
      advice: 'For acidity/gastric, try Eno, Gelusil, or Pantoprazole. For nausea, Domperidone helps. For diarrhea, take ORS (Electral) and stay hydrated. For constipation, Isabgol or Lactulose syrup may help. Consult a doctor if symptoms persist.',
    },
    {
      symptomName: 'Allergy',
      emoji: '🤧',
      triggers: ['allergy', 'allergic', 'rash', 'hives', 'itching', 'itch', 'urticaria', 'एलर्जी', 'खुजली', 'అలెర్జీ', 'ಅಲರ್ಜಿ', 'skin rash', 'swelling'],
      medicineKeywords: ['cetirizine', 'levocetrizine', 'allegra', 'fexofenadine', 'montelukast', 'antihistamine', 'allergy', 'calamine', 'loratadine', 'chlorpheniramine', 'itch', 'anti-allergy'],
      advice: 'For allergies, Cetirizine, Levocetrizine, or Allegra (Fexofenadine) are commonly prescribed antihistamines. For skin rashes, Calamine lotion soothes itching. Avoid known allergens and consult a doctor for recurring allergies.',
    },
    {
      symptomName: 'Diabetes Care',
      emoji: '💉',
      triggers: ['diabetes', 'sugar', 'blood sugar', 'glucose', 'diabetic', 'मधुमेह', 'शुगर', 'డయాబెటిస్', 'షుగర్', 'ಮಧುಮೇಹ', 'insulin', 'hba1c', 'a1c'],
      medicineKeywords: ['metformin', 'glimepiride', 'insulin', 'glucometer', 'sugar', 'diabetes', 'diabetic', 'glucose', 'test strip', 'lancet', 'glycomet', 'januvia', 'sitagliptin', 'voglibose'],
      advice: 'For diabetes management, Metformin and Glimepiride are commonly prescribed. Monitor blood sugar regularly with a Glucometer. Follow a low-sugar diet and exercise regularly. Always consult your doctor before changing diabetes medication.',
    },
    {
      symptomName: 'Blood Pressure',
      emoji: '❤️',
      triggers: ['blood pressure', 'bp', 'hypertension', 'high bp', 'low bp', 'रक्तचाप', 'ब्लड प्रेशर', 'బీపీ', 'రక్తపోటు', 'ಬಿಪಿ', 'ರಕ್ತದೊತ್ತಡ'],
      medicineKeywords: ['amlodipine', 'telmisartan', 'losartan', 'atenolol', 'bp monitor', 'blood pressure', 'sphygmomanometer', 'ramipril', 'enalapril', 'hypertension', 'olmesartan', 'nebivolol'],
      advice: 'For blood pressure management, Amlodipine, Telmisartan, or Losartan are commonly prescribed. Regular monitoring with a BP monitor is essential. Reduce salt intake, exercise, and manage stress. Never stop BP medication without consulting your doctor.',
    },
    {
      symptomName: 'Skin Care & Infections',
      emoji: '✨',
      triggers: ['skin', 'acne', 'pimple', 'fungal', 'ringworm', 'eczema', 'psoriasis', 'dark spot', 'pigmentation', 'sunscreen', 'moistur', 'त्वचा', 'मुहासे', 'చర్మం', 'ಚರ್ಮ', 'face wash', 'skin infection', 'wound', 'burn', 'cut'],
      medicineKeywords: ['clotrimazole', 'ketoconazole', 'fluconazole', 'benzoyl peroxide', 'salicylic', 'retinol', 'moisturizer', 'sunscreen', 'serum', 'cream', 'lotion', 'skin', 'face wash', 'aloe', 'neem', 'betadine', 'soframycin', 'mupirocin', 'derma', 'anti-fungal', 'antifungal'],
      advice: 'For acne, Benzoyl Peroxide or Salicylic Acid face washes help. For fungal infections, Clotrimazole cream is effective. Always use sunscreen (SPF 30+) daily. For persistent skin issues, consult a dermatologist.',
    },
    {
      symptomName: 'Eye Care',
      emoji: '👁️',
      triggers: ['eye', 'eyes', 'vision', 'eyedrop', 'eye drop', 'dry eye', 'redness', 'conjunctivitis', 'आंख', 'కంటి', 'ಕಣ್ಣು', 'eye pain', 'eye infection', 'blurry'],
      medicineKeywords: ['eye drop', 'eyedrop', 'tear', 'ciprofloxacin', 'moxifloxacin', 'tobramycin', 'eye', 'vision', 'lubricant', 'itone', 'refresh'],
      advice: 'For dry eyes, lubricating eye drops (Refresh Tears) help. For infections, antibiotic drops like Ciprofloxacin may be needed. Avoid rubbing your eyes and reduce screen time. See an ophthalmologist for persistent issues.',
    },
    {
      symptomName: 'Vitamin & Nutrition Deficiency',
      emoji: '💊',
      triggers: ['vitamin', 'calcium', 'iron', 'zinc', 'omega', 'supplement', 'immunity', 'immune', 'weakness', 'fatigue', 'tired', 'energy', 'विटामिन', 'कैल्शियम', 'విటమిన్', 'ವಿಟಮಿನ್', 'protein', 'multivitamin', 'b12', 'd3', 'folic'],
      medicineKeywords: ['vitamin', 'calcium', 'iron', 'zinc', 'omega', 'supplement', 'multivitamin', 'becosule', 'shelcal', 'revital', 'ensure', 'protinex', 'b12', 'd3', 'folic acid', 'biotin', 'immunity', 'immune', 'antioxidant', 'protein', 'nutrition'],
      advice: 'Common supplements include Vitamin D3 + Calcium (Shelcal), Multivitamins (Revital, Becosule), Iron (for anemia), Omega-3 (for heart health), and Protein powders (Protinex, Ensure). Consult a doctor for proper dosage based on blood reports.',
    },
    {
      symptomName: 'Baby & Kids Care',
      emoji: '👶',
      triggers: ['baby', 'child', 'kid', 'infant', 'toddler', 'newborn', 'pediatric', 'बच्चा', 'शिशु', 'పిల్ల', 'బేబీ', 'ಮಗು', 'ಶಿಶು', 'baby fever', 'baby cold', 'diaper', 'rash'],
      medicineKeywords: ['calpol', 'baby', 'infant', 'pediatric', 'gripe water', 'diaper', 'cerelac', 'lactogen', 'baby cream', 'baby oil', 'baby soap', 'kids', 'child'],
      advice: 'For baby fever, Calpol (Paracetamol syrup) is commonly used. For diaper rash, Zinc Oxide cream helps. Always use pediatric-formulated medicines for children. Consult a pediatrician before giving any medication to infants.',
    },
    {
      symptomName: 'Dental & Oral Care',
      emoji: '🦷',
      triggers: ['tooth', 'teeth', 'dental', 'gum', 'mouth ulcer', 'oral', 'toothache', 'दांत', 'दाँत', 'పంటి', 'ಹಲ್ಲು', 'cavity', 'bad breath'],
      medicineKeywords: ['toothpaste', 'mouthwash', 'dental', 'clove oil', 'oral', 'sensodyne', 'listerine', 'chlorhexidine', 'tooth', 'gum', 'orajel'],
      advice: 'For toothache, Clove Oil or Ibuprofen provides temporary relief. For mouth ulcers, Orajel or Chlorhexidine mouthwash helps. Use Sensodyne for sensitive teeth. Visit a dentist for persistent dental issues.',
    },
    {
      symptomName: 'Respiratory & Asthma',
      emoji: '🫁',
      triggers: ['asthma', 'breathing', 'breathless', 'wheezing', 'inhaler', 'respiratory', 'oxygen', 'दमा', 'सांस', 'ఆస్తమా', 'ಆಸ್ತಮಾ', 'shortness of breath', 'chest tightness', 'bronchitis'],
      medicineKeywords: ['inhaler', 'nebulizer', 'salbutamol', 'budesonide', 'montelukast', 'asthma', 'respiratory', 'oxygen', 'oximeter', 'pulse oximeter', 'bronchodilator', 'levosalbutamol', 'formoterol'],
      advice: 'For asthma, Salbutamol inhalers provide quick relief. Budesonide is used for long-term control. A pulse oximeter helps monitor oxygen levels. Always carry your rescue inhaler. Consult a pulmonologist for proper asthma management.',
    },
    {
      symptomName: 'Wound & First Aid',
      emoji: '🩹',
      triggers: ['wound', 'injury', 'first aid', 'bandage', 'antiseptic', 'dressing', 'cut', 'bleeding', 'burn', 'घाव', 'चोट', 'గాయం', 'ಗಾಯ'],
      medicineKeywords: ['bandage', 'dettol', 'betadine', 'antiseptic', 'band-aid', 'cotton', 'gauze', 'first aid', 'wound', 'savlon', 'hydrogen peroxide', 'povidone', 'crepe', 'surgical'],
      advice: 'For minor wounds, clean with Savlon/Dettol antiseptic, apply Betadine (Povidone-Iodine), and cover with a sterile bandage. For burns, run cool water and apply Burnol or Silver Sulfadiazine cream. Seek medical help for deep or infected wounds.',
    },
    {
      symptomName: 'Women\'s Health',
      emoji: '👩',
      triggers: ['period', 'menstrual', 'cramp', 'pcod', 'pcos', 'pregnancy', 'prenatal', 'postnatal', 'menopause', 'पीरियड', 'मासिक', 'నెలసరి', 'ಮಾಸಿಕ', 'contracepti'],
      medicineKeywords: ['meftal spas', 'mefenamic', 'folic acid', 'iron', 'calcium', 'prenatal', 'sanitary', 'pad', 'tampon', 'panty liner', 'intimate wash', 'cranberry'],
      advice: 'For menstrual cramps, Meftal-Spas (Mefenamic Acid + Dicyclomine) is commonly used. Folic Acid and Iron supplements are essential during pregnancy. Always consult a gynecologist for PCOD/PCOS management or prenatal care.',
    },
    {
      symptomName: 'Hair Care',
      emoji: '💇',
      triggers: ['hair', 'hair fall', 'hair loss', 'dandruff', 'bald', 'बालों', 'बाल झड़ना', 'జుట్టు', 'ಕೂದಲು', 'scalp'],
      medicineKeywords: ['biotin', 'minoxidil', 'ketoconazole', 'hair', 'shampoo', 'anti-dandruff', 'scalp', 'follicle', 'hair oil', 'hair serum'],
      advice: 'For hair fall, Biotin supplements and Minoxidil solution are commonly recommended. For dandruff, Ketoconazole shampoo works well. Maintain a protein-rich diet and manage stress. Consult a dermatologist for severe hair loss.',
    },
    {
      symptomName: 'Sleep & Stress',
      emoji: '😴',
      triggers: ['sleep', 'insomnia', 'stress', 'anxiety', 'depression', 'mental health', 'tension', 'neend', 'नींद', 'तनाव', 'నిద్ర', 'ಒತ್ತಡ', 'ನಿದ್ರೆ', 'calm', 'relax', 'panic'],
      medicineKeywords: ['melatonin', 'ashwagandha', 'sleep', 'calm', 'stress', 'anxiety', 'lavender', 'chamomile', 'valerian', 'magnesium', 'zincovit'],
      advice: 'For better sleep, Melatonin supplements or Ashwagandha can help. Practice good sleep hygiene - avoid screens 1 hour before bed, maintain a regular schedule. For anxiety/depression, please consult a psychiatrist for proper treatment. You are not alone.',
    },
    {
      symptomName: 'Thyroid',
      emoji: '🦋',
      triggers: ['thyroid', 'hypothyroid', 'hyperthyroid', 'tsh', 'थायराइड', 'థైరాయిడ్', 'ಥೈರಾಯ್ಡ್'],
      medicineKeywords: ['thyroxine', 'levothyroxine', 'thyronorm', 'thyroid', 'eltroxin'],
      advice: 'For hypothyroidism, Levothyroxine (Thyronorm/Eltroxin) is the standard treatment. Take it on an empty stomach, 30 minutes before breakfast. Regular TSH monitoring every 3-6 months is essential. Never change dosage without doctor consultation.',
    },
    {
      symptomName: 'Infection & Antibiotic',
      emoji: '🦠',
      triggers: ['infection', 'antibiotic', 'bacterial', 'viral', 'संक्रमण', 'ఇన్ఫెక్షన్', 'ಸೋಂಕು', 'uti', 'urinary', 'throat infection', 'ear infection'],
      medicineKeywords: ['amoxicillin', 'azithromycin', 'ciprofloxacin', 'cefixime', 'metronidazole', 'antibiotic', 'anti-bacterial', 'doxycycline', 'norfloxacin', 'ofloxacin', 'augmentin'],
      advice: 'Antibiotics require a valid prescription. Common antibiotics include Amoxicillin, Azithromycin, and Cefixime. Never self-medicate with antibiotics - complete the full course as prescribed by your doctor. Upload your prescription on Sanjeevani for quick dispensing.',
    },
  ];

  // Detect if user query matches any symptom/health condition
  const detectSymptomIntent = (queryText) => {
    const q = queryText.toLowerCase();
    // Also detect generic "medicine for X" or "tablet for X" patterns
    const medicineForPattern = q.match(/(?:medicine|tablet|syrup|capsule|cream|drop|spray|gel|ointment|remedy|treatment|cure|dawai|dawa|goli)\s+(?:for|of|to)\s+(.+)/);
    const forMedicinePattern = q.match(/(.+?)\s+(?:ke liye|ka ilaj|ki dawa|medicine|tablet|remedy|treatment|ke lie|ka dawa)/);
    const whatToTakePattern = q.match(/(?:what|which|suggest|recommend|give|need|want)\s+(?:medicine|tablet|for)\s+(.+)/);

    for (const entry of SYMPTOM_MEDICINE_MAP) {
      // Direct trigger match
      if (entry.triggers.some(trigger => q.includes(trigger))) {
        return {
          ...entry,
          symptomTerms: entry.triggers.filter(t => t.length > 2),
        };
      }
      // "medicine for X" pattern match
      const extractedSymptom = medicineForPattern?.[1] || forMedicinePattern?.[1] || whatToTakePattern?.[1] || '';
      if (extractedSymptom && entry.triggers.some(trigger => extractedSymptom.includes(trigger))) {
        return {
          ...entry,
          symptomTerms: entry.triggers.filter(t => t.length > 2),
        };
      }
    }
    return null;
  };

  // High-Level Application-Specific Sanjeevani AI Bot Engine
  const processQuery = async (queryText) => {
    setIsTyping(true);
    const rawQ = queryText.toLowerCase().trim();
    let translatedQ = rawQ;

    // 1. If spoken/typed in Indic script (Hindi, Telugu, Kannada), translate to English for intent detection
    if (language !== 'en') {
      try {
        const enRes = await fetchTranslation(queryText, 'en');
        if (enRes && typeof enRes === 'string') {
          translatedQ = enRes.toLowerCase().trim();
        }
      } catch (e) {}
    }

    const q = `${rawQ} ${translatedQ}`;
    await new Promise(res => setTimeout(res, 500));

    let botResponse = {
      id: Date.now(),
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Extract Order ID pattern (e.g. FAIL-BAA14DA2, ORD-102948, BUY-XXXXXX)
    const orderIdMatch = queryText.match(/(?:FAIL|ORD|BUY|ord|fail|buy)-[A-Za-z0-9]{4,16}/i) || 
                          queryText.match(/[A-Za-z0-9]{4,8}-[A-Za-z0-9]{4,12}/i);
    const specificOrderId = orderIdMatch ? orderIdMatch[0].toUpperCase() : null;

    // Helper: format currency
    const fmtPrice = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    // Helper: format date
    const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return 'N/A'; } };

    // ─────────────────────────────────────────────────────────
    // 1. MY ORDERS — Show all orders with real data
    // ─────────────────────────────────────────────────────────
    if (
      specificOrderId ||
      q.includes('my order') || q.includes('my orders') || q.includes('order history') || q.includes('all orders') ||
      q.includes('show order') || q.includes('list order') || q.includes('recent order') || q.includes('last order') ||
      q.includes('track') || q.includes('order status') || q.includes('delivery') || q.includes('where is my') ||
      q.includes('how many order') || q.includes('total order') || q.includes('order count') ||
      q.includes('ऑर्डर') || q.includes('ट्रैक') || q.includes('स्थिति') || q.includes('कहाँ') ||
      q.includes('ఆర్డర్') || q.includes('ట్రాక్') || q.includes('ఎక్కడ') ||
      q.includes('ಆರ್ಡರ್') || q.includes('ಟ್ರ್ಯಾಕ್') || q.includes('ಎಲ್ಲಿದೆ')
    ) {
      try {
        const res = await shopService.getOrders();
        const orders = (res && res.success && Array.isArray(res.data)) ? res.data : [];

        if (specificOrderId) {
          // ── Specific order lookup ──
          const matchedOrder = orders.find(o => 
            (o.orderId && o.orderId.toUpperCase() === specificOrderId) ||
            (o.orderId && o.orderId.toUpperCase().includes(specificOrderId))
          );

          if (matchedOrder) {
            const status = matchedOrder.orderStatus || matchedOrder.paymentStatus || matchedOrder.status || 'Processing';
            const total = fmtPrice(matchedOrder.grandTotal || matchedOrder.totalAmount);
            const payMethod = matchedOrder.paymentMethod || matchedOrder.paymentMode || 'Online';
            const address = matchedOrder.shippingAddress || 'Saved Address';
            const date = fmtDate(matchedOrder.createdAt || matchedOrder.orderDate);
            const items = Array.isArray(matchedOrder.items) ? matchedOrder.items : [];
            const itemList = items.length > 0 
              ? items.map(it => `• ${it.productName || it.name || 'Item'} × ${it.quantity || 1} — ${fmtPrice(it.totalPrice || it.pricePerUnit)}`).join('\n')
              : '• Order items available on tracking page';

            botResponse.text = `📦 Order #${matchedOrder.orderId}\n\n📅 Date: ${date}\n📊 Status: ${status}\n💰 Total: ${total}\n💳 Payment: ${payMethod}\n📍 Address: ${address}\n\n🛍️ Items:\n${itemList}`;
            botResponse.actionBtn = {
              label: `📦 Track Order #${matchedOrder.orderId}`,
              onClick: () => { setIsOpen(false); navigate(`/track-order/${matchedOrder.orderId}`); }
            };
          } else {
            botResponse.text = `❌ Order #${specificOrderId} was not found. Please check the order ID and try again. You can also view all your orders below.`;
            botResponse.actionBtn = {
              label: '📋 View All My Orders',
              onClick: () => { setIsOpen(false); if (onOpenOrders) onOpenOrders(); else navigate('/track-order'); }
            };
          }
        } else if (orders.length > 0) {
          // ── Show all orders summary ──
          const totalSpent = orders.reduce((sum, o) => sum + Number(o.grandTotal || o.totalAmount || 0), 0);
          const orderSummaries = orders.slice(0, 5).map((o, i) => {
            const status = o.orderStatus || o.paymentStatus || o.status || 'Processing';
            const total = fmtPrice(o.grandTotal || o.totalAmount);
            const date = fmtDate(o.createdAt || o.orderDate);
            const items = Array.isArray(o.items) ? o.items.length : 0;
            return `${i + 1}. #${o.orderId} — ${status} — ${total} — ${date}${items > 0 ? ` (${items} items)` : ''}`;
          }).join('\n');

          botResponse.text = `📋 Your Orders (${orders.length} total | Total Spent: ${fmtPrice(totalSpent)})\n\n${orderSummaries}${orders.length > 5 ? `\n\n...and ${orders.length - 5} more orders. View all on your orders page.` : ''}`;
          botResponse.actionBtn = {
            label: '📦 View All Orders & Track',
            onClick: () => { setIsOpen(false); if (onOpenOrders) onOpenOrders(); else navigate('/track-order'); }
          };
        } else {
          botResponse.text = '📭 You have no orders yet. Browse our products and place your first order!';
          botResponse.quickReplies = CATEGORIES.map(c => ({
            label: `${c.icon} ${c.name}`, action: c.action, catData: c
          }));
        }
      } catch (err) {
        botResponse.text = '📦 View your orders from the Orders section. Click below to open.';
        botResponse.actionBtn = {
          label: '📋 Open My Orders',
          onClick: () => { setIsOpen(false); if (onOpenOrders) onOpenOrders(); else navigate('/track-order'); }
        };
      }
    }
    // ─────────────────────────────────────────────────────────
    // 2. REFUND & REPLACEMENT — Show real order data + guide
    // ─────────────────────────────────────────────────────────
    else if (
      q.includes('refund') || q.includes('return') || q.includes('replace') || q.includes('exchange') ||
      q.includes('damaged') || q.includes('wrong item') || q.includes('broken') || q.includes('defective') ||
      q.includes('money back') || q.includes('cancel order') || q.includes('cancel my order') ||
      q.includes('रिफंड') || q.includes('वापस') || q.includes('बदलो') || q.includes('రీఫండ్') || q.includes('ಮರಳಿ')
    ) {
      try {
        const res = await shopService.getOrders();
        const orders = (res && res.success && Array.isArray(res.data)) ? res.data : [];
        const eligibleOrders = orders.filter(o => {
          const status = (o.orderStatus || o.paymentStatus || o.status || '').toUpperCase();
          return status !== 'CANCELLED' && status !== 'REFUNDED' && status !== 'RETURNED';
        });

        if (eligibleOrders.length > 0) {
          const orderList = eligibleOrders.slice(0, 4).map((o, i) => {
            const status = o.orderStatus || o.paymentStatus || o.status || 'Delivered';
            return `${i + 1}. #${o.orderId} — ${status} — ${fmtPrice(o.grandTotal || o.totalAmount)} — ${fmtDate(o.createdAt)}`;
          }).join('\n');

          const isRefund = q.includes('refund') || q.includes('money back') || q.includes('रिफंड');
          const isReplace = q.includes('replace') || q.includes('exchange') || q.includes('बदलो');
          const isCancel = q.includes('cancel');

          let guide = '';
          if (isCancel) {
            guide = '🚫 To cancel an order:\n1. Go to Track Order page\n2. Select the order\n3. Click "Cancel Order"\n4. Refund will be processed within 3-5 business days to your original payment method.';
          } else if (isRefund) {
            guide = '💸 Refund Policy:\n• 7-day return window from delivery\n• Full refund to original payment method\n• Refund processed within 3-5 business days\n• Go to Track Order → Select Order → Click "Request Refund"';
          } else if (isReplace) {
            guide = '🔄 Replacement Policy:\n• Free replacement within 7 days of delivery\n• Available for damaged/defective/wrong items\n• Go to Track Order → Select Order → Click "Request Replacement"\n• New item shipped within 2-3 business days';
          } else {
            guide = '📦 Return Policy:\n• 7-day doorstep return guarantee\n• Free pickup from your address\n• Choose refund or replacement\n• Go to Track Order page to initiate';
          }

          botResponse.text = `${guide}\n\n📋 Your eligible orders:\n${orderList}`;
          botResponse.actionBtn = {
            label: '📦 Go to Track Order Page',
            onClick: () => { setIsOpen(false); navigate('/track-order'); }
          };
        } else {
          botResponse.text = '📦 Sanjeevani offers a 7-day Doorstep Return & Instant Refund Guarantee.\n\n• Full refund to your original payment method\n• Free replacement for damaged/wrong items\n• No questions asked return policy\n\nYou currently have no active orders eligible for return/refund.';
          botResponse.quickReplies = [
            { label: '💊 Browse Medicines', action: 'show_categories' },
            { label: '📞 Contact Support', action: 'contact_support' },
          ];
        }
      } catch (err) {
        botResponse.text = '📦 Sanjeevani offers a 7-day return & instant refund guarantee. Go to Track Order page to request a refund or replacement.';
        botResponse.actionBtn = {
          label: '📦 Track & Request Support',
          onClick: () => { setIsOpen(false); navigate('/track-order'); }
        };
      }
    }
    // ─────────────────────────────────────────────────────────
    // 3. CART — Show real cart data
    // ─────────────────────────────────────────────────────────
    else if (
      q.includes('cart') || q.includes('my cart') || q.includes('shopping cart') || q.includes('items in cart') ||
      q.includes('cart total') || q.includes('checkout') || q.includes('buy now') || q.includes('how to buy') ||
      q.includes('place order') || q.includes('कार्ट') || q.includes('కార్ట్') || q.includes('ಕಾರ್ಟ್')
    ) {
      try {
        const res = await shopService.getCart();
        const cartItems = (res && res.success && Array.isArray(res.data)) ? res.data : [];

        if (cartItems.length > 0) {
          const totalAmount = cartItems.reduce((sum, item) => {
            const price = Number(item.price || item.productPrice || item.product?.price || 0);
            const qty = Number(item.quantity || 1);
            return sum + (price * qty);
          }, 0);

          const itemList = cartItems.slice(0, 5).map((item, i) => {
            const name = item.productName || item.product?.name || item.name || 'Product';
            const price = fmtPrice(item.price || item.productPrice || item.product?.price);
            const qty = item.quantity || 1;
            return `${i + 1}. ${name} × ${qty} — ${price}`;
          }).join('\n');

          botResponse.text = `🛒 Your Cart (${cartItems.length} items | Total: ${fmtPrice(totalAmount)})\n\n${itemList}${cartItems.length > 5 ? `\n...and ${cartItems.length - 5} more items` : ''}\n\n💡 To checkout: Open cart → Enter address → Choose payment (Razorpay/COD) → Confirm!`;
          botResponse.actionBtn = {
            label: '🛒 Open Cart & Checkout',
            onClick: () => { setIsOpen(false); if (onOpenCart) onOpenCart(); }
          };
        } else {
          botResponse.text = '🛒 Your cart is empty! Browse our products and add items to start shopping.';
          botResponse.quickReplies = CATEGORIES.map(c => ({
            label: `${c.icon} ${c.name}`, action: c.action, catData: c
          }));
        }
      } catch (err) {
        botResponse.text = '🛒 To buy on Sanjeevani: click "Add to Cart" or "Buy Now" on any product → enter address → choose Razorpay or COD → confirm!';
        botResponse.actionBtn = {
          label: '🛒 Open My Cart',
          onClick: () => { setIsOpen(false); if (onOpenCart) onOpenCart(); }
        };
      }
    }
    // ─────────────────────────────────────────────────────────
    // 4. WISHLIST / FAVORITES — Show real data
    // ─────────────────────────────────────────────────────────
    else if (
      q.includes('wishlist') || q.includes('favorite') || q.includes('favourit') || q.includes('saved') || q.includes('liked') ||
      q.includes('पसंदीदा') || q.includes('ఫేవరేట్') || q.includes('ಮೆಚ್ಚಿನ')
    ) {
      try {
        const res = await shopService.getFavorites();
        const favItems = (res && res.success && Array.isArray(res.data)) ? res.data : [];

        if (favItems.length > 0) {
          const itemList = favItems.slice(0, 5).map((item, i) => {
            const name = item.productName || item.product?.name || item.name || 'Product';
            const price = fmtPrice(item.price || item.productPrice || item.product?.price);
            return `${i + 1}. ❤️ ${name} — ${price}`;
          }).join('\n');

          botResponse.text = `❤️ Your Wishlist (${favItems.length} items)\n\n${itemList}${favItems.length > 5 ? `\n...and ${favItems.length - 5} more items` : ''}\n\n💡 Tap the heart icon on any product to add/remove from wishlist.`;
        } else {
          botResponse.text = '❤️ Your wishlist is empty! Tap the heart ♡ icon on any product to save it to your favorites.';
          botResponse.quickReplies = CATEGORIES.map(c => ({
            label: `${c.icon} ${c.name}`, action: c.action, catData: c
          }));
        }
      } catch (err) {
        botResponse.text = '❤️ View your saved favorites by tapping the heart icon in the navbar. Add products to your wishlist by tapping the ♡ icon on any product card.';
      }
    }
    // ─────────────────────────────────────────────────────────
    // 5. PRESCRIPTION (without upload)
    // ─────────────────────────────────────────────────────────
    else if (
      q.includes('prescription') || q.includes('rx') || q.includes('doctor note') || 
      q.includes('पर्च') || q.includes('पर्ची') || q.includes('ప్రిస్క్రిప్షన్')
    ) {
      botResponse.text = 'For prescription-based medicines, please consult your doctor. You can browse our Prescriptions & Pharmacy category for available OTC medicines.';
      botResponse.actionBtn = {
        label: '💊 Browse Prescriptions & Pharmacy',
        onClick: () => { setIsOpen(false); navigate('/category/prescriptions-pharmacy'); }
      };
    }
    // ─────────────────────────────────────────────────────────
    // 6. PAYMENT & RAZORPAY — Detailed payment info
    // ─────────────────────────────────────────────────────────
    else if (
      q.includes('payment') || q.includes('razorpay') || q.includes('upi') || q.includes('card') || 
      q.includes('credit') || q.includes('debit') || q.includes('cod') || q.includes('cash on delivery') || 
      q.includes('pay') || q.includes('net banking') || q.includes('gpay') || q.includes('phonepe') ||
      q.includes('भुगतान') || q.includes('पेमेंट') || q.includes('చెల్లింపు') || q.includes('ಪಾವತಿ')
    ) {
      botResponse.text = '💳 Payment Methods on Sanjeevani:\n\n✅ Razorpay Online Payment:\n• UPI (Google Pay, PhonePe, Paytm)\n• Credit/Debit Cards (Visa, Mastercard, RuPay)\n• Net Banking (All major banks)\n• Wallets (Paytm, Amazon Pay)\n\n✅ Cash on Delivery (COD):\n• Pay in cash when your order arrives\n• Available on orders up to ₹5,000\n\n🔒 All transactions are 100% encrypted & secure via Razorpay payment gateway.';
      botResponse.actionBtn = {
        label: '🛒 Go to Cart & Checkout',
        onClick: () => { setIsOpen(false); if (onOpenCart) onOpenCart(); }
      };
    }
    // ─────────────────────────────────────────────────────────
    // 7. OFFERS, COUPONS & DISCOUNTS
    // ─────────────────────────────────────────────────────────
    else if (
      q.includes('offer') || q.includes('coupon') || q.includes('discount') || q.includes('promo') || 
      q.includes('deal') || q.includes('free delivery') || q.includes('save') || q.includes('sale') ||
      q.includes('ऑफर') || q.includes('छूट') || q.includes('ఆఫర్') || q.includes('ಆಫರ್')
    ) {
      botResponse.text = '🏷️ Active Sanjeevani Store Offers:\n\n🎫 SANJEEVANI50 → ₹50 OFF on orders above ₹400\n🎫 HEALTH10 → 10% Instant Discount on orders above ₹300\n🎫 FIRST100 → ₹100 OFF on first order above ₹750\n🎫 FREESHIP → Free Express Delivery on all orders!\n\n💡 Apply coupon code at checkout to avail the discount.';
      botResponse.actionBtn = {
        label: '🛒 Shop Now & Apply Coupon',
        onClick: () => { setIsOpen(false); navigate('/dashboard'); }
      };
    }
    // ─────────────────────────────────────────────────────────
    // 8. CONTACT SUPPORT
    // ─────────────────────────────────────────────────────────
    else if (
      q.includes('contact') || q.includes('call') || q.includes('agent') || q.includes('help') || 
      q.includes('number') || q.includes('phone') || q.includes('email') || q.includes('support') ||
      q.includes('complaint') || q.includes('issue') || q.includes('problem') ||
      q.includes('संपर्क') || q.includes('मदद') || q.includes('సహాయం') || q.includes('ಸಹಾಯ')
    ) {
      botResponse.text = '📞 Sanjeevani Support — Available 24/7\n\n☎️ Toll-Free: 1800-SANJEEVANI (+91 1800-726-5338)\n📧 Email: support@sanjeevani.com\n💬 Live Chat: You\'re talking to me right now!\n\n🕐 Response Time:\n• Chat: Instant\n• Email: Within 2 hours\n• Phone: No wait time\n\nHow else can I help you?';
      botResponse.quickReplies = [
        { label: '📦 Track My Order', action: 'track_order' },
        { label: '🔄 Refund/Return', action: 'return_policy' },
        { label: '💊 Browse Medicines', action: 'show_categories' },
      ];
    }
    // ─────────────────────────────────────────────────────────
    // 9. CATEGORIES & MEDICINE BROWSING
    // ─────────────────────────────────────────────────────────
    else if (
      q.includes('category') || q.includes('categories') || q.includes('find medicine') || q.includes('browse') ||
      q.includes('all products') || q.includes('shop') || q.includes('store') ||
      q.includes('दवा') || q.includes('मందులు') || q.includes('ಔಷಧ')
    ) {
      try {
        const res = await shopService.getProducts();
        const allProds = (res && res.success && Array.isArray(res.data)) ? res.data : [];
        botResponse.text = `🏪 Sanjeevani Store — ${allProds.length} products available\n\nSelect a category to browse:`;
      } catch (e) {
        botResponse.text = 'Select a healthcare category below to browse products:';
      }
      botResponse.quickReplies = CATEGORIES.map(c => ({
        label: `${c.icon} ${c.name}`, action: c.action, catData: c
      }));
    }
    // ─────────────────────────────────────────────────────────
    // 10. ACCOUNT & PROFILE INFO
    // ─────────────────────────────────────────────────────────
    else if (
      q.includes('account') || q.includes('profile') || q.includes('my info') || q.includes('settings') ||
      q.includes('password') || q.includes('change password') || q.includes('login') || q.includes('logout') || q.includes('sign') ||
      q.includes('अकाउंट') || q.includes('ప్రొఫైల్') || q.includes('ಪ್ರೊಫೈಲ್')
    ) {
      botResponse.text = '👤 Account & Profile:\n\n• View/edit profile: Tap your avatar in the top-right corner\n• Change password: Profile → Change Password\n• View orders: Profile → My Orders\n• View wishlist: Tap the heart icon in navbar\n• Language: Change from the globe icon in navbar\n• Logout: Profile → Logout\n\n🔒 Your data is securely encrypted and protected.';
      botResponse.quickReplies = [
        { label: '📦 My Orders', action: 'track_order' },
        { label: '❤️ My Wishlist', action: 'wishlist_info' },
        { label: '🛒 My Cart', action: 'cart_info' },
      ];
    }
    // ─────────────────────────────────────────────────────────
    // 11. DELIVERY & SHIPPING INFO
    // ─────────────────────────────────────────────────────────
    else if (
      q.includes('deliver') || q.includes('shipping') || q.includes('ship') || q.includes('when will') ||
      q.includes('how long') || q.includes('estimated') || q.includes('dispatch') || q.includes('courier') ||
      q.includes('डिलीवरी') || q.includes('డెలివరీ') || q.includes('ಡೆಲಿವರಿ')
    ) {
      botResponse.text = '🚚 Delivery & Shipping Info:\n\n📦 Standard Delivery: 3-5 business days\n⚡ Express Delivery: 1-2 business days\n🆓 Free shipping on all orders!\n\n📍 We deliver across India — enter your pincode at checkout to check availability.\n\n📋 Track your delivery in real-time from the Track Order page.';
      botResponse.actionBtn = {
        label: '📦 Track My Deliveries',
        onClick: () => { setIsOpen(false); navigate('/track-order'); }
      };
    }
    // ─────────────────────────────────────────────────────────
    // 12. GREETINGS & GENERAL
    // ─────────────────────────────────────────────────────────
    else if (
      q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('good morning') || 
      q.includes('good evening') || q.includes('good afternoon') || q.includes('thanks') || q.includes('thank you') ||
      q.includes('namaste') || q.includes('नमस्ते') || q.includes('నమస్కారం') || q.includes('ನಮಸ್ಕಾರ')
    ) {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
      botResponse.text = `🙏 ${greeting}! I'm Sanjeevani AI Assistant. I can help you with:\n\n💊 Find medicines for any symptom\n📦 Check your order status & details\n🛒 View your cart & checkout\n❤️ View your wishlist\n🔄 Request refund or replacement\n💳 Payment options (Razorpay/COD)\n🏷️ Store offers & coupons\n📞 Contact support\n\nWhat would you like to know?`;
      botResponse.quickReplies = [
        { label: '💊 Browse Medicines', action: 'show_categories' },
        { label: '🤒 Medicine for Fever', action: 'symptom_fever' },
        { label: '📦 My Orders', action: 'track_order' },
        { label: '🛒 My Cart', action: 'cart_info' },
      ];
    }
    // ─────────────────────────────────────────────────────────
    // 12.5 EMERGENCY MEDICAL NOTICE
    // ─────────────────────────────────────────────────────────
    else if (
      q.includes('emergency') || q.includes('chest pain') || q.includes('heart attack') || 
      q.includes('breathing problem') || q.includes('ambulance') || q.includes('108') ||
      q.includes('severe pain') || q.includes('unconscious') || q.includes('इमरजेंसी') || q.includes('అత్యవసర')
    ) {
      botResponse.text = '🚨 EMERGENCY MEDICAL NOTICE 🚨\n\nIf you or someone around you is experiencing a life-threatening medical emergency (e.g. severe chest pain, breathing difficulty, sudden weakness, or severe injury):\n\n☎️ Call National Medical Emergency Helpline: 108\n☎️ Call Ambulance Services: 102 / 112\n\n📍 Please visit the nearest hospital emergency room immediately. Do not delay emergency care.';
      botResponse.actionBtn = {
        label: '🚨 Call Emergency Hotline (108)',
        onClick: () => { window.location.href = 'tel:108'; }
      };
    }
    // ─────────────────────────────────────────────────────────
    // 13. SYMPTOM → MEDICINE RECOMMENDATION ENGINE
    // ─────────────────────────────────────────────────────────
    else if (detectSymptomIntent(q)) {
      const symptomResult = detectSymptomIntent(q);
      try {
        const res = await shopService.getProducts();
        const allProds = (res && res.success && Array.isArray(res.data)) ? res.data : [];

        const medicineMatches = [];
        const seenIds = new Set();

        for (const keyword of symptomResult.medicineKeywords) {
          for (const p of allProds) {
            if (seenIds.has(p.productId)) continue;
            const pName = (p.name || '').toLowerCase();
            const pDesc = (p.description || '').toLowerCase();
            const pCat = (p.categoryName || '').toLowerCase();
            if (pName.includes(keyword) || pDesc.includes(keyword) || pCat.includes(keyword)) {
              medicineMatches.push(p);
              seenIds.add(p.productId);
            }
          }
        }

        for (const p of allProds) {
          if (seenIds.has(p.productId)) continue;
          const pDesc = (p.description || '').toLowerCase();
          if (symptomResult.symptomTerms.some(term => pDesc.includes(term))) {
            medicineMatches.push(p);
            seenIds.add(p.productId);
          }
        }

        if (medicineMatches.length > 0) {
          botResponse.text = `${symptomResult.emoji} ${symptomResult.advice}\n\nHere are recommended products available on Sanjeevani for "${symptomResult.symptomName}":`;
          botResponse.products = medicineMatches.slice(0, 4);
          botResponse.actionBtn = {
            label: `🔍 Browse All Medicines for ${symptomResult.symptomName}`,
            onClick: () => { setIsOpen(false); navigate('/dashboard'); }
          };
        } else {
          botResponse.text = `${symptomResult.emoji} ${symptomResult.advice}\n\n⚠️ We couldn't find a specific match in our current inventory for "${symptomResult.symptomName}". Browse our full catalog:`;
          botResponse.quickReplies = [
            { label: '💊 Prescriptions & Pharmacy', action: 'cat_prescriptions', catData: CATEGORIES[0] },
            { label: '🏋️ Nutrition & Health', action: 'cat_nutrition', catData: CATEGORIES[1] },
            { label: '🩺 Medical Devices', action: 'cat_devices', catData: CATEGORIES[2] },
          ];
        }
      } catch (e) {
        botResponse.text = `${symptomResult.emoji} ${symptomResult.advice}\n\nBrowse our medicine catalog on Sanjeevani Store.`;
        botResponse.actionBtn = {
          label: '💊 Browse Medicines',
          onClick: () => { setIsOpen(false); navigate('/dashboard'); }
        };
      }
    }
    // ─────────────────────────────────────────────────────────
    // 14. PRODUCT SEARCH — Search real products
    // ─────────────────────────────────────────────────────────
    else {
      try {
        const res = await shopService.getProducts();
        const allProds = (res && res.success && Array.isArray(res.data)) ? res.data : [];
        const cleanTerm = translatedQ.replace(/^(show|find|search|give|me|want|need|what is|tell me about)\s+/g, '').trim();

        const matched = allProds.filter(p => {
          const name = (p.name || '').toLowerCase();
          const desc = (p.description || '').toLowerCase();
          const cat = (p.categoryName || '').toLowerCase();
          const brand = (p.brand || '').toLowerCase();
          return name.includes(rawQ) || name.includes(cleanTerm) || desc.includes(cleanTerm) || cat.includes(cleanTerm) || brand.includes(cleanTerm);
        });

        if (matched.length > 0) {
          botResponse.text = `🔍 Found ${matched.length} product(s) matching "${queryText}":`;
          botResponse.products = matched.slice(0, 4);
          if (matched.length > 4) {
            botResponse.actionBtn = {
              label: `View all ${matched.length} results`,
              onClick: () => { setIsOpen(false); navigate('/dashboard'); }
            };
          }
        } else {
          botResponse.text = `I'm Sanjeevani AI Assistant — I can help you with:\n\n💊 Medicines — "medicine for fever", "cold tablet"\n📦 Orders — "my orders", "track order"\n🛒 Cart — "my cart", "checkout"\n❤️ Wishlist — "my wishlist"\n🔄 Returns — "refund", "replace"\n💳 Payment — "payment options"\n🏷️ Offers — "store offers"\n📞 Support — "contact support"\n\nTry asking one of these!`;
          botResponse.quickReplies = [
            { label: '💊 Browse Medicines', action: 'show_categories' },
            { label: '🤒 Medicine for Fever', action: 'symptom_fever' },
            { label: '📦 My Orders', action: 'track_order' },
            { label: '🛒 My Cart', action: 'cart_info' },
            { label: '🔄 Refund/Return', action: 'return_policy' },
            { label: '📞 Support', action: 'contact_support' }
          ];
        }
      } catch (e) {
        botResponse.text = 'Search for medicines and health products on Sanjeevani Store.';
        botResponse.actionBtn = {
          label: '🏪 Go to Store',
          onClick: () => { setIsOpen(false); navigate('/dashboard'); }
        };
      }
    }

    setIsTyping(false);
    setMessages(prev => [...prev, botResponse]);

    if (botResponse.text) {
      speakText(botResponse.text);
    }
  };

  const handleSendWithText = (textVal) => {
    if (!textVal || !textVal.trim()) return;
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textVal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    processQuery(textVal);
  };

  const handleSend = () => {
    handleSendWithText(inputValue);
  };

  const handleQuickReply = (action, label, chipObj) => {
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: label,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    
    if (action.startsWith('cat_')) {
      const foundCat = CATEGORIES.find(c => c.action === action) || chipObj?.catData;
      if (foundCat) {
        handleCategorySelection(foundCat);
        return;
      }
    }

    if (action === 'view_cart') {
      setIsOpen(false);
      if (onOpenCart) onOpenCart();
    } else if (action === 'symptom_fever') {
      processQuery('medicine for fever');
    } else if (action === 'symptom_cold') {
      processQuery('medicine for cold and cough');
    } else if (action === 'cart_info') {
      processQuery('my cart');
    } else if (action === 'wishlist_info') {
      processQuery('my wishlist');
    } else if (action === 'return_policy') {
      processQuery('refund and return policy');
    } else if (action === 'track_order') {
      processQuery('my orders');
    } else if (action === 'payment_info') {
      processQuery('payment options');
    } else if (action === 'contact_support') {
      processQuery('contact support');
    } else if (action === 'offers') {
      processQuery('store offers');
    } else if (action === 'show_categories') {
      processQuery('categories');
    } else {
      processQuery(label);
    }
  };

  return (
    <>
      {/* ── FLOATING SANJEEVANI BRAND LOGO TRIGGER BUTTON (TRANSPARENT, LARGER ROBO AVATAR) ──────── */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="sanjeevani-bot-fab-container"
          style={{
            position: 'fixed',
            zIndex: 9999,
            pointerEvents: 'auto',
          }}
        >
          {/* Compact Floating Robo Icon Trigger Button */}
          <motion.button
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            className="sanjeevani-bot-fab"
            title="Open SANJEEVANI AI Assistant"
            style={{
              background: 'linear-gradient(135deg, #0D5C75 0%, #059669 100%)',
              borderRadius: '50%',
              padding: '6px',
              border: '2px solid #FFFFFF',
              boxShadow: '0 8px 24px rgba(13, 92, 117, 0.4), 0 3px 10px rgba(5, 150, 105, 0.3)',
              outline: 'none',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Soft Glowing Pulsing Radial Backlight Ring */}
            <span
              style={{
                position: 'absolute',
                inset: '-4px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(13,92,117,0) 75%)',
                animation: 'pulse 2.2s infinite',
                pointerEvents: 'none',
              }}
            />
            {/* Compact High-Contrast Robo Character Icon */}
            <AnimatedDoctorRoboIcon size="clamp(42px, 5vw, 54px)" />
          </motion.button>
        </motion.div>
      )}

      {/* ── SANJEEVANI BOT CHAT DIALOG / DRAWER ────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="sanjeevani-bot-window"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 10000,
              width: 'min(410px, calc(100vw - 32px))',
              height: '600px',
              maxHeight: 'calc(100vh - 48px)',
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.22), 0 8px 24px rgba(13, 92, 117, 0.15)',
              border: '1.5px solid #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontFamily: "'Inter', system-ui, sans-serif"
            }}
          >
            {/* 1. Header with Sanjeevani Brand Logo & Voice Controls */}
            <div style={{
              background: 'linear-gradient(135deg, #0D5C75 0%, #059669 100%)',
              color: '#ffffff',
              padding: '0.9rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <AnimatedDoctorRoboIcon size={32} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.5px' }}>
                    SANJEEVANI
                    <Sparkles style={{ width: 14, height: 14, color: '#fde047' }} />
                  </h3>
                </div>
              </div>

              {/* Controls: Voice On/Off Toggle + Close */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                {/* Text-to-Speech (Agent Talking) Toggle */}
                <button
                  onClick={() => {
                    const next = !isVoiceOutputEnabled;
                    setIsVoiceOutputEnabled(next);
                    if (!next) window.speechSynthesis?.cancel();
                  }}
                  title={isVoiceOutputEnabled ? 'Agent Voice ON — Click to mute' : 'Agent Voice OFF — Click to enable'}
                  style={{
                    background: isVoiceOutputEnabled ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: '10px',
                    padding: '0.25rem 0.6rem',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    color: '#ffffff', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: 700,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isVoiceOutputEnabled ? <Volume2 style={{ width: 14, height: 14 }} /> : <VolumeX style={{ width: 14, height: 14 }} />}
                  <span>{isVoiceOutputEnabled ? 'Voice ON' : 'Voice OFF'}</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.speechSynthesis?.cancel();
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.15)', border: 'none',
                    borderRadius: '50%', width: 30, height: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ffffff', cursor: 'pointer'
                  }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>

            {/* 2. Messages Body */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              background: '#F0FDFA',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{
                    maxWidth: '85%',
                    padding: '0.85rem 1.05rem',
                    borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #0D5C75 0%, #0369a1 100%)' : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : '#1A2E35',
                    fontSize: '0.88rem',
                    lineHeight: 1.48,
                    fontWeight: 500,
                    boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(13,92,117,0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
                    border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                    position: 'relative'
                  }}>
                    {translateData(msg.text)}

                    {/* Speaker Read Aloud Button */}
                    {msg.sender === 'bot' && (
                      <button
                        onClick={() => speakText(msg.text)}
                        title="Read aloud"
                        style={{
                          display: 'inline-flex', alignItems: 'center', marginLeft: '0.5rem',
                          background: 'none', border: 'none', color: '#059669', cursor: 'pointer'
                        }}
                      >
                        <Volume2 style={{ width: 14, height: 14 }} />
                      </button>
                    )}

                    {/* Products Grid */}
                    {msg.products && msg.products.length > 0 && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                        {msg.products.map((prod) => (
                          <div
                            key={prod.id || prod.productId}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.65rem',
                              background: '#ffffff', padding: '0.55rem 0.75rem',
                              borderRadius: '12px', border: '1.5px solid #cbd5e1',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                            }}
                          >
                            <div
                              onClick={() => {
                                setIsOpen(false);
                                navigate(`/product/${prod.id || prod.productId}`);
                              }}
                              style={{ width: 42, height: 42, borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', flexShrink: 0, cursor: 'pointer', border: '1px solid #e2e8f0' }}
                            >
                              <ProductImage src={prod.imageUrl} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div
                              onClick={() => {
                                setIsOpen(false);
                                navigate(`/product/${prod.id || prod.productId}`);
                              }}
                              style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                            >
                              <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {translateData(prod.name)}
                              </p>
                              <p style={{ margin: 0, fontSize: '0.78rem', color: '#059669', fontWeight: 900 }}>
                                ₹{prod.price}
                              </p>
                            </div>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const pId = prod.id || prod.productId;
                                try {
                                  await shopService.addToCart(pId, 1);
                                  handleSendWithText('cart');
                                } catch (err) {
                                  navigate(`/product/${pId}`);
                                }
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                color: '#ffffff', border: 'none', borderRadius: '8px',
                                padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 800,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
                                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                              }}
                            >
                              <ShoppingCart style={{ width: 12, height: 12 }} />
                              <span>Add</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Custom Action Button */}
                    {msg.actionBtn && (
                      <button
                        onClick={msg.actionBtn.onClick}
                        style={{
                          marginTop: '0.75rem', width: '100%', padding: '0.58rem 0.85rem',
                          borderRadius: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff', fontWeight: 800, fontSize: '0.82rem', border: 'none',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                          boxShadow: '0 3px 10px rgba(16,185,129,0.3)'
                        }}
                      >
                        <span>{translateData(msg.actionBtn.label)}</span>
                        <ArrowRight style={{ width: 14, height: 14 }} />
                      </button>
                    )}
                  </div>

                  {/* Quick Reply Chips */}
                  {msg.quickReplies && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem', maxWidth: '95%' }}>
                      {msg.quickReplies.map((chip, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickReply(chip.action, chip.label, chip)}
                          style={{
                            background: '#ffffff',
                            border: chip.action.startsWith('cat_') ? '1.5px solid #10b981' : '1.5px solid #a4c3d2',
                            color: chip.action.startsWith('cat_') ? '#047857' : '#0D5C75',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '99px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          {translateData(chip.label)}
                        </button>
                      ))}
                    </div>
                  )}

                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', padding: '0 0.2rem' }}>
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', padding: '0.6rem 0.9rem', borderRadius: '14px', width: 'fit-content', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: 7, height: 7, background: '#0D5C75', borderRadius: '50%', animation: 'bounce 1s infinite 0.1s' }} />
                  <div style={{ width: 7, height: 7, background: '#059669', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
                  <div style={{ width: 7, height: 7, background: '#10b981', borderRadius: '50%', animation: 'bounce 1s infinite 0.3s' }} />
                  <span style={{ fontSize: '0.76rem', color: '#64748b', marginLeft: '0.2rem', fontWeight: 600 }}>
                    {translateData('Sanjeevani is typing...')}
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 3. Input Footer with Microphone Voice Recognition */}
            <div style={{
              padding: '0.75rem 1rem',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}>
              {/* Microphone Voice Input Button */}
              <button
                onClick={toggleListening}
                title={isListening ? 'Listening... Speak now' : 'Speak to Sanjeevani'}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '12px',
                  background: isListening ? '#ef4444' : '#f0fdf4',
                  color: isListening ? '#ffffff' : '#059669',
                  border: isListening ? 'none' : '1.5px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isListening ? '0 0 14px rgba(239, 68, 68, 0.6)' : 'none',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                {isListening ? (
                  <MicOff style={{ width: 17, height: 17, animation: 'pulse 1s infinite' }} />
                ) : (
                  <Mic style={{ width: 17, height: 17 }} />
                )}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? translateData('Listening... Speak now!') : translateData('Ask or speak to Sanjeevani...')}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  border: isListening ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.86rem',
                  color: '#0f172a',
                  background: '#f8fafc'
                }}
              />

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '12px',
                  background: inputValue.trim() ? 'linear-gradient(135deg, #0D5C75 0%, #059669 100%)' : '#e2e8f0',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: inputValue.trim() ? '0 4px 12px rgba(13,92,117,0.3)' : 'none',
                  flexShrink: 0
                }}
              >
                <Send style={{ width: 17, height: 17 }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RESPONSIVE ALIGNMENT STYLES (Android, iPhone, Tablet, PC) ────── */}
      <style>{`
        @media (max-width: 480px) {
          .sanjeevani-bot-fab-container {
            bottom: 72px !important;
            right: 14px !important;
          }
          .sanjeevani-bot-window {
            bottom: 8px !important;
            right: 8px !important;
            left: 8px !important;
            width: auto !important;
            max-width: calc(100vw - 16px) !important;
            height: calc(100vh - 75px) !important;
            max-height: 580px !important;
            border-radius: 16px !important;
          }
        }

        @media (min-width: 481px) and (max-width: 1024px) {
          .sanjeevani-bot-fab-container {
            bottom: 80px !important;
            right: 20px !important;
          }
          .sanjeevani-bot-window {
            bottom: 20px !important;
            right: 20px !important;
            width: 390px !important;
            height: 580px !important;
          }
        }

        @media (min-width: 1025px) {
          .sanjeevani-bot-fab-container {
            bottom: 88px !important;
            right: 26px !important;
          }
          .sanjeevani-bot-window {
            bottom: 24px !important;
            right: 24px !important;
            width: 420px !important;
            height: 610px !important;
          }
        }
      `}</style>
    </>
  );
};

export default SanjeevaniBot;
