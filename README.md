
# CivicMind AI reasoning Assistant

A specialized learning tool for civic exams that focuses on decoding institutional logic rather than rote memorization.

## Features
- **3-Question Demo Flow**: Walk through core civic concepts with immediate feedback.
- **Deep Reasoning Analysis**: AI-powered breakdown of institutional logic for every question.
- **Conceptual Trap Identification**: Learn how questions are designed to mislead.
- **Session Blueprint**: Comprehensive analysis of your reasoning patterns after the practice session.
- **Targeted Practice**: AI-generated questions based on your identified weaknesses.

## Tech Stack
- **Frontend**: React (v19) + Tailwind CSS
- **AI Engine**: Google Gemini 3 Flash Preview
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
