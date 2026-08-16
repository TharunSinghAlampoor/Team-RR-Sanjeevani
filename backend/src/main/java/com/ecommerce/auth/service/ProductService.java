package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.CategoryDto;
import com.ecommerce.auth.dto.ProductDto;
import com.ecommerce.auth.entity.Category;
import com.ecommerce.auth.entity.Product;
import com.ecommerce.auth.entity.ProductImage;
import com.ecommerce.auth.exception.AuthException;
import com.ecommerce.auth.repository.CategoryRepository;
import com.ecommerce.auth.repository.ProductImageRepository;
import com.ecommerce.auth.repository.ProductRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductImageRepository productImageRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
    }

    @Cacheable(value = "categories")
    public List<CategoryDto> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        Map<String, CategoryDto> canonicalMap = new LinkedHashMap<>();

        Map<String, String> defaultCategoryImages = new HashMap<>();
        defaultCategoryImages.put("Prescriptions & Pharmacy", "https://ik.imagekit.io/stringstackpharma/Medicine/Dolo%20650?updatedAt=1785174105976");
        defaultCategoryImages.put("Nutrition & Health", "https://ik.imagekit.io/ShwetaStringstack/Ensure%20Nutrition%20Powder%20400g.webp");
        defaultCategoryImages.put("Medical Devices", "https://ik.imagekit.io/stringstackpharmacy/Images/BP%20Monitor.webp");
        defaultCategoryImages.put("Kid's Essentials", "https://ik.imagekit.io/stringstackpharma/Baby%20needs%20and%20pediatric%20needs/Pampers%20Baby%20Diapers%20(Small%20Pack)?updatedAt=1785176453338");
        defaultCategoryImages.put("Dermocosmetics (Skin Care)", "https://ik.imagekit.io/stringstackhemavathi/HydraGlow%20Moisturizing%20Cream.webp?updatedAt=1785214832999");

        for (Category cat : categories) {
            String rawName = cat.getCategoryName();
            String canonicalName = getCanonicalCategoryName(rawName);
            long count = productRepository.countByCategoryCategoryId(cat.getCategoryId());

            if (canonicalMap.containsKey(canonicalName)) {
                CategoryDto existing = canonicalMap.get(canonicalName);
                existing.setProductCount(existing.getProductCount() + count);
            } else {
                String imgUrl = defaultCategoryImages.getOrDefault(canonicalName, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80");
                canonicalMap.put(canonicalName, new CategoryDto(cat.getCategoryId(), canonicalName, count, imgUrl));
            }
        }
        return new ArrayList<>(canonicalMap.values());
    }

    private String getCanonicalCategoryName(String name) {
        if (name == null) return "General Care";
        if (name.contains("Medicine Prescription") || name.contains("Prescriptions")) return "Prescriptions & Pharmacy";
        if (name.contains("Nutrition") || name.contains("Health Supplements")) return "Nutrition & Health";
        if (name.contains("Baby") || name.contains("Pediatric") || name.contains("Kid")) return "Kid's Essentials";
        return name;
    }

    @Cacheable(value = "products", key = "{#query, #categoryId, #minPrice, #maxPrice, #inStock}")
    public List<ProductDto> getProducts(String query, Integer categoryId, BigDecimal minPrice, BigDecimal maxPrice, Boolean inStock) {
        List<Product> products = productRepository.searchAndFilterProducts(
                (query != null && !query.trim().isEmpty()) ? query.trim() : null,
                categoryId,
                minPrice,
                maxPrice,
                inStock
        );
        if (products.isEmpty()) {
            return Collections.emptyList();
        }

        List<Integer> productIds = products.stream().map(p -> p.getProductId()).collect(Collectors.toList());
        List<ProductImage> images = productImageRepository.findByProductProductIdIn(productIds);
        Map<Integer, String> imageMap = new HashMap<>();
        for (ProductImage img : images) {
            if (img.getProduct() != null && !imageMap.containsKey(img.getProduct().getProductId())) {
                imageMap.put(img.getProduct().getProductId(), img.getImageUrl());
            }
        }

        return products.stream()
                .map(p -> convertToDtoWithImage(p, imageMap.get(p.getProductId())))
                .collect(Collectors.toList());
    }

    @Cacheable(value = "product_details", key = "#id")
    public ProductDto getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AuthException("Product not found with id: " + id));
        return convertToDto(product);
    }

    public List<ProductDto> getRelatedProducts(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AuthException("Product not found with id: " + productId));
        if (product.getCategory() == null) {
            return Collections.emptyList();
        }
        List<Product> related = productRepository.findByCategoryCategoryIdAndProductIdNot(
                product.getCategory().getCategoryId(), productId);
        List<Product> limited = related.stream().limit(6).collect(Collectors.toList());
        if (limited.isEmpty()) {
            return Collections.emptyList();
        }

        List<Integer> productIds = limited.stream().map(p -> p.getProductId()).collect(Collectors.toList());
        List<ProductImage> images = productImageRepository.findByProductProductIdIn(productIds);
        Map<Integer, String> imageMap = new HashMap<>();
        for (ProductImage img : images) {
            if (img.getProduct() != null && !imageMap.containsKey(img.getProduct().getProductId())) {
                imageMap.put(img.getProduct().getProductId(), img.getImageUrl());
            }
        }

        return limited.stream()
                .map(p -> convertToDtoWithImage(p, imageMap.get(p.getProductId())))
                .collect(Collectors.toList());
    }

    @CacheEvict(value = {"products", "categories", "product_details"}, allEntries = true)
    @Transactional
    public Map<String, Object> importProductsFromPdf(MultipartFile file, Integer categoryId) {
        if (file.isEmpty()) {
            throw new AuthException("Uploaded PDF file is empty.");
        }
        Category category = null;
        if (categoryId != null) {
            category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new AuthException("Invalid Category ID: " + categoryId));
        }

        int addedCount = 0;
        int skippedCount = 0;

        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper textStripper = new PDFTextStripper();
            String fullText = textStripper.getText(document);

            // Parse text lines for Product Name, Description, Price, Stock, Image URL
            String[] lines = fullText.split("\\r?\\n");
            for (String line : lines) {
                line = line.trim();
                if (line.isEmpty() || line.toLowerCase().contains("product name") || line.toLowerCase().contains("description")) {
                    continue; // Skip header lines
                }

                // Look for URL pattern
                Pattern urlPattern = Pattern.compile("(https?://\\S+)");
                Matcher matcher = urlPattern.matcher(line);

                String imageUrl = null;
                if (matcher.find()) {
                    imageUrl = matcher.group(1);
                    line = line.replace(imageUrl, "").trim();
                }

                // Split remaining by spaces / tabs
                String[] tokens = line.split("\\s+");
                if (tokens.length >= 3) {
                    // Try parsing price and stock from end of tokens
                    BigDecimal price = BigDecimal.valueOf(199.00);
                    Integer stock = 100;
                    try {
                        price = new BigDecimal(tokens[tokens.length - 2].replaceAll("[^0-9.]", ""));
                        stock = Integer.parseInt(tokens[tokens.length - 1].replaceAll("[^0-9]", ""));
                    } catch (Exception ignored) {}

                    StringBuilder nameBuilder = new StringBuilder();
                    for (int i = 0; i < Math.max(1, tokens.length - 2); i++) {
                        nameBuilder.append(tokens[i]).append(" ");
                    }
                    String productName = nameBuilder.toString().trim();

                    if (!productName.isEmpty()) {
                        if (productRepository.existsByNameIgnoreCase(productName)) {
                            skippedCount++;
                        } else {
                            if (category == null) {
                                category = categoryRepository.findAll().stream().findFirst().orElse(null);
                            }
                            Product newProd = new Product(
                                    productName,
                                    productName + " - High quality medical supply.",
                                    price,
                                    stock,
                                    category
                            );
                            Product saved = productRepository.save(newProd);

                            if (imageUrl != null && !imageUrl.isEmpty()) {
                                productImageRepository.save(new ProductImage(saved, imageUrl));
                            } else {
                                productImageRepository.save(new ProductImage(saved, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80"));
                            }
                            addedCount++;
                        }
                    }
                }
            }

        } catch (Exception e) {
            throw new AuthException("Failed to process PDF import: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("addedCount", addedCount);
        result.put("skippedCount", skippedCount);
        result.put("message", String.format("PDF processed successfully. Added %d products, skipped %d duplicates.", addedCount, skippedCount));
        return result;
    }

    public ProductDto convertToDto(Product product) {
        List<ProductImage> images = productImageRepository.findByProductProductId(product.getProductId());
        String imageUrl = images.isEmpty() ?
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80" :
                images.get(0).getImageUrl();
        return convertToDtoWithImage(product, imageUrl);
    }

    public ProductDto convertToDtoWithImage(Product product, String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            imageUrl = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80";
        }

        // Extract Brand from product name to match product image branding
        String name = product.getName();
        String brand = "Healthcare";
        if (name.contains("Pampers")) brand = "Pampers";
        else if (name.contains("Mamy")) brand = "MamyPoko";
        else if (name.contains("Johnson")) brand = "Johnson & Johnson";
        else if (name.contains("Volini")) brand = "Volini";
        else if (name.contains("Vicks")) brand = "Vicks";
        else if (name.contains("Otrivin")) brand = "Otrivin";
        else if (name.contains("Moov")) brand = "Moov";
        else if (name.contains("Liv 52")) brand = "Himalaya";
        else if (name.contains("Honitus")) brand = "Dabur";
        else if (name.contains("Dolo")) brand = "Micro Labs";
        else if (name.contains("Dabur")) brand = "Dabur";
        else if (name.contains("Crocin")) brand = "GSK";
        else if (name.contains("Combiflam")) brand = "Sanofi";
        else if (name.contains("Benadryl")) brand = "McNeil";
        else if (name.contains("Ensure")) brand = "Ensure";
        else if (name.contains("Horlicks")) brand = "Horlicks";
        else if (name.contains("Protinex")) brand = "Protinex";
        else if (name.contains("Pediasure")) brand = "Pediasure";
        else if (name.contains("Himalaya")) brand = "Himalaya";
        else if (name.contains("Revital")) brand = "Revital";
        else if (name.contains("Zincovit")) brand = "Zincovit";
        else if (name.contains("Shelcal")) brand = "Shelcal";
        else if (name.contains("Supradyn")) brand = "Supradyn";
        else if (name.contains("HealthKart")) brand = "HealthKart";
        else if (name.contains("Evion")) brand = "Evion";
        else if (name.contains("Cofsils")) brand = "Cofsils";
        else if (name.contains("Strepsils")) brand = "Strepsils";
        else if (name.contains("ENO")) brand = "ENO";
        else if (name.contains("Digene")) brand = "Digene";
        else if (name.contains("Limcee")) brand = "Limcee";
        else if (name.contains("Becosules")) brand = "Becosules";
        else if (name.contains("Neurobion")) brand = "Neurobion";
        else if (name.contains("Centrum")) brand = "Centrum";
        else {
            String[] words = name.trim().split("\\s+");
            brand = (words.length > 0 && !words[0].isEmpty()) ? words[0] : "Healthcare";
        }

        // Deterministic rating between 4.2 and 4.9 based on ID
        double rating = 4.2 + (Math.abs(product.getProductId().hashCode()) % 8) / 10.0;
        boolean prescription = product.getName().toLowerCase().contains("mg") ||
                                product.getName().toLowerCase().contains("inhaler") ||
                                product.getName().toLowerCase().contains("pen") ||
                                product.getName().toLowerCase().contains("syrup");

        ProductDto dto = new ProductDto();
        dto.setProductId(product.getProductId());
        dto.setName(product.getName());
        dto.setGenericName(product.getGenericName());
        dto.setBrand(brand);
        dto.setManufacturer(product.getManufacturer());
        dto.setBatchNumber(product.getBatchNumber());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setDiscountPrice(product.getDiscountPrice());
        dto.setStock(product.getStock());
        dto.setExpiryDate(product.getExpiryDate());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getCategoryId());
            dto.setCategoryName(product.getCategory().getCategoryName());
        } else {
            dto.setCategoryName("General Healthcare");
        }
        dto.setImageUrl(imageUrl);
        dto.setRating(rating);
        dto.setPrescriptionRequired(product.getPrescriptionRequired() != null ? product.getPrescriptionRequired() : prescription);
        dto.setStatus(product.getStatus() != null ? product.getStatus() : "ACTIVE");
        dto.setCreatedAt(product.getCreatedAt());

        return dto;
    }
}
