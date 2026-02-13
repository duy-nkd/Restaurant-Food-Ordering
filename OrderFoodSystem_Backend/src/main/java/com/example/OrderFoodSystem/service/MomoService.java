package com.example.OrderFoodSystem.service;

import com.example.OrderFoodSystem.config.MomoConfig;
import com.example.OrderFoodSystem.entity.Order;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Formatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class MomoService {

    private final WebClient webClient;

    public MomoService() {
        this.webClient = WebClient.builder().baseUrl(MomoConfig.CREATE_ORDER_URL).build();
    }

    public String createPaymentRequest(Order order) throws Exception {
        String requestId = UUID.randomUUID().toString();
        String orderId = order.getIdOrder() + "_" + System.currentTimeMillis();
        String orderInfo = "Thanh toán đơn hàng #" + order.getIdOrder();
        String amount = String.valueOf(Math.round(order.getTotalPrice()));
        String extraData = ""; // Can pass base64 encoded JSON here

        // Build raw signature string as per MoMo AIO documentation
        String rawHash = "accessKey=" + MomoConfig.ACCESS_KEY +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + MomoConfig.NOTIFY_URL +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + MomoConfig.PARTNER_CODE +
                "&redirectUrl=" + MomoConfig.REDIRECT_URL +
                "&requestId=" + requestId +
                "&requestType=captureWallet";

        String signature = hmacSha256(rawHash, MomoConfig.SECRET_KEY);

        Map<String, Object> body = new HashMap<>();
        body.put("partnerCode", MomoConfig.PARTNER_CODE);
        body.put("partnerName", "Test");
        body.put("storeId", "MomoTestStore");
        body.put("requestId", requestId);
        body.put("amount", amount);
        body.put("orderId", orderId);
        body.put("orderInfo", orderInfo);
        body.put("redirectUrl", MomoConfig.REDIRECT_URL);
        body.put("ipnUrl", MomoConfig.NOTIFY_URL);
        body.put("lang", "vi");
        body.put("extraData", extraData);
        body.put("requestType", "captureWallet");
        body.put("signature", signature);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = webClient.post()
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response != null && response.containsKey("payUrl")) {
            return (String) response.get("payUrl");
        } else {
            String message = response != null ? (String) response.get("message") : "Unknown error";
            throw new RuntimeException("MoMo Error: " + message);
        }
    }

    public boolean verifySignature(Map<String, String> data) throws Exception {
        String requestId = data.get("requestId");
        String orderId = data.get("orderId");
        String amount = data.get("amount");
        String orderInfo = data.get("orderInfo");
        String orderType = data.get("orderType");
        String transId = data.get("transId");
        String resultCode = data.get("resultCode");
        String message = data.get("message");
        String payType = data.get("payType");
        String responseId = data.get("responseTime");
        String extraData = data.getOrDefault("extraData", "");
        String signature = data.get("signature");

        String rawHash = "accessKey=" + MomoConfig.ACCESS_KEY +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&message=" + message +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&orderType=" + orderType +
                "&partnerCode=" + MomoConfig.PARTNER_CODE +
                "&payType=" + payType +
                "&requestId=" + requestId +
                "&responseTime=" + responseId +
                "&resultCode=" + resultCode +
                "&transId=" + transId;

        String calculatedSignature = hmacSha256(rawHash, MomoConfig.SECRET_KEY);
        return calculatedSignature.equalsIgnoreCase(signature);
    }

    private String hmacSha256(String data, String key) throws Exception {
        byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
        SecretKeySpec secretKeySpec = new SecretKeySpec(keyBytes, "HmacSHA256");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return toHexString(rawHmac);
    }

    private String toHexString(byte[] bytes) {
        try (Formatter formatter = new Formatter()) {
            for (byte b : bytes) {
                formatter.format("%02x", b);
            }
            return formatter.toString();
        }
    }
}
