import google.generativeai as genai
import os
from flask import request, jsonify
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Initialize Gemini model
model = genai.GenerativeModel("models/gemini-1.5-flash-latest")


def generate_chat_response(user_message, conversation_history=None):
    """
    Generate a response using Gemini AI based on user message and conversation history
    """
    try:
        # Prepare the conversation context
        if conversation_history:
            # Format conversation history for Gemini
            context = ""
            for msg in conversation_history[-10:]:  # Keep last 10 messages for context
                role = "user" if msg.get("role") == "user" else "assistant"
                content = msg.get("content", "")
                context += f"{role}: {content}\n"
            
            # Add current user message
            full_prompt = f"{context}user: {user_message}\nassistant:"
        else:
            full_prompt = f"user: {user_message}\nassistant:"

        # Generate response using Gemini
        response = model.generate_content(full_prompt)
        
        if response.text:
            return {
                "success": True,
                "response": response.text.strip(),
                "model": "gemini-pro"
            }
        else:
            return {
                "success": False,
                "error": "No response generated from Gemini"
            }
            
    except Exception as e:
        logger.error(f"Error generating chat response: {str(e)}")
        return {
            "success": False,
            "error": f"Error generating response: {str(e)}"
        }

def chat_endpoint():
    """
    Main chat endpoint that handles POST requests
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                "success": False,
                "error": "Message is required"
            }), 400
        
        user_message = data['message']
        conversation_history = data.get('conversation_history', [])
        
        if not user_message.strip():
            return jsonify({
                "success": False,
                "error": "Message cannot be empty"
            }), 400
        
        # Generate response
        result = generate_chat_response(user_message, conversation_history)
        
        if result["success"]:
            return jsonify({
                "success": True,
                "response": result["response"],
                "model": result["model"]
            })
        else:
            return jsonify({
                "success": False,
                "error": result["error"]
            }), 500
            
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}"
        }), 500
