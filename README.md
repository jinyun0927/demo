
# CivicMind AI: Institutional Reasoning Auditor

A next-generation learning platform for civic exams, built for the **Gemini 3 Global Hackathon**.

## Hackathon Features

### 1. Deep Audit with Gemini 3 Pro Reasoning
We leverage **Gemini 3 Pro Preview** to go beyond simple text explanations. The "Institutional Auditor" performs a high-fidelity audit of the user's logic, identifying "Conceptual Traps" and "tested principles."

### 2. Live Legal Clinic (Multimodal Native Audio)
Using the **Gemini Live API** (`gemini-2.5-flash-native-audio-preview-12-2025`), we've created a real-time, voice-to-voice reasoning partner. Users can vocalize their logic, and Gemini listens and corrects institutional reasoning gaps with ultra-low latency.

### 3. Google Search Grounding
To ensure our legal advice is never stale, the auditor is grounded in real-time data using the `googleSearch` tool. It automatically verifies current French jurisprudence before issuing its audit report.

### 4. Mnemonic Synthesis
Scenario illustrations are generated at runtime using **Gemini 2.5 Flash Image**, creating high-fidelity visual context for abstract legal concepts.

## Tech Stack
- **AI Models**: Gemini 3 Pro (Reasoning), Gemini 2.5 Flash (Multimodal/Speed), Native Audio (Live API).
- **Core**: React 19, Tailwind CSS, Lucide Icons.
- **Tools**: Google Search Grounding.
