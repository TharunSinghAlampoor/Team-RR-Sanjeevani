package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.ApiResponse;
import com.ecommerce.auth.dto.ProductDto;
import com.ecommerce.auth.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDto>>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStock) {
        List<ProductDto> products = productService.getProducts(search, categoryId, minPrice, maxPrice, inStock);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable Integer id) {
        ProductDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product details retrieved", product));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getRelatedProducts(@PathVariable Integer id) {
        List<ProductDto> related = productService.getRelatedProducts(id);
        return ResponseEntity.ok(ApiResponse.success("Related products retrieved", related));
    }

    @PostMapping("/import-pdf")
    public ResponseEntity<ApiResponse<Map<String, Object>>> importProductsFromPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "categoryId", required = false) Integer categoryId) {
        Map<String, Object> result = productService.importProductsFromPdf(file, categoryId);
        return ResponseEntity.ok(ApiResponse.success("PDF catalog import completed", result));
    }
}
