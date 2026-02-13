import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from '../config';

export default function EditCustomer() {
  const { id } = useParams(); // lấy id từ /edit-customer/:id
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({ nameCustomer: "", phoneCustomer: "", addressCustomer: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/customers/${id}`);
        setCustomer({
          nameCustomer: res.data.nameCustomer ?? "",
          phoneCustomer: res.data.phoneCustomer ?? "",
          addressCustomer: res.data.addressCustomer ?? "",
        });
      } catch (err) {
        console.error("Lỗi khi tải khách hàng:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCustomer();
  }, [id]);

  const handleChange = (e) => setCustomer({ ...customer, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer.nameCustomer.trim() || !customer.phoneCustomer.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    try {
      setSaving(true);
      await axios.put(`${API_URL}/customers/${id}`, customer, {
        headers: { "Content-Type": "application/json" },
      });
      navigate("/");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      alert("Có lỗi xảy ra khi cập nhật.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Đang tải...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Chỉnh sửa khách hàng</h2>
      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Tên khách hàng:</label>
          <input name="nameCustomer" value={customer.nameCustomer} onChange={handleChange} style={{ width: "100%", padding: 5 }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Số điện thoại:</label>
          <input name="phoneCustomer" value={customer.phoneCustomer} onChange={handleChange} style={{ width: "100%", padding: 5 }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Địa chỉ:</label>
          <input name="addressCustomer" value={customer.addressCustomer} onChange={handleChange} style={{ width: "100%", padding: 5 }} />
        </div>
        <button type="submit" disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</button>
        <button type="button" onClick={() => navigate("/")} style={{ marginLeft: 8 }} disabled={saving}>Hủy</button>
      </form>
    </div>
  );
}