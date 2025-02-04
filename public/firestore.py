import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials

def init_firestore_client():
    # Application Default credentials are automatically created.
    cred = credentials.ApplicationDefault()

    firebase_admin.initialize_app(cred)
    db = firestore.client() 

if __name__ == "__main__":
    init_firestore_client()