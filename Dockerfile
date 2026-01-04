# Use Python slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy backend files
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 5000
EXPOSE 5000

# Run Flask app
CMD ["python", "app.py"]
