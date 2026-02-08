
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
    
    // High-fidelity mock for Question 1 (Laïcité)
    if (question.id === 1) {
      return {
        isMock: true,
        reasoning: {
          testedPrinciple: "The principle of Laïcité (secularism) and the distinction between the neutrality of the 'service' (the institution and its agents) and the freedom of the 'user' (the citizen receiving the service).",
          explanation: "Parents are considered users ('usagers') of the public education service, not agents or students. Under French law and clarified by the Conseil d'État, users of public services enjoy freedom of conscience and are not subject to the duty of neutrality. Therefore, a parent attending a school meeting is permitted to wear a visible religious sign, provided their behavior does not constitute an act of proselytism or disrupt the public order/functioning of the school.",
          thinkingSteps: [
            "Identify the legal status of the individual: The parent is an 'usager' of the public service.",
            "Determine the scope of the 2004 Law: Confirm that the prohibition of conspicuous religious signs applies exclusively to students in public primary and secondary schools.",
            "Apply the duty of neutrality: Note that this duty applies to public officials (agents publics) to ensure the impartiality of the state.",
            "Assess the jurisprudence: Reference the Conseil d'État's position that parents, even when participating in school activities or meetings, are not inherently bound by the religious neutrality requirement.",
            "Verify exceptions: Check if the behavior involves proselytism or disruption, which would be the only legal grounds for intervention."
          ],
          conceptualTrap: "The most common trap is conflating the neutrality requirements of public service agents (staff) and students with those of parents. Many mistakenly believe the 2004 ban on conspicuous religious signs applies to everyone within the school walls, whereas it is strictly delimited by status."
        },
        sources: [
          { web: { title: "Loi du 15 mars 2004 sur la laïcité", uri: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000417977/" } },
          { web: { title: "Avis du Conseil d'État n° 374508 (Accompagnateurs scolaires)", uri: "https://www.conseil-etat.fr/ressources/decisions-contentieuses/derniere-actualites-jurisprudentielles/etude-sur-la-laicite" } }
        ]
      };
    }

    // High-fidelity mock for Question 2 (Liberté d'expression)
    if (question.id === 2) {
      return {
        isMock: true,
        reasoning: {
          testedPrinciple: "Freedom of Expression and the Right to Protest (Liberté d'expression et droit de manifestation).",
          explanation: "Under French law and the Declaration of the Rights of Man and of the Citizen, freedom of expression is a fundamental principle. Criticism of the government, even when expressed with vehemence, is protected as long as it does not constitute a specific crime such as incitement to hatred, discrimination, or violence. Since the scenario specifies no such calls were made, police intervention would be an unlawful infringement on civil liberties.",
          thinkingSteps: [
            "Assess the legality of the assembly (authorized).",
            "Evaluate the content of the speech against the thresholds of 'incitement to hatred' or 'violence'.",
            "Reference Article 10 of the 1789 Declaration of the Rights of Man regarding the free communication of thoughts and opinions.",
            "Distinguish between 'violent language' (protected political dissent) and 'incitement to violence' (prohibited criminal act).",
            "Determine that the police's role is to ensure safety and public order, not to censor political dissent."
          ],
          conceptualTrap: "Confusing the intensity of political rhetoric with illegal incitement or a breach of public order."
        },
        sources: [
          { web: { title: "Déclaration des Droits de l'Homme et du Citoyen de 1789 - Art. 11", uri: "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/declaration-des-droits-de-l-homme-et-du-citoyen-de-1789" } },
          { web: { title: "Code de la sécurité intérieure - Droit de manifestation", uri: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000025503206/LEGISCTA000025505105/" } }
        ]
      };
    }

    // High-fidelity mock for Question 3 (Droits et Société - PMA)
    if (question.id === 3) {
      return {
        isMock: true,
        reasoning: {
          testedPrinciple: "The principle of equality of access to healthcare and the evolution of family law under the Law n° 2021-1017 of August 2, 2021.",
          explanation: "Since the Bioethics Law of August 2, 2021, PMA is officially open to single women and female couples in France. Previously, it was reserved for heterosexual couples with a medical diagnosis of infertility. Now, any woman under the age of 45 can access these procedures (IVF, artificial insemination) with the costs covered by the French Social Security.",
          thinkingSteps: [
            "Identify the relevant legislation: Loi de bioéthique (August 2021).",
            "Distinguish between PMA (authorized for all women) and GPA (surrogacy - prohibited).",
            "Verify the age limit criteria (up to 43 or 45 depending on the specific procedure).",
            "Recognize the shift from a 'medical' justification (infertility) to a 'societal' right for single women."
          ],
          conceptualTrap: "The primary trap is confusing the current legality of PMA (Assisted Reproductive Technology) for single women with the status of GPA (Surrogacy), which remains strictly prohibited in France, or assuming that a medical diagnosis of infertility is still required."
        },
        sources: [
          { web: { title: "Loi n° 2021-1017 du 2 août 2021 relative à la bioéthique", uri: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043884384" } },
          { web: { title: "Service-Public.fr: Assistance médicale à la procréation (PMA)", uri: "https://www.service-public.fr/particuliers/vosdroits/F31462" } }
        ]
      };
    }

    // Default mock for other questions
    return {
      isMock: true,
      reasoning: {
        explanation: "Institutional logic requires distinguishing between service users (citizens) and service providers (agents).",
        thinkingSteps: ["Identify Actor", "Apply Institutional Framework"],
        conceptualTrap: "Standard scenario logic applied.",
        testedPrinciple: "General Public Interest"
      },
      sources: [{ web: { title: "Code des relations entre le public et l'administration", uri: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000031366350/" } }]
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
        },
        tools: [{ googleSearch: {} }] // Enable grounding in live mode
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
