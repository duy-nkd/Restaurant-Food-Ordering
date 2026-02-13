import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config';

export default function Cart() {
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteTimers, setNoteTimers] = useState({}); // Track timers for debouncing
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [showVoucherDialog, setShowVoucherDialog] = useState(false);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD, VNPAY
  const navigate = useNavigate();

  const customer = JSON.parse(localStorage.getItem("customer") || "null");

  useEffect(() => {
    if (!customer) {
      navigate("/login");
      return;
    }
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-clear message after 3 seconds (same as Wishlist)
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const ordersRes = await axios.get(`${API_URL}/orders`);
      const pendingOrder = ordersRes.data.find(
        (o) => o.customer?.idCustomer === customer.idCustomer && o.status === "pending"
      );

      if (pendingOrder) {
        setOrder(pendingOrder);
        setOrderDetails(pendingOrder.orderDetails || []);
      } else {
        setOrder(null);
        setOrderDetails([]);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setMessage("Lỗi khi tải giỏ hàng!");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const loadVouchers = async () => {
    try {
      const response = await axios.get(`${API_URL}/vouchers/valid`);
      setAvailableVouchers(response.data);
    } catch (error) {
      console.error("Error loading vouchers:", error);
    }
  };

  const updateQuantity = async (orderDetail, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const updatedDetail = {
        quantity: newQuantity,
        note: orderDetail.note,
      };
      await axios.put(
        `${API_URL}/orderDetails/${orderDetail.idOrderDetail}`,
        updatedDetail
      );
      await loadCart();

      // Kiểm tra lại voucher sau khi cập nhật số lượng
      if (appliedVoucher) {
        const ordersRes = await axios.get(`${API_URL}/orders`);
        const updatedOrder = ordersRes.data.find(
          (o) => o.customer?.idCustomer === customer.idCustomer && o.status === "pending"
        );

        if (updatedOrder && updatedOrder.totalPrice < appliedVoucher.minOrderValue) {
          // Đơn hàng không còn đủ điều kiện
          removeVoucher();
        }
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      setMessage("Lỗi khi cập nhật số lượng!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const updateNote = async (orderDetail, newNote) => {
    // Cập nhật note ngay lập tức trong state local để user thấy được gõ
    setOrderDetails(prevDetails =>
      prevDetails.map(detail =>
        detail.idOrderDetail === orderDetail.idOrderDetail
          ? { ...detail, note: newNote }
          : detail
      )
    );

    // Clear timer cũ nếu có
    if (noteTimers[orderDetail.idOrderDetail]) {
      clearTimeout(noteTimers[orderDetail.idOrderDetail]);
    }

    // Tạo timer mới để lưu sau 1 giây (debounce)
    const timer = setTimeout(async () => {
      try {
        const updatedDetail = {
          quantity: orderDetail.quantity,
          note: newNote,
        };
        await axios.put(
          `${API_URL}/orderDetails/${orderDetail.idOrderDetail}`,
          updatedDetail
        );
        // Không cần loadCart() ở đây vì đã update state local rồi
      } catch (error) {
        console.error("Error updating note:", error);
        alert("Lỗi khi lưu ghi chú!");
        // Nếu lỗi, reload lại để đồng bộ
        loadCart();
      }
    }, 1000); // Chờ 1 giây sau khi user ngừng gõ

    // Lưu timer vào state
    setNoteTimers(prev => ({
      ...prev,
      [orderDetail.idOrderDetail]: timer
    }));
  };

  const deleteItem = async (idOrderDetail, itemName) => {
    try {
      await axios.delete(`${API_URL}/orderDetails/${idOrderDetail}`);
      setMessage(`Đã xóa "${itemName}" khỏi giỏ hàng!`);
      setTimeout(() => setMessage(""), 3000);
      await loadCart();

      // Kiểm tra lại voucher sau khi xóa món
      if (appliedVoucher) {
        const ordersRes = await axios.get(`${API_URL}/orders`);
        const updatedOrder = ordersRes.data.find(
          (o) => o.customer?.idCustomer === customer.idCustomer && o.status === "pending"
        );

        if (updatedOrder && updatedOrder.totalPrice < appliedVoucher.minOrderValue) {
          removeVoucher();
        }
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Lỗi khi xóa món!");
    }
  };

  const cancelOrder = async () => {
    if (!order) return;
    setConfirmDialog({
      title: "Hủy đơn hàng?",
      message: "Bạn có chắc muốn hủy đơn hàng này?",
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/orders/${order.idOrder}`);
          setMessage("Đã hủy đơn hàng!");
          loadCart();
        } catch (error) {
          console.error("Error canceling order:", error);
          setMessage("Lỗi khi hủy đơn hàng!");
        }
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const selectVoucher = async (voucher) => {
    try {
      const response = await axios.post(`${API_URL}/vouchers/validate`, {
        code: voucher.code,
        orderValue: order.totalPrice
      });

      if (response.data.valid) {
        setAppliedVoucher(response.data.voucher);
        setVoucherDiscount(response.data.discount);
        setShowVoucherList(false);
        setMessage(response.data.message || "Áp dụng voucher thành công!");
      } else {
        setMessage(response.data.message || "Voucher không hợp lệ!");
      }
    } catch (error) {
      console.error("Error validating voucher:", error);
      setMessage(error.response?.data?.message || "Lỗi khi kiểm tra voucher!");
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    setShowVoucherList(false);
  };

  const confirmOrder = async () => {
    if (!order) return;
    if (orderDetails.length === 0) {
      setMessage("Giỏ hàng trống! Vui lòng thêm món trước khi đặt hàng.");
      return;
    }

    // Hiển thị dialog chọn Voucher trước
    try {
      const response = await axios.get(`${API_URL}/vouchers/valid`);
      setAvailableVouchers(response.data);
      setShowVoucherDialog(true);
    } catch (error) {
      console.error("Error loading vouchers:", error);
      // Nếu lỗi vẫn cho phép tiếp tục tới bước chọn thanh toán
      setShowPaymentDialog(true);
    }
  };

  const proceedToConfirmOrder = () => {
    // Kiểm tra xem đã chọn phương thức thanh toán chưa
    if (!paymentMethod || !["COD", "VNPAY"].includes(paymentMethod)) {
      setMessage("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    const paymentMethodNames = {
      COD: "Thanh toán khi nhận hàng",
      VNPAY: "Thanh toán VNPay"
    };

    setConfirmDialog({
      title: "Xác nhận đặt hàng?",
      message: `Phương thức: ${paymentMethodNames[paymentMethod]}\nTổng cộng: ${((order.totalPrice || 0) - voucherDiscount).toLocaleString("vi-VN")} VNĐ`,
      onConfirm: async () => {
        // Log Debug
        console.log("--- Confirming Order ---");
        console.log("Order ID:", order.idOrder);
        console.log("Payment Method:", paymentMethod);

        try {
          // Apply voucher if exists
          if (appliedVoucher && voucherDiscount > 0) {
            await axios.post(`${API_URL}/orders/${order.idOrder}/apply-voucher`, {
              voucherId: appliedVoucher.idVoucher,
              discountAmount: voucherDiscount
            });
          }

          // Process payment with VNPay
          if (paymentMethod === "VNPAY") {
            try {
              const finalAmount = (order.totalPrice || 0) - voucherDiscount;
              const orderInfo = `Thanh toan don hang #${order.idOrder}`;
              
              console.log("=== VNPay Payment ===");
              console.log("Order ID:", order.idOrder);
              console.log("Amount:", finalAmount);
              console.log("Order Info:", orderInfo);
              
              const paymentResponse = await axios.post(
                `${API_URL}/api/payment/vnpay/create?amount=${finalAmount}&orderInfo=${encodeURIComponent(orderInfo)}&orderId=${order.idOrder}`
              );
              
              console.log("VNPay Response:", paymentResponse.data);
              
              // Redirect to VNPay payment page
              if (paymentResponse.data) {
                window.location.href = paymentResponse.data;
                return;
              } else {
                throw new Error("Không nhận được URL thanh toán từ VNPay");
              }
            } catch (error) {
              console.error("VNPay Error:", error);
              setMessage(error.response?.data?.message || error.message || "Lỗi khi tạo thanh toán VNPay!");
              setConfirmDialog(null);
              return;
            }
          } else {
            // COD payment
            await axios.post(`${API_URL}/orders/${order.idOrder}/payment`, {
              paymentMethod: paymentMethod
            });
          }

          setMessage("Đặt hàng thành công! Bạn có thể theo dõi tình trạng đơn hàng.");
          setTimeout(() => navigate("/my-orders"), 2000);
        } catch (error) {
          console.error("Error confirming order:", error);
          setMessage(error.response?.data?.message || "Lỗi khi xác nhận đơn hàng!");
        }
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  if (!customer) return null;

  if (loading) return <div className="p-5 text-center">Đang tải...</div>;

  if (!order || orderDetails.length === 0) {
    return (
      <div
        className="min-h-screen w-full bg-cover bg-center bg-fixed relative p-5"
        style={{ backgroundImage: `url('/images/menubg.png')` }}
      >
        <div className="relative z-10 p-4 md:p-8 max-w-[1000px] mx-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-xl text-gray-600 mb-4">
                Giỏ hàng của bạn đang trống
              </p>
              <button
                onClick={() => navigate("/menu")}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Khám phá thực đơn
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed relative p-5"
      style={{ backgroundImage: `url('/images/menubg.png')` }}
    >
      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">{confirmDialog.title}</h3>
            <p className="text-gray-600 mb-6 whitespace-pre-line">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={confirmDialog.onCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Nội dung giỏ hàng */}
      <div className="relative z-10 p-4 md:p-8 max-w-[1000px] mx-auto text-white">

        {/* Message */}
        {message && (
          <div className="mb-4">
            <div className={`${message.includes("Lỗi") ? "bg-red-100 border-red-300 text-red-800" : "bg-green-100 border-green-300 text-green-800"} border p-3 rounded`}>
              {message}
            </div>
          </div>
        )}

        <div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="py-4 px-4 space-y-4">
              {orderDetails.map((detail) => (
                <div
                  key={detail.idOrderDetail}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white text-black"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1 w-full">
                      <h4 className="mb-2 text-base sm:text-lg font-medium">{detail.product?.nameProduct}</h4>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        Giá: {detail.product?.priceProduct?.toLocaleString("vi-VN")} VNĐ
                      </p>

                      {/* Quantity */}
                      <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                        <span className="text-sm sm:text-base">Số lượng:</span>
                        <button
                          onClick={() => updateQuantity(detail, detail.quantity - 1)}
                          className="px-2 sm:px-3 py-1.5 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer text-base sm:text-lg"
                        >
                          -
                        </button>
                        <span className="font-semibold min-w-[30px] text-center text-base sm:text-lg">{detail.quantity}</span>
                        <button
                          onClick={() => updateQuantity(detail, detail.quantity + 1)}
                          className="px-2 sm:px-3 py-1.5 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer text-base sm:text-lg"
                        >
                          +
                        </button>
                      </div>

                      {/* Note */}
                      <div className="mt-3.5">
                        <label className="block mb-1 text-sm">Ghi chú:</label>
                        <input
                          type="text"
                          value={detail.note || ""}
                          onChange={(e) => updateNote(detail, e.target.value)}
                          placeholder="Thêm ghi chú..."
                          className="w-full p-2 rounded border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                        />
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-3 sm:gap-5 items-center justify-between sm:justify-start w-full sm:w-auto sm:py-0 sm:ml-5 sm:text-right">
                      <p className="font-semibold text-base sm:text-[1.2rem] text-red-500">
                        {detail.subTotal?.toLocaleString("vi-VN")} VNĐ
                      </p>
                      <button
                        onClick={() => deleteItem(detail.idOrderDetail, detail.product?.nameProduct)}
                        className="px-3 sm:px-5 py-2 sm:py-2.5 bg-red-400 text-white rounded-md hover:bg-rose-500 cursor-pointer text-sm sm:text-base"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="mt-5 p-4 sm:p-5 bg-white/90 rounded-lg text-black">
          <h3 className="text-right mb-4 sm:mb-5 text-xl sm:text-2xl font-semibold">
            Tổng cộng: {(order.totalPrice || 0).toLocaleString("vi-VN")} VNĐ
          </h3>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              onClick={cancelOrder}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 font-semibold bg-gray-400 text-white rounded-md hover:bg-gray-600 cursor-pointer text-base"
            >
              Hủy đơn hàng
            </button>

            <button
              onClick={confirmOrder}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-indigo-500 text-white rounded-md font-semibold hover:bg-indigo-700 cursor-pointer text-base"
            >
              Xác nhận đặt hàng
            </button>
          </div>
        </div>
      </div>

      {/* Payment Method Selection Dialog */}
      {showPaymentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Chọn phương thức thanh toán
                </h3>
                <button
                  onClick={() => setShowPaymentDialog(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body - Payment Methods */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                  style={{
                    borderColor: paymentMethod === "COD" ? "#3b82f6" : "#d1d5db",
                    backgroundColor: paymentMethod === "COD" ? "#eff6ff" : "white"
                  }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 w-5 h-5"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800 text-lg">Thanh toán khi nhận hàng (COD)</span>
                    <p className="text-sm text-gray-600 mt-1">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                  style={{
                    borderColor: paymentMethod === "VNPAY" ? "#3b82f6" : "#d1d5db",
                    backgroundColor: paymentMethod === "VNPAY" ? "#eff6ff" : "white"
                  }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={paymentMethod === "VNPAY"}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      console.log("Selected Method:", e.target.value);
                    }}
                    className="mr-3 w-5 h-5"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800 text-lg">Thanh toán VNPay</span>
                    <p className="text-sm text-gray-600 mt-1">Thanh toán qua cổng VNPay</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-200 bg-gray-50">
              <div className="mb-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Tổng thanh toán:</span>
                  <span className="text-red-600">
                    {((order.totalPrice || 0) - voucherDiscount).toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPaymentDialog(false);
                    setShowVoucherDialog(true);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => {
                    setShowPaymentDialog(false);
                    proceedToConfirmOrder();
                  }}
                  disabled={!paymentMethod || !["COD", "VNPAY"].includes(paymentMethod)}
                  className={`flex-1 px-4 py-3 text-white rounded-lg font-semibold transition-colors ${!paymentMethod || !["COD", "VNPAY"].includes(paymentMethod)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600'
                    }`}
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Selection Dialog */}
      {showVoucherDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Chọn mã giảm giá
                </h3>
                <button
                  onClick={() => {
                    setShowVoucherDialog(false);
                    setShowVoucherList(false);
                    setAppliedVoucher(null);
                    setVoucherDiscount(0);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              {appliedVoucher && (
                <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-indigo-600">{appliedVoucher.code}</span>
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">ĐÃ CHỌN</span>
                      </div>
                      <p className="text-sm text-green-600 font-semibold">
                        Giảm: {voucherDiscount.toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                    <button
                      onClick={removeVoucher}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Body - Voucher List */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Voucher List */}
              {availableVouchers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Hiện không có voucher khả dụng</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableVouchers.map((voucher) => {
                    const canUse = order.totalPrice >= voucher.minOrderValue;
                    const isSelected = appliedVoucher?.idVoucher === voucher.idVoucher;
                    return (
                      <div
                        key={voucher.idVoucher}
                        className={`border rounded-lg p-4 transition-all ${isSelected
                          ? 'border-green-500 bg-green-50'
                          : canUse
                            ? 'border-orange-300 bg-orange-50 hover:bg-orange-100 cursor-pointer'
                            : 'border-gray-300 bg-gray-100 opacity-60'
                          }`}
                        onClick={() => canUse && !isSelected && selectVoucher(voucher)}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-indigo-600 text-lg">{voucher.code}</span>
                              {isSelected && (
                                <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">ĐÃ CHỌN</span>
                              )}
                              {canUse && !isSelected && (
                                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">CÓ THỂ DÙNG</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 font-semibold mb-1">
                              Giảm {voucher.discountType === 'percentage'
                                ? `${voucher.discountValue}%`
                                : `${voucher.discountValue.toLocaleString('vi-VN')} VNĐ`}
                              {voucher.maxDiscount && voucher.discountType === 'percentage' &&
                                ` (tối đa ${voucher.maxDiscount.toLocaleString('vi-VN')} VNĐ)`
                              }
                            </p>
                            <p className="text-xs text-gray-600">
                              Đơn tối thiểu: {voucher.minOrderValue.toLocaleString('vi-VN')} VNĐ
                            </p>
                            {!canUse && (
                              <p className="text-xs text-red-500 mt-1">
                                Cần thêm {(voucher.minOrderValue - order.totalPrice).toLocaleString('vi-VN')} VNĐ để sử dụng
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              HSD: {voucher.startDate} - {voucher.endDate} • Còn lại: {voucher.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-200 bg-gray-50">
              <div className="mb-3">
                <div className="flex justify-between text-gray-700 mb-1">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">{order.totalPrice?.toLocaleString("vi-VN")} VNĐ</span>
                </div>
                {appliedVoucher && voucherDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Giảm giá:</span>
                    <span>- {voucherDiscount.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                )}
                <hr className="my-2 border-gray-300" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Tổng thanh toán:</span>
                  <span className="text-red-600">
                    {((order.totalPrice || 0) - voucherDiscount).toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowVoucherDialog(false);
                    setAppliedVoucher(null);
                    setVoucherDiscount(0);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={() => {
                    setShowVoucherDialog(false);
                    setShowPaymentDialog(true);
                  }}
                  className="flex-1 px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-semibold"
                >
                  Tiếp tục đặt hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}