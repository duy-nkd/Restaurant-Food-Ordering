package com.example.OrderFoodSystem.repository;

import com.example.OrderFoodSystem.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    
    // Find voucher by code
    Optional<Voucher> findByCode(String code);
    
    // Find all active vouchers
    List<Voucher> findByStatusTrue();
    
    // Find vouchers by status
    List<Voucher> findByStatus(Boolean status);
    
    // Find valid vouchers (active, not expired, and has quantity)
    @Query("SELECT v FROM Voucher v WHERE v.status = true AND v.quantity > 0 " +
           "AND v.startDate <= :currentDate AND v.endDate >= :currentDate")
    List<Voucher> findValidVouchers(LocalDate currentDate);
    
    // Find vouchers by discount type
    List<Voucher> findByDiscountType(String discountType);
    
    // Check if voucher code exists
    boolean existsByCode(String code);
}
