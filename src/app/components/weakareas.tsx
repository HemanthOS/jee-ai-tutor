"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Attempt {
  id?: string;
  concept_type: string;
  mistake_type: string;
  created_at: string;
}

interface ConceptStats {
  [concept: string]: {
    count: number;
    mistakes: string[];
  };
}

export default function WeakAreas() {
  const [stats, setStats] = useState<ConceptStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from("attempts")
        .select("concept_type, mistake_type, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const conceptCounts: ConceptStats = {};
      data.forEach((attempt: Attempt) => {
        const concept = attempt.concept_type || "Unknown";
        if (!conceptCounts[concept]) {
          conceptCounts[concept] = { count: 0, mistakes: [] };
        }
        conceptCounts[concept].count += 1;
        if (attempt.mistake_type && attempt.mistake_type !== "No Mistake") {
          conceptCounts[concept].mistakes.push(attempt.mistake_type);
        }
      });

      setStats(conceptCounts);
    } catch (err) {
      console.error("Error fetching attempts:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="mb-8 p-8 rounded-3xl bg-black/90 backdrop-blur-sm border border-gray-800 shadow-2xl">
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl w-1/3"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl"></div>
          ))}
        </div>
      </div>
    </div>
  );

  const sortedConcepts = Object.entries(stats)
    .sort((a, b) => b[1].count - a[1].count)
    .filter(([_, data]) => data.count > 0);

  if (sortedConcepts.length === 0) {
    return (
      <div className="mb-8 p-8 rounded-3xl bg-black/90 backdrop-blur-sm border border-gray-800 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400">
          Your Weak Areas
        </h2>
        <div className="text-center py-12 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700">
          <svg className="w-20 h-20 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-xl font-medium text-gray-400">No attempts yet. Start practicing!</p>
          <p className="text-sm text-gray-500 mt-2">Your weak areas will appear here as you learn</p>
        </div>
      </div>
    );
  }

  const getStatus = (count: number) => {
    if (count >= 4) return { 
      emoji: "🔴", 
      label: "Needs Focus", 
      gradient: "from-red-600 to-rose-600",
      bg: "bg-red-950/30",
      border: "border-red-800/50",
      progress: "bg-red-500",
      glow: "shadow-red-500/20"
    };
    if (count >= 2) return { 
      emoji: "🟡", 
      label: "Improving", 
      gradient: "from-amber-600 to-orange-600",
      bg: "bg-amber-950/30",
      border: "border-amber-800/50",
      progress: "bg-amber-500",
      glow: "shadow-amber-500/20"
    };
    return { 
      emoji: "🟢", 
      label: "Strong", 
      gradient: "from-emerald-600 to-teal-600",
      bg: "bg-emerald-950/30",
      border: "border-emerald-800/50",
      progress: "bg-emerald-500",
      glow: "shadow-emerald-500/20"
    };
  };

  const getMaxCount = () => {
    return Math.max(...sortedConcepts.map(([_, data]) => data.count), 1);
  };

  return (
    <div className="mb-8 p-8 rounded-3xl bg-black/90 backdrop-blur-sm border border-gray-800 shadow-2xl hover:shadow-3xl transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400">
          Your Weak Areas
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-900/50 px-4 py-2 rounded-full border border-gray-800">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span>{sortedConcepts.length} concepts analyzed</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {sortedConcepts.map(([concept, data]) => {
          const status = getStatus(data.count);
          const maxCount = getMaxCount();
          const progressWidth = (data.count / maxCount) * 100;
          
          return (
            <div 
              key={concept} 
              className={`group relative overflow-hidden rounded-2xl border ${status.border} ${status.bg} hover:shadow-lg ${status.glow} transition-all duration-300`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative p-5 flex items-center gap-5">
                {/* Icon and Status */}
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${status.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {status.emoji}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-200 truncate">
                      {concept}
                    </h3>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r ${status.gradient} text-white shadow-sm`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="font-bold text-gray-300">{data.count}</span>
                      <span>mistake{data.count > 1 ? "s" : ""}</span>
                    </span>
                    {data.mistakes.length > 0 && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <span>•</span>
                        <span className="truncate max-w-[200px]">
                          {data.mistakes.join(", ")}
                        </span>
                      </span>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3 w-full h-1.5 bg-gray-800/70 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${status.gradient} transition-all duration-1000 ease-out`}
                      style={{ width: `${progressWidth}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Arrow indicator */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer Stats */}
      <div className="mt-6 pt-6 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <div className="flex flex-wrap items-center gap-4">
          <span>🔴 Needs Focus: {sortedConcepts.filter(([_, d]) => getStatus(d.count).label === "Needs Focus").length}</span>
          <span>🟡 Improving: {sortedConcepts.filter(([_, d]) => getStatus(d.count).label === "Improving").length}</span>
          <span>🟢 Strong: {sortedConcepts.filter(([_, d]) => getStatus(d.count).label === "Strong").length}</span>
        </div>
        <span>Last updated: {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}