from flask import Flask, request, jsonify
from flask_cors import CORS
from main2 import generate_response

app = Flask(__name__)
CORS(app, resources={r"/ask": {"origins": "*"}})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "status": "ok",
        "message": "Memora API",
        "endpoints": {
            "health": "/health",
            "ask": "POST /ask"
        }
    })


@app.route("/ask", methods=["GET", "POST"])
def ask():
    if request.method == "GET":
        return jsonify(
            {
                "message": "Use POST with JSON: { \"query\": \"...\" } to get a response.",
                "example": {"query": "hello"},
            }
        )

    data = request.get_json()
    if not data or "query" not in data:
        return jsonify({"error": "Missing 'query' in request"}), 400

    user_query = data["query"]
    try:
        answer = generate_response(user_query)
        return jsonify({"response": answer})
    except Exception as e:
        # Log server-side; return generic error to client
        print("Error in /ask:", e)
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    # Backend API only; frontend runs separately
    app.run(host="0.0.0.0", port=5000, debug=True)
