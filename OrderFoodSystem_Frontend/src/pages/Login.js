import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';


export default function Login() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const { email, password } = customer;

  const onInputChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/customers/login`, customer);

      // Lưu thông tin customer vào localStorage
      localStorage.setItem('customer', JSON.stringify(response.data.customer));

      // Dispatch event để Navbar cập nhật
      window.dispatchEvent(new Event('customerChanged'));

      alert('Đăng nhập thành công!');
      navigate('/');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại!');
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      const googleUser = {
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.sub
      };

      console.log("Google user:", googleUser); // DEBUG


      const response = await axios.post(
        `${API_URL}/customers/google-login`,
        googleUser
      );

      localStorage.setItem(
        'customer',
        JSON.stringify(response.data.customer)
      );

      window.dispatchEvent(new Event('customerChanged'));

      alert('Đăng nhập Google thành công!');
      navigate('/');
    } catch (err) {
      console.error("Google Login Error:", err.response?.data || err.message);
      setError('Đăng nhập Google thất bại');
    }
  };

  const handleGoogleError = () => {
    setError('Google Login thất bại');
  };


  return (
    <div className="pb-5 min-h-screen flex flex-col">
      <div className="flex-1 flex items-center">
        <div className="container px-3 py-4">
          <div className="row justify-content-center w-100">
            <div className="col-12 col-md-8 col-lg-6 border rounded p-4 mt-2 shadow bg-white">
              <h2 className="text-center m-4">Đăng nhập</h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={(e) => onSubmit(e)}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Nhập email của bạn"
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
                    placeholder="Nhập mật khẩu"
                    name="password"
                    value={password}
                    onChange={(e) => onInputChange(e)}
                  />
                </div>

                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button
                    type="submit"
                    className="flex-grow-1 px-4 py-2 border-1 border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white rounded-lg"
                  >
                    Đăng nhập
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

              <div className="mt-4 text-center">
                <p className="mb-2">Hoặc đăng nhập bằng</p>

                <div className="d-flex justify-content-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                  />
                </div>
              </div>


              <div className="mt-3 text-center">
                <p>
                  Chưa có tài khoản?{" "}
                  <Link to="/register" className="text-indigo-600 no-underline hover:text-indigo-800">
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
