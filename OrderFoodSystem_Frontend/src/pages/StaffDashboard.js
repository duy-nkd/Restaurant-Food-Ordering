import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config';

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const customer = JSON.parse(localStorage.getItem('customer') || 'null');

  useEffect(() => {
    if (!customer || customer.role !== 'STAFF') {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
      return;
    }
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders`);

      const filteredOrders = res.data.filter(o => o.status !== 'pending');
      filteredOrders.sort((a, b) => b.idOrder - a.idOrder);

      setOrders(filteredOrders);
    } catch (err) {
      console.error("Error loading orders:", err);
      alert("Lỗi khi tải đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}/status`, { status: newStatus });
      alert("Cập nhật trạng thái thành công!");
      loadOrders();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Lỗi khi cập nhật trạng thái!");
    }
  };

  if (!customer || customer.role !== 'STAFF') {
    return null;
  }

  if (loading) {
    return <div className="p-5">Đang tải...</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-400';
      case 'preparing': return 'bg-blue-400';
      case 'ready': return 'bg-blue-400';
      case 'delivered': return 'bg-emerald-500';
      case 'cancelled': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Đã nhận đơn';
      case 'preparing': return 'Đang chuẩn bị';
      case 'ready': return 'Sẵn sàng giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <div className="p-5 max-w-[1200px] mx-auto">
      <h2 className="text-2xl font-bold mb-5">Quản lý đơn hàng (Staff)</h2>

      {/* FILTER */}
      <div className="mb-5 flex gap-3 flex-wrap">

        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md font-medium 
            ${filter === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-black'}`}
        >
          Tất cả ({orders.length})
        </button>

        <button
          onClick={() => setFilter('confirmed')}
          className={`px-4 py-2 rounded-md font-medium 
            ${filter === 'confirmed' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-black'}`}
        >
          Mới nhận ({orders.filter(o => o.status === 'confirmed').length})
        </button>

        <button
          onClick={() => setFilter('preparing')}
          className={`px-4 py-2 rounded-md font-medium 
            ${filter === 'preparing' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-black'}`}
        >
          Đang làm ({orders.filter(o => o.status === 'preparing').length})
        </button>

        <button
          onClick={() => setFilter('ready')}
          className={`px-4 py-2 rounded-md font-medium 
            ${filter === 'ready' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-black'}`}
        >
          Sẵn sàng ({orders.filter(o => o.status === 'ready').length})
        </button>

      </div>

      {/* LIST OF ORDERS */}
      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-600 mt-10">Không có đơn hàng nào</p>
      ) : (
        <div className="grid gap-5">
          {filteredOrders.map((order) => (
            <div
              key={order.idOrder}
              className="border-2 border-gray-300 rounded-xl p-5 bg-white shadow-md"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-300">
                <div>
                  <h3 className="text-xl font-semibold">Đơn #{order.idOrder}</h3>
                  <p className="text-gray-600 mt-1">
                    Khách: {order.customer?.nameCustomer} - SĐT:{order.customer?.phoneCustomer}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Ngày đặt: {order.orderDate}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Địa chỉ: {order.customer?.addressCustomer || "Chưa có địa chỉ"}
                  </p>
                  
                  {/* Payment Info */}
                  {order.paymentMethod && (
                    <div className="mt-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm">
                        <strong>PT thanh toán:</strong>{' '}
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {order.paymentMethod === 'COD' && '💵 COD'}
                          {order.paymentMethod === 'BANK_TRANSFER' && '🏦 Chuyển khoản'}
                          {order.paymentMethod === 'CREDIT_CARD' && '💳 Thẻ'}
                          {order.paymentMethod === 'E_WALLET' && '📱 Ví điện tử'}
                          {!['COD', 'BANK_TRANSFER', 'CREDIT_CARD', 'E_WALLET'].includes(order.paymentMethod) && order.paymentMethod}
                        </span>
                      </span>
                    </div>
                  )}
                  {order.paymentStatus && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm">
                        <strong>TT thanh toán:</strong>{' '}
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                          order.paymentStatus === 'UNPAID' ? 'bg-yellow-100 text-yellow-800' :
                          order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.paymentStatus === 'PAID' && '✅ Đã thanh toán'}
                          {order.paymentStatus === 'UNPAID' && '⏳ Chưa thanh toán'}
                          {order.paymentStatus === 'FAILED' && '❌ Thất bại'}
                          {!['PAID', 'UNPAID', 'FAILED'].includes(order.paymentStatus) && order.paymentStatus}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-red-400">
                    {order.totalPrice?.toLocaleString("vi-VN")} VNĐ
                  </p>
                  <div
                    className={`mt-2 px-4 py-2 rounded-full text-white font-bold inline-block ${getStatusColor(order.status)}`}
                  >
                    {getStatusLabel(order.status)}
                  </div>
                </div>
              </div>

              {/* ORDER DETAILS */}
              <div className="mb-4">
                <h4 className="font-semibold text-lg mb-2">Chi tiết đơn hàng:</h4>

                {order.orderDetails && order.orderDetails.length > 0 ? (
                  <div className="bg-gray-100 p-4 rounded-lg">

                    {order.orderDetails.map((detail) => (
                      <div key={detail.idOrderDetail} className="py-2 border-b border-gray-300">
                        <div className="flex justify-between">
                          <strong>
                            {detail.product?.nameProduct} x{detail.quantity}
                          </strong>
                          <div>{detail.subTotal?.toLocaleString("vi-VN")} VNĐ</div>
                        </div>

                        {detail.note && (
                          <div className="mt-1 text-amber-600 italic font-semibold text-sm">
                            Ghi chú: {detail.note}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Voucher Info */}
                    {order.orderVoucher && (
                      <div className="mt-3 pt-3 border-t-2 border-gray-300 bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="font-bold text-indigo-600">
                            Đã áp dụng voucher: {order.orderVoucher.voucher?.code}
                          </span>
                        </div>
                        <div className="text-base text-green-600 font-bold ml-7">
                          Giảm giá: - {order.orderVoucher.discountAmount?.toLocaleString("vi-VN")} VNĐ
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <p>Không có thông tin chi tiết</p>
                )}
              </div>

              {/* STATUS UPDATE BUTTONS */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-300">

                <label className="mr-2 font-bold self-center">Cập nhật trạng thái:</label>

                {order.status === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(order.idOrder, 'preparing')}
                    className="px-5 py-2 bg-indigo-500 text-white font-bold rounded-md"
                  >
                    Bắt đầu chuẩn bị
                  </button>
                )}

                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.idOrder, 'ready')}
                    className="px-5 py-2 bg-indigo-500 text-white font-bold rounded-md"
                  >
                    Sẵn sàng giao
                  </button>
                )}

                {order.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(order.idOrder, 'delivered')}
                    className="px-5 py-2 bg-green-500 text-white font-bold rounded-md"
                  >
                    Đã giao
                  </button>
                )}

                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn hủy đơn này?')) {
                        updateOrderStatus(order.idOrder, 'cancelled');
                      }
                    }}
                    className="px-5 py-2 bg-red-400 text-white font-bold rounded-md"
                  >
                    Hủy đơn
                  </button>
                )}

                {(order.status === 'delivered' || order.status === 'cancelled') && (
                  <span className="px-5 py-2 text-gray-600 italic">
                    Đơn hàng đã hoàn tất
                  </span>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
