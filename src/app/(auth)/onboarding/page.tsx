"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Palette, Headphones, BookOpen, Activity } from "lucide-react";

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const styles = [
    { id: "visual", icon: Palette, title: "Visual", desc: "You learn best through images, diagrams, and videos." },
    { id: "auditory", icon: Headphones, title: "Auditory", desc: "You prefer listening to explanations, podcasts, or lectures." },
    { id: "reading", icon: BookOpen, title: "Reading/Writing", desc: "You favor text-based content and taking detailed notes." },
    { id: "kinesthetic", icon: Activity, title: "Kinesthetic", desc: "You learn by doing and directly interacting with the material." },
  ];

  const handleSave = async () => {
    if (!user || !selectedStyle) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { learningStyle: selectedStyle });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-zinc-200 dark:border-zinc-800">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">How do you learn best?</CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Select your preferred learning style to help us personalize your Adaptive Learning experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {styles.map((style) => {
            const Icon = style.icon;
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-6 flex flex-col items-start gap-4 rounded-xl border-2 transition-all ${
                  isSelected 
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" 
                    : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-zinc-900"
                }`}
              >
                <div className={`p-3 rounded-full ${isSelected ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">{style.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{style.desc}</p>
                </div>
              </button>
            );
          })}
        </CardContent>
        <CardFooter className="flex justify-end pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <Button 
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            onClick={handleSave} 
            disabled={!selectedStyle || isSaving}
          >
            {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            Complete Setup
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
