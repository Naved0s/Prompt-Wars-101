import { GoogleGenerativeAI, SchemaType, HarmCategory, HarmBlockThreshold, ResponseSchema } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export interface LessonPlan {
  title: string;
  conceptExplainer: string;
  analogy: string;
  realWorldExample: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const responseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING, description: "Title of the micro-lesson" },
    conceptExplainer: { type: SchemaType.STRING, description: "A highly personalized, engaging explanation of the concept adapted to the learning style" },
    analogy: { type: SchemaType.STRING, description: "An analogy to make the concept easier to understand" },
    realWorldExample: { type: SchemaType.STRING, description: "A practical real-world example of the concept" },
    quiz: {
      type: SchemaType.OBJECT,
      properties: {
        question: { type: SchemaType.STRING, description: "A multiple choice question to test understanding" },
        options: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "4 possible answers"
        },
        correctIndex: { type: SchemaType.INTEGER, description: "Index of the correct option (0-3)" },
        explanation: { type: SchemaType.STRING, description: "Explanation of why the correct answer is right" }
      },
      required: ["question", "options", "correctIndex", "explanation"]
    }
  },
  required: ["title", "conceptExplainer", "analogy", "realWorldExample", "quiz"]
};

/**
 * Generates an adaptive lesson using Gemini AI.
 * @param topic - The subject to generate a lesson for (e.g. "Java", "Python")
 * @param learningStyle - Skill level or learning style
 * @param context - Previous user performance context
 * @returns A structured lesson object with content and quiz questions
 * @throws Error if Gemini API is unreachable or quota exceeded
 */
export async function generateMicroLesson(topic: string, learningStyle: string, context: string = ""): Promise<LessonPlan> {
  if (!genAI) throw new Error("Gemini API key is not configured in environment variables.");

  // Prefer gemini-1.5-flash for speed and cost-effectiveness for micro-lessons
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.7,
    }
  });

  const prompt = `
    You are an expert adaptive learning tutor.
    Topic to teach: "${topic}"
    User's primary learning style: ${learningStyle}.
    Previous context or performance: ${context}
    
    Create a personalized micro-lesson on this topic. Provide an explainer tailored to a ${learningStyle} learner. If they are visual, use descriptive language describing diagrams/imagery. If auditory, explain it conversationally. If reading, use clear structured text. If kinesthetic, describe an interactive thought experiment or physical action.
    Create a relevant analogy, a real-world example, and a 1-question quiz to test their knowledge.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText) as LessonPlan;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
