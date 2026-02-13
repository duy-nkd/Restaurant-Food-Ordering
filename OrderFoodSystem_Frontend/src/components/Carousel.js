import React, { useState, useEffect } from "react";

export default function Carousel() {
    const slides = [
        { src: "/images/banner1.jpg", caption: "MÓN ĂN ĐẶC SẮC" },
        { src: "/images/banner2.jpg", caption: "NGUYÊN LIỆU TƯƠI NGON" },
        { src: "/images/banner3.jpg", caption: "KHÔNG GIAN THÂN THIỆN" },
    ];

    const [current, setCurrent] = useState(0);

    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 3000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[400px] overflow-hidden shadow-lg">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <img
                        src={slide.src}
                        alt={slide.caption}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <p className="text-white text-2xl font-semibold">{slide.caption}</p>
                    </div>
                </div>
            ))}

            {/* Nút điều hướng */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-black/60"
            >
                ❮
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-black/60"
            >
                ❯
            </button>

        </div>
    );
}
