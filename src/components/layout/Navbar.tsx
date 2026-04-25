"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Brain, LogOut, Code, Gamepad, Award } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white group-hover:bg-indigo-700 transition">
            <Brain className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">AdaptLearn AI</span>
        </Link>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 mr-4">
              <span className="flex items-center gap-1 text-sm font-medium text-amber-500">
                <GamePadIcon className="w-4 h-4" /> 0 Streak
              </span>
              <span className="flex items-center gap-1 text-sm font-medium text-emerald-500">
                <Award className="w-4 h-4" /> 0 Mastery
              </span>
            </div>
            <span className="text-sm text-zinc-600 dark:text-zinc-300 hidden sm:inline-block">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2 border border-zinc-200 dark:border-zinc-800">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

function GamePadIcon(props: any) {
  return <Gamepad {...props} />;
}
