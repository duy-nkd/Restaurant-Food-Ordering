package com.example.OrderFoodSystem.service;

import com.example.OrderFoodSystem.dto.ChatbotDTO;
import com.example.OrderFoodSystem.entity.*;
import com.example.OrderFoodSystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private OrderService orderService;

    private final Map<String, ChatSession> sessions = new ConcurrentHashMap<>();

    public ChatbotDTO.Response processQuery(ChatbotDTO.Request request) {
        String message = request.getMessage().toLowerCase().trim();
        String sessionId = request.getSessionId();
        Long customerId = request.getCustomerId();

        ChatSession session = sessions.computeIfAbsent(sessionId, id -> new ChatSession(id));
        if (customerId != null) {
            session.setCustomerId(customerId);
        }
        session.updateLastSeen();

        ChatbotDTO.Response response = new ChatbotDTO.Response();

        // Phase 1: Intent Detection (Rule-based)
        if (isMatch(message, "menu", "món gì", "danh sách", "thực đơn")) {
            return handleFindProducts(session, response);
        } else if (isMatch(message, "dưới", "rẻ", "k", "giá")) {
            return handlePriceFilter(session, response, message);
        } else if (isMatch(message, "bán chạy", "phổ biến", "ngon nhất")) {
            return handleBestSellers(session, response);
        } else if (isMatch(message, "giỏ hàng", "đã đặt", "mua gì")) {
            return handleCartView(session, response);
        } else if (isMatch(message, "trạng thái", "đơn hàng", "đâu rồi")) {
            return handleOrderStatus(session, response);
        } else if (isMatch(message, "thêm", "đặt", "lấy")
                && (message.contains("vào giỏ") || session.getLastProductList() != null)) {
            return handleAddToCart(session, response, message);
        } else if (isMatch(message, "tìm", "có", "không")) {
            return handleSearchProduct(session, response, message);
        }

        // Fallback
        return handleFallback(response);
    }

    private boolean isMatch(String message, String... keywords) {
        return Arrays.stream(keywords).anyMatch(message::contains);
    }

    private ChatbotDTO.Response handleFindProducts(ChatSession session, ChatbotDTO.Response response) {
        List<Product> products = productRepository.findAll().stream()
                .filter(p -> p.getIsActive() != null && p.getIsActive())
                .limit(5)
                .collect(Collectors.toList());

        session.setLastProductList(products);
        session.setLastIntent("FIND_PRODUCTS");

        response.setReply("Đây là một số món ngon tại nhà hàng chúng mình:");
        response.setProducts(products);
        response.setSuggestions(Arrays.asList("Món bán chạy", "Giá dưới 50k", "Xem giỏ hàng"));
        response.setIntent("FIND_PRODUCTS");
        return response;
    }

    private ChatbotDTO.Response handlePriceFilter(ChatSession session, ChatbotDTO.Response response, String message) {
        Pattern pattern = Pattern.compile("(\\d+)\\s*(k|nghìn|vnđ)?");
        Matcher matcher = pattern.matcher(message);
        double maxPrice = 1000000; // default large

        if (matcher.find()) {
            maxPrice = Double.parseDouble(matcher.group(1));
            if (maxPrice < 1000)
                maxPrice *= 1000; // handle "50k" -> 50000
        } else if (message.contains("rẻ")) {
            maxPrice = 50000;
        }

        List<Product> products = productRepository.findByPriceProductLessThanEqualAndIsActiveTrue(maxPrice);
        session.setLastProductList(products);
        session.setLastIntent("PRICE_FILTER");

        if (products.isEmpty()) {
            response.setReply("Rất tiếc, mình không tìm thấy món nào có giá dưới " + (int) maxPrice + " VNĐ.");
        } else {
            response.setReply("Đây là các món có giá dưới " + (int) maxPrice + " VNĐ:");
            response.setProducts(products);
        }
        response.setSuggestions(Arrays.asList("Món bán chạy", "Xem menu", "Giỏ hàng"));
        response.setIntent("PRICE_FILTER");
        return response;
    }

    private ChatbotDTO.Response handleSearchProduct(ChatSession session, ChatbotDTO.Response response, String message) {
        String query = message.replace("tìm", "").replace("có", "").replace("không", "").replace("món", "").trim();
        List<Product> products = productRepository.findByNameProductContainingIgnoreCaseAndIsActiveTrue(query);

        session.setLastProductList(products);
        session.setLastIntent("SEARCH_PRODUCT");

        if (products.isEmpty()) {
            response.setReply("Mình không tìm thấy món nào tên là '" + query + "'. Bạn thử xem menu nhé!");
        } else {
            response.setReply("Mình tìm thấy các món này:");
            response.setProducts(products);
        }
        response.setIntent("SEARCH_PRODUCT");
        return response;
    }

    private ChatbotDTO.Response handleBestSellers(ChatSession session, ChatbotDTO.Response response) {
        // Simple mock: just return 3 random active products since we don't have
        // soldCount yet
        List<Product> products = productRepository.findAll().stream()
                .filter(p -> p.getIsActive() != null && p.getIsActive())
                .limit(3)
                .collect(Collectors.toList());

        session.setLastProductList(products);
        session.setLastIntent("GET_BEST_SELLERS");

        response.setReply("Đây là những món được yêu thích nhất:");
        response.setProducts(products);
        response.setIntent("GET_BEST_SELLERS");
        return response;
    }

    private ChatbotDTO.Response handleCartView(ChatSession session, ChatbotDTO.Response response) {
        if (session.getCustomerId() == null) {
            response.setReply("Bạn vui lòng đăng nhập để xem giỏ hàng nhé!");
            return response;
        }

        Optional<Order> pendingOrder = orderRepository.findAll().stream()
                .filter(o -> o.getCustomer() != null && o.getCustomer().getIdCustomer().equals(session.getCustomerId())
                        && "pending".equals(o.getStatus()))
                .findFirst();

        if (pendingOrder.isEmpty() || pendingOrder.get().getOrderDetails().isEmpty()) {
            response.setReply("Giỏ hàng của bạn đang trống.");
        } else {
            Order order = pendingOrder.get();
            String items = order.getOrderDetails().stream()
                    .map(d -> d.getProduct().getNameProduct() + " (x" + d.getQuantity() + ")")
                    .collect(Collectors.joining(", "));
            response.setReply("Giỏ hàng của bạn đang có: " + items + ". Tổng cộng: " + order.getTotalPrice() + " VNĐ.");
        }
        response.setIntent("CART_VIEW");
        return response;
    }

    private ChatbotDTO.Response handleAddToCart(ChatSession session, ChatbotDTO.Response response, String message) {
        if (session.getCustomerId() == null) {
            response.setReply("Bạn phải đăng nhập để thêm món vào giỏ hàng.");
            return response;
        }

        List<Product> lastProducts = session.getLastProductList();
        Product productToAdd = null;

        // Try to resolve ordinal (món đầu tiên, món số 1)
        if (lastProducts != null && !lastProducts.isEmpty()) {
            if (message.contains("đầu") || message.contains("số 1") || message.contains("1")) {
                productToAdd = lastProducts.get(0);
            } else if (message.contains("thứ 2") || message.contains("số 2") || message.contains("2")) {
                productToAdd = lastProducts.size() > 1 ? lastProducts.get(1) : null;
            }
        }

        if (productToAdd == null) {
            response.setReply("Bạn muốn thêm món nào? Hãy nói tên món hoặc số thứ tự từ danh sách mình vừa gửi nhé.");
            return response;
        }

        // Logic to add to cart (using existing "pending" order logic)
        try {
            Order cart = getOrCreateCart(session.getCustomerId());
            addToOrder(cart, productToAdd);
            response.setReply("Đã thêm '" + productToAdd.getNameProduct() + "' vào giỏ hàng cho bạn rồi nhé!");
        } catch (Exception e) {
            response.setReply("Hệ thống gặp lỗi khi thêm món. Bạn vui lòng thử lại sau.");
        }

        response.setIntent("ADD_TO_CART");
        return response;
    }

    private ChatbotDTO.Response handleOrderStatus(ChatSession session, ChatbotDTO.Response response) {
        if (session.getCustomerId() == null) {
            response.setReply("Bạn vui lòng đăng nhập để kiểm tra đơn hàng.");
            return response;
        }

        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getCustomer() != null && o.getCustomer().getIdCustomer().equals(session.getCustomerId())
                        && !"pending".equals(o.getStatus()))
                .sorted((a, b) -> b.getIdOrder().compareTo(a.getIdOrder()))
                .collect(Collectors.toList());

        if (orders.isEmpty()) {
            response.setReply("Bạn chưa có đơn hàng nào được đặt.");
        } else {
            Order lastOrder = orders.get(0);
            response.setReply("Đơn hàng #" + lastOrder.getIdOrder() + " của bạn đang có trạng thái: "
                    + translateStatus(lastOrder.getStatus()));
        }
        response.setIntent("ORDER_STATUS");
        return response;
    }

    private ChatbotDTO.Response handleFallback(ChatbotDTO.Response response) {
        response.setReply("Mình chưa hiểu ý bạn lắm. Bạn có thể chọn một trong các yêu cầu dưới đây:");
        response.setSuggestions(Arrays.asList("Xem menu", "Món bán chạy", "Giỏ hàng của tôi"));
        response.setIntent("FALLBACK");
        return response;
    }

    private Order getOrCreateCart(Long customerId) {
        Optional<Order> pendingOrder = orderRepository.findAll().stream()
                .filter(o -> o.getCustomer() != null && o.getCustomer().getIdCustomer().equals(customerId)
                        && "pending".equals(o.getStatus()))
                .findFirst();

        if (pendingOrder.isPresent())
            return pendingOrder.get();

        Order newOrder = new Order();
        Customer customer = customerRepository.findById(customerId).orElseThrow();
        newOrder.setCustomer(customer);
        newOrder.setStatus("pending");
        newOrder.setOrderDate(LocalDateTime.now());
        newOrder.setTotalPrice(0.0);
        return orderRepository.save(newOrder);
    }

    private void addToOrder(Order order, Product product) {
        Optional<OrderDetail> existingDetail = orderDetailRepository.findByOrderIdAndProductId(order.getIdOrder(),
                product.getIdProduct());

        if (existingDetail.isPresent()) {
            OrderDetail detail = existingDetail.get();
            detail.setQuantity(detail.getQuantity() + 1);
            detail.setSubTotal(detail.getQuantity() * product.getPriceProduct());
            orderDetailRepository.save(detail);
        } else {
            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(1);
            detail.setSubTotal(product.getPriceProduct());
            orderDetailRepository.save(detail);
        }
        orderService.updateTotalPrice(order.getIdOrder());
    }

    private String translateStatus(String status) {
        switch (status) {
            case "confirmed":
                return "Đã xác nhận";
            case "preparing":
                return "Đang chuẩn bị";
            case "ready":
                return "Sẵn sàng giao";
            case "delivered":
                return "Đã giao hàng";
            case "cancelled":
                return "Đã hủy";
            default:
                return "Chờ xác nhận";
        }
    }
}
