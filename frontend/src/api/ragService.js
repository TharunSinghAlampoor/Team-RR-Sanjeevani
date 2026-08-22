import shopService from './shopService';

/**
 * Universal Sanjeevani Healthcare RAG (Retrieval-Augmented Generation) Engine
 * Capable of answering ANY question asked by the customer:
 * - Products & Medicines (159 items across Prescriptions, Skincare, Nutrition, Devices, Baby Care)
 * - General Health & Medical Questions (Fever, Cold, BP, Diabetes, Vitamins, Remedies)
 * - Skincare & Dermocosmetics (Lotion, Sunscreen, Serums, Acne, Moisturizers)
 * - Orders, Returns, Refunds, Payments & Store Policies
 * - General Knowledge & Universal Questions
 */

const KNOWLEDGE_BASE_FAQS = [
  {
    topic: 'how_to_use_app',
    keywords: ['how to use', 'how it works', 'guide', 'app use', 'features', 'help', 'tutorial', 'instructions', 'about app', 'what is this app'],
    answer: '📱 How to Use Sanjeevani App & Features:\n\n1. 🔍 Search & Browse Medicines: Type medicine name or symptom in the top search bar or ask Sanjeevani AI Assistant.\n2. 🛒 Place an Order: Click "Add to Cart" ➔ Open Cart ➔ "Proceed to Checkout" ➔ Select Address & Payment ➔ Place Order.\n3. ⚡ Express Buy Now: Tap "Buy Now" on any product card for instant 1-click checkout.\n4. 📋 Upload Prescription: Click "Upload Prescription" to send doctor notes to our pharmacist team.\n5. 📦 Track Orders: Click "My Orders" in the menu to track live delivery timeline.\n6. 🎙️ Voice & AI Assistant: Tap the microphone icon 🎙️ in Sanjeevani AI to speak in English, Hindi, Telugu, or Kannada!'
  },
  {
    topic: 'how_to_order',
    keywords: ['how to order', 'buy medicine', 'purchase', 'place order', 'buy now', 'checkout'],
    answer: '🛒 How to Place an Order on Sanjeevani:\n\n1. Find your item using search or category browsing.\n2. Click "Add to Cart" or "⚡ Buy Now".\n3. In Cart/Checkout, enter your delivery address.\n4. Select Payment method (Razorpay UPI, Debit/Credit Card, or Cash on Delivery).\n5. Enter promo code "SANJEEVANI10" for 10% OFF & click "Place Order"!'
  },
  {
    topic: 'shipping_delivery',
    keywords: ['delivery', 'ship', 'shipping', 'track', 'courier', 'arrive', 'deliver', 'when', 'dispatch', 'fast'],
    answer: '🚚 Delivery & Shipping Policy:\n• Standard Delivery: 3 to 5 business days across India.\n• Express Delivery: 1 to 2 days in metro cities.\n• Free Shipping: Available on all orders over ₹499.\n• Real-Time Tracking: Enter your Order ID (e.g. #ORD-0EB650DF) or click "My Orders" in the menu to track live courier location.'
  },
  {
    topic: 'return_refund',
    keywords: ['return', 'refund', 'replace', 'exchange', 'cancel', 'money back', 'damage', 'wrong item'],
    answer: '🔄 7-Day Doorstep Return & Instant Refund Policy:\n• Returns: You can return any unopened item or medicine within 7 days of delivery.\n• Doorstep Pickup: Our agent will collect the item directly from your address.\n• Instant Refunds: Refund is initiated immediately upon pickup back to your UPI, Bank Account, or Card (24-48 hours process time).'
  },
  {
    topic: 'payment_options',
    keywords: ['payment', 'pay', 'razorpay', 'cod', 'cash on delivery', 'upi', 'gpay', 'phonepe', 'credit card', 'debit card'],
    answer: '💳 Payment Methods & Security:\n• Cash on Delivery (COD): Available for orders up to ₹5,000.\n• Online Payment via Razorpay: 100% Secure SSL Payment gateway supporting Google Pay, PhonePe, Paytm, All UPI, Credit Cards, Debit Cards, and Net Banking.\n• Payment Protection: Full refund guarantee for failed or cancelled transactions.'
  },
  {
    topic: 'coupons_offers',
    keywords: ['coupon', 'offer', 'discount', 'code', 'promo', 'deal', 'cheap', 'save'],
    answer: '🏷️ Active Store Offers & Discount Coupons:\n• SANJEEVANI10: Get 10% Flat OFF on all medicines & health products.\n• FIRST20: Get 20% OFF on your 1st order.\n• FREESHIP: Free Express Shipping on orders over ₹499.'
  },
  {
    topic: 'prescription_upload',
    keywords: ['prescription', 'rx', 'doctor note', 'upload', 'slip', 'paper', 'schedule h'],
    answer: '📋 Prescription Upload Guidelines:\n• For Prescription-only (Rx) medicines, click "Upload Prescription" on the homepage or cart page.\n• Upload a clear image or PDF of your doctor\'s prescription.\n• Our verified pharmacist team will review and dispense your order within 30 minutes.'
  },
  {
    topic: 'emergency_contact',
    keywords: ['emergency', 'ambulance', 'urgent', '108', '112', 'doctor', 'helpline', 'hospital'],
    answer: '🚨 Emergency Medical Hotline:\n• Call 108 for National Medical Emergency Helpline.\n• Call 102 / 112 for Ambulance Services.\n• Sanjeevani Customer Support: Available 24/7 at support@sanjeevani.com or +91 1800-123-4567.'
  }
];

export const filterAndRankProducts = (allProds, rawQuery) => {
  if (!allProds || !Array.isArray(allProds)) return [];
  const q = rawQuery.toLowerCase().trim();
  const cleanQ = q.replace(/[^a-z0-9\s]/g, '');

  const isPainQuery = q.includes('pain') || q.includes('pains') || q.includes('ache') || q.includes('headache') || q.includes('backache') || q.includes('cramp') || q.includes('sprain') || q.includes('balm') || q.includes('volini') || q.includes('moov') || q.includes('joint') || q.includes('muscle');
  const isFeverColdQuery = q.includes('fever') || q.includes('cold') || q.includes('cough') || q.includes('flu') || q.includes('throat');
  const isAdultQuery = q.includes('adult') || q.includes('skin care') || q.includes('skincare') || q.includes('sunscreen') || q.includes('serum') || q.includes('acne') || q.includes('vitamin c') || q.includes('lotion');
  const isBabyQuery = q.includes('baby') || q.includes('kid') || q.includes('child') || q.includes('infant') || q.includes('pediatric') || q.includes('toddler');

  const stopWords = ['show', 'find', 'search', 'give', 'me', 'want', 'need', 'what', 'is', 'tell', 'about', 'the', 'a', 'an', 'some', 'for', 'please', 'i', 'can', 'you', 'get', 'of', 'in', 'on', 'with', 'care', 'health', 'healthcare', 'product', 'products', 'medicine', 'medicines', 'treatment', 'solution', 'solutions', 'good', 'best', 'top', 'buy', 'item', 'items', 'body'];
  const keywords = cleanQ.split(/\s+/).filter(w => !stopWords.includes(w) && w.length > 1);

  const scored = allProds.map(p => {
    if (!p) return { product: p, score: -999 };
    const name = (p.name || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const cat = (p.categoryName || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const fullText = `${name} ${brand} ${desc} ${cat}`;
    const noSpaceText = fullText.replace(/[^a-z0-9]/g, '');

    const isCosmeticOrPersonalCare = (
      name.includes('lotion') || name.includes('wash') || name.includes('cleanser') ||
      name.includes('serum') || name.includes('sunscreen') || name.includes('cream') ||
      name.includes('shampoo') || name.includes('soap') || cat.includes('skin') || cat.includes('baby')
    );

    const isPainProduct = (
      name.includes('pain') || desc.includes('pain') || name.includes('balm') || desc.includes('balm') ||
      name.includes('relief') || desc.includes('relief') || name.includes('gel') || desc.includes('gel') ||
      name.includes('spray') || desc.includes('spray') || name.includes('paracetamol') || desc.includes('paracetamol') ||
      name.includes('ibuprofen') || name.includes('diclofenac') || name.includes('volini') || name.includes('moov') ||
      name.includes('crocin') || name.includes('dolo') || name.includes('ortho') || name.includes('knee') || name.includes('hot water')
    );

    // Strict Pain Intent Filtering
    if (isPainQuery) {
      if (isCosmeticOrPersonalCare && !isPainProduct) {
        return { product: p, score: -999 }; // Exclude body lotions, face washes, cosmetics
      }
      if (!isPainProduct && !cat.includes('prescription') && !cat.includes('device')) {
        return { product: p, score: -999 };
      }
    }

    // Strict Fever/Cold Intent Filtering
    if (isFeverColdQuery && isCosmeticOrPersonalCare && !isPainProduct) {
      return { product: p, score: -999 };
    }

    // Audience Check
    const isBabyProduct = cat.includes('baby') || cat.includes('kid') || name.includes('baby') || name.includes('kid') || name.includes('child') || name.includes('infant') || name.includes('pediatric') || cat.includes('pediatric') || name.includes('diaper') || name.includes('cerelac') || name.includes('lactogen');

    if (isAdultQuery && isBabyProduct) {
      return { product: p, score: -999 };
    }

    if (isBabyQuery && !isBabyProduct) {
      return { product: p, score: -999 };
    }

    let score = 0;

    if (isPainQuery && isPainProduct) {
      score += 70;
    }

    // Exact name or brand match
    if (name.includes(cleanQ) || (noSpaceText.includes(cleanQ) && cleanQ.length > 2)) score += 50;

    // Specific multi-word keywords match
    if (q.includes('vitamin c') && (name.includes('vitamin c') || desc.includes('vitamin c') || cat.includes('vitamin c') || name.includes('serum') || desc.includes('serum'))) {
      score += 40;
    }

    for (const kw of keywords) {
      if (kw.length <= 1) continue;
      if (name.includes(kw)) score += 30;
      else if (cat.includes(kw)) score += 20;
      else if (brand.includes(kw)) score += 20;
      else if (desc.includes(kw)) score += 10;
    }

    return { product: p, score };
  });

  // Only return products that pass a strict relevance threshold of score >= 15
  return scored
    .filter(item => item.score >= 15)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
};

/**
 * Universal Intelligent Answer Synthesizer for ANY General / Health / Conversational Question
 */
/**
 * Official Sanjeevani AI Assistant System Persona & Response Guidelines
 */
const DOCTOR_DISCLAIMER = "Please consult a licensed doctor or pharmacist for advice specific to you.";

const EMERGENCY_SYMPTOMS = [
  'chest pain', 'difficulty breathing', 'shortness of breath', 'can\'t breathe',
  'severe bleeding', 'stroke', 'numbness on one side', 'loss of consciousness',
  'fainted', 'unconscious', 'suicidal', 'suicide', 'severe allergic reaction',
  'anaphylaxis', 'choking', 'seizure', 'heart attack'
];

const OUT_OF_SCOPE_KEYWORDS = [
  'movie', 'cricket', 'game', 'sports', 'python', 'java', 'programming', 'code',
  'politics', 'election', 'song', 'music', 'crypto', 'bitcoin', 'stock market'
];

/**
 * Universal Intelligent Answer Synthesizer aligned with Sanjeevani AI Persona
 */
const synthesizeUniversalResponse = (queryText, cleanQ) => {
  // 1. Emergency Symptom Check
  if (EMERGENCY_SYMPTOMS.some(s => cleanQ.includes(s))) {
    return `🚨 **URGENT ADVISORY: THIS COULD BE A MEDICAL EMERGENCY.**\n\nPlease call your local emergency number (108 / 112) or get to the nearest emergency room right away — don't wait. If someone is with you, ask them to help you get there now.`;
  }

  // 2. Out of Scope Check
  if (OUT_OF_SCOPE_KEYWORDS.some(k => cleanQ.includes(k))) {
    return `I'm here to help with Sanjeevani orders and general health questions — is there something in that area I can help with?`;
  }

  // 3. Mild Symptom & Over-The-Counter Guidance (Headache, Fever, Pain, Cold)
  if (cleanQ.includes('headache') || cleanQ.includes('fever') || cleanQ.includes('pain') || cleanQ.includes('cold') || cleanQ.includes('cough')) {
    return `For mild, occasional symptoms like fever or headaches, many people use common over-the-counter options like **paracetamol** as directed on the package label. Rest, staying hydrated with water, and avoiding screen strain can also support your recovery.\n\n${DOCTOR_DISCLAIMER}`;
  }

  // 4. Skincare, Lotion, Moisturizer, Serums
  if (cleanQ.includes('lotion') || cleanQ.includes('cream') || cleanQ.includes('moistur') || cleanQ.includes('skin') || cleanQ.includes('face') || cleanQ.includes('acne') || cleanQ.includes('serum') || cleanQ.includes('sunscreen')) {
    return `✨ **Skincare & Product Info:**\n\n• **Hydration & Barrier Care**: Look for gentle formulations with **Ceramides**, **Hyaluronic Acid**, or **Niacinamide**.\n• **Application**: Apply evenly on clean, dry skin twice daily (Morning & Night).\n• **Sun Protection**: Pair your routine with broad-spectrum **SPF 30+ / 50+ Sunscreen**.\n\n${DOCTOR_DISCLAIMER}`;
  }

  // 5. Nutrition & Supplements
  if (cleanQ.includes('vitamin') || cleanQ.includes('protien') || cleanQ.includes('protein') || cleanQ.includes('diet') || cleanQ.includes('nutrition') || cleanQ.includes('supplement') || cleanQ.includes('calcium') || cleanQ.includes('iron') || cleanQ.includes('zinc')) {
    return `💊 **Nutrition & Wellness Info:**\n\n• **Multivitamins**: Essential for daily cellular energy, immune strength, and bone density.\n• **Dietary Support**: Consume green vegetables, citrus fruits, nuts, and adequate protein.\n• **Best Usage**: Take supplements after main meals as directed on the label.\n\n${DOCTOR_DISCLAIMER}`;
  }

  // 6. Diabetes, Blood Pressure, Chronic Care
  if (cleanQ.includes('diabetes') || cleanQ.includes('sugar') || cleanQ.includes('bp') || cleanQ.includes('blood pressure') || cleanQ.includes('hypertension') || cleanQ.includes('heart') || cleanQ.includes('thyroid')) {
    return `❤️ **Health & Chronic Care Info:**\n\n• **Monitoring**: Regularly track blood sugar or blood pressure using digital home monitors.\n• **Lifestyle**: Maintain a balanced low-sodium diet and engage in 30 minutes of daily light exercise.\n• **Prescriptions**: Always follow your doctor's exact dosage for prescription medications.\n\n${DOCTOR_DISCLAIMER}`;
  }

  // 7. General Knowledge Fallback
  return `I'm Sanjeevani AI Assistant, here to help with your orders, products, and general health inquiries.\n\n• **Explore Catalog**: Browse 159+ certified medical products, devices, and skincare on our store.\n• **Order Help**: Ask me about delivery tracking, payments, or returns.\n\n${DOCTOR_DISCLAIMER}`;
};

export const performRAGQuery = async (queryText, userSession = {}) => {
  const rawQ = queryText.toLowerCase().trim();
  const cleanQ = rawQ.replace(/[^a-z0-9\s]/g, '');

  // 1. Check Emergency First
  if (EMERGENCY_SYMPTOMS.some(s => cleanQ.includes(s))) {
    return {
      text: `🚨 **URGENT ADVISORY: THIS COULD BE A MEDICAL EMERGENCY.**\n\nPlease call your local emergency number (108 / 112) or get to the nearest emergency room right away — don't wait. If someone is with you, ask them to help you get there now.`,
      products: null,
      orderList: null,
      isEmergency: true
    };
  }

  // 2. RETRIEVAL PHASE — Fetch Live Database & Knowledge Context
  let productContext = [];
  let orderContext = [];
  let faqMatches = [];
  let matchingProducts = [];
  let matchingOrders = [];

  // A. Search FAQ Knowledge Base
  faqMatches = KNOWLEDGE_BASE_FAQS.filter(faq => 
    faq.keywords.some(kw => cleanQ.includes(kw))
  );

  // B. Search Live Products Database
  try {
    const prodRes = await shopService.getProducts();
    const allProds = (prodRes && prodRes.success && Array.isArray(prodRes.data)) ? prodRes.data : [];

    matchingProducts = filterAndRankProducts(allProds, queryText);

    productContext = matchingProducts.map(p => 
      `• ${p.name} | Price: ₹${p.price} | Rating: ★${p.rating || 4.8} | Category: ${p.categoryName} | Stock: ${p.stock > 0 ? 'In Stock' : 'Out of Stock'}`
    );
  } catch (e) {
    console.warn('RAG Product Retrieval notice:', e);
  }

  // C. Search Live User Orders
  try {
    const orderRes = await shopService.getOrders();
    const orders = (orderRes && orderRes.success && Array.isArray(orderRes.data)) ? orderRes.data : [];
    
    matchingOrders = orders;
    orderContext = orders.slice(0, 3).map(o => 
      `• Order #${o.orderId}: Status=${o.orderStatus || o.status || 'Confirmed'}, Total=₹${o.grandTotal || o.totalAmount}, Date=${o.createdAt || o.orderDate}`
    );
  } catch (e) {}

  // 3. GENERATION PHASE — Response Synthesis
  let synthesizedText = '';

  if (faqMatches.length > 0) {
    synthesizedText = faqMatches.map(f => f.answer).join('\n\n');
  } else if (cleanQ.includes('order') || cleanQ.includes('track') || cleanQ.includes('where is my order') || cleanQ.includes('status')) {
    if (matchingOrders.length > 0) {
      synthesizedText = ` Here are your recent Sanjeevani orders:`;
    } else {
      synthesizedText = `I don't have your order details in front of me — you can check real-time status on the **Track Order** page using your order ID, or I can point you to support if it's delayed. Want me to do that?`;
    }
  } else if (matchingProducts.length > 0) {
    synthesizedText = `✨ Here are top matching products on **Sanjeevani Store** for "${queryText}":`;
  } else {
    synthesizedText = synthesizeUniversalResponse(queryText, cleanQ);
  }

  return {
    text: synthesizedText,
    products: matchingProducts.length > 0 ? matchingProducts.slice(0, 4) : null,
    orderList: matchingOrders.length > 0 && (cleanQ.includes('order') || cleanQ.includes('track') || cleanQ.includes('status')) ? matchingOrders.slice(0, 3) : null,
    isRAG: true
  };
};

export default { performRAGQuery, filterAndRankProducts };
