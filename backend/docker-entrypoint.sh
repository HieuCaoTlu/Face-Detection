#!/bin/sh

# Apply database migrations
python manage.py makemigrations api
python manage.py migrate

exec "$@"
