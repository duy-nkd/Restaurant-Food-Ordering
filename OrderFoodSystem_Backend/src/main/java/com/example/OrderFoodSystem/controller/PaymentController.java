package com.example.OrderFoodSystem.controller;

import com.example.OrderFoodSystem.service.VNPayService;
import com.example.OrderFoodSystem.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private VNPayService vnPayService;
    
    @Autowired
    private OrderService orderService;

    @PostMapping("/vnpay/create")
    public ResponseEntity<String> createPayment(
            @RequestParam(value = "amount", defaultValue = "100000") long amount,
            @RequestParam(value = "orderInfo", defaultValue = "Thanh toan don hang") String orderInfo,
            @RequestParam(value = "orderId", required = true) String orderId,
            HttpServletRequest request) {
        try {
            // Cập nhật paymentMethod của order thành VNPAY
            Long orderIdLong = Long.parseLong(orderId);
            orderService.updatePaymentMethod(orderIdLong, "VNPAY");
            
            String ipAddress = getIpAddress(request);
            String paymentUrl = vnPayService.createPaymentUrl(amount, orderInfo, ipAddress, orderId);
            return ResponseEntity.ok(paymentUrl);
        } catch (UnsupportedEncodingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating payment URL: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/vnpay/return")
    public ResponseEntity<Map<String, Object>> paymentReturn(@RequestParam Map<String, String> params) {
        Map<String, Object> response = new HashMap<>();
        
        System.out.println("=== VNPay Return URL ===");
        System.out.println("Params: " + params);
        
        boolean isValid = vnPayService.verifyPayment(params);
        
        if (isValid) {
            String responseCode = params.get("vnp_ResponseCode");
            String transactionNo = params.get("vnp_TransactionNo");
            String txnRef = params.get("vnp_TxnRef");
            String amount = params.get("vnp_Amount");
            String bankCode = params.get("vnp_BankCode");
            String payDate = params.get("vnp_PayDate");
            
            if ("00".equals(responseCode)) {
                // Thanh toán thành công - Cập nhật trạng thái đơn hàng
                try {
                    // Parse orderId từ txnRef (format: orderId_timestamp hoặc chỉ orderId)
                    Long orderId = Long.parseLong(txnRef.split("_")[0]);
                    orderService.confirmPayment(orderId);
                    System.out.println("Order #" + orderId + " payment confirmed");
                    
                    response.put("status", "success");
                    response.put("message", "Thanh toán thành công");
                    response.put("orderId", orderId);
                    response.put("transactionNo", transactionNo);
                    response.put("txnRef", txnRef);
                    response.put("amount", Long.parseLong(amount) / 100); // Chia 100 để lấy số tiền gốc
                    response.put("bankCode", bankCode);
                    response.put("payDate", payDate);
                } catch (Exception e) {
                    System.err.println("Error updating order: " + e.getMessage());
                    response.put("status", "error");
                    response.put("message", "Lỗi cập nhật đơn hàng: " + e.getMessage());
                }
            } else {
                // Thanh toán thất bại
                try {
                    Long orderId = Long.parseLong(txnRef.split("_")[0]);
                    orderService.failPayment(orderId, "VNPay response code: " + responseCode);
                    System.out.println("Order #" + orderId + " payment failed");
                } catch (Exception e) {
                    System.err.println("Error updating failed order: " + e.getMessage());
                }
                
                response.put("status", "failed");
                response.put("message", "Thanh toán thất bại");
                response.put("responseCode", responseCode);
            }
        } else {
            response.put("status", "error");
            response.put("message", "Chữ ký không hợp lệ");
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, Object>> paymentIPN(@RequestParam Map<String, String> params) {
        Map<String, Object> response = new HashMap<>();
        
        boolean isValid = vnPayService.verifyPayment(params);
        
        if (isValid) {
            String responseCode = params.get("vnp_ResponseCode");
            String transactionNo = params.get("vnp_TransactionNo");
            String txnRef = params.get("vnp_TxnRef");
            String amount = params.get("vnp_Amount");
            
            if ("00".equals(responseCode)) {
                // Kiểm tra đơn hàng tồn tại trong DB
                // Kiểm tra số tiền thanh toán có đúng không
                // Kiểm tra trạng thái đơn hàng (chưa được xử lý)
                // Cập nhật trạng thái đơn hàng thành công
                
                // TODO: Implement logic cập nhật database
                System.out.println("IPN: Payment success for order " + txnRef);
                System.out.println("Transaction No: " + transactionNo);
                System.out.println("Amount: " + Long.parseLong(amount) / 100);
                
                response.put("RspCode", "00");
                response.put("Message", "Confirm Success");
            } else {
                // Thanh toán thất bại, cập nhật trạng thái đơn hàng
                System.out.println("IPN: Payment failed for order " + txnRef);
                response.put("RspCode", "00");
                response.put("Message", "Confirm Success");
            }
        } else {
            response.put("RspCode", "97");
            response.put("Message", "Invalid Signature");
        }
        
        return ResponseEntity.ok(response);
    }

    private String getIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }
}
