package com.example.OrderFoodSystem.controller;

import com.example.OrderFoodSystem.entity.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.OrderFoodSystem.entity.Product;
import com.example.OrderFoodSystem.repository.ProductRepository;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("products")
@CrossOrigin("*")
public class ControllerProduct {
    @Autowired
    private ProductRepository productRepository;

    @PostMapping
    public Product newProduct(
            @RequestParam("nameProduct") String nameProduct,
            @RequestParam("descriptionProduct") String descriptionProduct,
            @RequestParam("priceProduct") Double priceProduct,
            @RequestParam(value = "idCategory", required = false) Long idCategory,
            @RequestParam("image") MultipartFile image) throws IOException {

        Product product = new Product();
        product.setNameProduct(nameProduct);
        product.setDescriptionProduct(descriptionProduct);
        product.setPriceProduct(priceProduct);
        product.setIsActive(true);

        if (idCategory != null) {
            Category category = new Category();
            category.setIdCategory(idCategory);
            product.setCategory(category);
        }

        String imageUrl = saveImage(image);
        product.setImageUrl(imageUrl);

        return productRepository.save(product);
    }

    @GetMapping
    List<Product> getallProducts() {
        // Chỉ trả về sản phẩm đang active (chưa xóa)
        return productRepository.findAll().stream()
                .filter(p -> p.getIsActive() != null && p.getIsActive())
                .toList();
    }

    @GetMapping("/all-including-deleted")
    List<Product> getAllProductsIncludingDeleted() {
        // API này để xem tất cả kể cả đã xóa (nếu cần)
        return productRepository.findAll();
    }

    // Lấy sản phẩm theo category (chỉ sản phẩm active)
    @GetMapping("/category/{categoryId}")
    List<Product> getProductsByCategory(@PathVariable Long categoryId) {
        List<Product> allProducts = productRepository.findAll();
        return allProducts.stream()
                .filter(p -> p.getIsActive() != null && p.getIsActive())
                .filter(p -> p.getCategory() != null && categoryId.equals(p.getCategory().getIdCategory()))
                .toList();
    }

    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestParam("nameProduct") String nameProduct,
            @RequestParam("descriptionProduct") String descriptionProduct,
            @RequestParam("priceProduct") Double priceProduct,
            @RequestParam(value = "idCategory", required = false) Long idCategory,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        return productRepository.findById(id)
                .map(product -> {
                    product.setNameProduct(nameProduct);
                    product.setDescriptionProduct(descriptionProduct);
                    product.setPriceProduct(priceProduct);

                    if (idCategory != null) {
                        Category category = new Category();
                        category.setIdCategory(idCategory);
                        product.setCategory(category);
                    }

                    if (image != null && !image.isEmpty()) {
                        try {
                            String imageUrl = saveImage(image);
                            product.setImageUrl(imageUrl);
                        } catch (IOException e) {
                            throw new RuntimeException("Error saving image", e);
                        }
                    }

                    return productRepository.save(product);
                })
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    // Soft delete: Chỉ đánh dấu là inactive thay vì xóa thật
                    product.setIsActive(false);
                    productRepository.save(product);
                    return ResponseEntity.ok("Món ăn đã được xóa. Lịch sử đơn hàng vẫn được giữ nguyên.");
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Product not found with id " + id));
    }

    // Khôi phục món ăn đã xóa
    @PatchMapping("/{id}/restore")
    ResponseEntity<?> restoreProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setIsActive(true);
                    productRepository.save(product);
                    return ResponseEntity.ok("Món ăn đã được khôi phục thành công.");
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Product not found with id " + id));
    }

    private String saveImage(MultipartFile image) throws IOException {
        if (image == null || image.isEmpty()) {
            return null;
        }

        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        File uploadDir = new File("uploads");
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String originalFilename = image.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String newFilename = UUID.randomUUID().toString() + extension;

        Path path = Paths.get("uploads", newFilename);
        Files.copy(image.getInputStream(), path);

        return "http://localhost:8080/uploads/" + newFilename;
    }
}
