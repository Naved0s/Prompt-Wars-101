"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Flame, Target, Star, BrainCircuit, ArrowRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for Recharts (until Firestore is implemented fully)
const progressData = [
  { name: 'Mon', mastery: 10 },
  { name: 'Tue', mastery: 25 },
  { name: 'Wed', mastery: 45 },
  { name: 'Thu', mastery: 50 },
  { name: 'Fri', mastery: 80 },
  { name: 'Sat', mastery: 95 },
  { name: 'Sun', mastery: 120 },
];

const PREDEFINED_TOPICS = [
  "React Hooks",
  "Photosynthesis",
  "Machine Learning Basics",
  "World War II",
  "Introduction to Psychology"
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [topic, setTopic] = useState("");

  const handleStartSession = (selectedTopic: string) => {
    if (!selectedTopic.trim()) return;
    router.push(`/learn?topic=${encodeURIComponent(selectedTopic.trim())}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome back!
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Ready to expand your neural pathways today?
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <Card className="col-span-1 md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Mastery Growth
            </CardTitle>
            <CardDescription>Your learning progress over the past week</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#f4f4f5' }}
                  itemStyle={{ color: '#818cf8', fontWeight: 600 }}
                  cursor={{stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Line type="monotone" dataKey="mastery" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="flex flex-col gap-6">
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200/50 dark:border-amber-900/50 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-amber-500 rounded-full text-white shadow-lg shadow-amber-500/30">
                <Flame className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-500">Current Streak</p>
                <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">3 Days</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200/50 dark:border-emerald-900/50 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-emerald-500 rounded-full text-white shadow-lg shadow-emerald-500/30">
                <Star className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500">Total Mastery</p>
                <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">1,250 XP</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search for Concept */}
        <Card className="border-indigo-200 dark:border-indigo-900 shadow-indigo-100/50 dark:shadow-indigo-900/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4">
            <BrainCircuit className="w-64 h-64 text-indigo-600" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl">Learn something new</CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400">Enter any concept and our AI will generate a personalized adaptive lesson.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleStartSession(topic); }}
              className="flex gap-3"
            >
              <Input 
                placeholder="e.g. Quantum Computing..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur shadow-inner"
              />
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-md">
                <Search className="w-4 h-4 mr-2" />
                Learn
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Popular Topics */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Popular Topics</CardTitle>
            <CardDescription>Dive into these highly rated subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2.5">
              {PREDEFINED_TOPICS.map((t) => (
                <Button 
                  key={t} 
                  variant="secondary" 
                  className="rounded-full gap-2 transition-all hover:-translate-y-0.5 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 border border-zinc-200 dark:border-zinc-800"
                  onClick={() => handleStartSession(t)}
                >
                  {t}
                  <ArrowRight className="w-3 h-3 opacity-50" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
