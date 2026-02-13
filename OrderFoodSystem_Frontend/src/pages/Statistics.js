import React, { useState, useEffect } from "react";
import { API_URL } from "../config";

/**
 * Statistics Component - Official Version
 * 
 * This component fetches REAL DATA from the backend API
 * Features:
 * - Summary cards (Total Orders, Revenue, Customers, Products)
 * - Time range selector (Today/This Week/This Month/All Time)
 * - Revenue chart for visualization
 * - Recent orders table with status badges
 * - Order status distribution
 */

// ============== HELPER FUNCTIONS ==============
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

const getStatusBadge = (status) => {
    const badges = {
        completed: "bg-green-100 text-green-800",
        confirmed: "bg-blue-100 text-blue-800",
        pending: "bg-yellow-100 text-yellow-800",
        preparing: "bg-indigo-100 text-indigo-800",
        ready: "bg-purple-100 text-purple-800",
        delivered: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
    };
    const labels = {
        completed: "Hoàn thành",
        confirmed: "Đã xác nhận",
        pending: "Chờ xử lý",
        preparing: "Đang chuẩn bị",
        ready: "Sẵn sàng",
        delivered: "Đã giao",
        cancelled: "Đã hủy",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status] || badges.pending}`}>
            {labels[status] || status}
        </span>
    );
};

// Calculate statistics based on time range
const filterOrdersByTimeRange = (orders, timeRange) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return orders.filter(order => {
        // Only count real orders, not carts (pending) or deleted ones (optional)
        if (order.status === "pending" || order.status === "cancelled") return false;

        const orderDate = new Date(order.orderDate);

        switch (timeRange) {
            case "today":
                return orderDate >= today;
            case "thisWeek":
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                return orderDate >= weekAgo;
            case "thisMonth":
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                return orderDate >= monthStart;
            case "all":
            default:
                return true;
        }
    });
};

// Group orders by date for chart
const groupOrdersByDate = (orders, timeRange) => {
    const grouped = {};

    // Initialize time slots for "today" view (6 time blocks)
    if (timeRange === "today") {
        grouped["00:00 - 04:00"] = 0;
        grouped["04:00 - 08:00"] = 0;
        grouped["08:00 - 12:00"] = 0;
        grouped["12:00 - 16:00"] = 0;
        grouped["16:00 - 20:00"] = 0;
        grouped["20:00 - 24:00"] = 0;
    }

    orders.forEach(order => {
        const date = new Date(order.orderDate);
        let key;

        if (timeRange === "today") {
            const hour = date.getHours();
            if (hour >= 0 && hour < 4) key = "00:00 - 04:00";
            else if (hour >= 4 && hour < 8) key = "04:00 - 08:00";
            else if (hour >= 8 && hour < 12) key = "08:00 - 12:00";
            else if (hour >= 12 && hour < 16) key = "12:00 - 16:00";
            else if (hour >= 16 && hour < 20) key = "16:00 - 20:00";
            else key = "20:00 - 24:00";
        } else if (timeRange === "thisWeek") {
            const days = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
            key = days[date.getDay()];
        } else if (timeRange === "thisMonth") {
            const weekNum = Math.ceil(date.getDate() / 7);
            key = `Tuần ${weekNum}`;
        } else {
            key = `${date.getMonth() + 1}/${date.getFullYear()}`;
        }

        if (!grouped[key]) {
            grouped[key] = 0;
        }
        grouped[key] += order.totalPrice || 0;
    });

    // Return as array (already in correct order for "today")
    let result = Object.entries(grouped).map(([day, revenue]) => ({
        day,
        revenue
    }));

    return result;
};

export default function Statistics() {
    const [timeRange, setTimeRange] = useState("today");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for data
    const [allOrders, setAllOrders] = useState([]);
    const [allCustomers, setAllCustomers] = useState([]);
    const [allProducts, setAllProducts] = useState([]);

    // Computed data based on time range
    const [stats, setStats] = useState({
        totalOrders: 0,
        revenue: 0,
        totalCustomers: 0,
        totalProducts: 0
    });
    const [chartData, setChartData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [orderStatusCounts, setOrderStatusCounts] = useState({});

    // Fetch all data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch orders, customers, and products in parallel
                const [ordersRes, customersRes, productsRes] = await Promise.all([
                    fetch(`${API_URL}/orders`),
                    fetch(`${API_URL}/customers`),
                    fetch(`${API_URL}/products`)
                ]);

                if (!ordersRes.ok || !customersRes.ok || !productsRes.ok) {
                    throw new Error("Không thể tải dữ liệu từ server");
                }

                const ordersData = await ordersRes.json();
                const customersData = await customersRes.json();
                const productsData = await productsRes.json();

                setAllOrders(ordersData);
                setAllCustomers(customersData);
                setAllProducts(productsData);

            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Update computed data when time range or data changes
    useEffect(() => {
        if (allOrders.length > 0) {
            const filteredOrders = filterOrdersByTimeRange(allOrders, timeRange);

            // Calculate statistics
            const totalOrders = filteredOrders.length;
            const revenue = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

            setStats({
                totalOrders,
                revenue,
                totalCustomers: allCustomers.length,
                totalProducts: allProducts.filter(p => p.isActive).length
            });

            // Generate chart data
            const chart = groupOrdersByDate(filteredOrders, timeRange);
            setChartData(chart);

            // Get recent orders (last 10)
            const sorted = [...filteredOrders].sort((a, b) =>
                new Date(b.orderDate) - new Date(a.orderDate)
            );
            setRecentOrders(sorted.slice(0, 10));

            // Count orders by status
            const statusCounts = {};
            filteredOrders.forEach(order => {
                const status = order.status || "pending";
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            setOrderStatusCounts(statusCounts);
        }
    }, [allOrders, allCustomers, allProducts, timeRange]);

    // Calculate max revenue for chart scaling
    const maxRevenue = Math.max(...chartData.map((item) => item.revenue), 1);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải dữ liệu thống kê...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                    <div className="text-center">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Thống Kê Hệ Thống</h1>
                    <p className="text-gray-600 mt-2">
                        Tổng quan về đơn hàng, doanh thu và hoạt động khách hàng
                    </p>
                </div>

                {/* Time Range Selector */}
                <div className="mb-6 flex gap-2 flex-wrap">
                    <button
                        onClick={() => setTimeRange("today")}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${timeRange === "today"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Hôm nay
                    </button>
                    <button
                        onClick={() => setTimeRange("thisWeek")}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${timeRange === "thisWeek"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Tuần này
                    </button>
                    <button
                        onClick={() => setTimeRange("thisMonth")}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${timeRange === "thisMonth"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Tháng này
                    </button>
                    <button
                        onClick={() => setTimeRange("all")}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${timeRange === "all"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Tất cả
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Orders Card */}
                    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Tổng đơn hàng</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats.totalOrders}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <svg
                                    className="w-8 h-8 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Card */}
                    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Doanh thu</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {formatCurrency(stats.revenue)}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Customers Card */}
                    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Tổng khách hàng</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats.totalCustomers}
                                </p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <svg
                                    className="w-8 h-8 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Products Card */}
                    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Tổng sản phẩm</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats.totalProducts}
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <svg
                                    className="w-8 h-8 text-orange-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Status Distribution */}
                {Object.keys(orderStatusCounts).length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Phân Bố Trạng Thái Đơn Hàng</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(orderStatusCounts).map(([status, count]) => (
                                <div key={status} className="bg-gray-50 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                                    <div className="mt-2">{getStatusBadge(status)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Revenue Chart */}
                {chartData.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Biểu Đồ Doanh Thu</h2>
                        <div className="space-y-4">
                            {chartData.map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-24 text-sm font-medium text-gray-700 text-right">
                                        {item.day}
                                    </div>
                                    <div className="flex-1 bg-gray-100 rounded-full h-10 relative overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                                            style={{
                                                width: `${(item.revenue / maxRevenue) * 100}%`,
                                                minWidth: item.revenue > 0 ? "100px" : "0",
                                            }}
                                        >
                                            {item.revenue > 0 && (
                                                <span className="text-white text-xs font-semibold">
                                                    {formatCurrency(item.revenue)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Orders Table */}
                {recentOrders.length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Đơn Hàng Gần Đây</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Mã đơn hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                            Khách hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                            Tổng tiền
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                            Ngày đặt
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentOrders.map((order) => (
                                        <tr key={order.idOrder} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{order.idOrder}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {order.customer?.nameCustomer || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                {formatCurrency(order.totalPrice || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {getStatusBadge(order.status || "pending")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.orderDate).toLocaleString("vi-VN")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* No Data Message */}
                {recentOrders.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đơn hàng</h3>
                        <p className="text-gray-600">Không có dữ liệu đơn hàng trong khoảng thời gian đã chọn</p>
                    </div>
                )}
            </div>
        </div>
    );
}
