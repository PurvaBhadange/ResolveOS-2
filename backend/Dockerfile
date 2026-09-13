FROM python:3.11-slim

WORKDIR /app

# Set python path environment variable
ENV PYTHONPATH=/app


# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements & install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose port
EXPOSE 8000

# Start Uvicorn server after seeding database
CMD ["sh", "-c", "python app/seed/seed_data.py && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

