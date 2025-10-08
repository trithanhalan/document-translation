# Use the official Python image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Set environment variables to manage cache
ENV HF_HOME=/app/.cache/huggingface
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface/models

# Create a non-root user
RUN useradd --create-home appuser
WORKDIR /home/appuser
USER appuser

# Copy only the requirements file to leverage Docker cache
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download and cache the translation models
# This runs as the 'appuser' so the cache is in the correct home directory
# Replace with the specific models your app uses.
RUN python -c "from transformers import MarianMTModel, MarianTokenizer; \
               models = ['Helsinki-NLP/opus-mt-en-de', 'Helsinki-NLP/opus-mt-en-fr', 'Helsinki-NLP/opus-mt-en-es']; \
               for model_name in models: \
                   print(f'Downloading {model_name}...'); \
                   MarianTokenizer.from_pretrained(model_name); \
                   MarianMTModel.from_pretrained(model_name); \
               print('Model downloads complete.')"

# Copy the rest of your application's code
WORKDIR /app
COPY --chown=appuser:appuser backend/ /app

# Expose the port the app runs on
EXPOSE 8000

# Specify the command to run on container startup
# Use Gunicorn for a production-ready server in a real deployment
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

    