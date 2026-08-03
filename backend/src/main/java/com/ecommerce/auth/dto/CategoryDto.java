package com.ecommerce.auth.dto;

public class CategoryDto {
    private Integer categoryId;
    private String categoryName;
    private Long productCount;
    private String imageUrl;

    public CategoryDto() {}

    public CategoryDto(Integer categoryId, String categoryName, Long productCount, String imageUrl) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.productCount = productCount;
        this.imageUrl = imageUrl;
    }

    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Long getProductCount() { return productCount; }
    public void setProductCount(Long productCount) { this.productCount = productCount; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
