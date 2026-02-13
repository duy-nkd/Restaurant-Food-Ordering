package com.example.OrderFoodSystem.controller;

import com.example.OrderFoodSystem.entity.Wishlist;
import com.example.OrderFoodSystem.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/wishlist")
@CrossOrigin("*")
public class ControllerWishlist {

    @Autowired
    private WishlistService wishlistService;

    // Thêm sản phẩm vào wishlist
    @PostMapping
    public ResponseEntity<?> addToWishlist(@RequestBody Map<String, Long> request) {
        try {
            Long customerId = request.get("customerId");
            Long productId = request.get("productId");
            
            if (customerId == null || productId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "customerId and productId are required"));
            }

            Wishlist wishlist = wishlistService.addToWishlist(customerId, productId);
            return ResponseEntity.ok(wishlist);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // Lấy wishlist của customer
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Wishlist>> getCustomerWishlist(@PathVariable Long customerId) {
        List<Wishlist> wishlist = wishlistService.getWishlistByCustomer(customerId);
        return ResponseEntity.ok(wishlist);
    }

    // Xóa sản phẩm khỏi wishlist
    @DeleteMapping
    public ResponseEntity<?> removeFromWishlist(@RequestBody Map<String, Long> request) {
        try {
            Long customerId = request.get("customerId");
            Long productId = request.get("productId");
            
            if (customerId == null || productId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "customerId and productId are required"));
            }

            wishlistService.removeFromWishlist(customerId, productId);
            return ResponseEntity.ok(Map.of("message", "Removed from wishlist"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // Xóa theo wishlist id
    @DeleteMapping("/{wishlistId}")
    public ResponseEntity<?> deleteWishlist(@PathVariable Long wishlistId) {
        try {
            wishlistService.deleteWishlist(wishlistId);
            return ResponseEntity.ok(Map.of("message", "Wishlist deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // Kiểm tra sản phẩm có trong wishlist không
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkInWishlist(
            @RequestParam Long customerId, 
            @RequestParam Long productId) {
        boolean inWishlist = wishlistService.isInWishlist(customerId, productId);
        return ResponseEntity.ok(Map.of("inWishlist", inWishlist));
    }
}
