package com.example.OrderFoodSystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "wishlist", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"id_customer", "id_product"})
})
@JsonIgnoreProperties(ignoreUnknown = true)
public class Wishlist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_wishlist")
    private Long idWishlist;

    @ManyToOne
    @JoinColumn(name = "id_customer", nullable = false)
    @JsonIgnoreProperties("orders")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "id_product", nullable = false)
    private Product product;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
    }

    public Wishlist() {
    }

    public Wishlist(Customer customer, Product product) {
        this.customer = customer;
        this.product = product;
    }

    public Long getIdWishlist() {
        return idWishlist;
    }

    public void setIdWishlist(Long idWishlist) {
        this.idWishlist = idWishlist;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }
}
