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

/* ── HIGH-VISIBILITY ANIMATED FULL-BODY DOCTOR ROBO (HEAD, MOVING EYES, WAVING HANDS, LEGS & FEET) ── */
const AnimatedDoctorRoboIcon = ({ size = 46 }) => {
  return (
    <motion.div
      animate={{
        y: [0, -4, 0],
        rotate: [0, -2, 2, 0],
      }}
      transition={{
        duration: 2.8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 54 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 1. Antenna Stem & Pulsing Green Gem */}
        <line x1="27" y1="1" x2="27" y2="7" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
        <motion.circle
          cx="27"
          cy="2"
          r="3.5"
          fill="#10b981"
          stroke="#ffffff"
          strokeWidth="1.2"
          animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />

        {/* 2. Doctor Headband & Reflector Mirror */}
        <rect x="11" y="7" width="32" height="4.5" rx="2.2" fill="#0D5C75" stroke="#047857" strokeWidth="1" />
        <circle cx="27" cy="9.2" r="3.8" fill="#a7f3d0" stroke="#047857" strokeWidth="1.5" />

        {/* 3. Robo Head (Bold High-Contrast Shell) */}
        <rect x="9" y="10.5" width="36" height="24" rx="10" fill="url(#doctorHeadGradBold)" stroke="#047857" strokeWidth="2.8" />

        {/* 4. Face Plate Screen (Ultra High Contrast Dark Glass) */}
        <rect x="13" y="14" width="28" height="16" rx="7" fill="#090D16" stroke="#10B981" strokeWidth="1.8" />

        {/* 5. Animated Moving & Looking Eyes (High-Visibility Cyan Glowing LEDs) */}
        <motion.g
          animate={{
            x: [0, 2.5, -2.5, 0],
            y: [0, -1, 1, 0],
          }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Left Eye */}
          <motion.ellipse
            cx="21"
            cy="21.5"
            rx="3.5"
            ry="3.5"
            fill="#38BDF8"
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 3.4, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
          />
          <circle cx="22.4" cy="20.2" r="1.2" fill="#FFFFFF" />

          {/* Right Eye */}
          <motion.ellipse
            cx="33"
            cy="21.5"
            rx="3.5"
            ry="3.5"
            fill="#38BDF8"
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 3.4, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
          />
          <circle cx="34.4" cy="20.2" r="1.2" fill="#FFFFFF" />
        </motion.g>

        {/* 6. Cute Bright Smile */}
        <path d="M22.5 25.5C24 27.2 29 27.2 30.5 25.5" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" />

        {/* 7. Crisp Doctor Coat Body */}
        <path d="M15 34 L39 34 L41 49 L13 49 Z" fill="#FFFFFF" stroke="#047857" strokeWidth="2.5" />
        <path d="M27 34 L27 49" stroke="#059669" strokeWidth="2" strokeDasharray="2.5 2.5" />

        {/* Red Cross Badge on Pocket */}
        <rect x="29.5" y="38.5" width="7.5" height="7.5" rx="1.8" fill="#FFFFFF" stroke="#EF4444" strokeWidth="1.5" />
        <path d="M33.25 40 V44.5 M31 42.25 H35.5" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />

        {/* Stethoscope Hanging round Neck */}
        <path d="M17 33 C17 40.5, 37 40.5, 37 33" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="27" cy="42" r="2.8" fill="#EAB308" stroke="#047857" strokeWidth="1.2" />

        {/* 8. ANIMATED WAVING LEFT HAND */}
        <motion.g
          style={{ transformOrigin: '14px 35px' }}
          animate={{
            rotate: [0, 24, -10, 24, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Left Arm */}
          <path d="M14 36 L6 27" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />
          {/* Left Hand Knob */}
          <circle cx="5" cy="26" r="3.8" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
        </motion.g>

        {/* 9. ANIMATED RIGHT HAND (Holding Prescription Pad) */}
        <motion.g
          style={{ transformOrigin: '40px 35px' }}
          animate={{
            rotate: [0, -8, 8, 0],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Right Arm */}
          <path d="M40 36 L47 41" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />
          {/* Right Hand Knob */}
          <circle cx="48" cy="42" r="3.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
          {/* Mini Rx Prescription Pad */}
          <rect x="46" y="37" width="7" height="9" rx="1.2" fill="#FEF08A" stroke="#047857" strokeWidth="1.2" />
          <line x1="47.5" y1="39.5" x2="51.5" y2="39.5" stroke="#047857" strokeWidth="1" />
          <line x1="47.5" y1="42.5" x2="51.5" y2="42.5" stroke="#047857" strokeWidth="1" />
        </motion.g>

        {/* 10. ANIMATED LEGS & FEET */}
        {/* Left Leg */}
        <motion.g
          animate={{ y: [0, -1.8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="19" y="49" width="5.5" height="8.5" rx="2" fill="#0D5C75" stroke="#047857" strokeWidth="1" />
          <rect x="16" y="56.5" width="10" height="5" rx="2.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.2" />
        </motion.g>

        {/* Right Leg */}
        <motion.g
          animate={{ y: [0, 1.8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="29.5" y="49" width="5.5" height="8.5" rx="2" fill="#0D5C75" stroke="#047857" strokeWidth="1" />
          <rect x="28" y="56.5" width="10" height="5" rx="2.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.2" />
        </motion.g>

        <defs>
          <linearGradient id="doctorHeadGradBold" x1="9" y1="10.5" x2="45" y2="34.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.6" stopColor="#F1F5F9" />
            <stop offset="1" stopColor="#CBD5E1" />
          </linearGradient>
        </defs>
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
          { label: 'Upload Prescription', action: 'upload_rx' },
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
    // Prescription Upload
    else if (
      q.includes('prescription') || q.includes('rx') || q.includes('doctor note') || q.includes('upload') ||
      q.includes('प्रिस्क्रिप्शन') || q.includes('पर्चा') || q.includes('अपलोड') ||
      q.includes('ప్రిస్క్రిప్షన్') || q.includes('అప్‌లోడ్') ||
      q.includes('ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್') || q.includes('ಅಪ್‌ಲೋಡ್')
    ) {
      botResponse.text = 'You can upload your Doctor Prescription PDF or Image easily! Our licensed Sanjeevani Pharmacists will verify and prepare your exact medication order.';
      botResponse.actionBtn = {
        label: 'Upload Prescription Now',
        onClick: () => {
          setIsOpen(false);
          if (onOpenPrescriptionModal) onOpenPrescriptionModal();
        }
      };
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
        <motion.button
          onClick={() => setIsOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          className="sanjeevani-bot-fab"
          title="Open SANJEEVANI AI Assistant"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '28px',
            zIndex: 9999,
            background: 'none',
            border: 'none',
            outline: 'none',
            padding: 0,
            cursor: 'pointer',
            filter: 'none',
          }}
        >
          {/* Standalone Animated Doctor Robo Logo Character (Clean without background or name) */}
          <AnimatedDoctorRoboIcon size={54} />
        </motion.button>
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
                <AnimatedDoctorRoboIcon size={30} />
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
          .sanjeevani-bot-fab {
            bottom: 76px !important;
            right: 16px !important;
            background: none !important;
            border: none !important;
            padding: 0 !important;
          }
          .sanjeevani-bot-window {
            bottom: 8px !important;
            right: 8px !important;
            left: 8px !important;
            width: auto !important;
            max-width: calc(100vw - 16px) !important;
            height: calc(100vh - 75px) !important;
            max-height: 570px !important;
            border-radius: 16px !important;
          }
        }

        @media (min-width: 481px) and (max-width: 1024px) {
          .sanjeevani-bot-fab {
            bottom: 84px !important;
            right: 22px !important;
          }
          .sanjeevani-bot-window {
            bottom: 20px !important;
            right: 20px !important;
            width: 380px !important;
            height: 575px !important;
          }
        }

        @media (min-width: 1025px) {
          .sanjeevani-bot-fab {
            bottom: 90px !important;
            right: 28px !important;
          }
          .sanjeevani-bot-window {
            bottom: 24px !important;
            right: 24px !important;
            width: 410px !important;
            height: 600px !important;
          }
        }
      `}</style>
    </>
  );
};

export default SanjeevaniBot;
