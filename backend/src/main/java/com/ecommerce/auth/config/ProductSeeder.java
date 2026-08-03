package com.ecommerce.auth.config;

import com.ecommerce.auth.entity.Category;
import com.ecommerce.auth.entity.Product;
import com.ecommerce.auth.entity.ProductImage;
import com.ecommerce.auth.repository.CategoryRepository;
import com.ecommerce.auth.repository.ProductImageRepository;
import com.ecommerce.auth.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Component
public class ProductSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(ProductSeeder.class);

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    public ProductSeeder(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            ProductImageRepository productImageRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("[ACTION PERFORMED] Initializing Sanjeevani Medical Product Catalog...");

        // Ensure 5 main categories exist
        String[] requiredCategories = {
            "Prescriptions & Pharmacy",
            "Nutrition & Health",
            "Medical Devices",
            "Kid's Essentials",
            "Dermocosmetics (Skin Care)"
        };

        Map<String, Category> categoryMap = new HashMap<>();
        for (String catName : requiredCategories) {
            Category category = categoryRepository.findByCategoryName(catName)
                    .orElseGet(() -> {
                        logger.info("[ACTION PERFORMED] Created Category: '{}'", catName);
                        return categoryRepository.save(new Category(catName));
                    });
            categoryMap.put(catName, category);
        }

        // Fetch existing product names to optimize database check
        List<String> existingNamesList = productRepository.findAllProductNamesLowercase();
        Set<String> existingNamesSet = new HashSet<>();
        for (String n : existingNamesList) {
            if (n != null) {
                existingNamesSet.add(n.trim().toLowerCase());
            }
        }

        // Product data arrays: { Name, Description, Price, Stock, CategoryName, ImageUrl }
        List<String[]> pdfProducts = getPdfProductCatalog();

        int importedCount = 0;
        int updatedCount = 0;
        int skippedCount = 0;

        for (String[] item : pdfProducts) {
            String name = item[0].trim();
            String description = item[1].trim();
            BigDecimal price = new BigDecimal(item[2].trim());
            Integer stock = Integer.parseInt(item[3].trim());
            String rawCatName = item[4].trim();
            String imageUrl = item[5].trim();

            String canonicalCatName = mapCategoryName(rawCatName);
            Category cat = categoryMap.get(canonicalCatName);

            Optional<Product> existingOpt = productRepository.findByNameIgnoreCase(name);

            if (existingOpt.isPresent()) {
                Product existingProduct = existingOpt.get();
                boolean modified = false;

                // Update category if null or mismatched
                if (existingProduct.getCategory() == null ||
                        cat == null ||
                        !cat.equals(existingProduct.getCategory())) {
                    existingProduct.setCategory(cat);
                    modified = true;
                }

                if (modified) {
                    productRepository.save(existingProduct);
                    updatedCount++;
                    logger.info("[ACTION PERFORMED] Updated Category for Product: '{}' -> '{}'", name, canonicalCatName);
                } else {
                    skippedCount++;
                }

                // Ensure ProductImage exists
                List<ProductImage> existingImages = productImageRepository.findByProductProductId(existingProduct.getProductId());
                if (existingImages.isEmpty()) {
                    productImageRepository.save(new ProductImage(existingProduct, imageUrl));
                }
            } else {
                Product product = new Product(name, description, price, stock, cat);
                Product savedProduct = productRepository.save(product);

                ProductImage productImage = new ProductImage(savedProduct, imageUrl);
                productImageRepository.save(productImage);

                importedCount++;
                logger.info("[ACTION PERFORMED] Seeded Product: '{}' (Category: '{}')", name, canonicalCatName);
            }
        }

        // Clean up any empty orphan categories if present
        List<Category> allCategories = categoryRepository.findAll();
        for (Category c : allCategories) {
            if (!categoryMap.containsKey(c.getCategoryName())) {
                long count = productRepository.countByCategoryCategoryId(c.getCategoryId());
                if (count == 0) {
                    try {
                        categoryRepository.delete(c);
                        logger.info("[ACTION PERFORMED] Cleaned up unused category: '{}'", c.getCategoryName());
                    } catch (Exception ignored) {}
                }
            }
        }

        logger.info("[ACTION PERFORMED] Product Seeder Execution Completed. Total Seeded: {}, Updated Category: {}, Already Correct: {}.", importedCount, updatedCount, skippedCount);
    }

    private String mapCategoryName(String raw) {
        if (raw == null) return "Prescriptions & Pharmacy";
        String s = raw.trim();
        if (s.contains("Baby") || s.contains("Pediatric") || s.contains("Kid")) {
            return "Kid's Essentials";
        }
        if (s.contains("Medicine") || s.contains("Prescription") || s.contains("General Care")) {
            return "Prescriptions & Pharmacy";
        }
        if (s.contains("Nutrition") || s.contains("Supplement") || s.contains("Health")) {
            return "Nutrition & Health";
        }
        if (s.contains("Dermo") || s.contains("Skin")) {
            return "Dermocosmetics (Skin Care)";
        }
        if (s.contains("Medical") || s.contains("Device")) {
            return "Medical Devices";
        }
        return s;
    }

    private List<String[]> getPdfProductCatalog() {
        List<String[]> list = new ArrayList<>();

        // --- Category 1: Baby Needs and Pediatric Needs ---
        String catBaby = "Baby Needs and Pediatric Needs";
        list.add(new String[]{"Vitamin D3 Drops", "Supports healthy bone development in children.", "349", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Vitamin%20D3%20Drops?updatedAt=1785176453169"});
        list.add(new String[]{"Pediatric Probiotic Sachets", "Supports healthy digestion and gut health.", "280", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Pediatric%20Probiotic%20Sachets?updatedAt=1785176453335"});
        list.add(new String[]{"Pediatric ORS Powder", "Replaces fluids lost due to dehydration.", "30", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Pediatric%20ORS%20Powder?updatedAt=1785176453258"});
        list.add(new String[]{"Pediatric Multivitamin Syrup", "Daily multivitamin supplement for children.", "249", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Pediatric%20Multivitamin%20Syrup?updatedAt=1785176453130"});
        list.add(new String[]{"Pediatric Fever Syrup", "Helps reduce fever in children.", "85", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Pediatric%20Fever%20Syrup?updatedAt=1785176453412"});
        list.add(new String[]{"Pediatric Electrolyte Drink", "Ready-to-drink electrolyte solution.", "95", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Pediatric%20Electrolyte%20Drink?updatedAt=1785176453294"});
        list.add(new String[]{"Pediatric Cough Syrup", "Provides relief from cough.", "135", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Pediatric%20Cough%20Syrup?updatedAt=1785176453332"});
        list.add(new String[]{"Pediatric Cold Syrup", "Relieves common cold symptoms.", "125", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Pediatric%20Cold%20Syrup?updatedAt=1785176453323"});
        list.add(new String[]{"Pampers Baby Diapers (Small Pack)", "Soft, leak-proof diapers for babies.", "299", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Pampers%20Baby%20Diapers%20(Small%20Pack)?updatedAt=1785176453338"});
        list.add(new String[]{"Mamy Poko Baby Wipes (72 Sheets)", "Alcohol-free baby wipes.", "149", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Mamy%20poko%20Baby%20Wipes%20(72%20Sheets).webp?updatedAt=1785176453185"});
        list.add(new String[]{"Iron Syrup", "Helps prevent iron deficiency.", "199", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Iron%20Syrup?updatedAt=1785176453125"});
        list.add(new String[]{"Diaper Rash Cream", "Prevents and soothes diaper rash.", "229", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Diaper%20Rash%20Cream?updatedAt=1785176453158"});
        list.add(new String[]{"Children's Sunscreen SPF 50", "Protects children's skin from UV rays.", "399", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Children's%20Sunscreen%20SPF%2050?updatedAt=1785176453372"});
        list.add(new String[]{"Children's Multivitamin Gummies", "Chewable daily vitamin supplement.", "399", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Children's%20Multivitamin%20Gummies?updatedAt=1785176453192"});
        list.add(new String[]{"Children's Mosquito Repellent Cream", "Protects against mosquito bites.", "149", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Children's%20Mosquito%20Repellent%20Cream?updatedAt=1785176453368"});
        list.add(new String[]{"Children's Moisturizing Cream", "Moisturizes sensitive skin.", "249", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Children's%20Moisturizing%20Cream?updatedAt=1785176453376"});
        list.add(new String[]{"Children's Lip Balm", "Prevents dry and cracked lips.", "99", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Children's%20Lip%20Balm?updatedAt=1785176453159"});
        list.add(new String[]{"Children's Antiseptic Cream", "Protects minor cuts from infection.", "110", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Children's%20Antiseptic%20Cream?updatedAt=1785176453127"});
        list.add(new String[]{"Calcium Syrup", "Supports healthy bones and teeth.", "229", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Calcium%20Syrup?updatedAt=1785176453311"});
        list.add(new String[]{"Baby Toothpaste", "Fluoride-free toothpaste for babies.", "149", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Toothpaste?updatedAt=1785176453238"});
        list.add(new String[]{"Baby Toothbrush", "Soft-bristle toothbrush for babies.", "99", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Toothbrush?updatedAt=1785176453364"});
        list.add(new String[]{"Baby Soap", "Gentle moisturizing soap.", "89", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Soap?updatedAt=1785176453129"});
        list.add(new String[]{"Baby Shampoo", "Tear-free baby shampoo.", "199", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Shampoo?updatedAt=1785176453415"});
        list.add(new String[]{"Baby Powder", "Keeps baby's skin dry.", "145", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Powder?updatedAt=1785176453170"});
        list.add(new String[]{"Baby Pacifier", "Soft silicone pacifier.", "199", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Pacifier?updatedAt=1785176453389"});
        list.add(new String[]{"Baby Oil", "Massage oil for babies.", "175", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Oil?updatedAt=1785176453292"});
        list.add(new String[]{"Baby Mosquito Patch", "Mosquito protection patch.", "179", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Mosquito%20Patch?updatedAt=1785176453115"});
        list.add(new String[]{"Baby Lotion", "Moisturizes baby's skin.", "225", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Lotion?updatedAt=1785176453134"});
        list.add(new String[]{"Baby Laundry Detergent", "Mild detergent for baby clothes.", "349", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Laundry%20Detergent?updatedAt=1785176453219"});
        list.add(new String[]{"Baby Formula Milk", "Infant nutrition formula.", "699", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Formula%20Milk?updatedAt=1785176453115"});
        list.add(new String[]{"Baby Feeding Bottle", "BPA-free feeding bottle.", "249", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Feeding%20Bottle?updatedAt=1785176452972"});
        list.add(new String[]{"Baby Cereal", "Nutritious cereal for babies.", "325", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Cereal?updatedAt=1785176452957"});
        list.add(new String[]{"Baby Bottle Cleaner", "Bottle cleaning liquid.", "189", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Bottle%20Cleaner?updatedAt=1785176452715"});
        list.add(new String[]{"Baby Body Wash", "Gentle body wash.", "249", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Body%20Wash?updatedAt=1785176452738"});
        list.add(new String[]{"Baby Bib", "Waterproof feeding bib.", "99", "100", catBaby, "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Baby%20Bib?updatedAt=1785176452700"});

        // --- Category 2: Dermocosmetics (Skin Care) ---
        String catDermo = "Dermocosmetics (Skin Care)";
        list.add(new String[]{"HydraGlow Moisturizing Cream", "Deeply hydrates and strengthens skin barrier for soft, healthy-looking skin.", "899.00", "50", catDermo, "https://ik.imagekit.io/stringstackhemavathi/HydraGlow%20Moisturizing%20Cream.webp?updatedAt=1785214832999"});
        list.add(new String[]{"ClearSkin Acne Control Gel", "Helps reduce pimples, excess oil, and redness without over-drying skin.", "649.00", "40", catDermo, "https://ik.imagekit.io/stringstackhemavathi/ClearSkin%20Acne%20Control%20Gel'.webp?updatedAt=1785214857882"});
        list.add(new String[]{"BrightRadiance Vitamin C Serum", "Brightens dull skin and helps reduce appearance of dark spots.", "1199.00", "35", catDermo, "https://ik.imagekit.io/stringstackhemavathi/BrightRadiance%20Vitamin%20C%20Serum.webp?updatedAt=1785214890236"});
        list.add(new String[]{"AquaShield Barrier Repair Cream", "Restores the skin's natural protective barrier with nourishing ingredients.", "999.00", "45", catDermo, "https://ik.imagekit.io/stringstackhemavathi/AquaShield%20Barrier%20Repair%20Cream.webp?updatedAt=1785214911228"});
        list.add(new String[]{"PureBalance Oil Control Cleanser", "Gently removes dirt and excess oil while maintaining skin hydration.", "549.00", "60", catDermo, "https://ik.imagekit.io/stringstackhemavathi/PureBalance%20Oil%20Control%20Cleanser.webp?updatedAt=1785214932413"});
        list.add(new String[]{"CalmRestore Sensitive Skin Cream", "Soothes irritation and reduces redness in sensitive skin.", "849.00", "30", catDermo, "https://ik.imagekit.io/stringstackhemavathi/CalmRestore%20Sensitive%20Skin%20Cream.webp?updatedAt=1785214967293"});
        list.add(new String[]{"RenewPeel Exfoliating Serum", "Promotes smoother, brighter skin with gentle exfoliating acids.", "1099.00", "25", catDermo, "https://ik.imagekit.io/stringstackhemavathi/RenewPeel%20Exfoliating%20Serum.webp?updatedAt=1785215002249"});
        list.add(new String[]{"SunGuard SPF 50+ Fluid", "Lightweight broad-spectrum sunscreen with a non-greasy finish.", "799.00", "80", catDermo, "https://ik.imagekit.io/stringstackhemavathi/SunGuard%20SPF%2050+%20Fluid.webp?updatedAt=1785215037770"});
        list.add(new String[]{"HydraMist Facial Spray", "Instantly refreshes and hydrates skin throughout the day.", "499.00", "70", catDermo, "https://ik.imagekit.io/stringstackhemavathi/HydraMist%20Facial%20Spray.webp?updatedAt=1785215065309"});
        list.add(new String[]{"AgeDefy Retinol Night Serum", "Improves skin texture and reduces the appearance of fine lines.", "1299.00", "20", catDermo, "https://ik.imagekit.io/stringstackhemavathi/AgeDefy%20Retinol%20Night%20Serum.webp?updatedAt=1785215104619"});
        list.add(new String[]{"EvenTone Pigmentation Cream", "Helps minimize uneven skin tone and discoloration.", "949.00", "30", catDermo, "https://ik.imagekit.io/stringstackhemavathi/EvenTone%20Pigmentation%20Cream.webp?updatedAt=1785215163604"});
        list.add(new String[]{"DermoHydra Face Wash", "Soap-free cleanser that gently cleanses without stripping moisture.", "399.00", "90", catDermo, "https://ik.imagekit.io/stringstackhemavathi/DermoHydra%20Face%20Wash.webp?updatedAt=1785215191448"});
        list.add(new String[]{"PureGlow Niacinamide Serum", "Helps refine pores, balance oil, and improve skin clarity.", "999.00", "40", catDermo, "https://ik.imagekit.io/stringstackhemavathi/PureGlow%20Niacinamide%20Serum.webp?updatedAt=1785215248081"});
        list.add(new String[]{"LipRepair Therapy Balm", "Moisturizes and protects dry, cracked lips for lasting comfort.", "299.00", "100", catDermo, "https://ik.imagekit.io/stringstackhemavathi/LipRepair%20Therapy%20Balm.webp?updatedAt=1785215275163"});
        list.add(new String[]{"EyeRevive Caffeine Gel", "Reduces the appearance of puffiness and tired-looking eyes.", "749.00", "30", catDermo, "https://ik.imagekit.io/stringstackhemavathi/EyeRevive%20Caffeine%20Gel'.webp?updatedAt=1785215310871"});
        list.add(new String[]{"Ceramide Repair Lotion", "Nourishes dry skin and reinforces the skin's moisture barrier.", "899.00", "50", catDermo, "https://ik.imagekit.io/stringstackhemavathi/Ceramide%20Repair%20Lotion.jpg?updatedAt=1785215345526"});
        list.add(new String[]{"GentleMicellar Cleansing Water", "Removes makeup and impurities while respecting sensitive skin.", "599.00", "60", catDermo, "https://ik.imagekit.io/stringstackhemavathi/GentleMicellar%20Cleansing%20Water.avif?updatedAt=1785215393222"});
        list.add(new String[]{"Hydrating Hyaluronic Serum", "Delivers long-lasting hydration for plump, smooth skin.", "1199.00", "35", catDermo, "https://ik.imagekit.io/stringstackhemavathi/Hydrating%20Hyaluronic%20Serum.webp"});
        list.add(new String[]{"Blemish Rescue Spot Treatment", "Targets blemishes with fast-acting ingredients to reduce appearance.", "549.00", "50", catDermo, "https://ik.imagekit.io/stringstackhemavathi/Blemish%20Rescue%20Spot%20Treatment.avif"});
        list.add(new String[]{"Overnight Recovery Mask", "Intensely hydrates and revitalizes skin while you sleep.", "999.00", "30", catDermo, "https://ik.imagekit.io/stringstackhemavathi/Overnight%20Recovery%20Mask.avif"});
        list.add(new String[]{"Daily Defense Face Cream", "Moisturizes and protects skin from environmental stressors.", "799.00", "45", catDermo, "https://ik.imagekit.io/stringstackhemavathi/Daily%20Defense%20Face%20Cream.jpg"});
        list.add(new String[]{"SkinComfort Body Lotion", "Provides all-day hydration for dry and sensitive skin.", "699.00", "55", catDermo, "https://ik.imagekit.io/stringstackhemavathi/SkinComfort%20Body%20Lotion.webp"});
        list.add(new String[]{"Anti-Redness Relief Cream", "Helps calm visible redness and supports a balanced complexion.", "849.00", "35", catDermo, "https://ik.imagekit.io/stringstackhemavathi/Anti-Redness%20Relief%20Cream.webp"});
        list.add(new String[]{"PoreRefine Mattifying Gel", "Minimizes the appearance of pores and controls shine.", "749.00", "40", catDermo, "https://ik.imagekit.io/stringstackhemavathi/PoreRefine%20Mattifying%20Gel.webp"});
        list.add(new String[]{"Gentle Baby Dermo Cream", "Specially formulated to protect and soothe delicate baby skin.", "499.00", "70", catDermo, "https://ik.imagekit.io/stringstackhemavathi/Gentle%20Baby%20Dermo%20Cream.webp"});
        list.add(new String[]{"RepairShield Hand Cream", "Repairs rough, dry hands with intensive moisturizing care.", "349.00", "80", catDermo, "https://ik.imagekit.io/stringstackhemavathi/RepairShield%20Hand%20Cream.webp"});
        list.add(new String[]{"ScalpBalance Dermo Shampoo", "Cleanses the scalp while helping reduce dryness and flaking.", "649.00", "45", catDermo, "https://ik.imagekit.io/stringstackhemavathi/ScalpBalance%20Dermo%20Shampoo.webp"});
        list.add(new String[]{"FootRestore Heel Cream", "Softens rough heels and intensely moisturizes dry feet.", "399.00", "60", catDermo, "https://ik.imagekit.io/stringstackhemavathi/FootRestore%20Heel%20Cream.webp"});
        list.add(new String[]{"Collagen Boost Peptide Serum", "Supports firmer, smoother-looking skin with peptide technology.", "1399.00", "25", catDermo, "https://ik.imagekit.io/stringstackhemavathi/'Collagen%20Boost%20Peptide%20Serum.webp"});
        list.add(new String[]{"Daily Hydration Gel Cream", "Lightweight gel moisturizer that provides lasting hydration without heaviness.", "899.00", "40", catDermo, "https://ik.imagekit.io/stringstackhemavathi/Daily%20Hydration%20Gel%20Cream.jpg"});

        // --- Category 3: Medicine Prescription and General Care ---
        String catMed = "Medicine Prescription and General Care";
        list.add(new String[]{"Cofsils Lozenges", "Cofsils used for healthcare and medical purposes.", "199", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/cofsils%20Lozenges?updatedAt=1785174106093"});
        list.add(new String[]{"Zincovit Tablets", "Zincovit Tablets used for healthcare and medical purposes.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Zincovit%20Tablets?updatedAt=1785174105992"});
        list.add(new String[]{"Johnson Wet Wipes", "Johnson Wet Wipes used for healthcare and medical purposes.", "99", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Wet%20Wipes%20(Pack%20of%2050)?updatedAt=1785174106118"});
        list.add(new String[]{"Volini Spray", "Volini Spray used for pain relief and healthcare.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Volini%20Spray?updatedAt=1785174105984"});
        list.add(new String[]{"Vitamin C 500 mg", "Vitamin C 500 mg used for healthcare and immunity.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Vitamin%20C%20500%20mg?updatedAt=1785174106030"});
        list.add(new String[]{"Vicks VapoRub", "Vicks VapoRub used for cold relief.", "199", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Vitamin%20C%20500%20mg?updatedAt=1785174106030"});
        list.add(new String[]{"Thyroxine 50 mcg", "Thyroxine 50 mcg used for thyroid medical care.", "199", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Thyroxine%2050%20mcg?updatedAt=1785174106061"});
        list.add(new String[]{"Telmisartan 40 mg", "Telmisartan 40 mg used for blood pressure management.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Telmisartan%2040%20mg?updatedAt=1785174106078"});
        list.add(new String[]{"Surgical Face Mask (Pack of 10)", "Surgical Face Mask (Pack of 10) for healthcare protection.", "99", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Surgical%20Face%20Mask%20(Pack%20of%2010)?updatedAt=1785174106123"});
        list.add(new String[]{"Strepsils", "Strepsils used for throat care.", "199", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Strepsils?updatedAt=1785174106165"});
        list.add(new String[]{"Sterile Gauze Pads", "Sterile Gauze Pads used for wound dressing.", "99", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Sterile%20Gauze%20Pads?updatedAt=1785174106042"});
        list.add(new String[]{"Sitagliptin 100 mg", "Sitagliptin 100 mg prescription medication for diabetes.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Sitagliptin%20100%20mg?updatedAt=1785174106005"});
        list.add(new String[]{"Rosuvastatin 10 mg", "Rosuvastatin 10 mg used for cholesterol control.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Rosuvastatin%2010%20mg?updatedAt=1785174106078"});
        list.add(new String[]{"Ramipril 5 mg", "Ramipril 5 mg prescription blood pressure care.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Ramipril%205%20mg?updatedAt=1785174106127"});
        list.add(new String[]{"Pantoprazole 40 mg", "Pantoprazole 40 mg used for acidity relief.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Pantoprazole%2040%20mg?updatedAt=1785174105979"});
        list.add(new String[]{"Otrivin Nasal Spray", "Otrivin Nasal Spray used for nasal decongestion.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Otrivin%20Nasal%20Spray?updatedAt=1785174106103"});
        list.add(new String[]{"ORS Sachet", "ORS Sachet used for rehydration.", "199", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/ORS%20Sachet?updatedAt=1785174105924"});
        list.add(new String[]{"N95 Face Mask", "N95 Face Mask used for high filtration protection.", "99", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/N95%20Face%20Mask?updatedAt=1785174105957"});
        list.add(new String[]{"Moov Pain Relief Cream", "Moov Pain Relief Cream for muscle aches.", "199", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Moov%20Pain%20Relief%20Cream?updatedAt=1785174105999"});
        list.add(new String[]{"Metformin 500 mg", "Metformin 500 mg for blood sugar management.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Metformin%20500%20mg?updatedAt=1785174105995"});
        list.add(new String[]{"Medical Adhesive Tape", "Medical Adhesive Tape used for surgical dressings.", "99", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Medical%20Adhesive%20Tape?updatedAt=1785174105945"});
        list.add(new String[]{"Losartan 50 mg", "Losartan 50 mg for hypertension control.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Losartan%2050%20mg?updatedAt=1785174105984"});
        list.add(new String[]{"Liv 52 Tablets", "Liv 52 Tablets for liver health support.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Liv%2052%20Tablets?updatedAt=1785174106070"});
        list.add(new String[]{"Levocetirizine 5 mg", "Levocetirizine 5 mg for allergy relief.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Levocetirizine%205%20mg?updatedAt=1785174105928"});
        list.add(new String[]{"Insulin Glargine Pen", "Insulin Glargine Pen used for diabetes management.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Insulin%20Glargine%20Pen?updatedAt=1785174106023"});
        list.add(new String[]{"Hot & Cold Gel Pack", "Hot & Cold Gel Pack for joint relief.", "199", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Hot%20&%20Cold%20Gel%20Pack?updatedAt=1785174106090"});
        list.add(new String[]{"Honitus Syrup", "Honitus Syrup herbal cough relief.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Honitus%20Syrup?updatedAt=1785174106108"});
        list.add(new String[]{"Hand Wash (250 ml)", "Hand Wash (250 ml) hygiene formula.", "99", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Hand%20Wash%20(250%20ml)?updatedAt=1785174106066"});
        list.add(new String[]{"Hand Sanitizer (100 ml)", "Hand Sanitizer (100 ml) 70% alcohol antiseptic.", "99", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Hand%20Sanitizer%20(100%20ml)?updatedAt=1785174106058"});
        list.add(new String[]{"Glimepiride 2 mg", "Glimepiride 2 mg prescription diabetes tablets.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Glimepiride%202%20mg?updatedAt=1785174105970"});
        list.add(new String[]{"First Aid Kit", "First Aid Kit complete emergency essentials.", "99", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/First%20Aid%20Kit?updatedAt=1785174105904"});
        list.add(new String[]{"Fast Aid Kit", "Fast Aid Kit quick response medical kit.", "99", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Fast%20Aid%20Kit?updatedAt=1785174105969"});
        list.add(new String[]{"Empagliflozin 10 mg", "Empagliflozin 10 mg diabetes medication.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Empagliflozin%2010%20mg?updatedAt=1785174105981"});
        list.add(new String[]{"Electral Powder", "Electral Powder electrolyte replenishment.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Electral%20Powder?updatedAt=1785174105909"});
        list.add(new String[]{"ENO Fruit Salt", "ENO Fruit Salt fast relief from acidity.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/ENO%20Fruit%20Salt?updatedAt=1785174106009"});
        list.add(new String[]{"Dolo 650", "Dolo 650 analgesic and antipyretic tablets.", "199", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Dolo%20650?updatedAt=1785174105976"});
        list.add(new String[]{"Disposable Gloves (Pack of 50)", "Disposable Gloves (Pack of 50) nitrile protection.", "99", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Disposable%20Gloves%20(Pack%20of%2050)?updatedAt=1785174105923"});
        list.add(new String[]{"Digene Tablets", "Digene Tablets antacid chewable tablets.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Digene%20Tablets?updatedAt=1785174106098"});
        list.add(new String[]{"Dabur Chyawanprash", "Dabur Chyawanprash Ayurvedic immunity booster.", "199", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Dabur%20Chyawanprash?updatedAt=1785174105883"});
        list.add(new String[]{"Crocin Advance 500", "Crocin Advance 500 fast action fever relief.", "199", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Crocin%20Advance%20500?updatedAt=1785174105989"});
        list.add(new String[]{"Cotton Roll", "Cotton Roll absorbent medical cotton.", "99", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Cotton%20Roll?updatedAt=1785174105908"});
        list.add(new String[]{"Combiflam", "Combiflam pain and inflammation relief.", "199", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Combiflam?updatedAt=1785174106039"});
        list.add(new String[]{"Clopidogrel 75 mg", "Clopidogrel 75 mg prescription cardiovascular medication.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Clopidogrel%2075%20mg?updatedAt=1785174105866"});
        list.add(new String[]{"Cetirizine 10 mg", "Cetirizine 10 mg antihistamine anti-allergy tablets.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Cetirizine%2010%20mg?updatedAt=1785174106006"});
        list.add(new String[]{"Cefuroxime 500 mg", "Cefuroxime 500 mg antibiotic tablets.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Cefuroxime%20500%20mg?updatedAt=1785174105827"});
        list.add(new String[]{"Cefixime 200 mg", "Cefixime 200 mg prescription antibiotic.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Cefixime%20200%20mg?updatedAt=1785174105799"});
        list.add(new String[]{"Budesonide Inhaler", "Budesonide Inhaler asthma & respiratory relief.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Budesonide%20Inhaler?updatedAt=1785174105832"});
        list.add(new String[]{"Benadryl Syrup", "Benadryl Syrup cough & throat soothing syrup.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Benadryl%20Syrup?updatedAt=1785174105538"});
        list.add(new String[]{"Azithromycin 500 mg", "Azithromycin 500 mg broad spectrum antibiotic.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Azithromycin%20500%20mg?updatedAt=1785174105652"});
        list.add(new String[]{"Atorvastatin 10 mg", "Atorvastatin 10 mg cholesterol managing medicine.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Atorvastatin%2010%20mg?updatedAt=1785174105601"});
        list.add(new String[]{"Amoxicillin 500 mg", "Amoxicillin 500 mg antibacterial capsules.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Amoxicillin%20500%20mg?updatedAt=1785174105538"});
        list.add(new String[]{"Amlodipine 5 mg", "Amlodipine 5 mg blood pressure treatment.", "149", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Amlodipine%205%20mg?updatedAt=1785174105394"});
        list.add(new String[]{"Adhesive Bandages (Band-Aid)", "Adhesive Bandages (Band-Aid) sterile wound protection.", "199", "100", catMed, "https://ik.imagekit.io/stringstackpharma/Medicine/Adhesive%20Bandages%20(Band-Aid)?updatedAt=1785174105505"});

        // --- Category 4: Nutrition and Health Supplements ---
        String catNutr = "Nutrition and Health Supplements";
        list.add(new String[]{"Ensure Nutrition Powder 400g", "Complete balanced nutrition supplement.", "18.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Ensure%20Nutrition%20Powder%20400g.webp"});
        list.add(new String[]{"Horlicks Classic 500g", "Malt-based health drink for strength.", "7.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Horlicks%20Classic%20500g.webp"});
        list.add(new String[]{"Protinex Original 400g", "High-protein nutrition powder for adults.", "11.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Protinex%20Original%20400g.webp"});
        list.add(new String[]{"Pediasure Vanilla 400g", "Nutrition supplement for growing children.", "22.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Pediasure%20Vanilla%20400g.webp"});
        list.add(new String[]{"B-Protin Chocolate", "Protein powder enriched with essential vitamins.", "10.49", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/B-Protin%20Chocolate.webp"});
        list.add(new String[]{"Himalaya Ashwagandha", "Herbal energy and stress relief supplement.", "6.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Himalaya%20Ashwagandha.webp"});
        list.add(new String[]{"Revital H Capsules", "Multivitamin and Ginseng daily health capsules.", "5.49", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Revital%20H%20Capsules.webp"});
        list.add(new String[]{"Shelcal 500 Tablets", "Calcium and Vitamin D3 supplement for strong bones.", "3.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Shelcal%20500%20Tablets.jpg"});
        list.add(new String[]{"Supradyn Daily Tablets", "Daily multivitamin tablets for active immunity.", "4.49", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Supradyn%20Daily%20Tablets.webp"});
        list.add(new String[]{"Vitamin C 500mg Tablets", "Immunity support chewable tablet.", "5.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Vitamin%20C%20500mg%20Tablet.webp"});
        list.add(new String[]{"Omega-3 Fish Oil Capsules", "Supports heart, brain, and joint health.", "12.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Omega-3%20Fish%20Oil%20Capsules.webp"});
        list.add(new String[]{"Vitamin D3 Capsules", "High potency Vitamin D3 bone support.", "7.49", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Vitamin%20D3%20Capsules.webp"});
        list.add(new String[]{"Iron Plus Tablets", "Iron and folic acid supplement for vitality.", "4.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Iron%20Plus%20Tablets'.png"});
        list.add(new String[]{"Biotin Hair Gummies", "Supports healthy hair, skin, and nail growth.", "14.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Biotin%20Hair%20Gummies.webp"});
        list.add(new String[]{"Collagen Powder", "Collagen peptides for skin and joint elasticity.", "24.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Collagen%20Powder.webp"});
        list.add(new String[]{"Whey Protein Vanilla", "High-quality 100% whey protein isolate.", "44.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Whey%20Protein%20Vanilla.webp"});
        list.add(new String[]{"Electrolyte Powder", "Instant hydration and energy recharge powder.", "8.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Electrolyte%20Powder.webp"});
        list.add(new String[]{"Herbal Immunity Booster", "Natural Ayurvedic herbal immunity blend.", "9.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Herbal%20Immunity%20Booster.jpg"});
        list.add(new String[]{"Protein Energy Bars Pack", "High-protein quick energy bars.", "13.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Protein%20Energy%20Bars%20Pack.webp"});
        list.add(new String[]{"Centrum Multivitamin Tablets", "Complete daily multivitamin supplement.", "15.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Centrum%20Multivitamin%20Tablets.webp"});
        list.add(new String[]{"Neurobion Forte Tablets", "Vitamin B complex for nerve health and wellness.", "6.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Neurobion%20Forte%20Tablets.webp"});
        list.add(new String[]{"Limcee Vitamin C Tablets", "Chewable Vitamin C for daily immunity boost.", "4.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Limcee%20Vitamin%20C%20Tablets.webp"});
        list.add(new String[]{"Becosules Capsules", "Vitamin B-complex with Vitamin C capsules.", "5.49", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Becosules%20Capsules.webp"});
        list.add(new String[]{"Calcimax Tablets", "Calcium, Magnesium, and Vitamin D3 compound.", "8.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Calcimax%20Tablets.avif"});
        list.add(new String[]{"HealthKart Multivitamin Tablets", "Daily nutritional support tablets.", "12.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/HealthKart%20Multivitamin%20Tablets.avif"});
        list.add(new String[]{"Evion 400 Capsules", "Vitamin E antioxidant supplement.", "7.49", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Evion%20400%20Capsules.avif"});
        list.add(new String[]{"A to Z NS Tablets", "Multivitamin and multimineral daily supplement.", "9.49", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/A%20to%20Z%20NS%20Tablets.webp"});
        list.add(new String[]{"Livogen Tablets", "Iron and folic acid red blood cell booster.", "5.99", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Livogen%20Tablets.webp"});
        list.add(new String[]{"Dolo Vitamin D3 Tablets", "Vitamin D3 supplement for bone health.", "6.49", "100", catNutr, "https://ik.imagekit.io/ShwetaStringstack/Dolo%20Vitamin%20D3%20Tablets.jpg"});

        // --- Category 5: Medical Devices ---
        String catDev = "Medical Devices";
        list.add(new String[]{"Digital Clinical Thermometer", "High precision fast reading digital fever thermometer.", "299", "50", catDev, "https://ik.imagekit.io/stringstackpharmacy/Images/Thermometer.webp"});
        list.add(new String[]{"Electric Heating Pad", "Orthopedic electric heating pad for back & muscle pain relief.", "499", "50", catDev, "https://ik.imagekit.io/stringstackpharmacy/Images/Heating%20Pad.jpg"});
        list.add(new String[]{"Compressor Nebulizer Machine", "Medical grade nebulizer machine for respiratory therapy.", "1499", "40", catDev, "https://ik.imagekit.io/stringstackpharmacy/Images/Nebulizer.webp"});
        list.add(new String[]{"Insulin Injection Pen", "Ergonomic insulin injection device for diabetes care.", "899", "30", catDev, "https://ik.imagekit.io/stringstackpharmacy/Images/Insulin%20Pen.webp"});
        list.add(new String[]{"Automatic Digital BP Monitor", "Upper arm blood pressure monitor with heart rate indicator.", "1999", "40", catDev, "https://ik.imagekit.io/stringstackpharmacy/Images/BP%20Monitor.webp"});
        list.add(new String[]{"Graduated Compression Stockings", "Elastic compression stockings for varicose veins & circulation.", "399", "60", catDev, "https://ik.imagekit.io/stringstackpharmacy/Images/Compression%20Stockings.webp"});
        list.add(new String[]{"Blood Glucose Glucometer Kit", "Instant blood sugar testing meter with test strips.", "1299", "45", catDev, "https://ik.imagekit.io/stringstackpharmacy/Images/Glucometer.jpg"});
        list.add(new String[]{"Digital Body Weighing Scale", "Heavy duty tempered glass digital personal weighing scale.", "799", "50", catDev, "https://ik.imagekit.io/stringstackpharmacy/Images/Weighing%20Scale.webp"});
        list.add(new String[]{"Portable Medical Suction Machine", "High flow vacuum suction unit for clinical and home care.", "3499", "20", catDev, "https://ik.imagekit.io/stringstackpharmacy/Images/Suction%20Machine.jpg"});
        list.add(new String[]{"Personal Steam Inhaler & Vaporizer", "Warm mist facial steamer and respiratory steam inhaler.", "399", "80", catDev, "https://ik.imagekit.io/stringstackpharmacy/Images/Steam%20Inhaler.webp"});
        list.add(new String[]{"Fingertip Pulse Oximeter", "OLED display oxygen saturation (SpO2) and pulse monitor.", "699", "75", catDev, "https://ik.imagekit.io/stringstackpharmacy/Images/Pulse%20Oximeter.jpg"});
        list.add(new String[]{"CPAP Medical Machine", "Continuous positive airway pressure therapy machine for sleep apnea.", "14999", "10", catDev, "https://ik.imagekit.io/stringstackpharmacy/Images/Crap%20Machine.jpg"});

        return list;
    }
}
