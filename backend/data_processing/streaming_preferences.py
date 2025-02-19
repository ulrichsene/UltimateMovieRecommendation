import firebase_admin
from firebase_admin import credentials, firestore
import json

def init_firestore_client():
    """Initialize Firestore client using service account credentials."""
    cred = credentials.ApplicationDefault()  # Ensure this file exists
    firebase_admin.initialize_app(cred)

    return firestore.client()

def get_document(db, collection, document_id):
    """Retrieve a document from Firestore."""
    doc_ref = db.collection(collection).document(document_id)
    doc = doc_ref.get()

    if doc.exists:
        print(f"Document data: {doc.to_dict()}")
        return doc.to_dict()
    else:
        print("No such document!")
        return None

def add_document(db, data, collection, document_id):
    """Creates or updates a document with the specified ID."""
    db.collection(collection).document(document_id).set(data)
    print(f"Document {document_id} updated in {collection}.")

def add_new_document(db, data, collection):
    """Adds a new document with an auto-generated document ID."""
    update_time, ref = db.collection(collection).add(data)
    print(f"Added document with ID {ref.id}")

def save_streaming_preferences(user):
    """Saves user streaming preferences to Firestore."""
    db = init_firestore_client()
    
    user_id = user.get("id")
    streaming_services = user.get("streaming_services")

    if not user_id or not streaming_services:
        print("Error: Missing userID or streaming services.")
        return
    
    data = {
        "userID": user_id,
        "streamingServices": streaming_services
    }
    
    add_document(db, data, "users", user_id)
    print(f"Preferences for user {user_id} saved successfully.")

if __name__ == "__main__":
    # Example user data
    user = {"id": "3234-4389", "streaming_services": ["Netflix", "Hulu", "Disney+", "Amazon Prime Video"]}

    # Save preferences
    save_streaming_preferences(user)

    # Retrieve and print stored data
    db = init_firestore_client()
    get_document(db, "users", user["id"])
