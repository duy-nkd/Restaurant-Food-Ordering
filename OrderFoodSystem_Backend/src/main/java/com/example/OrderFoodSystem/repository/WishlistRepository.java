package com.example.OrderFoodSystem.repository;

import com.example.OrderFoodSystem.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    // Tìm tất cả wishlist của 1 customer
    List<Wishlist> findByCustomerIdCustomer(Long customerId);
    
    // Tìm wishlist cụ thể của customer và product
    Optional<Wishlist> findByCustomerIdCustomerAndProductIdProduct(Long customerId, Long productId);
    
    // Xóa wishlist của customer với product cụ thể
    void deleteByCustomerIdCustomerAndProductIdProduct(Long customerId, Long productId);
    
    // Kiểm tra xem product đã có trong wishlist của customer chưa
    boolean existsByCustomerIdCustomerAndProductIdProduct(Long customerId, Long productId);
}
