import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config';

export default function AdminDashboard() {
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [customerList, setCustomerList] = useState([]);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [form, setForm] = useState({
    nameProduct: "",
    descriptionProduct: "",
    priceProduct: 0,
    imageUrl: "",
    category: null,
  });
  const [categoryForm, setCategoryForm] = useState({
    nameCategory: "",
  });
  const [staffForm, setStaffForm] = useState({
    nameCustomer: "",
    phoneCustomer: "",
    email: "",
    password: "",
  });
  const [voucherForm, setVoucherForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: null,
    quantity: 0,
    startDate: "",
    endDate: "",
    status: true,
  });

  const navigate = useNavigate();
  const customer = JSON.parse(localStorage.getItem("customer") || "null");

  useEffect(() => {
    if (!customer || customer.role !== "ADMIN") {
      alert("Bạn không có quyền truy cập trang này!");
      navigate("/");
      return;
    }
    loadProducts();
    loadDeletedProducts();
    loadCustomers();
    loadOrders();
    loadCategories();
    loadStaff();
    loadVouchers();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const loadDeletedProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products/all-including-deleted`);
      const deleted = res.data.filter(p => p.isActive === false);
      setDeletedProducts(deleted);
    } catch (err) {
      console.error("Error loading deleted products:", err);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/customers`);
      // Lọc chỉ lấy những user có role là CUSTOMER
      const customersOnly = res.data.filter(user => user.role === "CUSTOMER");
      setCustomerList(customersOnly);
    } catch (err) {
      console.error("Error loading customers:", err);
    }
  };


  const loadOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`);
      // Sort orders by idOrder descending (newest first)
      const sortedOrders = res.data.sort((a, b) => b.idOrder - a.idOrder);
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadStaff = async () => {
    try {
      const res = await axios.get(`${API_URL}/customers`);
      // Lọc chỉ lấy những user có role là STAFF
      const staffOnly = res.data.filter(user => user.role === "STAFF");
      setStaffList(staffOnly);
    } catch (err) {
      console.error("Error loading staff:", err);
    }
  };

  const loadVouchers = async () => {
    try {
      const res = await axios.get(`${API_URL}/vouchers`);
      setVouchers(res.data);
    } catch (err) {
      console.error("Error loading vouchers:", err);
    }
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ nameProduct: "", descriptionProduct: "", priceProduct: 0, imageUrl: "", category: null });
    setImageFile(null);
    setImagePreview("");
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      nameProduct: p.nameProduct ?? "",
      descriptionProduct: p.descriptionProduct ?? "",
      priceProduct: p.priceProduct ?? 0,
      imageUrl: p.imageUrl ?? "",
      category: p.category?.idCategory ?? null,
    });
    setImageFile(null);
    setImagePreview(p.imageUrl ?? "");
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ nameCategory: "" });
    setCategoryModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      nameCategory: cat.nameCategory ?? "",
    });
    setCategoryModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa món này?\n\nLưu ý: Món sẽ bị ẩn khỏi menu nhưng lịch sử đơn hàng vẫn được giữ nguyên.")) return;
    try {
      const response = await axios.delete(`${API_URL}/products/${id}`);
      loadProducts();
      loadDeletedProducts();
      alert(response.data || "Xóa món thành công!");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(err.response?.data || "Lỗi khi xóa món ăn!");
    }
  };


  const handleRestoreProduct = async (id) => {
    if (!window.confirm("Bạn có chắc muốn khôi phục món ăn này?")) return;
    try {
      const response = await axios.patch(`${API_URL}/products/${id}/restore`);
      loadProducts();
      loadDeletedProducts();
      alert(typeof response.data === 'string' ? response.data : "Khôi phục món ăn thành công!");
    } catch (err) {
      console.error("Error restoring product:", err);
      const errorMsg = err.response?.data || err.message || "Lỗi khi khôi phục món ăn!";
      alert(typeof errorMsg === 'string' ? errorMsg : "Lỗi khi khôi phục món ăn! Vui lòng kiểm tra console.");
      console.error("Chi tiết lỗi:", err.response || err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa loại thức ăn này?")) return;
    try {
      await axios.delete(`${API_URL}/categories/${id}`);
      loadCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Lỗi khi xóa loại thức ăn!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("nameProduct", form.nameProduct);
      formData.append("descriptionProduct", form.descriptionProduct);
      formData.append("priceProduct", Number(form.priceProduct));
      if (form.category) {
        formData.append("idCategory", form.category);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (!editingProduct) {
        alert("Vui lòng chọn ảnh cho món ăn!");
        return;
      }

      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.idProduct}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${API_URL}/products`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setModalOpen(false);
      loadProducts();
      alert(editingProduct ? "Cập nhật món thành công!" : "Thêm món mới thành công!");
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Lỗi khi lưu món ăn!");
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nameCategory: categoryForm.nameCategory,
      };

      if (editingCategory) {
        await axios.put(`${API_URL}/categories/${editingCategory.idCategory}`, payload);
      } else {
        await axios.post(`${API_URL}/categories`, payload);
      }

      setCategoryModalOpen(false);
      loadCategories();
      alert(editingCategory ? "Cập nhật loại thức ăn thành công!" : "Thêm loại thức ăn mới thành công!");
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Lỗi khi lưu loại thức ăn!");
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await axios.put(`${API_URL}/customers/${editingStaff.idCustomer}`, staffForm);
        alert("Cập nhật tài khoản staff thành công!");
      } else {
        await axios.post(`${API_URL}/customers/create-staff`, staffForm);
        alert("Tạo tài khoản staff thành công!");
      }
      setStaffModalOpen(false);
      setStaffForm({ nameCustomer: "", phoneCustomer: "", email: "", password: "" });
      setEditingStaff(null);
      loadStaff(); // Reload danh sách staff
    } catch (err) {
      console.error("Error creating staff:", err);
      alert(err.response?.data?.message || "Lỗi khi tạo tài khoản staff!");
    }
  };

  const openEditStaff = (s) => {
    setEditingStaff(s);
    setStaffForm({
      nameCustomer: s.nameCustomer ?? "",
      phoneCustomer: s.phoneCustomer ?? "",
      email: s.email ?? "",
      password: "",
    });
    setStaffModalOpen(true);
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản staff "${name}"?`)) return;
    try {
      await axios.delete(`${API_URL}/customers/${id}`);
      alert("Xóa tài khoản staff thành công!");
      loadStaff(); // Reload danh sách staff
    } catch (err) {
      console.error("Error deleting staff:", err);
      alert("Lỗi khi xóa tài khoản staff!");
    }
  };

  const openAddVoucher = () => {
    setEditingVoucher(null);
    setVoucherForm({
      code: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderValue: 0,
      maxDiscount: null,
      quantity: 0,
      startDate: "",
      endDate: "",
      status: true,
    });
    setVoucherModalOpen(true);
  };

  const openEditVoucher = (voucher) => {
    setEditingVoucher(voucher);
    setVoucherForm({
      code: voucher.code ?? "",
      discountType: voucher.discountType ?? "percentage",
      discountValue: voucher.discountValue ?? 0,
      minOrderValue: voucher.minOrderValue ?? 0,
      maxDiscount: voucher.maxDiscount ?? null,
      quantity: voucher.quantity ?? 0,
      startDate: voucher.startDate ?? "",
      endDate: voucher.endDate ?? "",
      status: voucher.status ?? true,
    });
    setVoucherModalOpen(true);
  };

  const handleVoucherSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate dates
      if (new Date(voucherForm.endDate) < new Date(voucherForm.startDate)) {
        alert("Ngày kết thúc phải sau ngày bắt đầu!");
        return;
      }

      const payload = {
        code: voucherForm.code.trim(),
        discountType: voucherForm.discountType,
        discountValue: Number(voucherForm.discountValue),
        minOrderValue: Number(voucherForm.minOrderValue),
        maxDiscount: voucherForm.maxDiscount ? Number(voucherForm.maxDiscount) : null,
        quantity: parseInt(voucherForm.quantity),
        startDate: voucherForm.startDate,
        endDate: voucherForm.endDate,
        status: voucherForm.status,
      };

      console.log("Sending voucher payload:", payload);

      if (editingVoucher) {
        const response = await axios.put(`${API_URL}/vouchers/${editingVoucher.idVoucher}`, payload);
        console.log("Update response:", response.data);
        alert("Cập nhật voucher thành công!");
      } else {
        const response = await axios.post(`${API_URL}/vouchers`, payload);
        console.log("Create response:", response.data);
        alert("Thêm voucher mới thành công!");
      }

      setVoucherModalOpen(false);
      setEditingVoucher(null);
      loadVouchers();
    } catch (err) {
      console.error("Error saving voucher:", err);
      console.error("Error response:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data || "Lỗi khi lưu voucher!";
      alert(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
    }
  };

  const handleDeleteVoucher = async (id, code) => {
    if (!window.confirm(`Bạn có chắc muốn xóa voucher "${code}"?`)) return;
    try {
      await axios.delete(`${API_URL}/vouchers/${id}`);
      alert("Xóa voucher thành công!");
      loadVouchers();
    } catch (err) {
      console.error("Error deleting voucher:", err);
      alert("Lỗi khi xóa voucher!");
    }
  };

  const handleToggleVoucherStatus = async (id, currentStatus, code) => {
    const action = currentStatus ? "vô hiệu hóa" : "kích hoạt";
    if (!window.confirm(`Bạn có chắc muốn ${action} voucher "${code}"?`)) return;
    try {
      const response = await axios.patch(`${API_URL}/vouchers/${id}/toggle-status`);
      alert(response.data.message || `${action} voucher thành công!`);
      loadVouchers();
    } catch (err) {
      console.error("Error toggling voucher status:", err);
      alert(err.response?.data?.message || `Lỗi khi ${action} voucher!`);
    }
  };


  const handleToggleCustomerActive = async (id, currentStatus, name) => {
    const action = currentStatus ? "vô hiệu hóa" : "kích hoạt";
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản "${name}"?`)) return;
    try {
      const response = await axios.patch(`${API_URL}/customers/${id}/toggle-active`);
      alert(response.data.message || `${action} tài khoản thành công!`);
      loadCustomers();
    } catch (err) {
      console.error("Error toggling customer active:", err);
      alert(err.response?.data?.message || `Lỗi khi ${action} tài khoản!`);
    }
  };


  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}/status`, { status: newStatus });
      loadOrders();
      alert("Cập nhật trạng thái thành công!");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Lỗi khi cập nhật trạng thái!");
    }
  };

  if (!customer || customer.role !== "ADMIN") return null;

  return (
    <div
      className="min-h-screen bg-cover bg-center p-5"
      style={{ backgroundImage: "url('/images/menubg.png')" }}
    >
      <h2 className="text-3xl text-center mb-10 font-semibold text-indigo-900 drop-shadow-md">Quản Trị Hệ Thống</h2>

      {/* Tabs */}
      <div className="mb-5 border-b-2 border-gray-300 flex flex-wrap gap-2">
        {["products", "deleted", "categories", "orders", "vouchers", "staff", "customers"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 sm:px-5 py-2 text-sm sm:text-base rounded-t-lg transition-colors duration-200
                ${activeTab === tab
                ? "bg-indigo-500 text-white rounded"
                : "bg-gray-200 text-black hover:bg-indigo-500 hover:text-white rounded"
              }`}
          >
            {tab === "products"
              ? "Quản lý món ăn"
              : tab === "deleted"
                ? "Món đã xóa"
                : tab === "categories"
                  ? "Quản lý loại thức ăn"
                  : tab === "orders"
                    ? "Đơn hàng"
                    : tab === "vouchers"
                      ? "Quản lý voucher"
                      : tab === "staff"
                        ? "Quản lý staff"
                        : "Quản lý khách hàng"}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          <button
            onClick={openAdd}
            className="mb-4 px-5 py-2 bg-orange-400 text-white rounded hover:bg-orange-600"
          >
            Thêm món mới
          </button>
          <div className="grid gap-4">
            {products.map((p) => (
              <div key={p.idProduct} className="border border-gray-300 p-4 rounded bg-white flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-4 flex-1 flex-col sm:flex-row">
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.nameProduct}
                      className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-medium">{p.nameProduct}</h4>
                    <p className="text-sm">{p.descriptionProduct}</p>
                    <p className="font-semibold mt-2">
                      {p.priceProduct?.toLocaleString("vi-VN")} VNĐ
                      {p.category && (
                        <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-sm">
                          {p.category.nameCategory}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center justify-end md:justify-start flex-wrap">
                  <button
                    onClick={() => openEdit(p)}
                    className="font-semibold inline-flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-base leading-none flex-none"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(p.idProduct)}
                    className="font-semibold inline-flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-base leading-none flex-none"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Deleted Products Tab */}
      {activeTab === "deleted" && (
        <div>
          {deletedProducts.length === 0 ? (
            <p className="text-black p-4 rounded">Không có món ăn nào đã xóa.</p>
          ) : (
            <div className="grid gap-4">
              {deletedProducts.map((p) => (
                <div key={p.idProduct} className="border border-red-300 p-4 rounded bg-red-50 flex justify-between">
                  <div className="flex gap-4 flex-1">
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.nameProduct}
                        className="w-24 h-24 object-cover rounded opacity-60"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-600">
                        {p.nameProduct}
                        <span className="ml-2 px-2 py-1 bg-red-500 text-white rounded-full text-xs">
                          ĐÃ XÓA
                        </span>
                      </h4>
                      <p className="text-gray-500">{p.descriptionProduct}</p>
                      <p className="font-semibold text-gray-600">
                        {p.priceProduct?.toLocaleString("vi-VN")} VNĐ
                        {p.category && (
                          <span className="ml-2 px-2 py-1 bg-gray-200 rounded-full text-sm">
                            {p.category.nameCategory}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handleRestoreProduct(p.idProduct)}
                      className="font-semibold inline-flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-l leading-none flex-none"
                    >
                      Khôi phục
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div>
          <button
            onClick={openAddCategory}
            className="mb-4 px-5 py-2 bg-orange-400 text-white rounded hover:bg-orange-600"
          >
            Thêm loại thức ăn mới
          </button>
          <div className="grid gap-4">
            {categories.map((cat) => {
              const productCount = products.filter(p => p.category?.idCategory === cat.idCategory).length;
              return (
                <div key={cat.idCategory} className="border border-gray-300 p-4 rounded bg-white flex justify-between">
                  <div>
                    <h4 className="text-lg font-medium">{cat.nameCategory}</h4>
                    <p className="font-semibold text-indigo-600">
                      Số món ăn: {productCount}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => openEditCategory(cat)}
                      className="font-semibold inline-flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-l leading-none flex-none"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.idCategory)}
                      className="font-semibold inline-flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-l leading-none flex-none"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div>
          <div>
            <button
              className="mb-4 px-5 py-2 bg-orange-400 text-white rounded hover:bg-orange-600"
            >
              Danh Sách Đơn Hàng
            </button>
          </div>
          {orders.length === 0 ? (
            <p className="text-white drop-shadow">Chưa có đơn hàng nào.</p>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order.idOrder} className="border border-gray-300 p-4 rounded bg-white">
                  <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-lg">Đơn #{order.idOrder}</strong>
                      <span className="text-gray-600">Khách: {order.customer?.nameCustomer}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 text-gray-700 text-sm">
                      <div>
                        <span className="font-medium">Ngày đặt:</span> {new Date(order.orderDate).toLocaleString("vi-VN")}
                      </div>
                      <div>
                        <span className="font-medium">SĐT:</span> {order.customer?.phoneCustomer}
                      </div>
                      <div>
                        <span className="font-medium">Tổng:</span> {order.totalPrice?.toLocaleString("vi-VN")} VNĐ
                      </div>
                      <div>
                        <span className="font-medium">Địa chỉ:</span> {order.customer?.addressCustomer || "Chưa có địa chỉ"}
                      </div>

                      {/* Payment Info */}
                      {order.paymentMethod && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-medium">PT thanh toán:</span>{' '}
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                            {order.paymentMethod === 'COD' && '💵 COD'}
                            {order.paymentMethod === 'BANK_TRANSFER' && '🏦 Chuyển khoản'}
                            {order.paymentMethod === 'CREDIT_CARD' && '💳 Thẻ'}
                            {order.paymentMethod === 'E_WALLET' && '📱 Ví điện tử'}
                            {!['COD', 'BANK_TRANSFER', 'CREDIT_CARD', 'E_WALLET'].includes(order.paymentMethod) && order.paymentMethod}
                          </span>
                        </div>
                      )}
                      {order.paymentStatus && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">TT thanh toán:</span>{' '}
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                              order.paymentStatus === 'UNPAID' ? 'bg-yellow-100 text-yellow-800' :
                                order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}>
                            {order.paymentStatus === 'PAID' && '✅ Đã thanh toán'}
                            {order.paymentStatus === 'UNPAID' && '⏳ Chưa thanh toán'}
                            {order.paymentStatus === 'FAILED' && '❌ Thất bại'}
                            {!['PAID', 'UNPAID', 'FAILED'].includes(order.paymentStatus) && order.paymentStatus}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="font-medium">Trạng thái:</span>{" "}
                      <span
                        className={`px-3 py-1 rounded-full text-sm text-white`}
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label>Cập nhật trạng thái:</label>
                    <select
                      value={order.status || "pending"}
                      onChange={(e) => updateOrderStatus(order.idOrder, e.target.value)}
                      className="border border-gray-300 rounded p-1"
                    >
                      <option value="pending">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="preparing">Đang chuẩn bị</option>
                      <option value="ready">Sẵn sàng</option>
                      <option value="delivered">Đã giao</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                  {order.orderDetails && order.orderDetails.length > 0 && (
                    <div className="mt-2 text-sm">
                      <strong>Chi tiết:</strong>
                      <ul className="list-disc ml-5">
                        {order.orderDetails.map((detail) => (
                          <li key={detail.idOrderDetail}>
                            {detail.product?.nameProduct} x{detail.quantity}
                            {detail.note && ` (${detail.note})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Voucher Info */}
                  {order.orderVoucher && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="font-semibold text-indigo-600 text-sm">
                          Đã áp dụng voucher: {order.orderVoucher.voucher?.code}
                        </span>
                      </div>
                      <div className="text-sm text-green-600 font-semibold ml-6">
                        Giảm giá: - {order.orderVoucher.discountAmount?.toLocaleString("vi-VN")} VNĐ
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vouchers Tab */}
      {activeTab === "vouchers" && (
        <div>
          <button
            onClick={openAddVoucher}
            className="mb-4 px-5 py-2 bg-orange-400 text-white rounded hover:bg-orange-600"
          >
            Thêm voucher mới
          </button>

          {vouchers.length === 0 ? (
            <p className="text-black p-4 rounded">Không có voucher nào.</p>
          ) : (
            <div className="grid gap-4">
              {vouchers.map((voucher) => {
                const isActive = voucher.status !== false;
                const today = new Date();
                const startDate = new Date(voucher.startDate);
                const endDate = new Date(voucher.endDate);
                const isValid = isActive && voucher.quantity > 0 && today >= startDate && today <= endDate;

                return (
                  <div
                    key={voucher.idVoucher}
                    className={`border p-4 rounded flex flex-col md:flex-row justify-between items-start gap-4 ${isValid ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-300'
                      }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <h4 className="text-xl font-bold text-indigo-600">{voucher.code}</h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${isValid
                            ? 'bg-green-100 text-green-700'
                            : isActive
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {isValid ? 'HOẠT ĐỘNG' : isActive ? 'HẾT HẠN' : 'VÔ HIỆU HÓA'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Loại giảm giá:</span>{' '}
                          <span className="text-indigo-600 font-semibold">
                            {voucher.discountType === 'percentage'
                              ? `${voucher.discountValue}%`
                              : `${voucher.discountValue.toLocaleString('vi-VN')} VNĐ`}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Đơn tối thiểu:</span>{' '}
                          {voucher.minOrderValue.toLocaleString('vi-VN')} VNĐ
                        </div>
                        {voucher.maxDiscount && (
                          <div>
                            <span className="font-medium">Giảm tối đa:</span>{' '}
                            {voucher.maxDiscount.toLocaleString('vi-VN')} VNĐ
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Số lượng:</span>{' '}
                          <span className={voucher.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                            {voucher.quantity}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Bắt đầu:</span> {voucher.startDate}
                        </div>
                        <div>
                          <span className="font-medium">Kết thúc:</span> {voucher.endDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex gap-2 items-center flex-wrap">
                      <button
                        onClick={() => openEditVoucher(voucher)}
                        className="font-semibold inline-flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-base leading-none"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleToggleVoucherStatus(voucher.idVoucher, isActive, voucher.code)}
                        className={`font-semibold inline-flex items-center justify-center px-3 py-2 text-white rounded-md text-base leading-none ${isActive
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-green-500 hover:bg-green-600'
                          }`}
                      >
                        {isActive ? 'Tắt' : 'Bật'}
                      </button>
                      <button
                        onClick={() => handleDeleteVoucher(voucher.idVoucher, voucher.code)}
                        className="font-semibold inline-flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-base leading-none"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === "staff" && (
        <div>
          <button
            onClick={() => setStaffModalOpen(true)}
            className="mb-4 px-5 py-2 bg-orange-400 text-white rounded hover:bg-orange-600"
          >
            Tạo tài khoản staff
          </button>

          {staffList.length === 0 ? (
            <p className="text-black p-4 rounded">
              Chưa có nhân viên nào. Nhấn nút "Tạo tài khoản staff" để thêm nhân viên mới.
            </p>
          ) : (
            <div className="grid gap-4">
              {staffList.map((staff) => (
                <div key={staff.idCustomer} className="border border-gray-300 p-4 rounded bg-white flex flex-col md:flex-row justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <h4 className="text-lg font-semibold">{staff.nameCustomer}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">STAFF</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Email:</span> {staff.email}
                      </div>
                      <div>
                        <span className="font-medium">SĐT:</span> {staff.phoneCustomer}
                      </div>
                      <div>
                        <span className="font-medium">Mật khẩu:</span> <span className="font-mono text-sm">{staff.password || "Không có"}</span>
                      </div>
                      <div>
                        <span className="font-medium">Địa chỉ:</span> {staff.addressCustomer || "Chưa có địa chỉ"}
                      </div>
                      <div className="col-span-2 text-gray-500 text-xs">ID: {staff.idCustomer}</div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 mt-3 md:mt-0 md:ml-4 flex gap-2 items-center">
                    <button
                      onClick={() => openEditStaff(staff)}
                      className="font-semibold inline-flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-l leading-none"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(staff.idCustomer, staff.nameCustomer)}
                      className="font-semibold inline-flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-l leading-none"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-3">{editingProduct ? "Sửa món" : "Thêm món mới"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block mb-1">Tên món</label>
                <input
                  required
                  value={form.nameProduct}
                  onChange={(e) => setForm({ ...form, nameProduct: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Mô tả</label>
                <textarea
                  value={form.descriptionProduct}
                  onChange={(e) => setForm({ ...form, descriptionProduct: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Giá</label>
                <input
                  required
                  type="number"
                  value={form.priceProduct}
                  onChange={(e) => setForm({ ...form, priceProduct: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Ảnh món ăn</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded border"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
              <div className="mb-3">
                <label className="block mb-1">Danh mục</label>
                <select
                  value={form.category || ""}
                  onChange={(e) => setForm({ ...form, category: e.target.value ? Number(e.target.value) : null })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.idCategory} value={cat.idCategory}>
                      {cat.nameCategory}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
                  {editingProduct ? "Lưu" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-3">
              {editingCategory ? "Sửa loại thức ăn" : "Thêm loại thức ăn mới"}
            </h3>
            <form onSubmit={handleCategorySubmit}>
              <div className="mb-3">
                <label className="block mb-1">Tên loại thức ăn</label>
                <input
                  required
                  value={categoryForm.nameCategory}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameCategory: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                  placeholder="VD: Sushi, Món nước, Udon, Ramen..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
                  {editingCategory ? "Lưu" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {staffModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-3">{editingStaff ? "Sửa tài khoản Staff" : "Tạo tài khoản Staff"}</h3>
            <form onSubmit={handleCreateStaff}>
              {["nameCustomer", "phoneCustomer", "email", "password"].map((field) => (
                <div className="mb-3" key={field}>
                  <label className="block mb-1">
                    {field === "nameCustomer"
                      ? "Họ tên"
                      : field === "phoneCustomer"
                        ? "Số điện thoại"
                        : field === "email"
                          ? "Email"
                          : "Mật khẩu"}
                  </label>
                  <input
                    required={field === "password" ? !editingStaff : true}
                    type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                    value={staffForm[field]}
                    onChange={(e) => setStaffForm({ ...staffForm, [field]: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setStaffModalOpen(false); setEditingStaff(null); }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
                  {editingStaff ? "Lưu" : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      {voucherModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3">
              {editingVoucher ? "Sửa Voucher" : "Thêm Voucher Mới"}
            </h3>
            <form onSubmit={handleVoucherSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block mb-1 font-medium">Mã Voucher</label>
                  <input
                    required
                    type="text"
                    value={voucherForm.code}
                    onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                    placeholder="VD: GIAM20, FREESHIP"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Loại giảm giá</label>
                  <select
                    value={voucherForm.discountType}
                    onChange={(e) => setVoucherForm({ ...voucherForm, discountType: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Giá trị giảm {voucherForm.discountType === 'percentage' ? '(%)' : '(VNĐ)'}
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step={voucherForm.discountType === 'percentage' ? '0.01' : '1000'}
                    value={voucherForm.discountValue}
                    onChange={(e) => setVoucherForm({ ...voucherForm, discountValue: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1000"
                    value={voucherForm.minOrderValue}
                    onChange={(e) => setVoucherForm({ ...voucherForm, minOrderValue: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Giảm tối đa (VNĐ) - Tùy chọn</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={voucherForm.maxDiscount || ''}
                    onChange={(e) => setVoucherForm({ ...voucherForm, maxDiscount: e.target.value || null })}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                    placeholder="Để trống nếu không giới hạn"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Số lượng</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={voucherForm.quantity}
                    onChange={(e) => setVoucherForm({ ...voucherForm, quantity: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Ngày bắt đầu</label>
                  <input
                    required
                    type="date"
                    value={voucherForm.startDate}
                    onChange={(e) => setVoucherForm({ ...voucherForm, startDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Ngày kết thúc</label>
                  <input
                    required
                    type="date"
                    value={voucherForm.endDate}
                    onChange={(e) => setVoucherForm({ ...voucherForm, endDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={voucherForm.status}
                      onChange={(e) => setVoucherForm({ ...voucherForm, status: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">Kích hoạt voucher</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => { setVoucherModalOpen(false); setEditingVoucher(null); }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
                  {editingVoucher ? "Cập nhật" : "Thêm Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <div>
          {customerList.length === 0 ? (
            <p className="text-black p-4 rounded">Chưa có khách hàng nào.</p>
          ) : (
            <div className="grid gap-4">
              {customerList.map((cust) => {
                const isActive = cust.isActive !== false;
                return (
                  <div
                    key={cust.idCustomer}
                    className={`border p-4 rounded flex justify-between items-center ${isActive ? 'bg-white border-gray-300' : 'bg-red-50 border-red-300'
                      }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h4 className={`text-lg font-semibold ${isActive ? 'text-black' : 'text-gray-500'
                          }`}>{cust.nameCustomer}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}>
                          {isActive ? 'HOẠT ĐỘNG' : 'VÔ HIỆU HÓA'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Email:</span> {cust.email}
                        </div>
                        <div>
                          <span className="font-medium">SĐT:</span> {cust.phoneCustomer || 'Chưa có'}
                        </div>
                        {cust.addressCustomer && (
                          <div className="col-span-2">
                            <span className="font-medium">Địa chỉ:</span> {cust.addressCustomer}
                          </div>
                        )}
                        <div className="col-span-2 text-gray-500 text-xs">
                          ID: {cust.idCustomer}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => handleToggleCustomerActive(cust.idCustomer, isActive, cust.nameCustomer)}
                        className={`font-semibold inline-flex items-center justify-center px-3 py-2 text-white rounded-md text-l leading-none flex-none ${isActive
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-500 hover:bg-green-600'
                          }`}
                      >
                        {isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}





function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "#f59f00";
    case "confirmed":
      return "#3b82f6";
    case "preparing":
      return "#8b5cf6";
    case "ready":
      return "#22c55e";
    case "delivered":
      return "#16a34a";
    case "cancelled":
      return "#ef4444";
    default:
      return "#6b7280";
  }
}

function getStatusLabel(status) {
  switch (status) {
    case "pending":
      return "Chờ xác nhận";
    case "confirmed":
      return "Đã xác nhận";
    case "preparing":
      return "Đang chuẩn bị";
    case "ready":
      return "Sẵn sàng";
    case "delivered":
      return "Đã giao";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
}
