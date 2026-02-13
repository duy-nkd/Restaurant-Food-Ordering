package com.example.OrderFoodSystem.controller;

import com.example.OrderFoodSystem.entity.ProductReview;
import com.example.OrderFoodSystem.service.ProductReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@CrossOrigin("*")
public class ProductReviewController {

    @Autowired
    private ProductReviewService productReviewService;

    // DTO for Review Submission
    public static class ReviewRequest {
        public Long orderId;
        public Long orderDetailId;
        public int rating;
        public String comment;
    }

    @PostMapping
    public ResponseEntity<?> submitReview(@RequestBody ReviewRequest request) {
        try {
            ProductReview review = productReviewService.submitReview(
                    request.orderId,
                    request.orderDetailId,
                    request.rating,
                    request.comment);
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/product/{productId}")
    public List<ProductReview> getReviewsByProduct(@PathVariable Long productId) {
        return productReviewService.getReviewsByProduct(productId);
    }

    @GetMapping("/order/{orderId}")
    public List<ProductReview> getReviewsByOrder(@PathVariable Long orderId) {
        return productReviewService.getReviewsByOrder(orderId);
    }

    @GetMapping("/admin")
    public List<ProductReview> getAllReviews() {
        return productReviewService.getAllReviews();
    }

    @PutMapping("/admin/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        try {
            String statusStr = statusMap.get("status");
            ProductReview.ReviewStatus status = ProductReview.ReviewStatus.valueOf(statusStr);
            return ResponseEntity.ok(productReviewService.updateStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            productReviewService.deleteReview(id);
            return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
