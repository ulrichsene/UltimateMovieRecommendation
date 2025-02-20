import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
import pandas as pd
from google.cloud import firestore
from google.cloud.firestore_v1 import aggregation
from google.cloud.firestore_v1.base_query import FieldFilter
from ast import literal_eval
import utils

def init_firestore_client():
    # Application Default credentials are automatically created.
    cred = credentials.ApplicationDefault()

    firebase_admin.initialize_app(cred)
    db = firestore.Client() 
    return db

def save_movies(db, df, start=0, end=None):
    column_names = list(df.columns)

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
        utils.add_new_document(db, row_data, 'movies')
    
if __name__ == "__main__":

    # initialize database and load dataframe
    db = init_firestore_client()
    df = utils.load_data()