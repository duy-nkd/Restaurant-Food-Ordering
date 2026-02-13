import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config';
import ReviewForm from "../components/ReviewForm";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const customer = JSON.parse(localStorage.getItem('customer') || 'null');

  const [reviewsMap, setReviewsMap] = useState({}); // orderId -> Set of reviewed orderDetailIds
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState(null);

  useEffect(() => {
    if (!customer) {
      navigate('/login');
      return;
    }
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-clear message after 3 seconds (same as Wishlist)
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders`);
      const myOrders = res.data.filter(
        o => o.customer?.idCustomer === customer.idCustomer && o.status !== "pending"
      );
      myOrders.sort((a, b) => b.idOrder - a.idOrder);
      setOrders(myOrders);

      // Fetch reviews for delivered orders
      const deliveredOrders = myOrders.filter(o => o.status === 'delivered');
      fetchReviewsForOrders(deliveredOrders);

    } catch (error) {
      console.error("Error loading orders:", error);
      setMessage("Lỗi khi tải đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsForOrders = async (deliveredOrders) => {
    const map = {};
    for (const order of deliveredOrders) {
      try {
        const res = await axios.get(`${API_URL}/reviews/order/${order.idOrder}`);
        // Store reviewed orderDetailIds
        const reviewedIds = new Set(res.data.map(r => r.orderDetail?.idOrderDetail));
        map[order.idOrder] = reviewedIds;
      } catch (err) {
        console.error(`Error fetching reviews for order ${order.idOrder}`, err);
      }
    }
    setReviewsMap(map);
  };

  const handleOpenReview = (order, detail) => {
    setSelectedItemForReview({
      productId: detail.product.idProduct,
      orderId: order.idOrder,
      orderDetailId: detail.idOrderDetail
    });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = (newReview) => {
    setShowReviewModal(false);
    setMessage("Đánh giá thành công! Đang chờ duyệt.");
    // Update local state to hide button
    setReviewsMap(prev => {
      const newMap = { ...prev };
      const currentSet = newMap[newReview.order.idOrder] || new Set();
      currentSet.add(newReview.orderDetail.idOrderDetail);
      newMap[newReview.order.idOrder] = currentSet;
      return newMap;
    });
  };

  if (!customer) return null;
  if (loading) return <div className="p-4">Đang tải...</div>;

  const getStatusInfo = (status) => {
    switch (status) {
      case 'confirmed': return { label: 'Đã nhận đơn', color: 'bg-blue-300', raw: '#4dabf7', icon: '📋', step: 1 };
      case 'preparing': return { label: 'Đang chuẩn bị', color: 'bg-purple-300', raw: '#a78bfa', icon: '🍳', step: 2 };
      case 'ready': return { label: 'Sẵn sàng giao', color: 'bg-green-400', raw: '#51cf66', icon: '🥡', step: 3 };
      case 'delivered': return { label: 'Đã giao thành công', color: 'bg-emerald-500', raw: '#12b886', icon: '🏠', step: 4 };
      case 'cancelled': return { label: 'Đã hủy', color: 'bg-red-400', raw: '#ff6b6b', icon: '❌', step: 0 };
      default: return { label: 'Chờ xác nhận', color: 'bg-gray-400', raw: '#868e96', icon: '⏳', step: 0 };
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-5"
      style={{ backgroundImage: "url('images/menubg.png')" }}
    >
      <div className="p-4 md:p-8 max-w-[1200px] mx-auto">

        {/* Message */}
        {message && (
          <div className="mb-4">
            <div className="bg-green-100 border border-green-300 text-green-800 p-3 rounded">
              {message}
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-xl text-gray-600 mb-4">Đơn hàng của bạn đang trống</p>
              <button
                onClick={() => navigate('/menu')}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Khám phá thực đơn
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="py-4 px-4 space-y-4">
              {orders.map(order => {
                const statusInfo = getStatusInfo(order.status);
                const isCancelled = order.status === 'cancelled';

                return (
                  <div
                    key={order.idOrder}
                    className="border-2 border-gray-300 rounded-lg p-3 sm:p-4 bg-white shadow-md"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-gray-300 gap-3">
                      <div className="w-full sm:w-auto">
                        <h3 className="m-0 text-base sm:text-lg font-semibold">Đơn hàng #{order.idOrder}</h3>
                        <p className="text-gray-600 mt-1 text-xs sm:text-sm">Ngày đặt: {new Date(order.orderDate).toLocaleString("vi-VN")}</p>
                      </div>

                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="text-red-400 text-base sm:text-lg font-semibold">
                          {order.totalPrice?.toLocaleString("vi-VN")} VNĐ
                        </p>
                        <div
                          className={`mt-2 px-3 py-1 text-white rounded-full text-xs font-semibold`}
                          style={{ backgroundColor: statusInfo.raw }}
                        >
                          {statusInfo.icon} {statusInfo.label}
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    {!isCancelled && (
                      <div className="mb-4 relative px-2 sm:px-0">
                        <div className="absolute top-4 left-[10%] right-[10%] h-1 bg-gray-300">
                          <div
                            className="h-full bg-green-400 transition-all duration-500"
                            style={{ width: `${(statusInfo.step - 1) * 33.33}%` }}
                          />
                        </div>

                        <div className="flex justify-between relative">
                          {['confirmed', 'preparing', 'ready', 'delivered'].map((step, index) => {
                            const stepInfo = getStatusInfo(step);
                            const isCompleted = statusInfo.step > index + 1;
                            const isCurrent = statusInfo.step === index + 1;

                            return (
                              <div key={step} className="flex-1 text-center z-10">
                                <div
                                  className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto flex items-center justify-center rounded-full text-white text-xs sm:text-base font-semibold border-2 ${isCompleted || isCurrent ? '' : 'bg-gray-300 border-gray-300'}`}
                                  style={{
                                    backgroundColor: isCompleted || isCurrent ? stepInfo.raw : '#e0e0e0',
                                    boxShadow: isCurrent ? `0 0 0 3px ${stepInfo.raw}` : 'none'
                                  }}
                                >
                                  {isCompleted ? '✓' : stepInfo.icon}
                                </div>
                                <p className={`mt-1 text-xs ${isCompleted || isCurrent ? 'text-black font-semibold' : 'text-gray-400'}`}>{stepInfo.label}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Customer Info */}
                    {order.customer && (
                      <div className="mb-3 pb-2 border-b border-gray-200">
                        <p className="text-sm mb-1"><strong>Khách hàng:</strong> {order.customer.nameCustomer}</p>
                        <p className="text-sm mb-1"><strong>Số điện thoại:</strong> {order.customer.phoneCustomer}</p>
                        {order.customer.addressCustomer && (
                          <p className="text-sm mb-1"><strong>Địa chỉ giao hàng:</strong> {order.customer.addressCustomer}</p>
                        )}
                        
                        {/* Payment Method */}
                        {order.paymentMethod && (
                          <div className="mt-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-sm mb-0">
                              <strong>Phương thức thanh toán:</strong>{' '}
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                {order.paymentMethod === 'COD' && '💵 Thanh toán khi nhận hàng (COD)'}
                                {order.paymentMethod === 'BANK_TRANSFER' && '🏦 Chuyển khoản ngân hàng'}
                                {order.paymentMethod === 'CREDIT_CARD' && '💳 Thẻ tín dụng/Ghi nợ'}
                                {order.paymentMethod === 'E_WALLET' && '📱 Ví điện tử'}
                                {!['COD', 'BANK_TRANSFER', 'CREDIT_CARD', 'E_WALLET'].includes(order.paymentMethod) && order.paymentMethod}
                              </span>
                            </p>
                          </div>
                        )}
                        
                        {/* Payment Status */}
                        {order.paymentStatus && (
                          <div className="mt-1 flex items-center gap-2">
                            <p className="text-sm mb-0">
                              <strong>Trạng thái thanh toán:</strong>{' '}
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                                order.paymentStatus === 'UNPAID' ? 'bg-yellow-100 text-yellow-800' :
                                order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.paymentStatus === 'PAID' && '✅ Đã thanh toán'}
                                {order.paymentStatus === 'UNPAID' && '⏳ Chưa thanh toán'}
                                {order.paymentStatus === 'FAILED' && '❌ Thanh toán thất bại'}
                                {!['PAID', 'UNPAID', 'FAILED'].includes(order.paymentStatus) && order.paymentStatus}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Order Details */}
                    <div>
                      <h4 className="mb-1 font-semibold text-sm">Chi tiết đơn hàng:</h4>
                      {order.orderDetails?.length > 0 ? (
                        <div className="bg-gray-100 p-3 rounded-lg">
                          {order.orderDetails.map(detail => (
                            <div
                              key={detail.idOrderDetail}
                              className="flex justify-between py-1 border-b border-gray-300 text-sm"
                            >
                              <div>
                                <strong>{detail.product?.nameProduct}</strong> x{detail.quantity}
                                {detail.note && (
                                  <span className="ml-1 text-gray-600 italic text-xs">({detail.note})</span>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="font-semibold text-sm">
                                  {detail.subTotal?.toLocaleString("vi-VN")} VNĐ
                                </div>
                                {order.status === 'delivered' && (
                                  !reviewsMap[order.idOrder]?.has(detail.idOrderDetail) ? (
                                    <button
                                      onClick={() => handleOpenReview(order, detail)}
                                      className="bg-yellow-500 text-white text-xs px-2 py-1 rounded hover:bg-yellow-600 transition-colors"
                                    >
                                      Đánh giá
                                    </button>
                                  ) : (
                                    order.status === 'delivered' && (
                                      <span className="text-xs text-green-600 font-semibold border border-green-600 px-2 py-1 rounded">
                                        Đã đánh giá
                                      </span>
                                    )
                                  )
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Voucher Info */}
                          {order.orderVoucher && (
                            <div className="mt-3 pt-2 border-t border-gray-300">
                              <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <span className="font-semibold text-indigo-600 text-sm">
                                  Đã áp dụng voucher: {order.orderVoucher.voucher?.code}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-green-600 font-semibold">
                                <span>Giảm giá:</span>
                                <span>- {order.orderVoucher.discountAmount?.toLocaleString("vi-VN")} VNĐ</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">Không có thông tin chi tiết</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Review Modal */}
      {showReviewModal && selectedItemForReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <ReviewForm
              productId={selectedItemForReview.productId}
              orderId={selectedItemForReview.orderId}
              orderDetailId={selectedItemForReview.orderDetailId}
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
