
import { GoogleGenAI, Type } from "@google/genai";
import { Question, AIReasoning, UserAttempt, SessionAnalysis } from "../types";

const SYSTEM_INSTRUCTION_BASE = `
You are an AI reasoning assistant for civic exams. 
Focus on decoding logic, identifying conceptual traps, and explaining institutional reasoning.
Output ONLY valid JSON matching the provided schema.
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
    1. explanation: Professional institutional reasoning in English.
    2. simplifiedExplanation: The same reasoning in very simple "Plain English" (B1 level).
    3. vocabulary: A list of 2-3 difficult terms from the question with simple definitions in English.
    4. conceptualTrap: The specific distractor logic used.
    5. testedPrinciple: The core legal or civic principle.
    6. misleadingLanguage: Specific linguistic traps.
    7. patternAnalysis: Common misunderstanding patterns for this category.
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
            simplifiedExplanation: { type: Type.STRING },
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  simpleDefinition: { type: Type.STRING }
                },
                required: ["term", "simpleDefinition"]
              }
            },
            conceptualTrap: { type: Type.STRING },
            testedPrinciple: { type: Type.STRING },
            learnerPerspective: { type: Type.STRING },
            misleadingLanguage: { type: Type.STRING },
            patternAnalysis: { type: Type.STRING }
          },
          required: ["explanation", "simplifiedExplanation", "vocabulary", "conceptualTrap", "testedPrinciple"]
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
  const isPerfect = attempts.every(a => a.isCorrect);
  
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

  if (isPerfect) {
    const masteryPrompt = `
      The learner has answered all previous questions correctly.
      Your role is NOT to praise, but to validate reasoning depth and check for hidden misconceptions.
      
      Session History: ${JSON.stringify(historyData)}

      Tasks:
      1. Reasoning validation: Explain what correct answers suggest about their institutional logic.
      2. Trap awareness: Identify common traps they avoided.
      3. Subtle boundary check: Introduce ONE subtle scenario testing the same concepts.
      4. Pedagogical framing: Explain why this check matters beyond a "full score".

      Output format (JSON only):
      {
        "overall_validation": "string",
        "avoided_traps": ["string", "string"],
        "why_full_score_is_not_the_end": "string",
        "advanced_check": {
          "scenario": "string",
          "question": "string",
          "options": [{ "id": "A", "text": "string" }, { "id": "B", "text": "string" }, { "id": "C", "text": "string" }],
          "correct": "string",
          "explanation": "string"
        }
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: masteryPrompt,
        config: {
          systemInstruction: "You are an AI reasoning assistant. Focus on institutional depth and nuance validation. Output valid JSON.",
          responseMimeType: "application/json"
        }
      });
      return { isPerfect: true, mastery: JSON.parse(response.text.trim()) };
    } catch (e) {
      console.error("Mastery analysis error", e);
      throw e;
    }
  }

  const prompt = `
    Conduct a "Civic Logic Audit" for this learner:
    Session History: ${JSON.stringify(historyData)}
    
    Required JSON Schema:
    {
      "overallAssessment": "String summary of logic patterns",
      "weakAreas": [
        { "area": "Category", "evidenceQuestionIds": [1], "description": "Specific gap" }
      ],
      "errorPatterns": "Description of errors",
      "recommendedFocus": "Actionable advice",
      "nextPractice": {
        "id": 999, "category": "Topic", "text": "Question", "options": [{"id": "a", "text": "Choice"}], "correctOptionId": "a"
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
      }
    });

    const data = JSON.parse(response.text.trim());
    return { ...data, isPerfect: false };
  } catch (error) {
    console.error("Gemini analyzeSession error:", error);
    throw error;
  }
};
