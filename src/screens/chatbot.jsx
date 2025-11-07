import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User } from "lucide-react";
import "./chatbot.css"

const API_KEY = import.meta.env.VITE_GOOGLE_API;

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hey 👋 I'm Gemini Flash. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let model = "gemini-2.5-flash";
      let response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: input }] }],
          }),
        }
      );

      let data = await response.json();

      if (data?.error?.message?.includes("Quota exceeded")) {
        model = "gemini-pro";
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: input }] }],
            }),
          }
        );
        data = await response.json();
      }

      const botReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.error?.message ||
        "Sorry, I couldn't understand that.";

      setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Network error. Try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl bg-white/5 border border-white/10">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative px-6 py-5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-md border-b border-white/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-md opacity-75"></div>
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-full">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
                  Gemini AI
                </h1>
                <p className="text-xs text-indigo-300/80">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-300">Online</span>
            </div>
          </div>
        </motion.div>

        {/* Chat body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "bot" && (
                  <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                
                <div
                  className={`group relative px-5 py-3.5 rounded-2xl max-w-[75%] shadow-lg transition-all duration-300 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-md"
                      : "bg-white/10 backdrop-blur-md text-gray-100 rounded-bl-md border border-white/10"
                  }`}
                >
                  <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>
                  {msg.role === "user" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 items-center"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl rounded-bl-md border border-white/10">
                <div className="flex gap-1.5">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-indigo-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-pink-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={handleSend}
          className="p-4 bg-gradient-to-r from-indigo-950/50 to-purple-950/50 backdrop-blur-md border-t border-white/10"
        >
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-2 border border-white/10 focus-within:border-indigo-500/50 transition-all duration-300">
            <input
              type="text"
              className="flex-1 bg-transparent text-white px-4 py-3 outline-none placeholder-gray-400 text-sm sm:text-base"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="relative px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg overflow-hidden group"
              disabled={loading || !input.trim()}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}