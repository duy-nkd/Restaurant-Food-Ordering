# Trang Thống Kê (Statistics Page)

## Tổng quan
Trang thống kê mới đã được tạo tại `/statistics` với dữ liệu thực từ backend API.

## Tính năng chính

### 1. Thẻ Tóm tắt (Summary Cards)
- **Tổng đơn hàng**: Số lượng đơn hàng theo khoảng thời gian
- **Doanh thu**: Tổng doanh thu từ các đơn hàng
- **Tổng khách hàng**: Số lượng khách hàng đã đăng ký
- **Tổng sản phẩm**: Số lượng sản phẩm đang hoạt động

### 2. Bộ lọc Thời gian
- **Hôm nay**: Chỉ hiển thị dữ liệu của ngày hiện tại
- **Tuần này**: Dữ liệu trong 7 ngày gần đây
- **Tháng này**: Dữ liệu từ đầu tháng đến hiện tại
- **Tất cả**: Toàn bộ dữ liệu lịch sử

### 3. Phân bổ Trạng thái Đơn hàng
Hiển thị số lượng đơn hàng theo từng trạng thái:
- `pending`: Chờ xử lý
- `confirmed`: Đã xác nhận
- `preparing`: Đang chuẩn bị
- `ready`: Sẵn sàng
- `delivered`: Đã giao
- `cancelled`: Đã hủy

### 4. Biểu đồ Doanh thu
Biểu đồ thanh ngang hiển thị doanh thu theo:
- **Hôm nay**: Theo giờ (0:00, 4:00, 8:00, ...)
- **Tuần này**: Theo ngày trong tuần (Thứ 2 - Chủ Nhật)
- **Tháng này**: Theo tuần (Tuần 1 - Tuần 5)
- **Tất cả**: Theo tháng/năm

### 5. Bảng Đơn hàng Gần đây
Hiển thị 10 đơn hàng mới nhất với:
- Mã đơn hàng
- Tên khách hàng
- Tổng tiền
- Trạng thái
- Ngày đặt

## API Endpoints được sử dụng

```javascript
GET /orders       // Lấy tất cả đơn hàng
GET /customers    // Lấy tất cả khách hàng
GET /products     // Lấy tất cả sản phẩm
```

## Cách truy cập

### Cho Admin:
1. Đăng nhập với tài khoản Admin
2. Trên thanh điều hướng, chọn "Thống kê"
3. Hoặc truy cập trực tiếp: `http://localhost:3000/statistics`

### Routes đã cấu hình:
- `/statistics` - Trang thống kê chính thức (dữ liệu thực)
- `/admin/statistics` - Trang demo cũ (dữ liệu mẫu)

## Xử lý Lỗi

### Loading State
Hiển thị spinner khi đang tải dữ liệu:
```
Đang tải dữ liệu thống kê...
```

### Error State
Nếu không thể kết nối backend:
```
Lỗi tải dữ liệu
[Thông báo lỗi chi tiết]
[Nút Thử lại]
```

### No Data State
Khi không có dữ liệu trong khoảng thời gian đã chọn:
```
Chưa có đơn hàng
Không có dữ liệu đơn hàng trong khoảng thời gian đã chọn
```

## Responsive Design
- **Desktop**: Hiển thị đầy đủ tất cả tính năng
- **Tablet**: Grid layout điều chỉnh (2 cột thay vì 4)
- **Mobile**: Hiển thị dạng stack (1 cột)

## Hiệu ứng và Animation
- Hover effect trên các thẻ thống kê
- Smooth transition khi chuyển đổi khoảng thời gian
- Animated bar chart với gradient màu
- Loading spinner khi fetch dữ liệu

## So sánh với AdminStatistics (trang cũ)

| Tính năng | AdminStatistics (cũ) | Statistics (mới) |
|-----------|---------------------|------------------|
| Nguồn dữ liệu | Mock data (giả lập) | Real API data |
| Cập nhật real-time | ❌ | ✅ |
| Bộ lọc thời gian | 3 options | 4 options |
| Trạng thái đơn hàng | Cố định | Dynamic từ DB |
| Error handling | ❌ | ✅ |
| Loading state | ❌ | ✅ |
| No data handling | ❌ | ✅ |

## Lưu ý kỹ thuật

### Performance
- Fetch data một lần khi component mount
- Tính toán thống kê ở client-side
- Không cần re-fetch khi thay đổi time range

### Data Processing
- Filter orders by date range
- Group data for chart visualization
- Sort orders by date (descending)
- Calculate aggregated statistics

### Future Improvements
Có thể mở rộng thêm:
- Export dữ liệu ra Excel/PDF
- Real-time updates với WebSocket
- Biểu đồ phức tạp hơn (line chart, pie chart)
- So sánh giữa các khoảng thời gian
- Dashboard tùy chỉnh
- API endpoint `/statistics` tối ưu hơn ở backend

## Backend Requirements

Backend cần có các endpoint sau:
```java
@GetMapping("/orders")
List<Order> getAllOrders()

@GetMapping("/customers")  
List<Customer> getAllCustomers()

@GetMapping("/products")
List<Product> getAllProducts()
```

Và các entity cần có:
- Order: idOrder, orderDate, totalPrice, status, customer
- Customer: idCustomer, nameCustomer, email, role
- Product: idProduct, nameProduct, priceProduct, isActive

## Hướng dẫn Test

1. **Test với dữ liệu có sẵn**:
   - Truy cập `/statistics`
   - Kiểm tra các số liệu có hiển thị đúng
   - Thử đổi các khoảng thời gian

2. **Test khi chưa có dữ liệu**:
   - Nếu DB trống, should show "Chưa có đơn hàng"

3. **Test error handling**:
   - Tắt backend
   - Reload trang
   - Should show error message với nút "Thử lại"

4. **Test responsive**:
   - Resize browser window
   - Check mobile view
   - Hamburger menu should work

## Code Structure

```
Statistics.js
├── Imports & Configuration
├── Helper Functions
│   ├── formatCurrency()
│   ├── getStatusBadge()
│   ├── filterOrdersByTimeRange()
│   └── groupOrdersByDate()
├── Component State
│   ├── timeRange
│   ├── loading/error
│   └── data states
├── Data Fetching (useEffect)
├── Data Processing (useEffect)
└── Render
    ├── Loading State
    ├── Error State
    ├── Time Range Selector
    ├── Summary Cards
    ├── Status Distribution
    ├── Revenue Chart
    ├── Recent Orders Table
    └── No Data State
```

## Màu sắc & Styling

- Primary: Indigo/Blue (#4F46E5)
- Success: Green (#10B981)
- Warning: Yellow/Orange (#F59E0B)
- Danger: Red (#EF4444)
- Gray scale: Tailwind gray palette
- Gradient effects: from-blue-500 to-blue-600

## License
Part of OrderFoodSystem project
