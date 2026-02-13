import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config';

export default function AddCustomer() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({ nameCustomer: "", phoneCustomer: "", addressCustomer: "" });

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer.nameCustomer.trim() || !customer.phoneCustomer.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      await axios.post(`${API_URL}/customers`, customer, {
        headers: { "Content-Type": "application/json" },
      });
      navigate("/");
    } catch (err) {
      console.error("❌ Lỗi khi thêm khách hàng:", err);
      alert("Có lỗi xảy ra!");
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Thêm khách hàng</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Tên khách hàng: </label>
          <input
            name="nameCustomer"
            value={customer.nameCustomer}
            onChange={handleChange}
            style={{ width: "100%", padding: 5 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Số điện thoại: </label>
          <input
            name="phoneCustomer"
            value={customer.phoneCustomer}
            onChange={handleChange}
            style={{ width: "100%", padding: 5 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Địa chỉ: </label>
          <input
            name="addressCustomer"
            value={customer.addressCustomer}
            onChange={handleChange}
            style={{ width: "100%", padding: 5 }}
          />
        </div>

        <button type="submit">Lưu</button>
        <button type="button" onClick={() => navigate("/")} style={{ marginLeft: 10 }}>
          Hủy
        </button>
      </form>
    </div>
  );
}
