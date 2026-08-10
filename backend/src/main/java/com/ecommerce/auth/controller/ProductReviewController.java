package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.ApiResponse;
import com.ecommerce.auth.entity.Product;
import com.ecommerce.auth.entity.ProductReview;
import com.ecommerce.auth.repository.ProductRepository;
import com.ecommerce.auth.repository.ProductReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/products")
public class ProductReviewController {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ProductReviewController(ProductReviewRepository reviewRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/{productId}/reviews")
    public ResponseEntity<ApiResponse<List<ProductReview>>> getProductReviews(@PathVariable Integer productId) {
        List<ProductReview> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        return ResponseEntity.ok(ApiResponse.success("Product reviews retrieved successfully from database", reviews));
    }

    @PostMapping("/{productId}/reviews")
    public ResponseEntity<ApiResponse<ProductReview>> addProductReview(
            @PathVariable Integer productId,
            @AuthenticationPrincipal Integer userId,
            @RequestBody Map<String, Object> body) {

        String reviewerName = body.containsKey("reviewerName") ? String.valueOf(body.get("reviewerName")).trim() : "Anonymous";
        String reviewerEmail = body.containsKey("reviewerEmail") ? String.valueOf(body.get("reviewerEmail")).trim() : null;
        String comment = body.containsKey("comment") ? String.valueOf(body.get("comment")).trim() : "";
        Integer rating = body.containsKey("rating") ? Integer.parseInt(String.valueOf(body.get("rating"))) : 5;

        Integer effectiveUserId = (userId != null) ? userId : 1;

        // Check if customer already submitted a review for this product
        boolean alreadyExistsByName = reviewRepository.existsByProductIdAndReviewerNameIgnoreCase(productId, reviewerName);
        boolean alreadyExistsByUser = (userId != null) && reviewRepository.existsByProductIdAndUserId(productId, userId);

        if (alreadyExistsByName || alreadyExistsByUser) {
            return ResponseEntity.badRequest().body(ApiResponse.error("You have already submitted a review for this product."));
        }

        ProductReview review = new ProductReview(productId, effectiveUserId, reviewerName, reviewerEmail, rating, comment);
        ProductReview saved = reviewRepository.save(review);

        // Recalculate and update product overall rating & review count in products table
        List<ProductReview> allReviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        if (!allReviews.isEmpty()) {
            double avgRating = allReviews.stream()
                    .filter(r -> r != null && r.getRating() != null)
                    .mapToInt(r -> r.getRating())
                    .average()
                    .orElse(5.0);
            Optional<Product> prodOpt = productRepository.findById(productId);
            if (prodOpt.isPresent()) {
                Product p = prodOpt.get();
                p.setRating(Math.round(avgRating * 10.0) / 10.0);
                p.setReviewsCount(allReviews.size());
                productRepository.save(p);
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Review submitted and saved to database successfully", saved));
    }
}
