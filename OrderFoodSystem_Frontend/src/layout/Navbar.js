import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadCustomer = () => {
      const loggedCustomer = localStorage.getItem("customer");
      setCustomer(loggedCustomer ? JSON.parse(loggedCustomer) : null);
    };

    loadCustomer();
    window.addEventListener("storage", loadCustomer);
    window.addEventListener("customerChanged", loadCustomer);

    return () => {
      window.removeEventListener("storage", loadCustomer);
      window.removeEventListener("customerChanged", loadCustomer);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customer");
    setCustomer(null);
    window.dispatchEvent(new Event("customerChanged"));
    alert("Đăng xuất thành công!");
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav className="bg-indigo-100 shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 flex justify-between items-center">
        {/* Logo + Hamburger */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link to="/" className="flex items-center space-x-1 sm:space-x-2 no-underline">
            <img
              src="/images/logo.jpg"
              alt="Logo"
              className="h-8 sm:h-10 md:h-12 w-auto"
            />
            <span className="font-extrabold text-lg sm:text-2xl md:text-3xl text-indigo-500 whitespace-nowrap">
              Restaurant
            </span>
          </Link>

          {/* Hamburger icon mobile */}
          <button
            className="md:hidden text-2xl sm:text-3xl ml-2 focus:outline-none flex-shrink-0"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-6 ml-10 text-lg font-medium">
            <Link to="/" className="pt-2 text-indigo-500 hover:text-indigo-800 transition no-underline">
              Trang chủ
            </Link>
            <Link to="/menu" className="pt-2 text-indigo-500 hover:text-indigo-800 transition no-underline">
              Menu
            </Link>

            {customer && (!customer.role || customer.role === "CUSTOMER") && (
              <>
                <Link to="/cart" className="pt-2 text-indigo-500 hover:text-indigo-800 transition no-underline">
                  Giỏ hàng
                </Link>
                <Link to="/wishlist" className="pt-2 text-indigo-500 hover:text-indigo-800 transition no-underline">
                  Wishlist
                </Link>
                <Link to="/my-orders" className="pt-2 text-indigo-500 hover:text-indigo-800 transition no-underline">
                  Đơn hàng của tôi
                </Link>
              </>
            )}

            {customer?.role === "ADMIN" && (
              <>
                <Link to="/admin" className="pt-2 text-indigo-500 hover:text-indigo-800 transition no-underline">
                  Quản trị
                </Link>
                <Link to="/statistics" className="pt-2 text-indigo-500 hover:text-indigo-800 transition no-underline">
                  Thống kê
                </Link>
                <Link to="/admin/reviews" className="pt-2 text-indigo-500 hover:text-indigo-800 transition no-underline">
                  Quản lý Review
                </Link>
              </>
            )}

            {customer?.role === "STAFF" && (
              <Link to="/staff" className="pt-2 text-indigo-500 hover:text-indigo-800 transition no-underline">
                Quản lý đơn hàng
              </Link>
            )}
          </div>
        </div>

        {/* Right side desktop */}
        <div className="hidden md:flex items-center space-x-4 text-lg font-medium">
          {customer ? (
            <>
              <Link to="/profile" className="pt-2 text-indigo-500 hover:text-indigo-800 no-underline transition">
                Xin chào, {customer.nameCustomer}
                {customer.role === "ADMIN" && <span className="text-red-500"> (Admin)</span>}
                {customer.role === "STAFF" && <span className="text-green-500"> (Staff)</span>}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-indigo-500 hover:text-indigo-800 transition no-underline">
                Đăng nhập
              </Link>
              <Link to="/register">
                <button className="text-indigo-500 hover:text-indigo-800 rounded-md transition">
                  Đăng ký
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-indigo-100 border-t border-gray-200 px-4 sm:px-5 py-4 space-y-1.5">
          <Link
            to="/"
            className="block w-full px-4 py-2.5 rounded-lg text-indigo-500 hover:text-indigo-800 font-medium no-underline transition"
            onClick={() => setMenuOpen(false)}
          >
            Trang chủ
          </Link>
          <Link
            to="/menu"
            className="block w-full px-4 py-2.5 rounded-lg text-indigo-500 hover:text-indigo-800 font-medium no-underline transition"
            onClick={() => setMenuOpen(false)}
          >
            Menu
          </Link>

          {customer && (!customer.role || customer.role === "CUSTOMER") && (
            <>
              <Link
                to="/cart"
                className="block w-full px-4 py-2.5 rounded-lg text-indigo-500 hover:text-indigo-800 font-medium no-underline transition"
                onClick={() => setMenuOpen(false)}
              >
                Giỏ hàng
              </Link>
              <Link
                to="/wishlist"
                className="block w-full px-4 py-2.5 rounded-lg text-indigo-500 hover:text-indigo-800 font-medium no-underline transition"
                onClick={() => setMenuOpen(false)}
              >
                Wishlist
              </Link>
              <Link
                to="/my-orders"
                className="block w-full px-4 py-2.5 rounded-lg text-indigo-500 hover:text-indigo-800 font-medium no-underline transition"
                onClick={() => setMenuOpen(false)}
              >
                Đơn hàng của tôi
              </Link>
            </>
          )}

          {customer?.role === "ADMIN" && (
            <>
              <Link
                to="/admin"
                className="block w-full px-4 py-2.5 rounded-lg text-indigo-500 hover:text-indigo-800 font-medium no-underline transition"
                onClick={() => setMenuOpen(false)}
              >
                Quản trị
              </Link>
              <Link
                to="/statistics"
                className="block w-full px-4 py-2.5 rounded-lg text-indigo-500 hover:text-indigo-800 font-medium no-underline transition"
                onClick={() => setMenuOpen(false)}
              >
                Thống kê
              </Link>
              <Link
                to="/admin/reviews"
                className="block w-full px-4 py-2.5 rounded-lg text-indigo-500 hover:text-indigo-800 font-medium no-underline transition"
                onClick={() => setMenuOpen(false)}
              >
                Quản lý Review
              </Link>
            </>
          )}

          {customer?.role === "STAFF" && (
            <Link
              to="/staff"
              className="block w-full px-4 py-2.5 rounded-lg text-indigo-500 hover:text-indigo-800 font-medium no-underline transition"
              onClick={() => setMenuOpen(false)}
            >
              Quản lý đơn hàng
            </Link>
          )}

          <div className="pt-1.5 space-y-1.5">
            {customer ? (
              <>
                <Link
                  to="/profile"
                  className="block w-full px-4 py-2.5 rounded-lg text-indigo-500 hover:text-indigo-800 font-medium no-underline transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Thông tin cá nhân
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block w-full px-4 py-2.5 rounded-lg text-indigo-500 hover:text-indigo-800 font-medium no-underline transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-2.5 rounded-lg text-indigo-500 hover:text-indigo-800 font-medium no-underline transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
