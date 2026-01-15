
import { GoogleGenAI, Type } from "@google/genai";
import { Question, AIReasoning, UserAttempt, SessionAnalysis } from "../types";

const SYSTEM_INSTRUCTION_BASE = `
You are an AI reasoning assistant for civic exams. 
Focus on decoding logic, identifying conceptual traps, and explaining institutional reasoning.
Output ONLY valid JSON matching the provided schema. Do not include markdown code blocks or any text outside the JSON.
`;

const checkApiKey = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. The application requires process.env.API_KEY to function.");
  }
};

export const analyzeQuestion = async (
  question: Question,
  selectedOptionId: string
): Promise<AIReasoning> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const selectedOption = question.options.find(o => o.id === selectedOptionId);
  const correctOption = question.options.find(o => o.id === question.correctOptionId);

  const prompt = `
    Analyze this civic exam question and the learner's response:
    Question: ${question.text}
    Options: ${JSON.stringify(question.options)}
    Learner Selected: ${selectedOption?.text} (ID: ${selectedOptionId})
    Correct Answer: ${correctOption?.text} (ID: ${question.correctOptionId})
    
    Provide a JSON object with:
    1. explanation: Institutional reasoning for the correct answer.
    2. conceptualTrap: The specific distractor logic used.
    3. testedPrinciple: The core legal or civic principle.
    4. learnerPerspective: Why a student might choose the wrong answer (confusing personal intuition vs obligation).
    5. misleadingLanguage: Any subtle wording nuances or specific linguistic traps.
    6. patternAnalysis: Why this specific category of question is often misunderstood by learners.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            conceptualTrap: { type: Type.STRING },
            testedPrinciple: { type: Type.STRING },
            learnerPerspective: { type: Type.STRING },
            misleadingLanguage: { type: Type.STRING },
            patternAnalysis: { type: Type.STRING }
          },
          required: ["explanation", "conceptualTrap", "testedPrinciple"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI engine.");
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini analyzeQuestion error:", error);
    throw error;
  }
};

export const analyzeSession = async (
  questions: Question[],
  attempts: UserAttempt[]
): Promise<SessionAnalysis> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const historyData = attempts.map(a => {
    const q = questions.find(qu => qu.id === a.questionId);
    return {
      questionId: a.questionId,
      category: q?.category,
      text: q?.text,
      isCorrect: a.isCorrect,
      userChoice: q?.options.find(o => o.id === a.selectedOptionId)?.text,
      correctChoice: q?.options.find(o => o.id === q.correctOptionId)?.text
    };
  });

  const prompt = `
    Conduct a "Civic Logic Audit" for this learner based on their performance:
    Session History: ${JSON.stringify(historyData)}

    Your task is to decode their reasoning gaps across these scenarios and generate a targeted practice question.
    
    Required JSON Schema:
    {
      "overallAssessment": "String summary of their institutional logic patterns",
      "weakAreas": [
        { "area": "Category Name", "evidenceQuestionIds": [1], "description": "Specific reasoning gap found" }
      ],
      "errorPatterns": "Specific description of recurring logical errors (e.g. intuitive vs procedural)",
      "recommendedFocus": "Actionable advice for the next stage of study",
      "nextPractice": {
        "id": 999,
        "category": "Targeted Topic",
        "text": "The new question text",
        "options": [
          {"id": "a", "text": "Choice 1"},
          {"id": "b", "text": "Choice 2"},
          {"id": "c", "text": "Choice 3"},
          {"id": "d", "text": "Choice 4"}
        ],
        "correctOptionId": "a"
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallAssessment: { type: Type.STRING },
            weakAreas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  area: { type: Type.STRING },
                  evidenceQuestionIds: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                  description: { type: Type.STRING }
                },
                required: ["area", "evidenceQuestionIds", "description"]
              }
            },
            errorPatterns: { type: Type.STRING },
            recommendedFocus: { type: Type.STRING },
            nextPractice: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                category: { type: Type.STRING },
                text: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING }
                    },
                    required: ["id", "text"]
                  }
                },
                correctOptionId: { type: Type.STRING }
              },
              required: ["id", "category", "text", "options", "correctOptionId"]
            }
          },
          required: ["overallAssessment", "weakAreas", "errorPatterns", "recommendedFocus", "nextPractice"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis generated by the AI.");
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini analyzeSession error:", error);
    throw error;
  }
};
