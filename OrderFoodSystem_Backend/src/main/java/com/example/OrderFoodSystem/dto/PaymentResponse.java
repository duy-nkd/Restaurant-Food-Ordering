package com.example.OrderFoodSystem.dto;

public class PaymentResponse {
    private String message;
    private String paymentMethod;
    private String paymentStatus;
    private String paymentUrl; // URL để redirect đến trang thanh toán (cho Momo)
    private Long orderId;

    public PaymentResponse() {
    }

    public PaymentResponse(String message, String paymentMethod, String paymentStatus, Long orderId) {
        this.message = message;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.orderId = orderId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentUrl() {
        return paymentUrl;
    }

    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
}
