package com.example.OrderFoodSystem.entity;

import java.time.LocalDateTime;
import java.util.List;

public class ChatSession {
    private String sessionId;
    private List<Product> lastProductList;
    private String lastIntent;
    private Long customerId;
    private LocalDateTime lastSeen;

    public ChatSession(String sessionId) {
        this.sessionId = sessionId;
        this.lastSeen = LocalDateTime.now();
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public List<Product> getLastProductList() {
        return lastProductList;
    }

    public void setLastProductList(List<Product> lastProductList) {
        this.lastProductList = lastProductList;
    }

    public String getLastIntent() {
        return lastIntent;
    }

    public void setLastIntent(String lastIntent) {
        this.lastIntent = lastIntent;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public LocalDateTime getLastSeen() {
        return lastSeen;
    }

    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }

    public void updateLastSeen() {
        this.lastSeen = LocalDateTime.now();
    }
}
