(() => {
  const { useState } = React;

  function App() {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const ask = async () => {
      if (!query.trim()) {
        setError("Please enter a question.");
        setResponse("");
        return;
      }

      setLoading(true);
      setError("");
      setResponse("Thinking...");

      try {
        const res = await fetch("/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query.trim() })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        setResponse(data.response || "");
      } catch (err) {
        setResponse("");
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        ask();
      }
    };

    return React.createElement(
      "div",
      { id: "container" },
      React.createElement(
        "div",
        { className: "header" },
        React.createElement("h1", null, "🧠 Memora")
      ),
      React.createElement("p", { className: "subtitle" }, "Ask a question and I will recall your memories."),
      React.createElement(
        "div",
        { className: "input-row" },
        React.createElement("input", {
          type: "text",
          placeholder: "Ask something...",
          value: query,
          onChange: (e) => setQuery(e.target.value),
          onKeyDown: handleKeyDown,
          disabled: loading
        }),
        React.createElement(
          "button",
          { onClick: ask, disabled: loading },
          loading ? "Thinking..." : "Ask"
        )
      ),
      React.createElement(
        "div",
        { id: "response", className: error ? "error" : "" },
        error ? error : response
      )
    );
  }

  const rootEl = document.getElementById("root");
  const root = ReactDOM.createRoot(rootEl);
  root.render(React.createElement(App));
})();

