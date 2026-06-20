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

      // Count concepts
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

  if (loading) return <p>Loading weak areas...</p>;

  // Sort concepts by mistake count (highest first)
  const sortedConcepts = Object.entries(stats)
    .sort((a, b) => b[1].count - a[1].count)
    .filter(([_, data]) => data.count > 0);

  if (sortedConcepts.length === 0) {
    return <p>No attempts yet. Start practicing!</p>;
  }

  // Determine status color
  const getStatus = (count: number) => {
    if (count >= 4) return { emoji: "🔴", label: "Weak" };
    if (count >= 2) return { emoji: "🟡", label: "Improving" };
    return { emoji: "🟢", label: "Strong" };
  };

  return (
    <div className="mb-8 p-6 border rounded-lg bg-white shadow">
      <h2 className="text-2xl font-bold mb-4">Your Weak Areas</h2>
      <div className="space-y-2">
        {sortedConcepts.map(([concept, data]) => {
          const status = getStatus(data.count);
          return (
            <div key={concept} className="flex items-center gap-3 p-2 border-b">
              <span>{status.emoji}</span>
              <span className="font-medium flex-1">{concept}</span>
              <span className="text-sm text-gray-600">
                {data.count} mistake{data.count > 1 ? "s" : ""}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                status.label === "Weak" ? "bg-red-100 text-red-700" :
                status.label === "Improving" ? "bg-yellow-100 text-yellow-700" :
                "bg-green-100 text-green-700"
              }`}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}