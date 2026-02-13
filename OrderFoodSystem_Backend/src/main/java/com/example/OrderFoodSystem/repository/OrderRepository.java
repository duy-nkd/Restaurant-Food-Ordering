package com.example.OrderFoodSystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.OrderFoodSystem.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
