import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 text-gray-600 dark:text-gray-300">

                {/* Top */}
                <div className="grid gap-8 md:grid-cols-4">

                    {/* Brand */}
                    <div className="md:col-span-2 space-y-2">
                        <div className="text-xl font-semibold text-indigo-500">
                            Restaurant Food Ordering
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                            Đặt món nhanh, giao tận nơi. Trải nghiệm thực đơn đa dạng và ưu đãi hấp dẫn.
                        </p>
                    </div>

                    {/* Quick links */}
                    <div className="space-y-2">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                            Liên kết nhanh
                        </div>
                        <ul className="list-none m-0 p-0 space-y-1 text-sm">
                            {[
                                { to: "/menu", label: "Thực đơn" },
                                { to: "/cart", label: "Giỏ hàng" },
                                { to: "/wishlist", label: "Yêu thích" },
                                { to: "/my-orders", label: "Đơn hàng của tôi" },
                            ].map((item) => (
                                <li key={item.to}>
                                    <Link
                                        to={item.to}
                                        className="no-underline text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-2">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                            Hỗ trợ
                        </div>
                        <ul className="list-none m-0 p-0 space-y-1 text-sm">
                            <li>Email: support@orderfood.local</li>
                            <li>Hotline: 0123 456 789</li>
                            <li>Thời gian: 8:00 - 22:00</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
                    © {new Date().getFullYear()} RestaurantFoodOrdering. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
