/**
 * Comprehensive Product-to-Brand Mapping Dictionary
 * Maps every single item in the store catalog to its exact image/packaging brand name.
 */

const BRAND_DICTIONARY = [
  // --- Category 1: Baby Needs & Pediatric Care ---
  { match: ['baby toothpaste'], brand: 'Colgate' },
  { match: ['baby toothbrush'], brand: 'Colgate' },
  { match: ['pampers'], brand: 'Pampers' },
  { match: ['mamy poko', 'mamy', 'wipes'], brand: 'MamyPoko' },
  { match: ['baby soap'], brand: 'Himalaya' },
  { match: ['baby shampoo'], brand: 'Himalaya' },
  { match: ['baby powder'], brand: 'Himalaya' },
  { match: ['baby lotion'], brand: 'Himalaya' },
  { match: ['baby oil'], brand: 'Himalaya' },
  { match: ['baby body wash'], brand: 'Himalaya' },
  { match: ['diaper rash'], brand: 'Johnson\'s' },
  { match: ['children\'s sunscreen'], brand: 'Mama earth' },
  { match: ['multivitamin gummies'], brand: 'Nutri Bears' },
  { match: ['mosquito repellent'], brand: 'Odomos' },
  { match: ['children\'s moisturizing'], brand: 'Himalaya' },
  { match: ['children\'s lip balm'], brand: 'Nivea Kids' },
  { match: ['children\'s antiseptic'], brand: 'Boroline' },
  { match: ['calcium syrup'], brand: 'Centrum' },
  { match: ['iron syrup'], brand: 'Centrum' },
  { match: ['baby pacifier'], brand: 'Bibs' },
  { match: ['mosquito patch'], brand: 'Mamaearth' },
  { match: ['laundry detergent'], brand: 'Himalaya' },
  { match: ['baby formula'], brand: 'Nestle' },
  { match: ['baby feeding bottle'], brand: 'Philips' },
  { match: ['baby cereal'], brand: 'Ceregrow' },
  { match: ['bottle cleaner'], brand: 'Windmill' },
  { match: ['baby bib'], brand: 'Mee Mee' },
  { match: ['vitamin d3 drops'], brand: 'Uprise-D3' },
  { match: ['pediatric probiotic'], brand: 'Miduty' },
  { match: ['pediatric ors'], brand: 'Electral' },
  { match: ['pediatric multivitamin'], brand: 'Zincovit' },
  { match: ['pediatric fever'], brand: 'Calpol' },
  { match: ['pediatric electrolyte'], brand: 'ORS' },
  { match: ['pediatric cough'], brand: 'Vicks' },
  { match: ['pediatric cold'], brand: 'Vicks' },

  // --- Category 2: Dermocosmetics & Skincare ---
  { match: ['hydraglow'], brand: 'Pilgrim' },
  { match: ['clearskin'], brand: 'CeraVe' },
  { match: ['brightradiance'], brand: 'Pilgrim' },
  { match: ['aquashield'], brand: 'Pilgrim' },
  { match: ['purebalance'], brand: 'Pilgrim' },
  { match: ['calmrestore'], brand: 'CeraVe' },
  { match: ['renewpeel'], brand: 'Pilgrim' },
  { match: ['sunguard'], brand: 'Pilgrim' },
  { match: ['hydramist'], brand: 'Pilgrim' },
  { match: ['agedefy'], brand: 'Pilgrim' },
  { match: ['eventone'], brand: 'Fixderma' },
  { match: ['dermohydra'], brand: 'Dot & Key' },
  { match: ['pureglow'], brand: 'Pilgrim' },
  { match: ['liprepair'], brand: 'Fixderma' },
  { match: ['eyerevive'], brand: 'The Derma Co.' },
  { match: ['ceramide'], brand: 'CeraVe' },
  { match: ['gentlemicellar'], brand: 'Garnier' },
  { match: ['hyaluronic serum'], brand: "L'Oréal Paris" },
  { match: ['blemish rescue'], brand: 'Clearasil' },
  { match: ['overnight recovery'], brand: 'Neutrogena' },
  { match: ['daily defense'], brand: 'Olay' },
  { match: ['skincomfort'], brand: 'Nivea' },
  { match: ['anti-redness'], brand: 'Cetaphil' },
  { match: ['porerefine'], brand: 'Skinspired' },
  { match: ['gentle baby dermo'], brand: 'Sebamed' },
  { match: ['repairshield'], brand: 'Vaseline' },
  { match: ['scalpbalance'], brand: 'Head & Shoulders' },
  { match: ['footrestore'], brand: 'Krack' },
  { match: ['collagen boost peptide'], brand: 'Minimalist' },
  { match: ['daily hydration gel'], brand: 'Neutrogena' },

  // --- Category 3: Medicine & General Care ---

  { match: ['cofsils'], brand: 'Cofsils' },
  { match: ['zincovit'], brand: 'Zincovit' },
  { match: ['johnson wet wipes'], brand: 'Johnson & Johnson' },
  { match: ['volini'], brand: 'Volini' },
  { match: ['vicks'], brand: 'Vicks' },
  { match: ['thyroxine'], brand: 'Thyronorm' },
  { match: ['telmisartan'], brand: 'Telma' },
  { match: ['surgical face mask'], brand: '3M' },
  { match: ['strepsils'], brand: 'Strepsils' },
  { match: ['gauze pads'], brand: 'Dettol' },
  { match: ['sitagliptin'], brand: 'Januvia' },
  { match: ['rosuvastatin'], brand: 'Rosuvas' },
  { match: ['ramipril'], brand: 'Cardace' },
  { match: ['pantoprazole'], brand: 'Pan-D' },
  { match: ['otrivin'], brand: 'Otrivin' },
  { match: ['ors sachet'], brand: 'Electral' },
  { match: ['n95 face mask'], brand: '3M' },
  { match: ['moov'], brand: 'Moov' },
  { match: ['metformin'], brand: 'Glycomet' },
  { match: ['adhesive tape'], brand: '3M' },
  { match: ['losartan'], brand: 'Repace' },
  { match: ['liv 52', 'liv52'], brand: 'Himalaya' },
  { match: ['levocetirizine'], brand: '1-AL' },
  { match: ['insulin'], brand: 'Lantus' },
  { match: ['gel pack'], brand: 'Dr. Trust' },
  { match: ['honitus'], brand: 'Dabur' },
  { match: ['hand wash'], brand: 'Dettol' },
  { match: ['hand sanitizer'], brand: 'Lifebuoy' },
  { match: ['glimepiride'], brand: 'Amaryl' },
  { match: ['first aid kit'], brand: 'Dettol' },
  { match: ['fast aid kit'], brand: 'Hansaplast' },
  { match: ['empagliflozin'], brand: 'Jardiance' },
  { match: ['electral'], brand: 'Electral' },
  { match: ['eno'], brand: 'ENO' },
  { match: ['dolo 650', 'dolo'], brand: 'Dolo' },
  { match: ['disposable gloves'], brand: 'Kanam' },
  { match: ['digene'], brand: 'Digene' },
  { match: ['chyawanprash'], brand: 'Dabur' },
  { match: ['crocin'], brand: 'Crocin' },
  { match: ['cotton roll'], brand: 'Dettol' },
  { match: ['combiflam'], brand: 'Combiflam' },
  { match: ['clopidogrel'], brand: 'Plavix' },
  { match: ['cetirizine'], brand: 'Okacet' },
  { match: ['cefuroxime'], brand: 'Cefakind' },
  { match: ['cefixime'], brand: 'Taxim-O' },
  { match: ['budesonide'], brand: 'Foracort' },
  { match: ['benadryl'], brand: 'Benadryl' },
  { match: ['azithromycin'], brand: 'Azee' },
  { match: ['atorvastatin'], brand: 'Atorva' },
  { match: ['amoxicillin'], brand: 'Moxikind' },
  { match: ['amlodipine'], brand: 'Amlokind' },
  { match: ['band-aid', 'adhesive bandage'], brand: 'Band-Aid' },

  // --- Category 4: Nutrition & Health Supplements ---
  { match: ['ensure'], brand: 'Ensure' },
  { match: ['horlicks'], brand: 'Horlicks' },
  { match: ['protinex'], brand: 'Protinex' },
  { match: ['pediasure'], brand: 'Pediasure' },
  { match: ['b-protin'], brand: 'B-Protin' },
  { match: ['himalaya ashwagandha'], brand: 'Himalaya' },
  { match: ['revital'], brand: 'Revital' },
  { match: ['shelcal'], brand: 'Shelcal' },
  { match: ['supradyn'], brand: 'Supradyn' },
  { match: ['vitamin c 500mg'], brand: 'Limcee' },
  { match: ['omega-3'], brand: 'HealthKart' },
  { match: ['vitamin d3 capsules'], brand: 'Uprise-D3' },
  { match: ['iron plus'], brand: 'Dexorange' },
  { match: ['biotin hair gummies'], brand: 'Man Matters' },
  { match: ['collagen powder'], brand: 'HealthKart' },
  { match: ['whey protein'], brand: 'Optimum Nutrition' },
  { match: ['electrolyte powder'], brand: 'Electral' },
  { match: ['herbal immunity'], brand: 'Dabur' },
  { match: ['protein energy bars'], brand: 'RiteBite Max Protein' },
  { match: ['centrum'], brand: 'Centrum' },
  { match: ['neurobion'], brand: 'Neurobion' },
  { match: ['limcee'], brand: 'Limcee' },
  { match: ['becosules'], brand: 'Becosules' },
  { match: ['calcimax'], brand: 'Calcimax' },
  { match: ['healthkart'], brand: 'HealthKart' },
  { match: ['evion'], brand: 'Evion' },
  { match: ['a to z ns'], brand: 'A to Z' },
  { match: ['livogen'], brand: 'Livogen' },

  // --- Category 5: Medical Devices ---
  { match: ['thermometer'], brand: 'Dr. Trust' },
  { match: ['heating pad'], brand: 'Flamingo' },
  { match: ['nebulizer'], brand: 'Omron' },
  { match: ['insulin injection pen', 'insulin pen'], brand: 'AllStar' },
  { match: ['bp monitor', 'blood pressure monitor'], brand: 'Omron' },
  { match: ['compression stockings'], brand: 'Tynor' },
  { match: ['glucometer'], brand: 'Accu-Chek' },
  { match: ['weighing scale'], brand: 'HealthSense' },
  { match: ['suction machine'], brand: 'Dr. Odin' },
  { match: ['steam inhaler', 'vaporizer'], brand: 'Optima' },
  { match: ['pulse oximeter'], brand: 'Dr. Trust' },
  { match: ['cpap'], brand: 'ResMed' }
];

export function resolveBrandName(product) {
  if (!product) return 'Healthcare';

  const name = (product.name || '').toLowerCase().trim();

  // 1. Check in our Brand Dictionary
  for (const entry of BRAND_DICTIONARY) {
    if (entry.match.some(keyword => name.includes(keyword))) {
      return entry.brand;
    }
  }

  // 2. If product.brand is explicitly set and not a Sanjeevani placeholder
  if (product.brand &&
    !product.brand.toLowerCase().includes('sanjeevani') &&
    product.brand !== 'Healthcare' &&
    product.brand !== 'General Healthcare') {
    return product.brand;
  }

  // 3. Fallback: Extract first word of the product name
  const words = (product.name || '').trim().split(/\s+/);
  if (words.length > 0 && words[0].length > 1) {
    return words[0];
  }

  return 'Healthcare';
}

export default resolveBrandName;
