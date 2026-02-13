import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

export default function Register() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    nameCustomer: '',
    phoneCustomer: '',
    addressCustomer: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const { nameCustomer, phoneCustomer, addressCustomer, email, password, confirmPassword } = customer;

  const onInputChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!nameCustomer || !phoneCustomer || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      // Không gửi confirmPassword lên server
      const { confirmPassword, ...customerData } = customer;

      await axios.post(`${API_URL}/customers/register`, customerData);

      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại!');
      }
    }
  };

  return (
    <div className="container px-3 py-4">
      <div className="row">
        <div className="col-12 col-md-8 col-lg-6 offset-md-2 offset-lg-3 border rounded p-4 mt-2 shadow bg-white">
          <h2 className="text-center m-4">Đăng ký tài khoản</h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={(e) => onSubmit(e)}>
            <div className="mb-3">
              <label htmlFor="nameCustomer" className="form-label">
                Họ và tên
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập họ và tên"
                name="nameCustomer"
                value={nameCustomer}
                onChange={(e) => onInputChange(e)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="phoneCustomer" className="form-label">
                Số điện thoại
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập số điện thoại"
                name="phoneCustomer"
                value={phoneCustomer}
                onChange={(e) => onInputChange(e)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="addressCustomer" className="form-label">
                Địa chỉ
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập địa chỉ"
                name="addressCustomer"
                value={addressCustomer}
                onChange={(e) => onInputChange(e)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="Nhập email"
                name="email"
                value={email}
                onChange={(e) => onInputChange(e)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                name="password"
                value={password}
                onChange={(e) => onInputChange(e)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Nhập lại mật khẩu"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => onInputChange(e)}
              />
            </div>

            <div className="d-flex flex-column flex-sm-row gap-2">
              <button
                type="submit"
                className="flex-grow-1 px-4 py-2 border-1 border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white rounded-lg"
              >
                Đăng ký
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-grow-1 px-4 py-2 border-1 border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition duration-200"
              >
                Hủy
              </button>
            </div>

          </form>

          <div className="mt-3 text-center">
            <p>
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-indigo-600 no-underline hover:text-indigo-800">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
