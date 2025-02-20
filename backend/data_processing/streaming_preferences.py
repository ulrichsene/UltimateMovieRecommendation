import firebase_admin
from firebase_admin import credentials, firestore
import json
import utils

def save_streaming_preferences(user):
    """Saves user streaming preferences to Firestore."""
    db = utils.init_firestore_client()
    
    user_id = user.get("id")
    streaming_services = user.get("streaming_services")

    if not user_id or not streaming_services:
        print("Error: Missing userID or streaming services.")
        return
    
    data = {
        "userID": user_id,
        "streamingServices": streaming_services
    }
    
    utils.add_document(db, data, "users", user_id)
    print(f"Preferences for user {user_id} saved successfully.")

if __name__ == "__main__":
    # Example user data
    user = {"id": "3234-4389", "streaming_services": ["Netflix", "Hulu", "Disney+", "Amazon Prime Video"]}

    # Save preferences
    save_streaming_preferences(user)

    # Retrieve and print stored data
    db = utils.init_firestore_client()
    utils.get_document(db, "users", user["id"])
