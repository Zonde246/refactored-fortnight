# Refactored-Fortnight

Is just a random name

# How to run the code

## DEPENDENCIES

Python >= 3.10.6

Django, Djangorestframework,pymupdf

Use

```
pip install django djangorestframework pymupdf
```

```
.
├── Backend
│   ├── asgi.py
│   ├── __init__.py
│   ├── __pycache__
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── check
│   ├── admin.py
│   ├── apps.py
│   ├── __init__.py
│   ├── migrations
│   ├── models.py
│   ├── __pycache__
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── db.sqlite3
├── manage.py
├── readme.md
└── uploads
    └── pdfs
```

Change to the root directory and run `python manage.py runserver`

This will start the Django server. Now, Right now there is no UI created. and hence we need to use the CLI to test the code.

Use the following and replace "YOURFILE" with the name of your file.

```
curl -X POST -F "file=@YOURFILE.pdf" http://127.0.0.1:8000/api/upload/
```
