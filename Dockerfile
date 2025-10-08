# Use the official Python image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install Tesseract OCR and other system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Copy backend-specific files
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend source code
COPY backend/ .

# Expose the port the app runs on
EXPOSE 8000

# Set the command to run the application
# Use 0.0.0.0 to be accessible from outside the container
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

    