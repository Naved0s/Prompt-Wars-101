import { NextResponse } from 'next/server';
import { generateMicroLesson, LessonPlan } from '@/lib/gemini/service';

// Simple in-memory rate limiting map
// Maps UID -> last request timestamp
const rateLimitStore = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, learningStyle, context, uid } = body;

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limiting (1 request per 3 seconds)
    const now = Date.now();
    const lastRequest = rateLimitStore.get(uid);
    if (lastRequest && now - lastRequest < 3000) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait a few seconds before requesting another lesson." }, { status: 429 });
    }
    rateLimitStore.set(uid, now);

    if (!topic || !learningStyle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Retry Logic with Exponential Backoff
    let retryCount = 0;
    const MAX_RETRIES = 3;
    let lesson: LessonPlan | null = null;
    let lastError = null;

    while (retryCount < MAX_RETRIES) {
      try {
        lesson = await generateMicroLesson(topic, learningStyle, context);
        break; // Success
      } catch (err: any) {
        lastError = err;
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          // exponential backoff
          await new Promise(res => setTimeout(res, Math.pow(2, retryCount) * 1000));
        }
      }
    }

    if (!lesson) {
        // Fallback content if API completely fails
        console.warn("Using fallback Gemini response due to failure:", lastError);
        lesson = {
            title: `Introduction to ${topic}`,
            conceptExplainer: `We are currently experiencing high traffic or AI service issues. However, ${topic} is an important concept. A standard explanation usually defines it as a core principle in its respective field. Please try regenerating the comprehensive, personalized lesson later.`,
            analogy: `Think of learning ${topic} like assembling a puzzle - you need patience to piece it together step by step.`,
            realWorldExample: `A common real-world example involves relying on the foundational aspects of ${topic} to solve practical daily problems.`,
            quiz: {
                question: `Why is understanding ${topic} important?`,
                options: ["It isn't useful", "It forms a foundational concept", "It's merely a trend", "Only theoretical experts use it"],
                correctIndex: 1,
                explanation: "It serves as a foundational building block for advanced applications and understanding."
            }
        }
    }
    
    return NextResponse.json({ lesson });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate lesson" }, { status: 500 });
  }
}
