
# CivicMind AI Reasoning Assistant

A specialized learning tool for civic exams that focuses on decoding institutional logic rather than rote memorization.

## Gemini Integration

CivicMind transforms civic education by leveraging the **Gemini 3 Pro** model as a sophisticated reasoning engine. Rather than simply providing answers, the application uses **Gemini 3 Pro** to perform a "Logic Audit," decoding the institutional rationale behind French civic exam questions. It identifies "conceptual traps" and "tested principles," providing learners with a deep understanding of the legal and cultural bridge between intuition and institutional logic.

The integration is highly adaptive: Gemini 3 Pro analyzes a user's entire session history to detect recurring reasoning gaps. This enables the **Targeted Challenge** feature, where the model synthesizes brand-new, unique scenarios specifically designed to bridge identified weaknesses. This move from static content to dynamically generated, context-aware challenges is only possible due to Gemini's advanced reasoning and high-fidelity instruction following.

Furthermore, **Gemini 2.5 Flash** powers the multi-modal experience. The `gemini-2.5-flash-image` model generates cinematic visual context for every question, while the `gemini-2.5-flash-preview-tts` model provides a high-quality "Voice Assist" feature. By utilizing structured JSON outputs via `responseSchema` and `Type.OBJECT` definitions, the application ensures that these complex AI insights are rendered in a deterministic, high-performance, and responsive user interface.

## Features
- **3-Question Demo Flow**: Walk through core civic concepts with immediate feedback.
- **Deep Reasoning Analysis**: AI-powered breakdown of institutional logic for every question.
- **Conceptual Trap Identification**: Learn how questions are designed to mislead.
- **Session Blueprint**: Comprehensive analysis of your reasoning patterns after the practice session.
- **Targeted Practice**: AI-generated questions based on your identified weaknesses.

## Tech Stack
- **Frontend**: React (v19) + Tailwind CSS
- **AI Engine**: Google Gemini 3 Pro Preview
- **Logic Engine**: Client-side Gemini SDK (@google/genai)

## Getting Started
1. Obtain a Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
2. Create a `.env` file in the root directory (or ensure the environment variable is available).
3. `process.env.API_KEY` must be set to your key.

## Setup steps
1. Clone this project.
2. Run `npm install` (or equivalent if using a static server).
3. Ensure your local environment provides the `API_KEY`.
4. Open `index.html` in a modern browser.
