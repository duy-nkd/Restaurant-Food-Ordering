package com.example.OrderFoodSystem.service;

import com.example.OrderFoodSystem.entity.Order;
import com.example.OrderFoodSystem.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public Double calculateTotalPrice(Order order) {
        if (order.getOrderDetails() == null || order.getOrderDetails().isEmpty()) {
            return 0.0;
        }

        double total = order.getOrderDetails().stream()
                .mapToDouble(orderDetail -> orderDetail.getSubTotal() != null ? orderDetail.getSubTotal() : 0.0)
                .sum();

        return total;
    }

    public Order updateTotalPrice(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id " + orderId));

        Double totalPrice = calculateTotalPrice(order);
        order.setTotalPrice(totalPrice);

        return orderRepository.save(order);
    }

    /**
     * Xử lý thanh toán cho đơn hàng
     * 
     * @param orderId       ID của đơn hàng
     * @param paymentMethod Phương thức thanh toán (COD, MOMO)
     * @return Order đã được cập nhật
     */
    public Order processPayment(Long orderId, String paymentMethod) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id " + orderId));

        // Kiểm tra trạng thái đơn hàng
        if (order.getStatus() == null || order.getStatus().isEmpty()) {
            order.setStatus("pending");
        }

        // Cập nhật phương thức thanh toán
        order.setPaymentMethod(paymentMethod.toUpperCase());

        // Xử lý theo từng loại thanh toán
        switch (paymentMethod.toUpperCase()) {
            case "COD":
                return processCODPayment(order);
            case "MOMO":
                return processMomoPayment(order);
            case "VNPAY":
                return processVNPayPayment(order);
            default:
                throw new RuntimeException("Invalid payment method: " + paymentMethod);
        }
    }

    /**
     * Xử lý thanh toán COD (Cash on Delivery)
     * Thanh toán khi nhận hàng - trạng thái là UNPAID cho đến khi giao hàng
     */
    private Order processCODPayment(Order order) {
        order.setPaymentStatus("UNPAID");
        order.setStatus("confirmed");
        return orderRepository.save(order);
    }

    private Order processMomoPayment(Order order) {
        // Trạng thái ban đầu khi chờ thanh toán
        order.setPaymentStatus("UNPAID");
        order.setStatus("pending");
        return orderRepository.save(order);
    }

    private Order processVNPayPayment(Order order) {
        // Trạng thái ban đầu khi chờ thanh toán VNPay
        order.setPaymentStatus("UNPAID");
        order.setStatus("pending");
        return orderRepository.save(order);
    }

    /**
     * Xác nhận thanh toán thành công (dùng cho COD khi giao hàng)
     */
    public Order confirmPayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id " + orderId));

        order.setPaymentStatus("PAID");
        order.setStatus("confirmed"); // Cập nhật status từ pending sang confirmed
        return orderRepository.save(order);
    }

    /**
     * Cập nhật phương thức thanh toán
     */
    public Order updatePaymentMethod(Long orderId, String paymentMethod) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id " + orderId));

        order.setPaymentMethod(paymentMethod);
        return orderRepository.save(order);
    }

    /**
     * Đánh dấu thanh toán thất bại
     */
    public Order failPayment(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id " + orderId));

        order.setPaymentStatus("FAILED");
        order.setStatus("cancelled");
        return orderRepository.save(order);
    }
}
