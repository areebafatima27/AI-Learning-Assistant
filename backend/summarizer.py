# summarizer.py
from flask import Blueprint, request, jsonify
from transformers import pipeline
import fitz  # PyMuPDF

# Create blueprint instead of full Flask app
summarizer_bp = Blueprint("summarizer", __name__)

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def chunk_text(text, max_tokens=1000):
    sentences = text.split('. ')
    chunks = []
    current_chunk = ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) < max_tokens:
            current_chunk += sentence + ". "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence + ". "
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks

@summarizer_bp.route("/api/summarize", methods=["POST"])
def summarize():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    filename = file.filename
    file_ext = filename.split('.')[-1].lower()

    try:
        if file_ext == "pdf":
            doc = fitz.open(stream=file.read(), filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
        elif file_ext == "txt":
            text = file.read().decode("utf-8")
        else:
            return jsonify({"error": "Unsupported file format. Only .pdf and .txt are allowed."}), 400
    except Exception as e:
        return jsonify({"error": f"Error reading file: {str(e)}"}), 500

    try:
        chunks = chunk_text(text)
        summaries = [summarizer(chunk, max_length=150, min_length=30, do_sample=False)[0]["summary_text"]
                     for chunk in chunks]
        full_summary = " ".join(summaries)
        return jsonify({"summary": full_summary})
    except Exception as e:
        return jsonify({"error": f"Summarization failed: {str(e)}"}), 500
