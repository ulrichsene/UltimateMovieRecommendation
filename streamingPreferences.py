from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
import json

app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate("serviceAccountKey.json")  # Replace with your Firebase credentials file
firebase_admin.initialize_app(cred)

db = firestore.client()  # Initialize Firestore client

@app.route('/save_preferences', methods=['POST'])
def save_preferences():
    try:
        data = request.get_json()
        user_id = data.get("userID")
        streaming_services = data.get("streamingServices")

        if not user_id or not streaming_services:
            return jsonify({"error": "Missing userID or streamingServices"}), 400

        # Save to Firestore
        db.collection("user_preferences").document(user_id).set({
            "userID": user_id,
            "streamingServices": streaming_services
        })

        return jsonify({"message": "Preferences saved to Firestore!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
