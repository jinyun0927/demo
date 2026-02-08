
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Question, AIReasoning, UserAttempt, SessionAnalysis, SessionTier } from "../types";

// Engine state tracking
let useMockMode = true; 
let isQuotaExhausted = false;

// Tiered Model Constants
const MODEL_FLASH = 'gemini-3-flash-preview';
const MODEL_PRO = 'gemini-3-pro-preview'; 
const MODEL_LIVE = 'gemini-2.5-flash-native-audio-preview-12-2025';
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export const getEngineStatus = () => ({
  useMockMode,
  isQuotaExhausted
});

export const setMockMode = (val: boolean) => {
  useMockMode = val;
};

const SYSTEM_INSTRUCTION_BASE = `
You are the "CivicMind Institutional Auditor," an elite AI specialized in French law and civic exams. 
MISSION: Decode French institutional logic and explain it in clear, professional English.
CRITICAL: Respond ONLY with a raw JSON object matching the requested schema.
`;

const checkApiKey = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handleApiError = (err: any) => {
  console.error("API Engine Error:", err);
  if (err?.message?.includes("429") || err?.message?.includes("quota") || err?.message?.includes("Resource has been exhausted")) {
    isQuotaExhausted = true;
    return "QUOTA_EXHAUSTED";
  }
  return "GENERAL_ERROR";
};

export const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const decode = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number = 1
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const analyzeQuestion = async (
  question: Question,
  selectedOptionId: string
): Promise<{ reasoning: AIReasoning; sources?: any[]; isMock?: boolean }> => {
  if (useMockMode) {
    await sleep(1500);
    return {
      isMock: true,
      reasoning: {
        explanation: "Institutional logic requires distinguishing between service users (citizens) and service providers (agents).",
        thinkingSteps: ["Identify Actor", "Apply 1905 Neutrality Law"],
        conceptualTrap: "Confusion between student rules and agent duties.",
        testedPrinciple: "Public Service Neutrality"
      }
    };
  }

  try {
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Deep Audit Question: ${question.text}, User Choice: ${selectedOptionId}.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            thinkingSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            conceptualTrap: { type: Type.STRING },
            testedPrinciple: { type: Type.STRING }
          }
        }
      }
    });
    return { reasoning: JSON.parse(response.text), sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
  } catch (err) {
    if (handleApiError(err) === "QUOTA_EXHAUSTED") {
        useMockMode = true; 
    }
    return analyzeQuestion(question, selectedOptionId);
  }
};

export const analyzeSession = async (questions: Question[], attempts: UserAttempt[]): Promise<SessionAnalysis> => {
  const correctCount = attempts.filter(a => a.isCorrect).length;
  const scorePercentage = (correctCount / attempts.length) * 100;
  
  let tier: SessionTier = 'ALIGNED';
  if (scorePercentage === 100) tier = 'MASTERY';
  else if (scorePercentage === 0) tier = 'CRITICAL';

  if (useMockMode) {
    await sleep(1500);
    return {
      isPerfect: scorePercentage === 100,
      scorePercentage,
      tier,
      overallAssessment: "Simulation: Alignment confirmed.",
      errorPatterns: "Standard baseline.",
      mastery: tier === 'MASTERY' ? {
        why_full_score_is_not_the_end: "Mastery involves advanced jurisprudence.",
        advanced_check: {
          scenario: "Public library exhibit.",
          question: "Can religious texts be shown historically?",
          options: [{ id: "a", text: "Yes" }, { id: "b", text: "No" }],
          correct: "a",
          explanation: "Historical context is allowed."
        }
      } : undefined
    } as any;
  }

  try {
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: `Analyze exam session history: ${JSON.stringify(attempts)}. Generate institutional audit report.`,
      config: {
        systemInstruction: "You are an elite legal auditor. Analyze errors and provide deep patterns.",
        responseMimeType: "application/json"
      }
    });
    const data = JSON.parse(response.text);
    return { ...data, isPerfect: scorePercentage === 100, scorePercentage, tier };
  } catch (err) {
    handleApiError(err);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Analyze attempts: ${JSON.stringify(attempts)}. JSON output.`,
      config: { responseMimeType: "application/json" }
    });
    const data = JSON.parse(response.text);
    return { ...data, isPerfect: scorePercentage === 100, scorePercentage, tier };
  }
};

export const speakReasoning = async (text: string): Promise<Uint8Array | null> => {
  if (useMockMode) return null;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio ? decode(base64Audio) : null;
  } catch (err) {
    handleApiError(err);
    return null;
  }
};

export const generateTargetedQuestions = async (analysis: SessionAnalysis): Promise<Question[]> => {
  const FALLBACK_QUESTION: Question = {
    id: 999,
    category: "Remediation",
    text: "Un agent d'un hôpital public peut-il porter un signe religieux visible dans l'exercice de ses fonctions ?",
    text_en: "Can a public hospital employee wear a visible religious symbol while performing their duties?",
    options: [
      { id: "a", text: "Non, la neutralité est absolue pour tous les agents publics.", text_en: "No, neutrality is absolute for all public employees." },
      { id: "b", text: "Oui, si le patient ne s'y oppose pas.", text_en: "Yes, if the patient does not object." }
    ],
    correctOptionId: "a"
  };

  if (useMockMode) {
    await sleep(1000);
    return [FALLBACK_QUESTION];
  }

  try {
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Generate 1 repair question (French Law). 
      IMPORTANT: The 'text' and 'options.text' MUST be in French. 
      The 'text_en' and 'options.text_en' MUST be in English.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              category: { type: Type.STRING },
              text: { type: Type.STRING, description: "French version" },
              text_en: { type: Type.STRING, description: "English version" },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING, description: "French" },
                    text_en: { type: Type.STRING, description: "English" }
                  },
                  required: ["id", "text", "text_en"]
                }
              },
              correctOptionId: { type: Type.STRING }
            },
            required: ["id", "category", "text", "text_en", "options", "correctOptionId"]
          }
        }
      }
    });
    
    const parsed = JSON.parse(response.text);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [FALLBACK_QUESTION];
  } catch (err) {
    handleApiError(err);
    return [FALLBACK_QUESTION];
  }
};
