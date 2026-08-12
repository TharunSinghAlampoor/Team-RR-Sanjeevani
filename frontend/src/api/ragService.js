import shopService from './shopService';

/**
 * Sanjeevani Healthcare RAG (Retrieval-Augmented Generation) Engine
 * Combines live store context (Products, Orders, Store Policies) with Hugging Face LLM Inference.
 */

const HF_MODELS = [
  'Qwen/Qwen2.5-7B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.2',
  'meta-llama/Llama-3.2-3B-Instruct',
  'Helsinki-NLP/opus-mt-en-hi'
];

export const performRAGQuery = async (queryText, userSession = {}) => {
  const rawQ = queryText.toLowerCase().trim();

  // 1. RETRIEVAL PHASE — Fetch Live Database Context
  let productContext = [];
  let orderContext = [];
  let matchingProducts = [];

  try {
    const prodRes = await shopService.getProducts();
    const allProds = (prodRes && prodRes.success && Array.isArray(prodRes.data)) ? prodRes.data : [];

    // Filter relevant products
    const keywords = rawQ.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    matchingProducts = allProds.filter(p => {
      if (!p) return false;
      const text = `${p.name || ''} ${p.brand || ''} ${p.description || ''} ${p.categoryName || ''}`.toLowerCase();
      return keywords.some(kw => text.includes(kw));
    });

    productContext = (matchingProducts.length > 0 ? matchingProducts : allProds.slice(0, 5)).map(p => 
      `• Product: ${p.name} (₹${p.price}) - Brand: ${p.brand || 'Sanjeevani'}, Category: ${p.categoryName}, In Stock: ${p.stock > 0 ? 'Yes' : 'No'}`
    );
  } catch (e) {
    console.warn('RAG Product Retrieval notice:', e);
  }

  try {
    const orderRes = await shopService.getOrders();
    const orders = (orderRes && orderRes.success && Array.isArray(orderRes.data)) ? orderRes.data : [];
    orderContext = orders.slice(0, 3).map(o => 
      `• Order #${o.orderId}: Status=${o.orderStatus || o.status || 'Processing'}, Total=₹${o.grandTotal || o.totalAmount}, Items=${Array.isArray(o.items) ? o.items.length : 1}`
    );
  } catch (e) {}

  // 2. AUGMENTATION PHASE — Construct System RAG Context Prompt
  const contextText = [
    `SANJEEVANI STORE METADATA:`,
    `- Store: Sanjeevani Health & Medical Store`,
    `- Delivery: Free Shipping across India (3-5 days standard, 1-2 days express)`,
    `- Returns: 7-Day Doorstep Return & Instant Refund Guarantee`,
    `- Payments: Razorpay (UPI, Credit/Debit Cards, Net Banking) & Cash on Delivery (COD up to ₹5,000)`,
    `- Emergency Contact: 108 (National Emergency Helpline)`,
    ``,
    `RELEVANT PRODUCTS AVAILABLE:`,
    ...(productContext.length > 0 ? productContext : ['No specific product match found.']),
    ``,
    `USER ACTIVE ORDERS:`,
    ...(orderContext.length > 0 ? orderContext : ['No active orders found for current user.'])
  ].join('\n');

  // 3. GENERATION PHASE — Query Hugging Face Inference API
  const hfToken = typeof window !== 'undefined' ? (window.HUGGINGFACE_TOKEN || import.meta.env?.VITE_HUGGINGFACE_TOKEN) : null;
  
  if (hfToken && hfToken !== 'your_huggingface_token_here') {
    for (const model of HF_MODELS) {
      try {
        const prompt = `<|system|>\nYou are Sanjeevani AI Healthcare Assistant. Use the Context below to give a helpful, polite, and accurate response in 2-3 sentences. Do not invent products not in Context.\n\n${contextText}\n<|user|>\n${queryText}\n<|assistant|>`;

        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 250, temperature: 0.7, top_p: 0.9 }
          })
        });

        if (response.ok) {
          const data = await response.json();
          let generated = '';
          if (Array.isArray(data) && data[0]?.generated_text) {
            generated = data[0].generated_text.replace(prompt, '').trim();
          } else if (data?.generated_text) {
            generated = data.generated_text.trim();
          }

          if (generated && generated.length > 10) {
            return {
              text: generated,
              products: matchingProducts.slice(0, 4),
              isRAG: true,
              modelUsed: model
            };
          }
        }
      } catch (err) {
        console.warn(`HuggingFace RAG model ${model} fallback:`, err.message);
      }
    }
  }

  // Graceful RAG Fallback if token is unconfigured or HF API busy
  return {
    text: null,
    products: matchingProducts.slice(0, 4),
    isRAG: false
  };
};

export default { performRAGQuery };
