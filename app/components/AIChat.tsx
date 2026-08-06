"use client";

import { useState } from "react";

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am the AEGRIS AI assistant. Ask me anything about your infrastructure."
    }
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      text: input
    };

    const aiMessage = {
      role: "assistant",
      text: "Analysis complete. No critical anomalies detected. Risk level: Low."
    };

    setMessages([...messages, userMessage, aiMessage]);
    setInput("");
  };

  return (
    <section className="py-32 bg-slate-950">
      <div className="max-w-5xl mx-auto px-6">

        <h2 className="text-5xl font-black text-center text-white mb-3">
          AI Infrastructure Assistant
        </h2>

        <p className="text-center text-slate-400 mb-12">
          Ask questions about satellite imagery, infrastructure or AI analysis.
        </p>

        <div className="rounded-3xl border border-cyan-500/30 bg-slate-900">

          <div className="h-96 overflow-y-auto p-6 space-y-4">

            {messages.map((m, i) => (

              <div
                key={i}
                className={`max-w-xl rounded-xl px-5 py-3 ${
                  m.role === "assistant"
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "bg-slate-800 text-white ml-auto"
                }`}
              >
                {m.text}
              </div>

            ))}

          </div>

          <div className="flex border-t border-slate-700">

            <input
              className="flex-1 bg-transparent p-5 outline-none text-white"
              placeholder="Ask the AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button
              onClick={sendMessage}
              className="px-8 bg-cyan-500 hover:bg-cyan-400 font-semibold"
            >
              Send
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}