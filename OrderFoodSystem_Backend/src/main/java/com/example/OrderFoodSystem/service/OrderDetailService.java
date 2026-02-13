package com.example.OrderFoodSystem.service;

import com.example.OrderFoodSystem.entity.OrderDetail;
import org.springframework.stereotype.Service;

@Service
public class OrderDetailService {

    public Double calculateSubTotal(OrderDetail orderDetail) {
        if (orderDetail.getProduct() == null || orderDetail.getProduct().getPriceProduct() == null) {
            throw new RuntimeException("Product or price is missing");
        }

        int quantity = orderDetail.getQuantity();
        Double priceProduct = orderDetail.getProduct().getPriceProduct();

        return quantity * priceProduct;
    }

    public void setCalculatedSubTotal(OrderDetail orderDetail) {
        Double subTotal = calculateSubTotal(orderDetail);
        orderDetail.setSubTotal(subTotal);
    }
}
