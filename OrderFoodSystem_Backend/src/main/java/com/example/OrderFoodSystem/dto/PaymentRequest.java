package com.example.OrderFoodSystem.dto;

public class PaymentRequest {
    private String paymentMethod; // COD, MOMO
    private String returnUrl; // URL để redirect sau khi thanh toán (cho Momo)
    private String notifyUrl; // URL để nhận thông báo từ Momo

    public PaymentRequest() {
    }

    public PaymentRequest(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public void setReturnUrl(String returnUrl) {
        this.returnUrl = returnUrl;
    }

    public String getNotifyUrl() {
        return notifyUrl;
    }

    public void setNotifyUrl(String notifyUrl) {
        this.notifyUrl = notifyUrl;
    }
}
