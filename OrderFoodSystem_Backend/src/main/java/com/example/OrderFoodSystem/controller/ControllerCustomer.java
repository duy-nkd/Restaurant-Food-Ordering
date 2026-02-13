package com.example.OrderFoodSystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.OrderFoodSystem.entity.Customer;
import com.example.OrderFoodSystem.repository.CustomerRepository;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/customers")
@CrossOrigin("*")
public class ControllerCustomer {

    @Autowired
    private CustomerRepository customerRepository;

    // Thêm Customer mới
    @PostMapping
    public Customer newCustomer(@RequestBody Customer newCustomer) {
        newCustomer.setOrders(null); // tránh lỗi cascade
        return customerRepository.save(newCustomer);
    }

    // Lấy tất cả Customer
    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // Lấy Customer theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id " + id));
        return ResponseEntity.ok(customer);
    }

    // Cập nhật Customer
    @PutMapping("/{id}")
    public Customer updateCustomer(@PathVariable Long id, @RequestBody Customer newCustomer) {
        return customerRepository.findById(id)
                .map(customer -> {
                    customer.setNameCustomer(newCustomer.getNameCustomer());
                    customer.setPhoneCustomer(newCustomer.getPhoneCustomer());
                    customer.setAddressCustomer(newCustomer.getAddressCustomer());
                    customer.setEmail(newCustomer.getEmail());
                    customer.setPassword(newCustomer.getPassword());
                    if (newCustomer.getRole() != null) {
                        customer.setRole(newCustomer.getRole());
                    }
                    return customerRepository.save(customer);
                })
                .orElseThrow(() -> new RuntimeException("Customer not found with id " + id));
    }

    // Xóa Customer kèm Order (CascadeType.ALL)
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id " + id));

        customerRepository.delete(customer);
        return "User " + id + " has been deleted";
    }

    // Đăng ký Customer mới
    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@RequestBody Customer newCustomer) {
        // Kiểm tra email đã tồn tại chưa
        List<Customer> existingCustomers = customerRepository.findAll();
        for (Customer c : existingCustomers) {
            if (c.getEmail() != null && c.getEmail().equals(newCustomer.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email đã được sử dụng");
                return ResponseEntity.badRequest().body(error);
            }
        }

        newCustomer.setOrders(null);
        newCustomer.setRole("CUSTOMER"); // Mặc định là CUSTOMER
        Customer savedCustomer = customerRepository.save(newCustomer);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đăng ký thành công");
        response.put("customer", savedCustomer);
        return ResponseEntity.ok(response);
    }

    // Đăng nhập Customer
    @PostMapping("/login")
    public ResponseEntity<?> loginCustomer(@RequestBody Map<String, String> loginData) {

        String email = loginData.get("email");
        String password = loginData.get("password");

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);

        if (customerOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email hoặc mật khẩu không đúng");
            return ResponseEntity.badRequest().body(error);
        }

        Customer customer = customerOpt.get();

        if (customer.getPassword() == null || !customer.getPassword().equals(password)) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email hoặc mật khẩu không đúng");
            return ResponseEntity.badRequest().body(error);
        }

        if (customer.getIsActive() != null && !customer.getIsActive()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
            return ResponseEntity.badRequest().body(error);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đăng nhập thành công");
        response.put("customer", customer);

        return ResponseEntity.ok(response);
    }

    // Đăng nhập bằng Google
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> googleData) {

        String email = googleData.get("email");
        String name = googleData.get("name");

        if (email == null || email.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email Google không hợp lệ");
            return ResponseEntity.badRequest().body(error);
        }

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);

        // 1️⃣ Nếu đã tồn tại → login
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();

            if (customer.getIsActive() != null && !customer.getIsActive()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Tài khoản của bạn đã bị vô hiệu hóa");
                return ResponseEntity.badRequest().body(error);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Đăng nhập Google thành công");
            response.put("customer", customer);
            return ResponseEntity.ok(response);
        }

        // 2️⃣ Nếu chưa tồn tại → tạo mới
        Customer newCustomer = new Customer();
        newCustomer.setEmail(email);
        newCustomer.setNameCustomer(name != null ? name : "Google User");
        newCustomer.setPassword("OAUTH_GOOGLE_USER"); // Set placeholder to avoid NOT NULL constraints
        newCustomer.setRole("CUSTOMER");
        newCustomer.setIsActive(true);
        newCustomer.setProvider("GOOGLE"); // Mark as Google account
        newCustomer.setOrders(null);

        Customer savedCustomer = customerRepository.save(newCustomer);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Tạo tài khoản Google thành công");
        response.put("customer", savedCustomer);

        return ResponseEntity.ok(response);
    }

    // Tạo tài khoản STAFF (chỉ ADMIN mới được gọi - frontend phải kiểm tra)
    @PostMapping("/create-staff")
    public ResponseEntity<?> createStaff(@RequestBody Customer newStaff) {
        // Kiểm tra email đã tồn tại chưa
        List<Customer> existingCustomers = customerRepository.findAll();
        for (Customer c : existingCustomers) {
            if (c.getEmail() != null && c.getEmail().equals(newStaff.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email đã được sử dụng");
                return ResponseEntity.badRequest().body(error);
            }
        }

        newStaff.setOrders(null);
        newStaff.setRole("STAFF"); // Set role là STAFF
        Customer savedStaff = customerRepository.save(newStaff);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Tạo tài khoản staff thành công");
        response.put("staff", savedStaff);
        return ResponseEntity.ok(response);
    }

    // Tạo tài khoản ADMIN mặc định (chỉ chạy 1 lần để khởi tạo)
    @PostMapping("/init-admin")
    public ResponseEntity<?> initAdmin() {
        // Kiểm tra đã có admin chưa
        List<Customer> customers = customerRepository.findAll();
        for (Customer c : customers) {
            if ("ADMIN".equals(c.getRole())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Admin đã tồn tại");
                return ResponseEntity.badRequest().body(error);
            }
        }

        Customer admin = new Customer();
        admin.setNameCustomer("Admin");
        admin.setPhoneCustomer("0000000000");
        admin.setEmail("admin@restaurant.com");
        admin.setPassword("admin123");
        admin.setRole("ADMIN");
        admin.setOrders(null);

        Customer savedAdmin = customerRepository.save(admin);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Tạo tài khoản admin thành công");
        response.put("admin", savedAdmin);
        return ResponseEntity.ok(response);
    }

    // Enable/Disable tài khoản customer (chỉ ADMIN)
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleCustomerActive(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(customer -> {
                    // Không cho phép vô hiệu hóa tài khoản ADMIN
                    if ("ADMIN".equals(customer.getRole())) {
                        Map<String, String> error = new HashMap<>();
                        error.put("message", "Không thể vô hiệu hóa tài khoản ADMIN");
                        return ResponseEntity.badRequest().body((Object) error);
                    }

                    Boolean currentStatus = customer.getIsActive();
                    customer.setIsActive(currentStatus == null || !currentStatus);
                    customerRepository.save(customer);

                    Map<String, Object> response = new HashMap<>();
                    response.put("message",
                            customer.getIsActive() ? "Đã kích hoạt tài khoản" : "Đã vô hiệu hóa tài khoản");
                    response.put("customer", customer);
                    return ResponseEntity.ok((Object) response);
                })
                .orElseGet(() -> {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Không tìm thấy khách hàng");
                    return ResponseEntity.badRequest().body((Object) error);
                });
    }

}
