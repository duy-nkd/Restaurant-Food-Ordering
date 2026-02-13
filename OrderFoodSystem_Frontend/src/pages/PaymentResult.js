import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, failure
    const [paymentData, setPaymentData] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                console.log("=== Payment Result ===");
                console.log("All params:", Object.fromEntries(searchParams));
                
                // Gọi backend để verify payment với tất cả params từ VNPay
                const queryString = searchParams.toString();
                console.log("Query string:", queryString);
                
                const response = await axios.get(`${API_URL}/api/payment/vnpay/return?${queryString}`);
                console.log("Backend response:", response.data);
                
                if (response.data.status === 'success') {
                    setPaymentData(response.data);
                    setStatus('success');
                } else {
                    setPaymentData(response.data);
                    setStatus('failure');
                }
            } catch (error) {
                console.error("Error verifying payment:", error);
                setStatus('failure');
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {status === 'loading' && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <h2 className="text-2xl font-bold text-gray-800">Đang xác thực thanh toán...</h2>
                        <p className="text-gray-600">Vui lòng không đóng trình duyệt.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Thanh toán thành công!</h2>
                        <p className="text-gray-600 text-lg">Cảm ơn bạn đã đặt hàng tại HKD Food.</p>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-left space-y-2">
                            <p className="text-sm text-gray-500">Mã đơn hàng: <span className="font-bold text-gray-900">#{paymentData?.orderId}</span></p>
                            <p className="text-sm text-gray-500">Mã giao dịch: <span className="font-bold text-gray-900">{paymentData?.transactionNo}</span></p>
                            <p className="text-sm text-gray-500">Số tiền: <span className="font-bold text-gray-900">{paymentData?.amount?.toLocaleString()} VNĐ</span></p>
                            <p className="text-sm text-gray-500">Trạng thái: <span className="font-bold text-green-600 uppercase">Đã thanh toán</span></p>
                        </div>
                        <button
                            onClick={() => navigate('/my-orders')}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                        >
                            Xem đơn hàng của tôi
                        </button>
                    </div>
                )}

                {status === 'failure' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Thanh toán thất bại!</h2>
                        <p className="text-gray-600 text-lg">{paymentData?.message || 'Vui lòng thử lại sau.'}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/cart')}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                            >
                                Quay lại giỏ hàng
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                            >
                                Trang chủ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentResult;
