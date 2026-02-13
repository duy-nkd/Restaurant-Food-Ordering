import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Chào bạn! Mình là trợ lý ảo của nhà hàng. Mình có thể giúp gì cho bạn hôm nay?", sender: 'bot' }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Get or generate session ID
    useEffect(() => {
        if (!sessionStorage.getItem('chatbot_session_id')) {
            sessionStorage.setItem('chatbot_session_id', 'session_' + Math.random().toString(36).substr(2, 9));
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const customer = JSON.parse(localStorage.getItem("customer") || "null");
        const sessionId = sessionStorage.getItem('chatbot_session_id');

        const userMessage = { text, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/chatbot/query`, {
                message: text,
                sessionId: sessionId,
                customerId: customer?.idCustomer
            });

            const botMessage = {
                text: response.data.reply,
                sender: 'bot',
                products: response.data.products,
                suggestions: response.data.suggestions
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages(prev => [...prev, { text: "Xin lỗi, mình đang gặp chút trục trặc kỹ thuật. Thử lại sau nhé!", sender: 'bot' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleSend(suggestion);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[350px] sm:w-[400px] h-[550px] bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20">
                    {/* Header */}
                    <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="font-semibold">HKD Chatbot</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:text-gray-200 text-xl cursor-pointer">×</button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${msg.sender === 'user'
                                        ? 'bg-indigo-500 text-white rounded-tr-none'
                                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                    }`}>
                                    <p className="text-sm">{msg.text}</p>

                                    {/* Products Rendering */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {msg.products.map((p, idx) => (
                                                <div key={p.idProduct} className="flex gap-2 p-2 bg-white rounded-lg border border-gray-100 items-center">
                                                    <img
                                                        src={p.imageUrl}
                                                        alt={p.nameProduct}
                                                        className="w-12 h-12 object-cover rounded"
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                                                    />
                                                    <div className="flex-1">
                                                        <h5 className="text-[12px] font-bold text-gray-800 line-clamp-1">{idx + 1}. {p.nameProduct}</h5>
                                                        <p className="text-[11px] text-red-500 font-semibold">{p.priceProduct.toLocaleString()} VNĐ</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Suggestions */}
                                    {msg.suggestions && msg.suggestions.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {msg.suggestions.map((s, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSuggestionClick(s)}
                                                    className="px-3 py-1 bg-white border border-indigo-200 text-indigo-600 text-xs rounded-full hover:bg-indigo-50 transition-colors cursor-pointer"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.5s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 p-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                            type="submit"
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            disabled={!input.trim() || loading}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
