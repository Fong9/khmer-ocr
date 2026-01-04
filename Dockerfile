# Use official Python image
FROM python:3.13-slim

# Install system dependencies including Tesseract and Khmer language
RUN apt-get update && \
    apt-get install -y tesseract-ocr tesseract-ocr-khm libtesseract-dev && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Expose port
EXPOSE 5000

# Run the Flask app
CMD ["python", "app.py"]
