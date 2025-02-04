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

def get_document(db):
    doc_ref = db.collection("users").document("DOUd4fCGm572MDHQsnKO")

    doc = doc_ref.get()
    if doc.exists:
        print(f"Document data: {doc.to_dict()}")
    else:
        print("No such document!")

if __name__ == "__main__":
    db = init_firestore_client()
    document = get_document(db)