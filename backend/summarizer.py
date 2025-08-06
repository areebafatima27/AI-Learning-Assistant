# backend/summarizer.py
from flask import Flask, request, jsonify
from transformers import pipeline
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend to talk to this API

# Load summarization pipeline (uses free HuggingFace model)
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

@app.route("/api/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400

    summary = summarizer(text, max_length=150, min_length=30, do_sample=False)[0]["summary_text"]
    return jsonify({"summary": summary})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
