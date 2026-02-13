package com.example.OrderFoodSystem.repository;

import com.example.OrderFoodSystem.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    @Query("SELECT od FROM OrderDetail od WHERE od.order.idOrder = :orderId AND od.product.idProduct = :productId")
    Optional<OrderDetail> findByOrderIdAndProductId(Long orderId, Long productId);
}
