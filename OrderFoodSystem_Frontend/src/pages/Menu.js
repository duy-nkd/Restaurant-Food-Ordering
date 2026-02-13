import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config';
import ReviewList from "../components/ReviewList";

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [categories, setCategories] = useState([]);
  const [noteModalProduct, setNoteModalProduct] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const navigate = useNavigate();
  const customer = JSON.parse(localStorage.getItem("customer") || "null");

  useEffect(() => {
    loadProducts();
    if (customer) {
      loadWishlist();
    }
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      const categoriesRes = await axios.get(`${API_URL}/categories`);

      setProducts(res.data);
      setFilteredProducts(res.data);

      // Tạo danh sách category từ API với tên đầy đủ
      const cats = ["ALL", ...categoriesRes.data.map(cat => cat.nameCategory)];
      setCategories(cats);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const loadWishlist = async () => {
    try {
      const res = await axios.get(`${API_URL}/wishlist/customer/${customer.idCustomer}`);
      setWishlistItems(res.data.map(item => item.product.idProduct));
    } catch (err) {
      console.error("Error loading wishlist:", err);
    }
  };

  const filterByCategory = (categoryName) => {
    setSelectedCategory(categoryName);
    filterProducts(categoryName, searchTerm);
  };

  const handleSearchChange = (searchValue) => {
    setSearchTerm(searchValue);
    filterProducts(selectedCategory, searchValue);
  };

  const filterProducts = (categoryName, search) => {
    let filtered = products;

    // Lọc theo danh mục
    if (categoryName !== 'ALL') {
      filtered = filtered.filter(p => p.category?.nameCategory === categoryName);
    }

    // Lọc theo từ khóa tìm kiếm (tên bắt đầu bằng từ khóa, không phân biệt hoa/thường)
    if (search.trim() !== '') {
      filtered = filtered.filter(p =>
        p.nameProduct.toLowerCase().startsWith(search.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    if (!customer) {
      alert("Vui lòng đăng nhập để đặt món!");
      navigate("/login");
      return;
    }
    setNoteModalProduct(product);
    setNoteText("");
  };

  const confirmAddToCart = async () => {
    if (!noteModalProduct) return;

    try {
      const ordersRes = await axios.get(`${API_URL}/orders`);
      let currentOrder = ordersRes.data.find(
        (order) =>
          order.customer?.idCustomer === customer.idCustomer &&
          order.status === "pending"
      );

      if (!currentOrder) {
        const orderData = {
          totalPrice: 0,
          status: "pending",
          customer: { idCustomer: customer.idCustomer },
        };
        const orderRes = await axios.post(`${API_URL}/orders`, orderData);
        currentOrder = orderRes.data;
      }

      const data = {
        quantity: 1,
        subTotal: noteModalProduct.priceProduct,
        note: noteText,
        order: { idOrder: currentOrder.idOrder },
        product: { idProduct: noteModalProduct.idProduct },
      };

      await axios.post(`${API_URL}/orderDetails`, data);
      setMessage(`Đã thêm "${noteModalProduct.nameProduct}" vào giỏ hàng!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Lỗi khi thêm vào giỏ hàng!");
    }
    setNoteModalProduct(null);
  };

  const handleToggleWishlist = async (product) => {
    if (!customer) {
      alert('Vui lòng đăng nhập để thêm vào wishlist!');
      navigate('/login');
      return;
    }

    try {
      const isInWishlist = wishlistItems.includes(product.idProduct);

      if (isInWishlist) {
        // Remove from wishlist
        await axios.delete(`${API_URL}/wishlist`, {
          data: {
            customerId: customer.idCustomer,
            productId: product.idProduct
          }
        });
        setWishlistItems(wishlistItems.filter(id => id !== product.idProduct));
        setMessage(`Đã xóa "${product.nameProduct}" khỏi wishlist!`);
      } else {
        // Add to wishlist
        await axios.post(`${API_URL}/wishlist`, {
          customerId: customer.idCustomer,
          productId: product.idProduct
        });
        setWishlistItems([...wishlistItems, product.idProduct]);
        setMessage(`Đã thêm "${product.nameProduct}" vào wishlist!`);
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      alert("Lỗi khi cập nhật wishlist!");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-5"
      style={{ backgroundImage: "url('images/menubg.png')" }}
    >
      <h2 className="text-3xl text-center mb-10 font-semibold text-indigo-900 drop-shadow-md">Thực Đơn</h2>

      <div className="max-w-7xl mx-auto">

        {message && (
          <div className="bg-green-100 text-green-800 p-3 rounded mb-4 border border-green-200">
            {message}
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-5">
          <h4 className="mb-2 font-medium text-indigo-900 text-base sm:text-lg">Danh mục:</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => filterByCategory(cat)}
                className={`px-3 sm:px-4 py-2 rounded-full font-medium text-sm sm:text-base ${selectedCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-800"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Tìm món ăn..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <p className="text-indigo-900 text-center py-8 text-base sm:text-lg">Không tìm thấy món phù hợp.</p>
        ) : (
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {filteredProducts.map((p) => (
              <div
                key={p.idProduct}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white bg-opacity-90 shadow-sm flex flex-col
                   transform transition-transform duration-200 hover:-translate-y-2 hover:shadow-lg"
              >
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.nameProduct}
                    className="w-full h-40 sm:h-48 object-cover rounded-lg mb-3"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
                  />
                )}
                <h4 className="mb-2 font-semibold text-base sm:text-lg text-indigo-900">{p.nameProduct}</h4>
                <p className="text-gray-600 text-xs sm:text-sm mb-2 flex-1">{p.descriptionProduct}</p>
                <div className="flex gap-2 items-center mb-2">
                  {p.category && (
                    <span className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs whitespace-nowrap">
                      {p.category.nameCategory}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-red-500 text-base sm:text-lg mb-2">
                  {p.priceProduct?.toLocaleString("vi-VN")} VNĐ
                </p>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleAddToCart(p)}
                    className="flex-1 bg-indigo-400 text-white py-2 sm:py-2.5 rounded hover:bg-indigo-700 transition text-sm sm:text-base font-medium"
                  >
                    Thêm vào giỏ
                  </button>
                  <button
                    onClick={() => handleToggleWishlist(p)}
                    className={`w-12 h-10 flex items-center justify-center rounded transition ${wishlistItems.includes(p.idProduct)
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    title={wishlistItems.includes(p.idProduct) ? "Xóa khỏi wishlist" : "Thêm vào wishlist"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={wishlistItems.includes(p.idProduct) ? "white" : "none"}
                      stroke={wishlistItems.includes(p.idProduct) ? "white" : "currentColor"}
                      strokeWidth="2"
                      className="w-5 h-5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                </div>

                {/* View Reviews Button */}
                <button
                  onClick={() => {
                    setSelectedProductForReview(p);
                    setShowReviewModal(true);
                  }}
                  className="mt-2 w-full border border-indigo-300 text-indigo-600 py-1.5 rounded hover:bg-indigo-50 transition text-sm font-medium"
                >
                  Xem đánh giá
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Note Modal */}
        {noteModalProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 max-w-full">
              <h3 className="text-lg font-semibold mb-3">
                Thêm ghi chú cho: {noteModalProduct.nameProduct}
              </h3>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Ví dụ: Ít cay, không hành, thêm rau..."
                className="w-full h-24 p-3 border border-gray-300 rounded mb-4 resize-none"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setNoteModalProduct(null)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmAddToCart}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Modal */}
        {showReviewModal && selectedProductForReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Đánh giá: {selectedProductForReview.nameProduct}</h3>
                <ReviewList productId={selectedProductForReview.idProduct} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
