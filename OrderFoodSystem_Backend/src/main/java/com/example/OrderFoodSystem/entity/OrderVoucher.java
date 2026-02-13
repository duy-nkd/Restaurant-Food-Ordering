package com.example.OrderFoodSystem.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "order_voucher")
public class OrderVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOrderVoucher;

    @OneToOne
    @JoinColumn(name = "id_order", nullable = false, unique = true)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "id_voucher", nullable = false)
    private Voucher voucher;

    @Column(nullable = false)
    private Double discountAmount;

    // Constructors
    public OrderVoucher() {
    }

    public OrderVoucher(Order order, Voucher voucher, Double discountAmount) {
        this.order = order;
        this.voucher = voucher;
        this.discountAmount = discountAmount;
    }

    // Getters and Setters
    public Long getIdOrderVoucher() {
        return idOrderVoucher;
    }

    public void setIdOrderVoucher(Long idOrderVoucher) {
        this.idOrderVoucher = idOrderVoucher;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Voucher getVoucher() {
        return voucher;
    }

    public void setVoucher(Voucher voucher) {
        this.voucher = voucher;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(Double discountAmount) {
        this.discountAmount = discountAmount;
    }
}
