import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from '../config';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const result = await axios.get(`${API_URL}/orders`);
      setOrders(result.data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy chi tiết order; ưu tiên gọi GET /orders/:id nếu backend hỗ trợ
  const loadOrderDetails = async (orderId) => {
    try {
      setMessage("");
      setSelectedOrder(null);
      setOrderDetails([]);

      try {
        const res = await axios.get(`${API_URL}/orders/${orderId}`);
        const order = res.data;
        setSelectedOrder(order);
        setOrderDetails(order.orderDetails || []);
        return;
      } catch (err) {
        // fallback tiếp xuống
      }

      const ordersResult = await axios.get(`${API_URL}/orders`);
      setOrders(ordersResult.data || []);
      const order = (ordersResult.data || []).find((o) => o.idOrder === orderId);
      if (order) {
        setSelectedOrder(order);
        setOrderDetails(order.orderDetails || []);
      } else {
        setSelectedOrder(null);
        setOrderDetails([]);
        setMessage("Không tìm thấy đơn hàng.");
      }
    } catch (error) {
      console.error("Error loading order details:", error);
      setMessage("Lỗi khi tải chi tiết đơn.");
    }
  };

  // Xóa toàn bộ đơn hàng
  const deleteOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ đơn hàng này? Hành động không thể hoàn tác.")) return;
    try {
      setDeleting(true);
      try {
        await axios.delete(`${API_URL}/orders/${orderId}`);
      } catch (err) {
        // fallback: xóa từng orderDetail rồi xóa order
        console.warn("DELETE /orders/:id failed, attempting fallback deletion of orderDetails then order:", err);
        try {
          const res = await axios.get(`${API_URL}/orders/${orderId}`);
          const details = res.data?.orderDetails || [];
          for (const d of details) {
            await axios.delete(`${API_URL}/orderDetails/${d.idOrderDetail}`);
          }
          await axios.delete(`${API_URL}/orders/${orderId}`);
        } catch (err2) {
          console.error("Fallback deletion failed:", err2);
          alert("Xóa đơn hàng thất bại. Kiểm tra backend.");
          return;
        }
      }

      setSelectedOrder(null);
      setOrderDetails([]);
      await loadOrders();
      setMessage("Xóa đơn hàng thành công.");
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Có lỗi khi xóa đơn hàng.");
    } finally {
      setDeleting(false);
    }
  };

  // NEW: Xóa tất cả đơn hàng
  const deleteAllOrders = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa TẤT CẢ đơn hàng? Hành động này không thể hoàn tác.")) return;
    try {
      setDeletingAll(true);
      setMessage("");

      // Thử endpoint DELETE /orders (nếu backend hỗ trợ xóa toàn bộ)
      try {
        await axios.delete(`${API_URL}/orders`);
      } catch (err) {
        // Fallback: lấy danh sách orders rồi xóa từng order (và fallback xóa từng orderDetail nếu cần)
        console.warn("DELETE /orders failed, using per-order fallback:", err);
        const res = await axios.get(`${API_URL}/orders`);
        const allOrders = res.data || [];

        for (const o of allOrders) {
          try {
            // thử xóa order trực tiếp
            await axios.delete(`${API_URL}/orders/${o.idOrder}`);
          } catch (errOrder) {
            // fallback: xóa từng orderDetail rồi xóa order
            try {
              const resDetails = await axios.get(`${API_URL}/orders/${o.idOrder}`);
              const details = resDetails.data?.orderDetails || [];
              for (const d of details) {
                await axios.delete(`${API_URL}/orderDetails/${d.idOrderDetail}`);
              }
              await axios.delete(`${API_URL}/orders/${o.idOrder}`);
            } catch (err2) {
              console.error(`Không thể xóa đơn #${o.idOrder}:`, err2);
              // tiếp tục xóa các đơn khác, nhưng ghi log
            }
          }
        }
      }

      // Reload
      setSelectedOrder(null);
      setOrderDetails([]);
      await loadOrders();
      setMessage("Đã xóa tất cả đơn hàng.");
    } catch (error) {
      console.error("Error deleting all orders:", error);
      alert("Có lỗi khi xóa tất cả đơn hàng.");
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý đơn hàng</h2>

      {message && (
        <p style={{ background: "#f5f5f5", padding: 10, borderRadius: 4 }}>{message}</p>
      )}

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div style={{ flex: 1, borderRight: "1px solid #ccc", paddingRight: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Danh sách đơn hàng</h3>
            <button
              onClick={deleteAllOrders}
              disabled={deletingAll || orders.length === 0}
              style={{
                background: "#c9302c",
                color: "white",
                padding: "6px 10px",
                border: "none",
                borderRadius: 4,
                cursor: deletingAll ? "not-allowed" : "pointer",
              }}
              title="Xóa tất cả đơn hàng"
            >
              {deletingAll ? "Đang xóa..." : "Xóa tất cả"}
            </button>
          </div>

          {loading ? (
            <p>Đang tải...</p>
          ) : orders.length === 0 ? (
            <p>Chưa có đơn hàng nào</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.idOrder}
                onClick={() => loadOrderDetails(order.idOrder)}
                style={{
                  padding: 10,
                  cursor: "pointer",
                  backgroundColor:
                    selectedOrder?.idOrder === order.idOrder ? "#e0e0e0" : "transparent",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <div>Đơn hàng #{order.idOrder}</div>
                <div style={{ fontSize: 13, color: "#555" }}>
                  Khách: {order.customer?.nameCustomer || "N/A"}
                </div>
                <div style={{ fontSize: 13, color: "#555" }}>
                  Tổng: {order.totalPrice?.toLocaleString("vi-VN")} VNĐ
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chi tiết đơn hàng - chỉ đọc */}
        <div style={{ flex: 2, paddingLeft: 10 }}>
          {!selectedOrder ? (
            <p>Chọn một đơn hàng để xem chi tiết</p>
          ) : (
            <div>
              <h3>Chi tiết đơn hàng #{selectedOrder.idOrder}</h3>
              <div style={{ marginBottom: 15, padding: 10, backgroundColor: "#f8f9fa", borderRadius: 4 }}>
                <p style={{ margin: "5px 0" }}>
                  <strong>Khách hàng:</strong> {selectedOrder.customer?.nameCustomer || "-"}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Số điện thoại:</strong> {selectedOrder.customer?.phoneCustomer || "-"}
                </p>
                {selectedOrder.customer?.addressCustomer && (
                  <p style={{ margin: "5px 0" }}>
                    <strong>Địa chỉ giao hàng:</strong> {selectedOrder.customer.addressCustomer}
                  </p>
                )}
              </div>

              {orderDetails.length === 0 ? (
                <p>Đơn hàng này chưa có món nào</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Món</th>
                      <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Giá</th>
                      <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Số lượng</th>
                      <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Ghi chú</th>
                      <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Thành tiền</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orderDetails.map((detail) => (
                      <tr key={detail.idOrderDetail}>
                        <td style={{ padding: "8px 4px" }}>{detail.product?.nameProduct || detail.productName || "-"}</td>
                        <td style={{ padding: "8px 4px" }}>
                          {detail.product?.priceProduct?.toLocaleString("vi-VN") ?? detail.subUnitPrice?.toLocaleString?.("vi-VN") ?? 0} VNĐ
                        </td>
                        <td style={{ padding: "8px 4px" }}>{detail.quantity}</td>
                        <td style={{ padding: "8px 4px", color: "#555", fontStyle: "italic" }}>{detail.note || "—"}</td>
                        <td style={{ padding: "8px 4px" }}>{detail.subTotal?.toLocaleString("vi-VN") ?? 0} VNĐ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                <h4>Tổng cộng: {selectedOrder.totalPrice?.toLocaleString("vi-VN")} VNĐ</h4>

                <div>
                  <button
                    onClick={() => deleteOrder(selectedOrder.idOrder)}
                    disabled={deleting}
                    style={{ background: "#d9534f", color: "white", padding: "6px 12px", border: "none", borderRadius: 4 }}
                  >
                    {deleting ? "Đang xóa..." : "Xóa đơn hàng"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}