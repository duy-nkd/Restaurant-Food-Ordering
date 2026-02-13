package com.example.OrderFoodSystem.controller;

import com.example.OrderFoodSystem.entity.Order;
import com.example.OrderFoodSystem.repository.OrderRepository;
import com.example.OrderFoodSystem.service.MomoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin("*")
public class MomoController {

    @Autowired
    private MomoService momoService;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/momo/callback")
    public ResponseEntity<Void> momoCallback(@RequestBody Map<String, String> body) {
        try {
            // 1. Verify Signature
            if (!momoService.verifySignature(body)) {
                System.err.println("MoMo IPN Signature verification failed!");
                return ResponseEntity.noContent().build(); // Always return 204 to MoMo
            }

            String orderIdStr = body.get("orderId"); // Format: orderId_timestamp
            int resultCode = Integer.parseInt(body.get("resultCode"));

            // 2. Log Result
            System.out.println("MoMo IPN received for Order ID: " + orderIdStr);
            System.out.println("Result Code: " + resultCode);
            System.out.println("Message: " + body.get("message"));

            if (resultCode != 0) {
                System.err.println("Payment failed for order: " + orderIdStr);
                return ResponseEntity.noContent().build();
            }

            // 3. Update Order Status (Idempotent)
            Long orderId = Long.parseLong(orderIdStr.split("_")[0]);
            Order order = orderRepository.findById(orderId).orElse(null);

            if (order != null) {
                if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
                    System.out.println("Order " + orderId + " is already marked as PAID. Ignoring duplicate IPN.");
                } else {
                    order.setPaymentStatus("PAID");
                    order.setStatus("confirmed");
                    orderRepository.save(order);
                    System.out.println("Order " + orderId + " updated to PAID successfully.");
                }
            }

        } catch (Exception e) {
            System.err.println("Error processing MoMo IPN: " + e.getMessage());
        }

        // 4. Always return HTTP 204 No Content to acknowledge
        return ResponseEntity.noContent().build();
    }
}
