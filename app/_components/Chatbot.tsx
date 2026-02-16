"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";
import { chatbotKnowledgeBase, defaultResponse } from "../_data/chatbotData";

interface Message {
    id: number;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

export const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! I'm the **TrustVaultX**. Ask me about our DRM, Payments, or how to protect your work!",
            sender: "bot",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            text: inputValue,
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        // Simulate AI "thinking" time
        setTimeout(() => {
            const botResponseText = findResponse(userMessage.text);
            const botMessage: Message = {
                id: Date.now() + 1,
                text: botResponseText,
                sender: "bot",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const findResponse = (query: string): string => {
        const lowerQuery = query.toLowerCase();
        let bestMatch = defaultResponse;
        let maxKeywordsFound = 0;

        for (const entry of chatbotKnowledgeBase) {
            let keywordsFound = 0;
            for (const keyword of entry.keywords) {
                if (lowerQuery.includes(keyword)) {
                    keywordsFound++;
                }
            }
            if (keywordsFound > maxKeywordsFound) {
                maxKeywordsFound = keywordsFound;
                bestMatch = entry.response;
            }
        }

        // If no keywords matched at all, return default
        if (maxKeywordsFound === 0) return defaultResponse;

        return bestMatch;
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="pointer-events-auto w-[350px] md:w-[400px] h-[500px] bg-brand-navy/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-brand-surface/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center border border-brand-cyan/30">
                                    <Bot size={18} className="text-brand-cyan" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">TrustVaultX</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-xs text-brand-green/80 font-mono">ONLINE</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === "user"
                                        ? "bg-brand-violet/20 border border-brand-violet/30"
                                        : "bg-brand-cyan/20 border border-brand-cyan/30"
                                        }`}>
                                        {msg.sender === "user" ? <User size={14} className="text-brand-violet" /> : <Bot size={14} className="text-brand-cyan" />}
                                    </div>
                                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${msg.sender === "user"
                                        ? "bg-brand-violet/10 border border-brand-violet/20 text-gray-100 rounded-tr-none"
                                        : "bg-white/5 border border-white/10 text-gray-300 rounded-tl-none"
                                        }`}>
                                        {/* Simple Markdown-like parsing for bold text */}
                                        {msg.text.split("**").map((part, i) =>
                                            i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 flex-shrink-0 flex items-center justify-center">
                                        <Bot size={14} className="text-brand-cyan" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-3 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-brand-surface/30 backdrop-blur-md">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                className="relative flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask about DRM, payments..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/20 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="absolute right-2 p-1.5 bg-brand-cyan text-black rounded-lg hover:bg-brand-cyan/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                            <div className="text-center mt-2">
                                <span className="text-[10px] text-gray-600 flex items-center justify-center gap-1">
                                    Powered by <Sparkles size={8} className="text-brand-violet" /> CreatorSecure Intelligence
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto w-14 h-14 rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center text-black font-bold z-50 hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transition-shadow group relative overflow-hidden"
            >
                {/* Glow Ring */}
                <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-20"></div>

                {isOpen ? <X size={28} /> : (
                    <div className="relative">
                        <MessageSquare size={26} className="fill-black/10" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-brand-cyan rounded-full"></span>
                    </div>
                )}
            </motion.button>
        </div>
    );
};
