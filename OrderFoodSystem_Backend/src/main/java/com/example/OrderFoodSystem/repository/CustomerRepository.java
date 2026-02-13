package com.example.OrderFoodSystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.OrderFoodSystem.entity.Customer;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
}
