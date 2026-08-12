package com.ecommerce.auth.dto;

import java.math.BigDecimal;
import java.util.List;

public class CheckoutRequest {

    private String shippingAddress;
    private String paymentMethod;
    private BigDecimal totalAmount;
    private List<OrderItemPayload> items;

    public CheckoutRequest() {}

    public CheckoutRequest(String shippingAddress, String paymentMethod, BigDecimal totalAmount, List<OrderItemPayload> items) {
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.totalAmount = totalAmount;
        this.items = items;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<OrderItemPayload> getItems() {
        return items;
    }

    public void setItems(List<OrderItemPayload> items) {
        this.items = items;
    }

    public static class OrderItemPayload {
        private Integer productId;
        private String productName;
        private Integer quantity;
        private BigDecimal pricePerUnit;
        private BigDecimal totalPrice;

        public OrderItemPayload() {}

        public OrderItemPayload(Integer productId, String productName, Integer quantity, BigDecimal pricePerUnit, BigDecimal totalPrice) {
            this.productId = productId;
            this.productName = productName;
            this.quantity = quantity;
            this.pricePerUnit = pricePerUnit;
            this.totalPrice = totalPrice;
        }

        public Integer getProductId() {
            return productId;
        }

        public void setProductId(Integer productId) {
            this.productId = productId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public BigDecimal getPricePerUnit() {
            return pricePerUnit;
        }

        public void setPricePerUnit(BigDecimal pricePerUnit) {
            this.pricePerUnit = pricePerUnit;
        }

        public BigDecimal getTotalPrice() {
            return totalPrice;
        }

        public void setTotalPrice(BigDecimal totalPrice) {
            this.totalPrice = totalPrice;
        }
    }
}
