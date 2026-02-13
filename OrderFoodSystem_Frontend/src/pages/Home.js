import React from "react";
import { useNavigate } from "react-router-dom";
import Carousel from "../components/Carousel";

export default function Home() {
  const navigate = useNavigate();
  const customer = JSON.parse(localStorage.getItem('customer') || 'null');

  return (


    <div className="m-0 p-0">
      {/* Hero Section */}
      <div
        className="relative text-white h-[60vh] md:h-[80vh] px-5 text-center bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/bg1.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '60vh'
        }}
      >
        {/* Overlay tối để chữ nổi bật */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Nội dung */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-5">Chào mừng đến với HKD Restaurant</h1>
          <p className="text-xl md:text-2xl mb-8">Hương vị tuyệt vời, phục vụ tận tâm</p>

        </div>
      </div>




      {/* CTA Section */}

      <div className="py-16 px-5 text-center bg-white">
        <h2 className="text-3xl mb-5">Bạn đã sẵn sàng đặt món chưa?</h2>
        <p className="text-lg text-gray-600 mb-8">
          {customer
            ? `Xin chào ${customer.nameCustomer}, hãy khám phá thực đơn của chúng tôi!`
            : 'Đăng nhập ngay để bắt đầu đặt món và nhận ưu đãi!'}
        </p>

        <button
          onClick={() => navigate('/menu')}
          className="px-3 py-3 font-semibold bg-indigo-500 text-white hover:bg-indigo-700 hover:text-white rounded-lg"
        >
          Xem thực đơn ngay
        </button>


      </div>

      {/* Carousel */}
      <Carousel />


      {/* Features Section */}
      <div className="py-16 px-5 bg-gray-100">
        <h2 className="text-3xl text-center mb-10">Tại sao chọn chúng tôi?</h2>
        <div className="grid gap-8 max-w-6xl mx-auto sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

          <div className="bg-white p-8 rounded-lg text-center shadow-md">
            <img src="/images/monngon.jpg" alt="Món ngon" className="w-20 h-20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Món ngon đa dạng</h3>
            <p className="text-gray-600">Thực đơn phong phú với nhiều món ăn hấp dẫn</p>
          </div>

          <div className="bg-white p-8 rounded-lg text-center shadow-md">
            <img src="/images/ship.png" alt="Giao hàng nhanh" className="w-20 h-20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Giao hàng nhanh</h3>
            <p className="text-gray-600">Đảm bảo giao hàng đúng giờ, món ăn luôn nóng sốt</p>
          </div>

          <div className="bg-white p-8 rounded-lg text-center shadow-md">
            <img src="/images/quality.jpg" alt="Chất lượng" className="w-20 h-20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chất lượng đảm bảo</h3>
            <p className="text-gray-600">Nguyên liệu tươi ngon, vệ sinh an toàn thực phẩm</p>
          </div>
        </div>
      </div>

    </div>
  );
}
