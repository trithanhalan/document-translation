# LinguaFlow - Production-Grade Document Translation Framework

LinguaFlow is a comprehensive, AI-powered document translation framework designed for professional use cases. It provides a robust pipeline for ingesting documents (PDF, DOCX, TXT), translating them with high fidelity, and enabling post-translation review and editing. This version has been refactored for scalability and robustness, incorporating a Python FastAPI backend and a sophisticated document processing engine.

## Architecture

LinguaFlow is a decoupled, full-stack application. The frontend is a Next.js application, while the backend is a Python-based FastAPI service, designed to be containerized and deployed independently.

- **Frontend**: Built with Next.js App Router, React, TypeScript, and styled with Tailwind CSS and [shadcn/ui](https://ui.shadcn.com/). It handles user authentication, file uploads, and the post-edition user interface.
- **Backend**: A powerful FastAPI application that exposes endpoints for document processing. It includes modules for:
    - **Orchestration**: Manages the end-to-end translation workflow.
    - **Preprocessing**: Uses `PyMuPDF` for robust text and layout extraction from PDFs and DOCX files.
    - **OCR**: `pytesseract` is used as a fallback to extract text from image-based documents.
    - **Glossary Management**: A SQLite-based termbase ensures terminology consistency, manageable via a CLI.
    - **Translation**: A hybrid approach using local Hugging Face Marian models for speed and cost-effectiveness, with a Genkit-powered LLM fallback for quality.
    - **Document Reassembly**: Creates translated DOCX and PDF files while preserving the original layout.
- **Database**: Firestore is used to manage translation task state, progress, and metadata.
- **Storage**: Firebase Cloud Storage is used for securely storing original and translated documents.
- **Deployment**: The frontend is optimized for Vercel, and the backend is containerized with Docker for easy deployment on services like Google Cloud Run.

## Core Features

- **End-to-End Document Workflow**: Upload a document, track its progress through a multi-stage pipeline, and download the translated version.
- **Hybrid Translation Engine**: Combines the speed of local NMT models (Helsinki-NLP) with the power of large language models.
- **Format Preservation**: Advanced document parsing and reassembly for DOCX and PDF files to maintain layout and styling.
- **OCR Fallback**: Automatically extracts text from scanned documents or PDFs without a text layer.
- **Glossary Enforcement**: Ensures that technical or brand-specific terms are translated correctly every time.
- **Interactive Post-Edit UI**: A segment-by-segment review interface to compare source and target text, make edits, and get AI-powered suggestions.
- **Secure and Scalable**: Decoupled architecture, secure Firebase rules, and containerized backend ready for cloud deployment.
- **Automated Evaluation**: Includes scripts to evaluate translation quality using sacreBLEU and terminology consistency metrics.

## Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **Python** (v3.9 or later)
- **Docker** and **Docker Compose**
- **Firebase Account** and a Firebase project with Firestore and Storage enabled.
- **Google AI API Key** (for Genkit LLM fallback).
- **Tesseract OCR Engine**: Install on your local machine (`brew install tesseract` on macOS, `sudo apt-get install tesseract-ocr` on Debian/Ubuntu).

### Local Development Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/linguaflow.git
    cd linguaflow
    ```

2.  **Set up environment variables:**

    Copy the example environment files for both the frontend and backend.
    ```bash
    cp .env.example .env
    cp backend/.env.example backend/.env
    ```
    Open `.env` and `backend/.env` to add your Firebase project configuration and Google AI API key.

3.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

4.  **Set up Backend Environment:**
    ```bash
    python3 -m venv backend/venv
    source backend/venv/bin/activate
    pip install -r backend/requirements.txt
    ```

5.  **Run the Complete System with Docker Compose:**

    This is the recommended way to run the entire stack, including the FastAPI backend and any other services.
    ```bash
    docker-compose up --build
    ```
    - The Next.js frontend will be available at `http://localhost:9002`.
    - The FastAPI backend will be available at `http://localhost:8000`.

6.  **Run Frontend and Backend Separately (Alternative):**

    *   **Terminal 1: Run the Backend**
        ```bash
        source backend/venv/bin/activate
        uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
        ```
    *   **Terminal 2: Run the Frontend**
        ```bash
        npm run dev
        ```

### Building for Production

-   **Frontend (Next.js):**
    ```bash
    npm run build
    ```
-   **Backend (Docker):**
    The backend is designed to be deployed as a Docker container. Refer to `deploy_cloud_run.md` for instructions.

## Project Structure

```
LinguaFlow/
├── backend/            # FastAPI backend application
│   ├── src/            # Python source code for the backend
│   ├── tests/          # Pytest tests for the backend
│   ├── Dockerfile
│   └── requirements.txt
├── src/                # Next.js frontend application
│   ├── app/            # App Router pages and layouts
│   ├── components/     # React components
│   └── lib/            # Actions, types, and constants
├── public/
├── .env.example        # Frontend environment variables
├── docker-compose.yml  # Docker Compose for local development
├── firebase.json       # Firebase configuration
├── firestore.rules     # Firestore security rules
├── storage.rules       # Cloud Storage security rules
└── package.json
```