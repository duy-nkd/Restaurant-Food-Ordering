package com.example.OrderFoodSystem.config;

import org.springframework.stereotype.Component;

@Component
public class MomoConfig {
    // Sandbox Credentials
    public static final String PARTNER_CODE = "MOMOBKUN20180529";
    public static final String ACCESS_KEY = "klm05ndA9908";
    public static final String SECRET_KEY = "at67qH6670830";

    // Sandbox Endpoints
    public static final String CREATE_ORDER_URL = "https://test-payment.momo.vn/v2/gateway/api/create";

    // Redirect & Notification URLs
    // Note: notifyUrl requires a public URL (ngrok). For local testing, IPN might
    // not reach.
    // However, we will implement the logic correctly.
    public static final String REDIRECT_URL = "http://localhost:3000/payment-result";
    public static final String NOTIFY_URL = "https://your-public-url.ngrok-free.app/momo/callback";
}
