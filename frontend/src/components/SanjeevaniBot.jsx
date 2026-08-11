import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, X, Send, Sparkles, ShoppingBag, Truck, FileText, 
  HelpCircle, RefreshCw, ChevronRight, MessageSquare, ShieldCheck, 
  ArrowRight, HeartPulse, Mic, MicOff, Volume2, VolumeX, Globe, LayoutGrid
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

export const SanjeevaniBot = ({ onOpenCart, onOpenOrders, onOpenPrescriptionModal }) => {
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

  // Handle in-bot language switch & announce speech in new language
  const handleInBotLanguageChange = (newLang) => {
    changeLanguage(newLang);
    const announcements = {
      en: 'Language changed to English. I am ready to assist you in English.',
      hi: 'भाषा हिंदी में बदल दी गई है। मैं आपकी सहायता हिंदी में करने के लिए तैयार हूँ।',
      te: 'భాష తెలుగులోకి మార్చబడింది. నేను మీకు తెలుగులో సహాయం చేయడానికి సిద్ధంగా ఉన్నాను.',
      kn: 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ. ನಾನು ನಿಮಗೆ ಕನ್ನಡದಲ್ಲಿ ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ.'
    };
    const announceMsg = announcements[newLang] || announcements['en'];
    setTimeout(() => {
      speakText(announceMsg);
    }, 200);
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
        text: 'Hello! I am Sanjeevani, your AI Healthcare & Pharmacy Assistant. Select a category below or ask anything by typing or speaking in your language!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: [
          { label: 'Find Medicines & Categories', action: 'show_categories' },
          { label: 'Track My Order', action: 'track_order' },
          { label: 'Return & Refund Policy', action: 'return_policy' },
          { label: 'Offers & Discounts', action: 'offers' }
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

      botResponse.text = `${catItem.icon} Here are top products in ${catItem.name}:`;
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

  // Intelligent Sanjeevani Bot Engine with Spoken Indic Speech Understanding
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

    // Extract any specific Order ID pattern (e.g. FAIL-BAA14DA2, ORD-102948, ORD-XXXXXX, FAIL-XXXXXX)
    const orderIdMatch = queryText.match(/(?:FAIL|ORD|ord|fail)-[A-Za-z0-9]{4,16}/i) || 
                          queryText.match(/[A-Za-z0-9]{4,8}-[A-Za-z0-9]{4,12}/i);
    const specificOrderId = orderIdMatch ? orderIdMatch[0].toUpperCase() : null;

    // Category Prompt Trigger
    if (
      !specificOrderId && (
        q.includes('category') || q.includes('categories') || q.includes('find medicine') || 
        q.includes('search_products') || q.includes('show_categories') || q.includes('browse') ||
        q.includes('दवा') || q.includes('मందులు') || q.includes('ಔಷಧ') ||
        q.includes('उत्पाद') || q.includes('ఉత్పత్తి') || q.includes('ಉತ್ಪನ್ನ')
      )
    ) {
      botResponse.text = 'Please select a healthcare category below to browse verified products:';
      botResponse.quickReplies = CATEGORIES.map(c => ({
        label: `${c.icon} ${c.name}`,
        action: c.action,
        catData: c
      }));
    }
    // Order Tracking & Specific Order ID Query
    else if (
      specificOrderId ||
      q.includes('track') || q.includes('order') || q.includes('status') || q.includes('delivery') || q.includes('where is my package') ||
      q.includes('ऑर्डर') || q.includes('ट्रैक') || q.includes('स्थिति') || q.includes('कहाँ') ||
      q.includes('ఆర్డర్') || q.includes('ట్రాక్') || q.includes('ఎక్కడ') ||
      q.includes('ಆರ್ಡರ್') || q.includes('ಟ್ರ್ಯಾಕ್') || q.includes('ಎಲ್ಲಿದೆ')
    ) {
      try {
        const res = await shopService.getOrders();
        const orders = (res && res.success && Array.isArray(res.data)) ? res.data : [];

        if (specificOrderId) {
          // Look up exact order in user's list
          const matchedOrder = orders.find(o => 
            (o.orderId && o.orderId.toUpperCase() === specificOrderId) ||
            (o.orderId && o.orderId.toUpperCase().includes(specificOrderId))
          );

          if (matchedOrder) {
            const status = matchedOrder.orderStatus || matchedOrder.paymentStatus || 'Processing';
            const total = Number(matchedOrder.grandTotal || matchedOrder.totalAmount || 0).toFixed(2);
            botResponse.text = `Order #${matchedOrder.orderId}: Current Status is "${status}". Total Amount: ₹${total}. Delivery Address: ${matchedOrder.shippingAddress || 'Saved Address'}.`;
            botResponse.actionBtn = {
              label: `Track Order #${matchedOrder.orderId}`,
              onClick: () => {
                setIsOpen(false);
                navigate(`/track-order/${matchedOrder.orderId}`);
              }
            };
          } else {
            botResponse.text = `Order #${specificOrderId} was not found under your active account. You can view all your orders or check tracking details below.`;
            botResponse.actionBtn = {
              label: 'View All My Orders',
              onClick: () => {
                setIsOpen(false);
                if (onOpenOrders) onOpenOrders();
                else navigate('/track-order');
              }
            };
          }
        } else if (orders.length > 0) {
          const latest = orders[0];
          botResponse.text = `Your latest order #${latest.orderId} is currently ${latest.orderStatus || 'In Transit'}. You can track live delivery status on your tracking page.`;
          botResponse.actionBtn = {
            label: `View Order Details #${latest.orderId}`,
            onClick: () => {
              setIsOpen(false);
              navigate(`/track-order/${latest.orderId}`);
            }
          };
        } else {
          botResponse.text = 'You currently have no active orders. Would you like to browse our healthcare products or place a new order?';
          botResponse.quickReplies = CATEGORIES.map(c => ({
            label: `${c.icon} ${c.name}`,
            action: c.action,
            catData: c
          }));
        }
      } catch (err) {
        botResponse.text = 'You can track all your active orders directly from your Orders drawer or Track Order page.';
        botResponse.actionBtn = {
          label: 'Open Orders',
          onClick: () => {
            setIsOpen(false);
            if (onOpenOrders) onOpenOrders();
            else navigate('/track-order');
          }
        };
      }
    }
    // Return & Refund Policy
    else if (
      q.includes('return') || q.includes('refund') || q.includes('replace') || q.includes('cancel') ||
      q.includes('रिफंड') || q.includes('वापस') || q.includes('रीफंड') || q.includes('రిటర్న్')
    ) {
      botResponse.text = 'Sanjeevani offers a 100% Doorstep Instant Return & Replacement Guarantee for damaged, wrong, or expired items within 7 days of delivery with zero questions asked.';
      botResponse.quickReplies = [
        { label: 'Check Order Support', action: 'track_order' },
        { label: 'Talk to Support Agent', action: 'contact_support' }
      ];
    }
    // Payment & Offers
    else if (
      q.includes('payment') || q.includes('offer') || q.includes('discount') || q.includes('upi') || q.includes('cod') ||
      q.includes('ऑफर') || q.includes('छूट') || q.includes('ఆఫర్') || q.includes('ಆಫರ್')
    ) {
      botResponse.text = 'We support Razorpay Online Payments (UPI, Credit/Debit Cards, Net Banking) and Cash on Delivery (COD). Free Express Delivery is unlocked on all orders above ₹500!';
      botResponse.quickReplies = CATEGORIES.map(c => ({
        label: `${c.icon} ${c.name}`,
        action: c.action,
        catData: c
      }));
    }
    // Contact Support
    else if (
      q.includes('contact') || q.includes('call') || q.includes('agent') || q.includes('help') || q.includes('number') ||
      q.includes('संपर्क') || q.includes('मदद') || q.includes('సహాయం') || q.includes('ಸಹಾಯ')
    ) {
      botResponse.text = 'Sanjeevani Healthcare Support Team is available 24/7. Call us toll-free at 1800-SANJEEVANI (+91 1800-726-5338) or email support@sanjeevani.com.';
    }
    // Fallback Product Search Query
    else {
      try {
        const res = await shopService.getProducts();
        const allProds = (res && res.success && Array.isArray(res.data)) ? res.data : [];
        const cleanTerm = translatedQ.replace(/^(show|find|search|give|me|want|need)\s+/g, '').trim();

        const matched = allProds.filter(p => {
          const name = (p.name || '').toLowerCase();
          const cat = (p.categoryName || '').toLowerCase();
          return name.includes(rawQ) || name.includes(cleanTerm) || cat.includes(cleanTerm);
        });

        if (matched.length > 0) {
          botResponse.text = `Here are products matching "${queryText}":`;
          botResponse.products = matched.slice(0, 3);
        } else {
          botResponse.text = `Please select a category below to browse medicines & healthcare products on Sanjeevani Store:`;
          botResponse.quickReplies = CATEGORIES.map(c => ({
            label: `${c.icon} ${c.name}`,
            action: c.action,
            catData: c
          }));
        }
      } catch (e) {
        botResponse.text = 'Search thousands of verified medicines and health devices directly on Sanjeevani Store.';
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
    } else if (action === 'upload_rx') {
      setIsOpen(false);
      if (onOpenPrescriptionModal) onOpenPrescriptionModal();
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

              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                {/* Language Switcher Badge */}
                <select
                  value={language}
                  onChange={(e) => handleInBotLanguageChange(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: '8px',
                    padding: '0.2rem 0.4rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="en" style={{ color: '#0f172a' }}>English</option>
                  <option value="hi" style={{ color: '#0f172a' }}>हिंदी</option>
                  <option value="te" style={{ color: '#0f172a' }}>తెలుగు</option>
                  <option value="kn" style={{ color: '#0f172a' }}>ಕನ್ನಡ</option>
                </select>

                {/* Text-to-Speech Toggle */}
                <button
                  onClick={() => setIsVoiceOutputEnabled(!isVoiceOutputEnabled)}
                  title={isVoiceOutputEnabled ? 'Voice Output ON' : 'Voice Output OFF'}
                  style={{
                    background: isVoiceOutputEnabled ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: '50%', width: 30, height: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ffffff', cursor: 'pointer'
                  }}
                >
                  {isVoiceOutputEnabled ? <Volume2 style={{ width: 15, height: 15 }} /> : <VolumeX style={{ width: 15, height: 15 }} />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
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
                            onClick={() => {
                              setIsOpen(false);
                              navigate(`/product/${prod.id || prod.productId}`);
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.65rem',
                              background: '#f8fafc', padding: '0.5rem 0.65rem',
                              borderRadius: '10px', border: '1px solid #cbd5e1',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ width: 40, height: 40, borderRadius: '6px', overflow: 'hidden', background: '#fff', flexShrink: 0 }}>
                              <ProductImage src={prod.imageUrl} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {translateData(prod.name)}
                              </p>
                              <p style={{ margin: 0, fontSize: '0.78rem', color: '#059669', fontWeight: 800 }}>
                                ₹{prod.price}
                              </p>
                            </div>
                            <ChevronRight style={{ width: 15, height: 15, color: '#64748b' }} />
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
