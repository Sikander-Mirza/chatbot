import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User, Paperclip, X, FileText, Image } from "lucide-react";
import "./chatbot.css"

const API_KEY = import.meta.env.VITE_GOOGLE_API;

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hey 👋 I'm Gemini Flash. Ask me anything! You can also upload images, PDFs, or text files for me to analyze." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("File size must be less than 10MB");
      return;
    }

    const validTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
      'application/json'
    ];

    if (!validTypes.includes(file.type)) {
      alert("Unsupported file type. Please upload images, PDFs, or text files.");
      return;
    }

    setUploadedFile(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !uploadedFile) return;

    const userMessage = { 
      role: "user", 
      text: input || "📎 Uploaded a file",
      file: uploadedFile ? { name: uploadedFile.name, type: uploadedFile.type } : null
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    const currentFile = uploadedFile;
    setInput("");
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLoading(true);

    try {
      let model = "gemini-2.5-flash";
      
      // Prepare the content parts
      const parts = [];
      
      // Add text if provided
      if (currentInput.trim()) {
        parts.push({ text: currentInput });
      }

      // Add file if uploaded
      if (currentFile) {
        const base64Data = await fileToBase64(currentFile);
        
        if (currentFile.type.startsWith('image/')) {
          parts.push({
            inline_data: {
              mime_type: currentFile.type,
              data: base64Data
            }
          });
          if (!currentInput.trim()) {
            parts.unshift({ text: "What's in this image?" });
          }
        } else if (currentFile.type === 'application/pdf') {
          parts.push({
            inline_data: {
              mime_type: currentFile.type,
              data: base64Data
            }
          });
          if (!currentInput.trim()) {
            parts.unshift({ text: "Please analyze this PDF document." });
          }
        } else {
          // For text files, read as text
          const text = await currentFile.text();
          parts.push({ text: `Here's the content of the file "${currentFile.name}":\n\n${text}\n\n` + (currentInput || "Please analyze this file.") });
        }
      }

      let response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts }],
          }),
        }
      );

      let data = await response.json();

      // Retry if quota exceeded
      if (data?.error?.message?.includes("Quota exceeded")) {
        model = "gemini-pro-vision";
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts }],
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
   <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white flex items-center justify-center p-2 sm:p-4">
  <div className="w-full max-w-4xl h-[92vh] sm:h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl bg-white/5 border border-white/10">

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
                
                <div className="flex flex-col gap-2 max-w-[75%]">
                  {msg.file && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-xs">
                      {msg.file.type.startsWith('image/') ? (
                        <Image className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-indigo-400" />
                      )}
                      <span className="text-gray-300 truncate">{msg.file.name}</span>
                    </div>
                  )}
                  <div
                    className={`group relative px-5 py-3.5 rounded-2xl shadow-lg transition-all duration-300 ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-md text-left"
                        : "bg-white/10 backdrop-blur-md text-gray-100 rounded-bl-md border border-white/10 text-left"
                    }`}
                  >
                    <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed text-left">
                      {msg.text}
                    </p>
                    {msg.role === "user" && (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                    )}
                  </div>
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
          {/* File preview */}
          <AnimatePresence>
            {uploadedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10"
              >
                {uploadedFile.type.startsWith('image/') ? (
                  <Image className="w-5 h-5 text-indigo-400" />
                ) : (
                  <FileText className="w-5 h-5 text-indigo-400" />
                )}
                <span className="text-sm text-gray-200 flex-1 truncate">
                  {uploadedFile.name}
                </span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-2 border border-white/10 focus-within:border-indigo-500/50 transition-all duration-300">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt,.csv,.json,.html,.css,.js"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Paperclip className="w-5 h-5 text-indigo-400" />
            </label>
            
            <input
              type="text"
              className="flex-1 bg-transparent text-white px-2 py-3 outline-none placeholder-gray-400 text-sm sm:text-base"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            
            <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  type="submit"
  className="relative px-3 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg overflow-hidden group"
  disabled={loading || (!input.trim() && !uploadedFile)}
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
          <p className="text-xs text-gray-400 mt-2 text-center">
            Supports images, PDFs, and text files (max 10MB)
          </p>
        </motion.form>
      </div>
    </div>
  );
}