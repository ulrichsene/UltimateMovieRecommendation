import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
import pandas as pd
from google.cloud import firestore
from google.cloud.firestore_v1 import aggregation
from google.cloud.firestore_v1.base_query import FieldFilter
from ast import literal_eval

def init_firestore_client():
    # Application Default credentials are automatically created.
    cred = credentials.ApplicationDefault()

    firebase_admin.initialize_app(cred)
    db = firestore.Client() 
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

def save_movies(db, df, start=0, end=None):
    column_names = list(df.columns)
    data_list = []

    if end is None:
        end = len(df)
        
    for i in range(start, end):
        row_data = {}
        for column_name in column_names:
            value = df[column_name].iloc[i]

            # convert value to list if needed
            if isinstance(value, str) and value.startswith('['):
                value = literal_eval(value)

            row_data[column_name] = value
        data_list.append(row_data)
        print(row_data)
    
if __name__ == "__main__":
    data = {"id": "1234-5678", "first_name": "John", "last_name": "Doe"}

    # initialize database and load dataframe
    db = init_firestore_client()
    df = load_data()