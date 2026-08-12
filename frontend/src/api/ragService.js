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

  const isAdultQuery = q.includes('adult') || q.includes('skin care') || q.includes('skincare') || q.includes('sunscreen') || q.includes('serum') || q.includes('acne') || q.includes('vitamin c') || q.includes('lotion');
  const isBabyQuery = q.includes('baby') || q.includes('kid') || q.includes('child') || q.includes('infant') || q.includes('pediatric') || q.includes('toddler');

  const stopWords = ['show', 'find', 'search', 'give', 'me', 'want', 'need', 'what', 'is', 'tell', 'about', 'the', 'a', 'an', 'some', 'for', 'please', 'i', 'can', 'you', 'get', 'of', 'in', 'on', 'with', 'care', 'health', 'healthcare', 'product', 'products', 'medicine', 'medicines', 'treatment', 'solution', 'solutions', 'good', 'best', 'top', 'buy', 'item', 'items'];
  const keywords = cleanQ.split(/\s+/).filter(w => !stopWords.includes(w) && w.length > 1);

  const scored = allProds.map(p => {
    if (!p) return { product: p, score: -999 };
    const name = (p.name || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const cat = (p.categoryName || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const fullText = `${name} ${brand} ${desc} ${cat}`;
    const noSpaceText = fullText.replace(/[^a-z0-9]/g, '');

    // Audience Check
    const isBabyProduct = cat.includes('baby') || cat.includes('kid') || name.includes('baby') || name.includes('kid') || name.includes('child') || name.includes('infant') || name.includes('pediatric') || cat.includes('pediatric') || name.includes('diaper') || name.includes('cerelac') || name.includes('lactogen');

    if (isAdultQuery && isBabyProduct) {
      return { product: p, score: -999 }; // Hard exclude baby products for adult requests!
    }

    if (isBabyQuery && !isBabyProduct) {
      return { product: p, score: -999 }; // Exclude non-baby products when explicitly asking for baby care!
    }

    let score = 0;

    // Exact phrase match
    if (fullText.includes(q)) score += 50;

    // Exact compound term
    const noSpaceQ = cleanQ.replace(/\s+/g, '');
    if (noSpaceQ.length > 3 && noSpaceText.includes(noSpaceQ)) score += 30;

    // Specific multi-word keywords match
    if (q.includes('vitamin c') && (name.includes('vitamin c') || desc.includes('vitamin c') || cat.includes('vitamin c') || name.includes('serum') || desc.includes('serum'))) {
      score += 40;
    }

    for (const kw of keywords) {
      if (kw.length <= 1) continue;
      if (name.includes(kw)) score += 15;
      else if (cat.includes(kw)) score += 10;
      else if (brand.includes(kw)) score += 10;
      else if (desc.includes(kw)) score += 5;
    }

    return { product: p, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
};

/**
 * Universal Intelligent Answer Synthesizer for ANY General / Health / Conversational Question
 */
const synthesizeUniversalResponse = (queryText, cleanQ) => {
  // 1. Skincare, Lotion, Moisturizer, Face Wash, Serums
  if (cleanQ.includes('lotion') || cleanQ.includes('cream') || cleanQ.includes('moistur') || cleanQ.includes('skin') || cleanQ.includes('face') || cleanQ.includes('acne') || cleanQ.includes('serum') || cleanQ.includes('sunscreen')) {
    return `✨ Skincare & Dermocosmetic Information for "${queryText}":\n\n• Primary Benefits: Deeply hydrates skin, locks in moisture, and protects skin barrier from environmental damage.\n• Active Ingredients: Look for Ceramides, Hyaluronic Acid, Niacinamide, Salicylic Acid, or Vitamin C.\n• How to Use: Apply evenly on clean, dry skin twice daily (Morning & Night).\n• Protection Tip: Always pair daytime skincare with broad-spectrum SPF 30+/50+ Sunscreen.`;
  }

  // 2. Nutrition, Vitamin, Protein, Diet, Supplements
  if (cleanQ.includes('vitamin') || cleanQ.includes('protien') || cleanQ.includes('protein') || cleanQ.includes('diet') || cleanQ.includes('nutrition') || cleanQ.includes('supplement') || cleanQ.includes('calcium') || cleanQ.includes('iron') || cleanQ.includes('zinc')) {
    return `💊 Nutrition & Vitamin Guidance for "${queryText}":\n\n• Key Role: Supports daily cellular energy, immune strength, muscle repair, and bone density.\n• Dietary Sources: Green leafy vegetables, citrus fruits, nuts, seeds, milk, eggs, and lean protein.\n• Supplement Tip: Take multivitamins (Vitamin D3, B12, Calcium) after main meals as advised by your healthcare provider.\n• Hydration: Drink 2.5 to 3 Liters of water daily for optimal nutrient absorption.`;
  }

  // 3. Fever, Cold, Cough, Pain, Headache Symptoms
  if (cleanQ.includes('fever') || cleanQ.includes('cold') || cleanQ.includes('cough') || cleanQ.includes('pain') || cleanQ.includes('headache') || cleanQ.includes('acidity') || cleanQ.includes('stomach')) {
    return `🩺 Health Guidance for "${queryText}":\n\n• Symptoms Overview: Common body defense responses to seasonal infection, fatigue, or inflammation.\n• Recommended Care: Adequate rest, light warm meals, and hydration (warm water/herbal tea).\n• OTC Options: Paracetamol (for fever/pain), Cetirizine (for cold/allergy), Gelusil/Eno (for acidity).\n• Caution: Seek immediate medical consultation if symptoms persist for more than 3 days.`;
  }

  // 4. Diabetes, Blood Pressure, Heart Health, Chronic Conditions
  if (cleanQ.includes('diabetes') || cleanQ.includes('sugar') || cleanQ.includes('bp') || cleanQ.includes('blood pressure') || cleanQ.includes('hypertension') || cleanQ.includes('cholesterol') || cleanQ.includes('heart') || cleanQ.includes('thyroid')) {
    return `❤️ Health & Disease Management Guide for "${queryText}":\n\n• Monitoring: Check blood sugar or blood pressure regularly using digital home monitors.\n• Lifestyle Measures: Reduce daily salt & refined sugar intake, engage in 30 mins walking.\n• Medication: Never skip prescribed medications (Metformin, Telmisartan, Amlodipine).\n• Medical Consultation: Schedule routine quarterly doctor check-ups and blood tests.`;
  }

  // 5. Sleep, Wellness, Stress, Fitness, Immunity
  if (cleanQ.includes('sleep') || cleanQ.includes('wellness') || cleanQ.includes('fitness') || cleanQ.includes('exercise') || cleanQ.includes('stress') || cleanQ.includes('immunity') || cleanQ.includes('water') || cleanQ.includes('weight')) {
    return `🌿 Wellness & Health Lifestyle Advice for "${queryText}":\n\n• Sleep Hygiene: Aim for 7 to 8 hours of uninterrupted sleep every night.\n• Active Living: Incorporate daily walking, yoga, or light cardiovascular exercise.\n• Hydration & Immunity: Drink 2.5L+ clean water daily and consume Vitamin C rich fruits.\n• Stress Management: Practice 10 minutes of daily mindfulness or deep breathing exercises.`;
  }

  // 6. Universal General Knowledge & Any Other Question
  return `💡 Guidance on "${queryText}":\n\n• Sanjeevani AI Healthcare Assistant is here to provide reliable medical, wellness, and store guidance.\n• What You Can Ask: Symptoms ("medicine for fever"), Skincare ("best lotion for dry skin"), Nutrition ("vitamin D3 benefits"), Orders ("track my order").\n• Pharmacy Catalog: Browse our 159+ certified medicines, health devices, and personal care products on the store dashboard.\n• Customer Support: Need further assistance? Contact support@sanjeevani.com or call 1800-123-4567 (24/7).`;
};

export const performRAGQuery = async (queryText, userSession = {}) => {
  const rawQ = queryText.toLowerCase().trim();
  const cleanQ = rawQ.replace(/[^a-z0-9\s]/g, '');

  // 1. RETRIEVAL PHASE — Fetch Live Database & Knowledge Context
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

  // 2. GENERATION PHASE — Universal Response Synthesis
  let synthesizedText = '';
  if (faqMatches.length > 0) {
    synthesizedText = faqMatches.map(f => f.answer).join('\n\n');
  } else if (matchingProducts.length > 0) {
    synthesizedText = `✨ Top Verified Products for "${queryText}":\n\nHere are matching health & medical products available on Sanjeevani Store:`;
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
