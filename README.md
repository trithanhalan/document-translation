# LinguaFlow - Document Translation Framework

Welcome to LinguaFlow, a modern, AI-powered document translation framework built with Next.js and Firebase Genkit. This application provides a seamless interface for translating text segments, leveraging powerful language models for accuracy and offering tools for post-editing and review.

## Architecture

LinguaFlow is a full-stack Next.js application that uses server components and server actions to interact with Google's generative AI models via Firebase Genkit.

- **Frontend**: Built with Next.js App Router, React, TypeScript, and styled with Tailwind CSS and [shadcn/ui](https://ui.shadcn.com/).
- **AI Backend**: Powered by [Firebase Genkit](https://firebase.google.com/docs/genkit), which orchestrates calls to Google's AI models (e.g., Gemini) for translation and content suggestions.
- **Styling**: A clean, modern UI with a professional color palette and typography, designed for a great user experience.
- **State Management**: Primarily uses React's built-in hooks (`useState`, `useEffect`, `useTransition`) for managing component state and server action pending states.

## Core Features

- **Segment-based Translation**: The document is split into manageable segments, which can be translated individually.
- **AI-Powered Translation**: Utilizes a Genkit flow that calls a powerful Large Language Model for high-quality translations.
- **AI-Powered Editing Suggestions**: Get suggestions from an AI to improve and refine translations.
- **Document Context Summary**: Generate a summary of the entire document to provide context for translators.
- **Glossary Highlighting**: Automatically highlights predefined glossary terms in the source text.
- **Interactive Post-Edit UI**: A user-friendly interface to view source text and edit the machine-generated translations.
- **HTML Export**: Export the final translation to a simple HTML file.
- **Responsive Design**: The application is fully responsive and works on desktop and mobile devices.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later)
- [Firebase Account](https://firebase.google.com/) and a Firebase project.
- A Google AI API key.

### Local Development Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env.local
    ```

    Open `.env.local` and add your Google AI API key:
    ```
    GOOGLE_GENAI_API_KEY=your_google_api_key_here
    ```

4.  **Run the Genkit developer UI (optional):**

    In a separate terminal, run the following command to start the Genkit developer UI, which allows you to inspect and test your AI flows.
    ```bash
    npm run genkit:watch
    ```
    Navigate to `http://localhost:4000` in your browser.

5.  **Run the Next.js development server:**
    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:9002`.

### Building for Production

To create a production-ready build of the application, run:
```bash
npm run build
```

To start the production server, run:
```bash
npm start
```

## Project Structure

```
LinguaFlow/
├── src/
│   ├── ai/             # Genkit AI flows
│   ├── app/            # Next.js App Router (pages and layouts)
│   ├── components/     # Reusable React components
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utility functions, types, actions, and data
├── .env.local          # Local environment variables (gitignored)
├── next.config.ts      # Next.js configuration
├── package.json        # Project dependencies and scripts
└── tailwind.config.ts  # Tailwind CSS configuration
```

## How It Works

The application loads a sample document from `src/lib/data.ts`. The main view (`TranslationView`) splits the document into segments. Each segment is managed by a `SegmentEditor` component, which allows the user to:

1.  Click **"Translate"** to trigger a server action that calls the `translateWithLLMFallback` Genkit flow.
2.  Edit the returned translation in a textarea.
3.  Click **"Suggest Edits"** to get AI-powered improvements on the current translation.

The sidebar provides document-level actions like language selection, context summarization, and exporting the final work.
