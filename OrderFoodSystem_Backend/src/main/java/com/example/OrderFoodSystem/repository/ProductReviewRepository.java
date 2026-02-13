package com.example.OrderFoodSystem.repository;

import com.example.OrderFoodSystem.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    Optional<ProductReview> findByOrderDetail_IdOrderDetail(Long idOrderDetail);

    List<ProductReview> findByOrderDetail_Product_IdProductAndStatus(Long idProduct, ProductReview.ReviewStatus status);

    List<ProductReview> findByOrder_IdOrder(Long idOrder);
}
