package com.example.OrderFoodSystem.service;

import com.example.OrderFoodSystem.entity.Customer;
import com.example.OrderFoodSystem.entity.Product;
import com.example.OrderFoodSystem.entity.Wishlist;
import com.example.OrderFoodSystem.repository.CustomerRepository;
import com.example.OrderFoodSystem.repository.ProductRepository;
import com.example.OrderFoodSystem.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    // Thêm sản phẩm vào wishlist
    public Wishlist addToWishlist(Long customerId, Long productId) {
        // Kiểm tra xem đã tồn tại chưa
        Optional<Wishlist> existing = wishlistRepository.findByCustomerIdCustomerAndProductIdProduct(customerId, productId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Wishlist wishlist = new Wishlist(customer, product);
        return wishlistRepository.save(wishlist);
    }

    // Lấy danh sách wishlist của customer
    public List<Wishlist> getWishlistByCustomer(Long customerId) {
        return wishlistRepository.findByCustomerIdCustomer(customerId);
    }

    // Xóa sản phẩm khỏi wishlist
    @Transactional
    public void removeFromWishlist(Long customerId, Long productId) {
        wishlistRepository.deleteByCustomerIdCustomerAndProductIdProduct(customerId, productId);
    }

    // Kiểm tra sản phẩm có trong wishlist không
    public boolean isInWishlist(Long customerId, Long productId) {
        return wishlistRepository.existsByCustomerIdCustomerAndProductIdProduct(customerId, productId);
    }

    // Xóa wishlist theo id
    public void deleteWishlist(Long wishlistId) {
        wishlistRepository.deleteById(wishlistId);
    }
}
