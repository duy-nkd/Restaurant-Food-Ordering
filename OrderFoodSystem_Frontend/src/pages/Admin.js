import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); // null => thêm mới
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nameProduct: "", descriptionProduct: "", priceProduct: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ nameProduct: "", descriptionProduct: "", priceProduct: 0 });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      nameProduct: p.nameProduct ?? "",
      descriptionProduct: p.descriptionProduct ?? "",
      priceProduct: p.priceProduct ?? 0,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa món này?")) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      loadProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nameProduct: form.nameProduct,
        descriptionProduct: form.descriptionProduct,
        priceProduct: Number(form.priceProduct),
      };

      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.idProduct}`, payload, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        await axios.post(`${API_URL}/products`, payload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      setModalOpen(false);
      loadProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Lỗi khi lưu món ăn");
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-semibold mb-4">Quản lý món ăn (Admin)</h2>

      <div className="mb-3">
        <button
          onClick={openAdd}
          className="mr-2 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Thêm món mới
        </button>

        <button
          onClick={() => navigate("/orders")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Xem danh sách đơn hàng
        </button>
      </div>

      {products.length === 0 ? (
        <p>Chưa có món ăn nào.</p>
      ) : (
        <div className="grid gap-3">
          {products.map((p) => (
            <div key={p.idProduct} className="border border-gray-300 p-3 rounded">
              <h4 className="text-lg font-medium">{p.nameProduct}</h4>
              <p className="mb-1">{p.descriptionProduct}</p>
              <p className="font-semibold mb-2">{p.priceProduct?.toLocaleString("vi-VN")} VNĐ</p>
              <div>
                <button
                  onClick={() => openEdit(p)}
                  className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(p.idProduct)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg w-80">
            <h3 className="text-xl font-semibold mb-3">{editingProduct ? "Sửa món" : "Thêm món mới"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block mb-1">Tên</label>
                <input
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
                  type="number"
                  value={form.priceProduct}
                  onChange={(e) => setForm({ ...form, priceProduct: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="mr-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  {editingProduct ? "Lưu" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
