import React, { useEffect, useState } from "react";

export default function GoToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 280);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            type="button"
            aria-label="Go to top"
            onClick={handleClick}
            className={`
        fixed bottom-24 right-6 md:bottom-28 md:right-8 z-[10000]
        w-12 h-12 rounded-full
        bg-indigo-500 text-white
        flex items-center justify-center
        shadow-lg
        hover:bg-primary-dark hover:scale-110
        focus:outline-none focus:ring-2 focus:ring-primary/40
        transition-[opacity,transform,background-color]
        duration-500
        ease-[cubic-bezier(0.22,1,0.36,1)]
        ${visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"}
      `}
        >
            {/* Elegant Arrow Icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 15l7-7 7 7"
                />
            </svg>
        </button>
    );
}
