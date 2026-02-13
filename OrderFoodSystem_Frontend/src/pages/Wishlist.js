import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const customer = JSON.parse(localStorage.getItem("customer") || "null");

  useEffect(() => {
    if (!customer) {
      alert("Vui lòng đăng nhập để xem wishlist!");
      navigate("/login");
      return;
    }
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/wishlist/customer/${customer.idCustomer}`
      );
      setWishlistItems(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading wishlist:", err);
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (wishlistId, productName) => {
    try {
      await axios.delete(`${API_URL}/wishlist/${wishlistId}`);
      setMessage(`Đã xóa "${productName}" khỏi wishlist!`);
      setTimeout(() => setMessage(""), 3000);
      loadWishlist();
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      alert("Lỗi khi xóa khỏi wishlist!");
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const ordersRes = await axios.get(`${API_URL}/orders`);
      let currentOrder = ordersRes.data.find(
        (order) =>
          order.customer?.idCustomer === customer.idCustomer &&
          order.status === "pending"
      );

      if (!currentOrder) {
        const orderData = {
          orderDate: new Date().toISOString().split("T")[0],
          totalPrice: 0,
          status: "pending",
          customer: { idCustomer: customer.idCustomer },
        };
        const orderRes = await axios.post(`${API_URL}/orders`, orderData);
        currentOrder = orderRes.data;
      }

      const data = {
        quantity: 1,
        subTotal: product.priceProduct,
        note: "",
        order: { idOrder: currentOrder.idOrder },
        product: { idProduct: product.idProduct },
      };

      await axios.post(`${API_URL}/orderDetails`, data);
      setMessage(`Đã thêm "${product.nameProduct}" vào giỏ hàng!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Lỗi khi thêm vào giỏ hàng!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed relative p-5"
      style={{ backgroundImage: "url('images/menubg.png')" }}
    >
      <div className="relative z-10 p-4 md:p-8 max-w-[1000px] mx-auto">

        {/* Message */}
        {message && (
          <div className="mb-4">
            <div className="bg-green-100 border border-green-300 text-green-800 p-3 rounded">
              {message}
            </div>
          </div>
        )}

        {/* Wishlist Table */}
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {wishlistItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-xl text-gray-600 mb-4">
                Wishlist của bạn đang trống
              </p>
              <button
                onClick={() => navigate("/menu")}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Khám phá thực đơn
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="py-4 px-4 text-left">Tên món ăn</th>
                    <th className="py-4 px-4 text-left">Đơn giá</th>
                    <th className="py-4 px-4 text-left">Thêm vào giỏ</th>
                    <th className="py-4 px-4 text-left">Đóng</th>
                  </tr>
                </thead>
                <tbody>
                  {wishlistItems.map((item, index) => (
                    <tr
                      key={item.idWishlist}
                      className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100`}
                    >

                      {/* Product Name */}
                      <td className="py-4 px-4 font-medium flex items-center gap-3">
                        {item.product?.imageUrl && (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.nameProduct}
                            className="w-16 h-16 object-cover rounded shadow-sm"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }}
                          />
                        )}
                        <span>{item.product?.nameProduct}</span>
                      </td>

                      {/* Unit Price */}
                      <td className="py-4 px-4 font-semibold">
                        {item.product?.priceProduct?.toFixed(0)} VNĐ
                      </td>

                      {/* Add to Cart Button */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleAddToCart(item.product)}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        >
                          Thêm
                        </button>
                      </td>

                      {/* Remove Button */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() =>
                            handleRemoveFromWishlist(
                              item.idWishlist,
                              item.product?.nameProduct
                            )
                          }
                          className="bg-gray-200 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
