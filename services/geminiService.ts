
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Question, AIReasoning, UserAttempt, SessionAnalysis } from "../types";

const SYSTEM_INSTRUCTION_BASE = `
You are the "CivicMind Institutional Auditor," an elite AI specialized in French law and civic exams. 
Your goal is to act as a cultural and legal bridge. 
MISSION: Decode the French institutional logic and explain it in clear, professional English.

When performing a Session Audit:
1. If the user has errors, identify the "Systemic Reasoning Gap" (e.g., confusing secularism with anti-religion).
2. If the user is perfect, trigger "Mastery Validation" with a high-level nuance challenge.
3. ALWAYS output valid JSON matching the requested schema.
`;

const CACHE_PREFIX = "CIVICMIND_IMG_CACHE_";

const checkApiKey = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. The application requires process.env.API_KEY to function.");
  }
};

// Simple hash function for string keys
const getCacheKey = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${CACHE_PREFIX}${hash}`;
};

// Generate a scenario image using gemini-2.5-flash-image with persistence
export const generateScenarioImage = async (prompt: string): Promise<string | null> => {
  const cacheKey = getCacheKey(prompt);
  
  // Check Local Persistence first
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    console.log("Image loaded from local project cache.");
    return cached;
  }

  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A clean, cinematic illustration of this French civic scenario: ${prompt}. Style: Professional flat illustration, corporate colors.` }]
      },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64Data = `data:image/png;base64,${part.inlineData.data}`;
        
        // Persist for next time
        try {
          localStorage.setItem(cacheKey, base64Data);
        } catch (e) {
          // LocalStorage might be full
          console.warn("Storage full, could not cache image.");
        }
        
        return base64Data;
      }
    }
    return null;
  } catch (e) {
    console.error("Gemini Image Generation Error:", e);
    return null;
  }
};

// Generate speech for reasoning using gemini-2.5-flash-preview-tts
export const speakReasoning = async (text: string): Promise<Uint8Array | null> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Explain clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName: 'Kore' } 
          } 
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }
    return null;
  } catch (e) {
    return null;
  }
};

// Generate targeted challenge questions using gemini-3-pro-preview
export const generateTargetedQuestions = async (analysis: SessionAnalysis): Promise<Question[]> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Based on this logic audit:
    Weak Areas: ${JSON.stringify(analysis.weakAreas)}
    Error Patterns: ${analysis.errorPatterns}
    
    Generate 3 NEW and unique French civic exam questions (scenarios) to test these specific gaps.
    Each question MUST include:
    - id (unique number)
    - category (French)
    - text (French scenario)
    - text_en (English translation)
    - options (4 options with id a,b,c,d, and both text and text_en fields)
    - correctOptionId
    - context (legal citation in French)

    Output as a JSON array of Questions.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a specialized civic exam generator. Output ONLY a valid JSON array.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.NUMBER },
            category: { type: Type.STRING },
            text: { type: Type.STRING },
            text_en: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  text_en: { type: Type.STRING }
                },
                required: ["id", "text"]
              }
            },
            correctOptionId: { type: Type.STRING },
            context: { type: Type.STRING }
          },
          required: ["id", "category", "text", "options", "correctOptionId"]
        }
      }
    }
  });

  return JSON.parse(response.text.trim());
};

// Analyze a specific question attempt using gemini-3-pro-preview
export const analyzeQuestion = async (
  question: Question,
  selectedOptionId: string
): Promise<AIReasoning> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const selectedOption = question.options.find(o => o.id === selectedOptionId);
  const correctOption = question.options.find(o => o.id === question.correctOptionId);

  const prompt = `
    AUDIT REQUEST:
    Scenario: ${question.text}
    User Choice: ${selectedOption?.text}
    Correct Answer: ${correctOption?.text}
    
    Output JSON with: explanation, simplifiedExplanation, vocabulary(array), conceptualTrap, testedPrinciple, misleadingLanguage.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
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
          misleadingLanguage: { type: Type.STRING }
        },
        required: ["explanation", "conceptualTrap", "testedPrinciple"]
      }
    }
  });

  return JSON.parse(response.text.trim());
};

// Perform session-wide audit using gemini-3-pro-preview
export const analyzeSession = async (
  questions: Question[],
  attempts: UserAttempt[]
): Promise<SessionAnalysis> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isPerfect = attempts.every(a => a.isCorrect);
  
  const auditContext = attempts.map(a => {
    const q = questions.find(qu => qu.id === a.questionId);
    const selected = q?.options.find(o => o.id === a.selectedOptionId);
    return { 
      question: q?.text, 
      category: q?.category, 
      userChoice: selected?.text, 
      wasCorrect: a.isCorrect 
    };
  });

  const prompt = `
    PERFORM INSTITUTIONAL LOGIC AUDIT.
    Session History: ${JSON.stringify(auditContext)}
    The user is ${isPerfect ? 'PERFECT' : 'DEVELOPING'}. 
    Based on this, generate a comprehensive session analysis.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallAssessment: { type: Type.STRING, description: "Executive summary of reasoning quality." },
          weakAreas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                area: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["area", "description"]
            }
          },
          errorPatterns: { type: Type.STRING, description: "Identification of repeated logic errors." },
          recommendedFocus: { type: Type.STRING, description: "Actionable fix for the user." },
          mastery: {
            type: Type.OBJECT,
            properties: {
              overall_validation: { type: Type.STRING },
              avoided_traps: { type: Type.ARRAY, items: { type: Type.STRING } },
              why_full_score_is_not_the_end: { type: Type.STRING },
              advanced_check: {
                type: Type.OBJECT,
                properties: {
                  scenario: { type: Type.STRING },
                  question: { type: Type.STRING },
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
                  correct: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["scenario", "question", "options", "correct", "explanation"]
              }
            }
          }
        },
        required: ["overallAssessment"]
      }
    }
  });

  const result = JSON.parse(response.text.trim());
  return { ...result, isPerfect };
};
