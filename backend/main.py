# main.py
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from summarizer import summarizer_bp
from chatbot import chat_endpoint

# Load environment variables from .env file
try:
    load_dotenv()
    print("Environment variables loaded successfully")
except Exception as e:
    print(f"Warning: Could not load .env file: {e}")
    print("Make sure GEMINI_API_KEY is set in your environment")

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(summarizer_bp)

# Register chatbot endpoint
app.add_url_rule('/api/chat', 'chat', chat_endpoint, methods=['POST'])

if __name__ == "__main__":
    # Check if Gemini API key is available
    if not os.getenv('GEMINI_API_KEY'):
        print("ERROR: GEMINI_API_KEY not found in environment variables!")
        print("Please set GEMINI_API_KEY in your .env file or environment")
        exit(1)
    
    print("Starting Flask server with Gemini integration...")
    app.run(port=5000, debug=True)
