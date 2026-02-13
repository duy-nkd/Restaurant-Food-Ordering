package com.example.OrderFoodSystem.service;

import com.example.OrderFoodSystem.entity.Order;
import com.example.OrderFoodSystem.entity.OrderDetail;
import com.example.OrderFoodSystem.entity.ProductReview;
import com.example.OrderFoodSystem.repository.OrderDetailRepository;
import com.example.OrderFoodSystem.repository.OrderRepository;
import com.example.OrderFoodSystem.repository.ProductReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductReviewService {

    @Autowired
    private ProductReviewRepository productReviewRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    public ProductReview submitReview(Long orderId, Long orderDetailId, int rating, String comment) {
        // 1. Verify order exists
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // 2. Verify order status is DELIVERED
        // Note: Assuming status is stored as String in Order entity based on
        // ControllerOrder
        // "Verify order status = DELIVERED"
        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Order is not delivered yet");
        }

        // 3. Verify orderDetail exists
        OrderDetail orderDetail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new RuntimeException("OrderDetail not found"));

        // 4. Verify orderDetail belongs to the order
        if (!orderDetail.getOrder().getIdOrder().equals(orderId)) {
            throw new RuntimeException("OrderDetail does not belong to this Order");
        }

        // 5. Verify not reviewed yet
        Optional<ProductReview> existingReview = productReviewRepository.findByOrderDetail_IdOrderDetail(orderDetailId);
        if (existingReview.isPresent()) {
            throw new RuntimeException("This product in this order has already been reviewed");
        }

        // 6. Create Review
        ProductReview review = new ProductReview();
        review.setCustomer(order.getCustomer()); // Derive customer from order
        review.setOrder(order);
        review.setOrderDetail(orderDetail);
        review.setRating(rating);
        review.setComment(comment);
        review.setStatus(ProductReview.ReviewStatus.PENDING); // Default PENDING

        return productReviewRepository.save(review);
    }

    public List<ProductReview> getReviewsByProduct(Long productId) {
        return productReviewRepository.findByOrderDetail_Product_IdProductAndStatus(productId,
                ProductReview.ReviewStatus.APPROVED);
    }

    public List<ProductReview> getReviewsByOrder(Long orderId) {
        return productReviewRepository.findByOrder_IdOrder(orderId);
    }

    public List<ProductReview> getAllReviews() {
        return productReviewRepository.findAll();
    }

    public ProductReview updateStatus(Long idReview, ProductReview.ReviewStatus status) {
        ProductReview review = productReviewRepository.findById(idReview)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setStatus(status);
        return productReviewRepository.save(review);
    }

    public void deleteReview(Long idReview) {
        if (!productReviewRepository.existsById(idReview)) {
            throw new RuntimeException("Review not found");
        }
        productReviewRepository.deleteById(idReview);
    }
}
