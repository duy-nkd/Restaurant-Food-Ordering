package com.example.OrderFoodSystem.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "order_details")
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOrderDetail;

    private int quantity;
    private Double subTotal;

    @Column(columnDefinition = "TEXT")
    private String note;  // ✅ thêm ghi chú

    // Nhiều orderDetail thuộc 1 order
    @ManyToOne
    @JoinColumn(name = "id_Order")
    @JsonBackReference
    private Order order;

    // Nhiều orderDetail thuộc 1 product
    @ManyToOne
    @JoinColumn(name = "id_Product")
    private Product product;

    public OrderDetail() {}

    public OrderDetail(int quantity, Double subTotal) {
        this.quantity = quantity;
        this.subTotal = subTotal;
    }

    public Long getIdOrderDetail() {
        return idOrderDetail;
    }

    public void setIdOrderDetail(Long idOrderDetail) {
        this.idOrderDetail = idOrderDetail;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Double getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(Double subTotal) {
        this.subTotal = subTotal;
    }

    public String getNote() {   // ✅ GETTER
        return note;
    }

    public void setNote(String note) {   // ✅ SETTER
        this.note = note;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }
}
