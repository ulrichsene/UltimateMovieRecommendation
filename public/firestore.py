import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials

def init_firestore_client():
    # Application Default credentials are automatically created.
    cred = credentials.ApplicationDefault()

    firebase_admin.initialize_app(cred)
    db = firestore.client() 
    return db

# class City:
#     def __init__(self, name, state, country, capital=False, population=0, regions=[]):
#         self.name = name
#         self.state = state
#         self.country = country
#         self.capital = capital
#         self.population = population
#         self.regions = regions

#     @staticmethod
#     def from_dict(source):
#         pass
#         # ...

#     def to_dict(self):
#         pass
#         # ...

#     def __repr__(self):
#         return f"City(\
#                 name={self.name}, \
#                 country={self.country}, \
#                 population={self.population}, \
#                 capital={self.capital}, \
#                 regions={self.regions}\
#             )"

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

if __name__ == "__main__":
    data = {"id": "1234-5678", "first_name": "John", "last_name": "Doe"}
    collection_name = "users"
    document_id = "DOUd4fCGm572MDHQsnKO"

    db = init_firestore_client()
    add_document(db, data, collection_name, document_id)
    document = get_document(db, collection_name, document_id)
