import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials

def init_firestore_client():
    # Application Default credentials are automatically created.
    cred = credentials.ApplicationDefault()

    firebase_admin.initialize_app(cred)
    db = firestore.client() 
    return db

def get_document(db, collection, document_id):
    doc_ref = db.collection(collection).document(document_id)

    doc = doc_ref.get()
    if doc.exists:
        print(f"Document data: {doc.to_dict()}")
    else:
        print("No such document!")

def add_document(db, data, collection, document_id):
    """Creates or updates a document with the specified ID"""
    # add a new doc in collection with document id, if the document exists already updates the information to the provided data 
    db.collection(collection).document(document_id).set(data)

def add_new_document(db, data, collection):
    """Adds a new document with an auto generated document id"""
    
    ref = db.collection(collection_name).add(data)
    print(f"Added document with id {ref.id}")

if __name__ == "__main__":
    data = {"id": "1234-5678", "first_name": "John", "last_name": "Doe"}
    user = {"id": "3234-4389", "first_name": "Marisa", "last_name": "Luis"}
    
    collection_name = "users"
    document_id = "DOUd4fCGm572MDHQsnKO"

    db = init_firestore_client()
    add_document(db, data, collection_name, document_id)
    document = get_document(db, collection_name, document_id)

    add_new_document(db, user, collection_name)



