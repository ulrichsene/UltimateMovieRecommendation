""""Stores all information about movies from the IMDB databset in the movies collection in firestore"""
from ast import literal_eval
import utils

def store_movies(db, df, start=0, end=None):
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
    db = utils.init_firestore_client()
    df = utils.load_data()