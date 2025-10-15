# LinguaFlow - Live Translation Editor

LinguaFlow is a streamlined, AI-powered live translation editor. It provides a simple and focused interface for translating text segments with high fidelity, leveraging powerful AI models for quick and accurate results.

## Architecture

LinguaFlow is a lightweight Next.js application.

- **Frontend**: Built with Next.js App Router, React, TypeScript, and styled with Tailwind CSS and [shadcn/ui](https://ui.shadcn.com/). It provides a real-time, segment-by-segment translation interface.
- **AI**: Uses Genkit to connect to Google's Gemini models for translation and suggestions.

## Core Features

- **Live Translation**: Enter text, select languages, and get an instant AI translation.
- **AI-Powered Suggestions**: Get suggestions to improve the fluency and accuracy of your translations.
- **Glossary Highlighting**: Pre-defined glossary terms are automatically highlighted in the source text to ensure consistency.
- **Clean, Focused UI**: A single-page application designed for an efficient translation workflow.

## Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **Google AI API Key** (for Genkit LLM functionality).

### Local Development Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/linguaflow.git
    cd linguaflow
    ```

2.  **Set up environment variables:**

    Copy the example environment file.
    ```bash
    cp .env.example .env
    ```
    Open `.env` and add your Google AI API key.

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

## Project Structure

```
LinguaFlow/
├── src/                # Next.js frontend application
│   ├── app/            # App Router pages and layouts
│   ├── components/     # React components
│   ├── lib/            # Actions, types, and constants
│   └── ai/             # Genkit flows
├── public/
├── .env.example        # Frontend environment variables
└── package.json
```
