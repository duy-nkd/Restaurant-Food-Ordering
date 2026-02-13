package com.example.OrderFoodSystem.controller;

import com.example.OrderFoodSystem.repository.OrderRepository;
import com.example.OrderFoodSystem.repository.ProductRepository;
import com.example.OrderFoodSystem.service.OrderDetailService;
import com.example.OrderFoodSystem.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.OrderFoodSystem.entity.OrderDetail;
import com.example.OrderFoodSystem.repository.OrderDetailRepository;

import java.util.List;

@RestController
@RequestMapping("/orderDetails")
@CrossOrigin("*")
public class ControllerOrderDetail {


    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailService orderDetailService;

    @Autowired
    private OrderService orderService;

    @PostMapping
    OrderDetail newOrderDetail(@RequestBody OrderDetail newOrderDetail) {

        Long idProduct = newOrderDetail.getProduct().getIdProduct();
        Long idOrder = newOrderDetail.getOrder().getIdOrder();

        var product = productRepository.findById(idProduct)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + idProduct));

        var order = orderRepository.findById(idOrder)
                .orElseThrow(() -> new RuntimeException("Order not found with id " + idOrder));

        // Kiểm tra xem món này đã có trong đơn chưa
        var existingOrderDetailOpt = orderDetailRepository.findByOrderIdAndProductId(idOrder, idProduct);

        OrderDetail savedOrderDetail;

        if (existingOrderDetailOpt.isPresent()) {
            // Nếu đã có -> tăng số lượng
            OrderDetail existingOrderDetail = existingOrderDetailOpt.get();
            existingOrderDetail.setQuantity(existingOrderDetail.getQuantity() + newOrderDetail.getQuantity());

            // Tính lại subTotal
            existingOrderDetail.setSubTotal(existingOrderDetail.getQuantity() * product.getPriceProduct());

            savedOrderDetail = orderDetailRepository.save(existingOrderDetail);
        } else {
            // Nếu chưa có -> thêm mới
            newOrderDetail.setProduct(product);
            newOrderDetail.setOrder(order);
            newOrderDetail.setSubTotal(product.getPriceProduct() * newOrderDetail.getQuantity());

            savedOrderDetail = orderDetailRepository.save(newOrderDetail);
        }

        // Cập nhật tổng tiền cho Order
        orderService.updateTotalPrice(idOrder);

        return savedOrderDetail;
    }



    @GetMapping
    List<OrderDetail> getallOrderDetails() {
        return orderDetailRepository.findAll();
    }

    @PutMapping("/{id}")
    OrderDetail updateOrderDetail(@PathVariable Long id, @RequestBody OrderDetail newOrderDetail) {
        return orderDetailRepository.findById(id)
                .map(orderDetail -> {
                    // Cập nhật quantity
                    orderDetail.setQuantity(newOrderDetail.getQuantity());
                    
                    // Nếu product thay đổi, cập nhật product
                    if (newOrderDetail.getProduct() != null && newOrderDetail.getProduct().getIdProduct() != null) {
                        Long idProduct = newOrderDetail.getProduct().getIdProduct();
                        var product = productRepository.findById(idProduct)
                                .orElseThrow(() -> new RuntimeException("Product not found with id " + idProduct));
                        orderDetail.setProduct(product);
                    }
                    
                    // Tính lại subTotal
                    orderDetailService.setCalculatedSubTotal(orderDetail);
                    
                    // Lưu orderDetail
                    OrderDetail updatedOrderDetail = orderDetailRepository.save(orderDetail);
                    
                    // Cập nhật lại totalPrice cho Order
                    Long orderId = orderDetail.getOrder().getIdOrder();
                    orderService.updateTotalPrice(orderId);
                    
                    return updatedOrderDetail;
                })
                .orElseThrow(() -> new RuntimeException("OrderDetail not found with id " + id));
    }

    @DeleteMapping("/{id}")
    String deleteUser(@PathVariable Long id) {
        if (!orderDetailRepository.existsById(id)) {
            throw new RuntimeException("OrderDetail not found with id " + id);
        }
        
        // Lấy orderId trước khi xóa
        OrderDetail orderDetail = orderDetailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrderDetail not found with id " + id));
        Long orderId = orderDetail.getOrder().getIdOrder();
        
        // Xóa orderDetail
        orderDetailRepository.deleteById(id);
        
        // Cập nhật lại totalPrice cho Order sau khi xóa
        orderService.updateTotalPrice(orderId);
        
        return "OrderDetail " + id + " has been deleted";
    }
}
