import pandas as pd
from google.cloud import firestore
from google.cloud.firestore_v1 import aggregation
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

def init_firestore_client():
    # Application Default credentials are automatically created.
    if not firebase_admin._apps:
        # Use Application Default Credentials
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    return db


def load_data():
    """Loads the cleaned IMDb dataset into a df"""
    try:
        df = pd.read_csv("../input_data/final_cleaned_IMDb_dataset.csv") # run python
        return df
    except:
        "File not found"
    try:
        df = pd.read_csv("input_data/final_cleaned_IMDb_dataset.csv", on_bad_lines="skip") # debugging
        return df
    except:
        "File not found"

def get_documents(db, collection_name, limit=None):
    """Returns all documents in the specified collection, returns all unless a limit is provided"""
    if limit:
        docs = db.collection(collection_name)
        query = docs.limit_to_last(limit)
        results = query.get()

        for doc in results:
            print(f"{doc.id} => {doc.to_dict()}")
        return results
    
    else:
        docs = db.collection(collection_name).stream()
        for doc in docs:
            print(f"{doc.id} => {doc.to_dict()}")

        return results

def get_document(db, collection, document_id):
    """Returns the document with the specified id"""
    doc_ref = db.collection(collection).document(document_id)

    doc = doc_ref.get()
    if doc.exists:
        print(f"Document data: {doc.to_dict()}")
        return doc
    else:
        print("No such document!")

def add_document(db, data, collection, document_id):
    """Creates or updates a document with the specified ID"""
    # add a new doc in collection with document id, if the document exists already updates the information to the provided data 
    db.collection(collection).document(document_id).set(data)

def add_new_document(db, data, collection_name):
    """Adds a new document with an auto generated document ID"""
    
    update_time, ref = db.collection(collection_name).add(data)
    print(f"Added document with id {ref.id}")

def create_count_query(project_id: str, collection_name) -> None:
    """Builds an aggregate query that returns the number of results in the query.

    Arguments:
      project_id: your Google Cloud Project ID
    """
    client = firestore.Client(project=project_id)

    collection_ref = client.collection(collection_name)
    query = collection_ref.select([])
    aggregate_query = aggregation.AggregationQuery(query)

    # `alias` to provides a key for accessing the aggregate query results
    aggregate_query.count(alias="all")

    results = aggregate_query.get()
    for result in results:
        print(f"Alias of results from query: {result[0].alias}")
        print(f"Number of results from query: {result[0].value}")