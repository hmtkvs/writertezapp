FROM python:3.10-slim

WORKDIR /app

# Copy API code
COPY ./app.py ./requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose API port
EXPOSE 8000

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Command to run the API server
CMD ["python", "app.py"]

# Note: This Dockerfile assumes you'll mount the readTexThesis directory
# when running the container. Example:
# docker run -p 8000:8000 -v /path/to/readTexThesis:/app/readTexThesis thesis-search-api 