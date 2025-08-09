# main.py
from flask import Flask
from flask_cors import CORS
from summarizer import summarizer_bp
# Later: from chatbot import chatbot_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(summarizer_bp)
# app.register_blueprint(chatbot_bp)  # when ready

if __name__ == "__main__":
    app.run(port=5000, debug=True)
