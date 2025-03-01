FROM python:3.12.7-slim

WORKDIR /app
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entrypoint script từ thư mục backend vào container
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
