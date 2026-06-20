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
    <div className="mb-6">
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-gray-800 rounded w-40"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-800/50 rounded-lg"></div>
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
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-400 mb-3">Your Weak Areas</h2>
        <div className="text-center py-8 bg-gray-900/30 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-500">No attempts yet. Start practicing!</p>
        </div>
      </div>
    );
  }

  const getStatus = (count: number) => {
    if (count >= 4) return { label: "Weak", color: "text-red-400" };
    if (count >= 2) return { label: "Improving", color: "text-amber-400" };
    return { label: "Strong", color: "text-emerald-400" };
  };

  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-gray-400 mb-3">Your Weak Areas</h2>
      
      <div className="space-y-1.5">
        {sortedConcepts.map(([concept, data]) => {
          const status = getStatus(data.count);
          
          return (
            <div 
              key={concept} 
              className="flex items-center justify-between px-4 py-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm text-gray-300 truncate">{concept}</span>
                <span className={`text-xs ${status.color}`}>{status.label}</span>
              </div>
              <span className="text-sm text-gray-500 flex-shrink-0">
                {data.count} mistake{data.count > 1 ? "s" : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}