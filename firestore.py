import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
import pandas as pd
from google.cloud import firestore
from google.cloud.firestore_v1 import aggregation
from google.cloud.firestore_v1.base_query import FieldFilter


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

def add_new_document(db, data, collection_name):
    """Adds a new document with an auto generated document id"""
    
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

def save_movie_titles(db):
    """Saves the cleaned IMDb movie dataset to the movie colection in firestore"""
    
    try:
        df = pd.read_csv("../input_data/final_cleaned_IMDb_dataset.csv") # run python
    except:
        "File not found"
    try:
        df = pd.read_csv("input_data/final_cleaned_IMDb_dataset.csv", on_bad_lines="skip") # debugging
    except:
        "File not found"
    column_names = df.columns
    data = []
    print(type(df))
    print(df)
    movie_titles = df['movie title']
    for movie in movie_titles:
        data = {"movie_title": f"{movie}"}
        print(data)
        add_new_document(db, data, "movies")

def save_genres():
    

    # try:
    #     with open("../input_data/final_cleaned_IMDb_dataset.csv", "r", encoding="utf-8") as file:
    #         lines = file.readlines()
    # except Exception as e:
    #     raise RuntimeError(f'Error reading the file: {e}')

    # try:
    #     with open("input_data/final_cleaned_IMDb_dataset.csv", "r", encoding="utf-8") as file:
    #         lines = file.readlines()
    # except Exception as e:
    #     raise RuntimeError(f'Error reading the file: {e}')

if __name__ == "__main__":
    data = {"id": "1234-5678", "first_name": "John", "last_name": "Doe"}


    create_count_query('free2memovies', 'movies')

    db = init_firestore_client()
    # add_document(db, data, collection_name, document_id)
    # document = get_document(db, collection_name, document_id)

    # add_new_document(db, user, collection_name)

    # save_movie_titles(db) # don't run, will save all movie titles to db and run out of daily document saves
    
    # df = pd.read_csv("../input_data/final_cleaned_IMDb_dataset.csv") # run python
    # for row in df:
    #     print(row)

