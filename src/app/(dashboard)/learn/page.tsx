"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LessonPlan } from "@/lib/gemini/service";
import { Loader2, Brain, CheckCircle, XCircle, ArrowRight, Lightbulb, Activity, Target } from "lucide-react";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

function LearnPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const topic = searchParams.get("topic");
  
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [quizState, setQuizState] = useState<"idle" | "answered" | "next">("idle");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const [context, setContext] = useState("");
  
  const isFetchingRef = useRef(false);

  const fetchLesson = async () => {
    if (!topic || !user || isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      setQuizState("idle");
      setSelectedOption(null);
      const cacheKey = `adaptlearn_lesson_${topic}_${context}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          setLesson(data);
          setLoading(false);
          isFetchingRef.current = false;
          return;
        } else {
          sessionStorage.removeItem(cacheKey);
        }
      }
      
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic, 
          learningStyle: (user as any).learningStyle || "reading",
          uid: user.uid,
          context 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch adaptive lesson");

      sessionStorage.setItem(cacheKey, JSON.stringify({ data: data.lesson, timestamp: Date.now() }));
      setLesson(data.lesson);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [topic, user]);

  const handleQuizAnswer = async (index: number) => {
    if (quizState !== "idle" || !lesson || !user) return;
    setSelectedOption(index);
    setQuizState("answered");

    const isCorrect = index === lesson.quiz.correctIndex;

    // Update Mastery Points and Streak in background
    if (isCorrect) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const currentData = userSnap.exists() ? userSnap.data() : null;
        const newMastery = (currentData?.masteryPoints || 0) + 10;
        
        let newHistory = currentData?.history || [
          { name: 'Start', mastery: 0 }
        ];
        
        // Add new data point
        newHistory.push({
          name: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mastery: newMastery
        });
        
        // Keep only last 7 items for the chart
        if (newHistory.length > 7) {
          newHistory = newHistory.slice(newHistory.length - 7);
        }

        await updateDoc(userRef, { 
          masteryPoints: newMastery,
          streak: increment(1),
          history: newHistory
        });
      } catch (e) {
        console.error("Failed to update user mastery:", e);
      }
    } else {
        // Break streak
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { streak: 0 });
        } catch (e) {
            console.error(e);
        }
    }
  };

  const handleNextLesson = () => {
     let performanceContext = "";
     if (selectedOption === lesson!.quiz.correctIndex) {
       performanceContext = "User answered correctly and demonstrated solid understanding. Make the next explainer and quiz slightly more advanced and dive deeper.";
     } else {
       performanceContext = "User answered incorrectly, showing misunderstanding. Provide simpler foundational explanations and an easier, confidence-building quiz.";
     }
     setContext(prev => prev + " " + performanceContext);
     fetchLesson();
  };

  const handleReturnDashboard = () => {
    router.push("/dashboard");
  };

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold">No topic selected</h2>
        <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 capitalize">
          Learning: {topic}
        </h1>
        <Button variant="outline" onClick={handleReturnDashboard}>
          End Session
        </Button>
      </div>

      {error && !loading && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20 shadow-sm animate-in fade-in">
          <CardContent className="p-6 text-red-700 dark:text-red-400 font-medium text-center">
            {error}
            <div className="mt-4">
              <Button onClick={() => fetchLesson()} variant="outline" className="border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50">
                Retry Generation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card aria-busy="true" aria-label="Generating your lesson..." className="min-h-[400px] flex flex-col items-center justify-center space-y-6 shadow-sm border-indigo-100 dark:border-indigo-900/50 animate-in fade-in duration-500">
          <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-full" role="status" aria-live="polite">
            <Brain className="w-16 h-16 text-indigo-500 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-medium animate-pulse text-zinc-900 dark:text-zinc-100">Generating personalized lesson...</h3>
            <p className="text-zinc-500 max-w-sm mx-auto text-sm">Our AI is analyzing your learning style and building a micro-lesson designed exactly for you.</p>
          </div>
        </Card>
      )}

      {!loading && lesson && !error && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
          <Card className="shadow-lg border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white">
              <CardTitle className="text-2xl font-bold">{lesson.title}</CardTitle>
              <CardDescription className="text-indigo-100 font-medium">Adapted to your learning profile</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-8">
              <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:leading-loose prose-p:text-lg">
                <p>{lesson.conceptExplainer}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
                <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/50 shadow-sm transition-transform hover:scale-[1.01]">
                  <h4 className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-400 mb-3 text-lg">
                    <Lightbulb className="w-6 h-6" /> Analogy
                  </h4>
                  <p className="text-amber-900/80 dark:text-amber-200/80 leading-relaxed">{lesson.analogy}</p>
                </div>
                
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm transition-transform hover:scale-[1.01]">
                  <h4 className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-400 mb-3 text-lg">
                    <Activity className="w-6 h-6" /> Real World Example
                  </h4>
                  <p className="text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">{lesson.realWorldExample}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Section */}
          <Card className="shadow-lg border-zinc-300 dark:border-zinc-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-5 pointer-events-none transform translate-x-8 -translate-y-8">
              <Target className="w-48 h-48" />
            </div>
            <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="flex items-center gap-2 text-xl">
                Knowledge Check
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 leading-snug">
                {lesson.quiz.question}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {lesson.quiz.options.map((option, idx) => {
                  let btnState = "outline";
                  if (quizState === "answered") {
                    if (idx === lesson.quiz.correctIndex) btnState = "correct";
                    else if (idx === selectedOption) btnState = "incorrect";
                    else btnState = "disabled";
                  }
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      disabled={quizState !== "idle"}
                      aria-pressed={quizState === "answered" && selectedOption === idx}
                      aria-label={`Option ${idx + 1}: ${option}`}
                      className={`p-5 rounded-xl text-left transition-all border-2 flex items-center justify-between group
                        ${quizState === "idle" ? "border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md" : ""}
                        ${btnState === "correct" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 shadow-inner" : ""}
                        ${btnState === "incorrect" ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100" : ""}
                        ${btnState === "disabled" ? "border-zinc-200 dark:border-zinc-800 opacity-40 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900" : ""}
                      `}
                    >
                      <span className="font-medium text-[15px]">{option}</span>
                      {btnState === "correct" && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                      {btnState === "incorrect" && <XCircle className="w-6 h-6 text-red-500" />}
                      {quizState === "idle" && <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 group-hover:border-indigo-400 transition-colors" />}
                    </button>
                  );
                })}
              </div>

              {quizState === "answered" && (
                <div className={`mt-8 p-6 mx-auto w-full max-w-3xl rounded-2xl border ${selectedOption === lesson.quiz.correctIndex ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/80 dark:bg-emerald-950/40' : 'border-amber-200 bg-amber-50 dark:border-amber-900/80 dark:bg-amber-950/40'} animate-in fade-in slide-in-from-top-4 shadow-sm`}>
                  <h4 className="font-bold mb-3 flex items-center gap-2 text-xl">
                    {selectedOption === lesson.quiz.correctIndex 
                      ? <><span className="text-emerald-700 dark:text-emerald-400">Brilliant!</span> <span className="text-lg">🔥 +10 Mastery XP</span></>
                      : <><span className="text-amber-700 dark:text-amber-400">Not quite right.</span></>
                    }
                  </h4>
                  <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed text-[15px]">{lesson.quiz.explanation}</p>
                  
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-emerald-200/50 dark:border-zinc-800">
                    <p className="text-sm text-zinc-500 font-medium">We'll adjust the difficulty based on your answer.</p>
                    <Button onClick={handleNextLesson} size="lg" className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl">
                      Next Adaptive Lesson <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    }>
      <LearnPageContent />
    </Suspense>
  );
}
