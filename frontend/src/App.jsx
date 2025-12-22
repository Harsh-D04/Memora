import React, { useState, useRef, useEffect } from "react";

const API_BASE = "http://127.0.0.1:5000";

function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! Ask me anything and I'll recall your memories." }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const ask = async () => {
    if (!query.trim() || loading) return;

    const userMessage = { role: "user", text: query.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.text })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      const botMessage = { role: "assistant", text: data.response || "(no response)" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(err.message || "Unexpected error");
      const botMessage = { role: "assistant", text: "Sorry, I hit an error." };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      ask();
    }
  };

  return (
    <div id="chat-shell">
      <div className="header">
        <h1>🧠 Memora</h1>
        <p className="subtitle">Two-way chat with your recalled memories.</p>
      </div>

      <div className="chat-window" ref={listRef}>
        {messages.map((m, idx) => (
          <div key={idx} className={`bubble ${m.role === "user" ? "user" : "assistant"}`}>
            <span className="author">{m.role === "user" ? "You" : "Memora"}</span>
            <span className="text">{m.text}</span>
          </div>
        ))}
      </div>

      <div className="input-row">
        <input
          type="text"
          placeholder="Type a message..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button onClick={ask} disabled={loading}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}

export default App;


