package com.example.OrderFoodSystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders") // tránh trùng từ khóa ORDER
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOrder;

    private LocalDateTime orderDate;
    private Double totalPrice;
    private String status; // pending, confirmed, preparing, ready, delivered, cancelled
    
    @Column(name = "payment_method", nullable = false)
    private String paymentMethod = "COD"; // COD, MOMO
    
    @Column(name = "payment_status", nullable = false)
    private String paymentStatus = "UNPAID"; // UNPAID, PAID, FAILED

    // Nhiều order thuộc 1 customer
    @ManyToOne
    @JoinColumn(name = "id_customer")
    @JsonIgnoreProperties("orders")
    private Customer customer;

    // 1 order có nhiều orderDetail
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<OrderDetail> orderDetails;

    // 1 order có thể có 1 orderVoucher (optional)
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("order")
    private OrderVoucher orderVoucher;

    public Long getIdOrder() {
        return idOrder;
    }

    public void setIdOrder(Long idOrder) {
        this.idOrder = idOrder;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public List<OrderDetail> getOrderDetails() {
        return orderDetails;
    }

    public void setOrderDetails(List<OrderDetail> orderDetails) {
        this.orderDetails = orderDetails;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public OrderVoucher getOrderVoucher() {
        return orderVoucher;
    }

    public void setOrderVoucher(OrderVoucher orderVoucher) {
        this.orderVoucher = orderVoucher;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}