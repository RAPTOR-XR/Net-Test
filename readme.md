### Run the project

```
$ virtualenv venv
$ source venv/bin/activate
$ pip3 install -r requirements.txt 
$ python3 manage.py makemigrations network
$ python3 manage.py migrate network 
$ python3 manage.py runserver