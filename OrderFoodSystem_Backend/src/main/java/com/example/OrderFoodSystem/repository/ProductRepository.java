package com.example.OrderFoodSystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.OrderFoodSystem.entity.Product;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByPriceProductLessThanEqualAndIsActiveTrue(Double price);

    List<Product> findByNameProductContainingIgnoreCaseAndIsActiveTrue(String name);
}
