package com.example.OrderFoodSystem.controller;

import com.example.OrderFoodSystem.entity.Customer;
import com.example.OrderFoodSystem.entity.OrderVoucher;
import com.example.OrderFoodSystem.entity.Voucher;
import com.example.OrderFoodSystem.repository.CustomerRepository;
import com.example.OrderFoodSystem.repository.OrderVoucherRepository;
import com.example.OrderFoodSystem.repository.VoucherRepository;
import com.example.OrderFoodSystem.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.OrderFoodSystem.entity.Order;
import com.example.OrderFoodSystem.repository.OrderRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@CrossOrigin("*")
public class ControllerOrder {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderVoucherRepository orderVoucherRepository;

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private com.example.OrderFoodSystem.service.MomoService momoService;

    @PostMapping
    Order newOrder(@RequestBody Order newOrder) {

        // Load Customer từ DB
        Long idCustomer = newOrder.getCustomer().getIdCustomer();
        Customer customer = customerRepository.findById(idCustomer)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        newOrder.setCustomer(customer);

        // Set status mặc định là pending nếu chưa có
        if (newOrder.getStatus() == null || newOrder.getStatus().isEmpty()) {
            newOrder.setStatus("pending");
        }

        // Set date nếu chưa có
        if (newOrder.getOrderDate() == null) {
            newOrder.setOrderDate(LocalDateTime.now());
        }

        // Save order
        return orderRepository.save(newOrder);
    }

    @GetMapping
    List<Order> getallOrder() {
        return orderRepository.findAll();
    }

    @PutMapping("/{id}")
    Order updateOrder(@PathVariable Long id, @RequestBody Order newOrder) {
        return orderRepository.findById(id)
                .map(order -> {
                    order.setOrderDate(newOrder.getOrderDate());
                    // Không cần set totalPrice thủ công, sẽ tính tự động
                    // order.setTotalPrice(newOrder.getTotalPrice());

                    // Cập nhật customer nếu có
                    if (newOrder.getCustomer() != null && newOrder.getCustomer().getIdCustomer() != null) {
                        Long idCustomer = newOrder.getCustomer().getIdCustomer();
                        Customer customer = customerRepository.findById(idCustomer)
                                .orElseThrow(() -> new RuntimeException("Customer not found"));
                        order.setCustomer(customer);
                    }

                    orderRepository.save(order);

                    // Tính lại totalPrice
                    return orderService.updateTotalPrice(id);
                })
                .orElseThrow(() -> new RuntimeException("Order not found with id " + id));
    }

    @DeleteMapping("/{id}")
    String deleteUser(@PathVariable Long id) {
        orderRepository.deleteById(id);
        return "Order " + id + " has been deleted";
    }

    // API cập nhật status đơn hàng (cho staff/admin)
    @PatchMapping("/{id}/status")
    Order updateOrderStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> statusUpdate) {
        return orderRepository.findById(id)
                .map(order -> {
                    String newStatus = statusUpdate.get("status");
                    if (newStatus != null && !newStatus.isEmpty()) {
                        order.setStatus(newStatus);
                        return orderRepository.save(order);
                    }
                    throw new RuntimeException("Status is required");
                })
                .orElseThrow(() -> new RuntimeException("Order not found with id " + id));
    }

    // API xác nhận đơn hàng (customer đặt hàng xong)
    @PatchMapping("/{id}/confirm")
    Order confirmOrder(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(order -> {
                    order.setStatus("confirmed");
                    order.setOrderDate(LocalDateTime.now()); // Set actual order time
                    return orderRepository.save(order);
                })
                .orElseThrow(() -> new RuntimeException("Order not found with id " + id));
    }

    // API áp dụng voucher vào đơn hàng
    @PostMapping("/{id}/apply-voucher")
    public ResponseEntity<?> applyVoucherToOrder(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Long voucherId = Long.parseLong(request.get("voucherId").toString());
            Double discountAmount = Double.parseDouble(request.get("discountAmount").toString());

            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            Voucher voucher = voucherRepository.findById(voucherId)
                    .orElseThrow(() -> new RuntimeException("Voucher not found"));

            // Xóa voucher cũ nếu có
            orderVoucherRepository.findByOrder_IdOrder(id).ifPresent(orderVoucherRepository::delete);

            // Tạo OrderVoucher mới
            OrderVoucher orderVoucher = new OrderVoucher(order, voucher, discountAmount);
            orderVoucherRepository.save(orderVoucher);

            // Cập nhật totalPrice của order
            Double newTotalPrice = order.getTotalPrice() - discountAmount;
            order.setTotalPrice(Math.max(0, newTotalPrice));
            orderRepository.save(order);

            // Giảm quantity của voucher
            voucher.setQuantity(voucher.getQuantity() - 1);
            voucherRepository.save(voucher);

            return ResponseEntity.ok(Map.of("message", "Áp dụng voucher thành công", "order", order));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi áp dụng voucher: " + e.getMessage()));
        }
    }

    // API xử lý thanh toán cho đơn hàng
    @PostMapping("/{id}/payment")
    public ResponseEntity<?> processPayment(@PathVariable Long id, @RequestBody Map<String, String> paymentRequest) {
        try {
            String paymentMethod = paymentRequest.get("paymentMethod");

            if (paymentMethod == null || paymentMethod.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Payment method is required"));
            }

            // Kiểm tra payment method hợp lệ
            if (!paymentMethod.equalsIgnoreCase("COD") && !paymentMethod.equalsIgnoreCase("MOMO")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid payment method. Only COD and MOMO are supported."));
            }

            Order order = orderService.processPayment(id, paymentMethod);

            if (paymentMethod.equalsIgnoreCase("MOMO")) {
                try {
                    String payUrl = momoService.createPaymentRequest(order);
                    return ResponseEntity.ok(Map.of(
                            "message", "Chuyển hướng đến cổng thanh toán MoMo",
                            "payUrl", payUrl,
                            "order", order));
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("message", "Lỗi khi tạo yêu cầu thanh toán MoMo: " + e.getMessage()));
                }
            }

            String message = "Xác nhận đơn hàng thành công. Thanh toán khi nhận hàng.";

            return ResponseEntity.ok(Map.of(
                    "message", message,
                    "order", order,
                    "paymentMethod", order.getPaymentMethod(),
                    "paymentStatus", order.getPaymentStatus()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi xử lý thanh toán: " + e.getMessage()));
        }
    }

    // API xác nhận thanh toán thành công (dùng cho COD khi giao hàng)
    @PatchMapping("/{id}/payment/confirm")
    public ResponseEntity<?> confirmPayment(@PathVariable Long id) {
        try {
            Order order = orderService.confirmPayment(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Xác nhận thanh toán thành công",
                    "order", order,
                    "paymentStatus", order.getPaymentStatus()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi xác nhận thanh toán: " + e.getMessage()));
        }
    }

    // API cập nhật trạng thái thanh toán (cho admin/staff)
    @PatchMapping("/{id}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("paymentStatus");

            if (newStatus == null || newStatus.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Payment status is required"));
            }

            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found with id " + id));

            order.setPaymentStatus(newStatus.toUpperCase());
            Order updatedOrder = orderRepository.save(order);

            return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật trạng thái thanh toán thành công",
                    "order", updatedOrder,
                    "paymentStatus", updatedOrder.getPaymentStatus()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi cập nhật trạng thái thanh toán: " + e.getMessage()));
        }
    }
}
