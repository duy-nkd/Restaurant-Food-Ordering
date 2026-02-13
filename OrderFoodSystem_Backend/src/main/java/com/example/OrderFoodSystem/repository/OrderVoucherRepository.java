package com.example.OrderFoodSystem.repository;

import com.example.OrderFoodSystem.entity.OrderVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderVoucherRepository extends JpaRepository<OrderVoucher, Long> {
    
    Optional<OrderVoucher> findByOrder_IdOrder(Long idOrder);
    
    void deleteByOrder_IdOrder(Long idOrder);
}
