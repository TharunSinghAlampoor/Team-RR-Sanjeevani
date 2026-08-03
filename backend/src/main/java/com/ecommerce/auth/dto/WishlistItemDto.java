package com.ecommerce.auth.dto;

import java.math.BigDecimal;

public class WishlistItemDto {
    private Integer id;
    private ProductDto product;
    private Integer quantity;
    private BigDecimal itemTotal;

    public WishlistItemDto() {}

    public WishlistItemDto(Integer id, ProductDto product, Integer quantity, BigDecimal itemTotal) {
        this.id = id;
        this.product = product;
        this.quantity = quantity;
        this.itemTotal = itemTotal;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public ProductDto getProduct() { return product; }
    public void setProduct(ProductDto product) { this.product = product; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getItemTotal() { return itemTotal; }
    public void setItemTotal(BigDecimal itemTotal) { this.itemTotal = itemTotal; }
}
