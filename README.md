# UltimateMovieRecomendation

Here is a link of our deployed website!
http://free2memovies.com/

Run pip install -r requirements.txt to install requirements 
To run flask app in debug mode run: **flask run --debug**
flask --app app run --debug
from the project directory

Runs locally on: http://127.0.0.1:5000


Steps for what to do if we make changes to our repo and want it to be reflected:
   
ssh root@24.199.119.69:8000
enter password (@49Sadie)
cd UltimateMovie..
source ./venv/bin/activate
git pull
pkill gunicorn
gunicorn --bind 0.0.0.0:8000 app:app --daemon
copy and paste the ip address into the browser + :8000