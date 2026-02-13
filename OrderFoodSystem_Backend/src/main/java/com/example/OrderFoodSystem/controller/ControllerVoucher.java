package com.example.OrderFoodSystem.controller;

import com.example.OrderFoodSystem.entity.Voucher;
import com.example.OrderFoodSystem.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/vouchers")
@CrossOrigin(origins = "*")
public class ControllerVoucher {

    @Autowired
    private VoucherRepository voucherRepository;

    // Get all vouchers
    @GetMapping
    public ResponseEntity<List<Voucher>> getAllVouchers() {
        List<Voucher> vouchers = voucherRepository.findAll();
        return ResponseEntity.ok(vouchers);
    }

    // Get voucher by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getVoucherById(@PathVariable Long id) {
        Optional<Voucher> voucher = voucherRepository.findById(id);
        if (voucher.isPresent()) {
            return ResponseEntity.ok(voucher.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy voucher với ID: " + id));
        }
    }

    // Get all valid vouchers
    @GetMapping("/valid")
    public ResponseEntity<List<Voucher>> getValidVouchers() {
        List<Voucher> vouchers = voucherRepository.findValidVouchers(LocalDate.now());
        return ResponseEntity.ok(vouchers);
    }

    // Get all active vouchers
    @GetMapping("/active")
    public ResponseEntity<List<Voucher>> getActiveVouchers() {
        List<Voucher> vouchers = voucherRepository.findByStatusTrue();
        return ResponseEntity.ok(vouchers);
    }

    // Validate voucher code
    @PostMapping("/validate")
    public ResponseEntity<?> validateVoucher(@RequestBody Map<String, Object> request) {
        String code = (String) request.get("code");
        Double orderValue = Double.parseDouble(request.get("orderValue").toString());

        Optional<Voucher> voucherOpt = voucherRepository.findByCode(code);
        
        if (voucherOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("valid", false, "message", "Mã voucher không tồn tại"));
        }

        Voucher voucher = voucherOpt.get();

        if (!voucher.isValid()) {
            String message = !voucher.getStatus() ? "Voucher đã bị vô hiệu hóa" :
                           voucher.getQuantity() <= 0 ? "Voucher đã hết lượt sử dụng" :
                           "Voucher đã hết hạn hoặc chưa có hiệu lực";
            return ResponseEntity.ok(Map.of("valid", false, "message", message));
        }

        if (orderValue < voucher.getMinOrderValue()) {
            return ResponseEntity.ok(Map.of(
                "valid", false, 
                "message", "Đơn hàng tối thiểu phải từ " + voucher.getMinOrderValue() + " VNĐ"
            ));
        }

        Double discount = voucher.calculateDiscount(orderValue);
        
        Map<String, Object> response = new HashMap<>();
        response.put("valid", true);
        response.put("voucher", voucher);
        response.put("discount", discount);
        response.put("message", "Áp dụng voucher thành công");
        
        return ResponseEntity.ok(response);
    }

    // Create new voucher
    @PostMapping
    public ResponseEntity<?> createVoucher(@RequestBody Voucher voucher) {
        try {
            // Check if code already exists
            if (voucherRepository.existsByCode(voucher.getCode())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Mã voucher đã tồn tại"));
            }

            // Validate dates
            if (voucher.getEndDate().isBefore(voucher.getStartDate())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Ngày kết thúc phải sau ngày bắt đầu"));
            }

            // Validate discount type
            if (!voucher.getDiscountType().equalsIgnoreCase("percentage") && 
                !voucher.getDiscountType().equalsIgnoreCase("fixed")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Loại giảm giá không hợp lệ (percentage hoặc fixed)"));
            }

            Voucher savedVoucher = voucherRepository.save(voucher);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedVoucher);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi tạo voucher: " + e.getMessage()));
        }
    }

    // Update voucher
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVoucher(@PathVariable Long id, @RequestBody Voucher voucherDetails) {
        try {
            Optional<Voucher> voucherOpt = voucherRepository.findById(id);
            
            if (voucherOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Không tìm thấy voucher"));
            }

            Voucher voucher = voucherOpt.get();

            // Check if code is being changed and if it already exists
            if (!voucher.getCode().equals(voucherDetails.getCode()) && 
                voucherRepository.existsByCode(voucherDetails.getCode())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Mã voucher đã tồn tại"));
            }

            // Validate dates
            if (voucherDetails.getEndDate().isBefore(voucherDetails.getStartDate())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Ngày kết thúc phải sau ngày bắt đầu"));
            }

            // Update fields
            voucher.setCode(voucherDetails.getCode());
            voucher.setDiscountType(voucherDetails.getDiscountType());
            voucher.setDiscountValue(voucherDetails.getDiscountValue());
            voucher.setMinOrderValue(voucherDetails.getMinOrderValue());
            voucher.setMaxDiscount(voucherDetails.getMaxDiscount());
            voucher.setQuantity(voucherDetails.getQuantity());
            voucher.setStartDate(voucherDetails.getStartDate());
            voucher.setEndDate(voucherDetails.getEndDate());
            voucher.setStatus(voucherDetails.getStatus());

            Voucher updatedVoucher = voucherRepository.save(voucher);
            return ResponseEntity.ok(updatedVoucher);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi cập nhật voucher: " + e.getMessage()));
        }
    }

    // Delete voucher
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVoucher(@PathVariable Long id) {
        try {
            Optional<Voucher> voucher = voucherRepository.findById(id);
            
            if (voucher.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Không tìm thấy voucher"));
            }

            voucherRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Xóa voucher thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi xóa voucher: " + e.getMessage()));
        }
    }

    // Toggle voucher status
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleVoucherStatus(@PathVariable Long id) {
        try {
            Optional<Voucher> voucherOpt = voucherRepository.findById(id);
            
            if (voucherOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Không tìm thấy voucher"));
            }

            Voucher voucher = voucherOpt.get();
            voucher.setStatus(!voucher.getStatus());
            voucherRepository.save(voucher);

            String message = voucher.getStatus() ? "Kích hoạt voucher thành công" : "Vô hiệu hóa voucher thành công";
            return ResponseEntity.ok(Map.of("message", message, "status", voucher.getStatus()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi thay đổi trạng thái: " + e.getMessage()));
        }
    }

    // Apply voucher to order (decrement quantity)
    @PostMapping("/{id}/apply")
    public ResponseEntity<?> applyVoucher(@PathVariable Long id) {
        try {
            Optional<Voucher> voucherOpt = voucherRepository.findById(id);
            
            if (voucherOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Không tìm thấy voucher"));
            }

            Voucher voucher = voucherOpt.get();

            if (!voucher.isValid()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Voucher không hợp lệ"));
            }

            voucher.setQuantity(voucher.getQuantity() - 1);
            voucherRepository.save(voucher);

            return ResponseEntity.ok(Map.of("message", "Áp dụng voucher thành công", "remainingQuantity", voucher.getQuantity()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi áp dụng voucher: " + e.getMessage()));
        }
    }
}
