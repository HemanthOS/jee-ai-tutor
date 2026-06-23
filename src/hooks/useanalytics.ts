"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface AttemptData {
  concept_type: string;
  mistake_type: string;
  coach_note?: string;
  created_at: string;
}

export interface Analytics {
  weakAreas: { concept: string; count: number; mistakes: string[] }[];
  studyPlan: { topic: string; mistakes: number; priority: "High" | "Medium" | "Low"; time: number }[];
  totalTime: number;
  lastCoachNote: string | null;
  lastMistakeType: string | null;
  mistakeTypeCount: number;
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from("attempts")
        .select("concept_type, mistake_type, coach_note, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setAnalytics({
          weakAreas: [],
          studyPlan: [],
          totalTime: 0,
          lastCoachNote: null,
          lastMistakeType: null,
          mistakeTypeCount: 0,
        });
        setLoading(false);
        return;
      }

      // Build Weak Areas
      const conceptMap: Record<string, { count: number; mistakes: string[] }> = {};
      data.forEach((row: AttemptData) => {
        const concept = row.concept_type || "Unknown";
        if (!conceptMap[concept]) conceptMap[concept] = { count: 0, mistakes: [] };
        conceptMap[concept].count++;
        if (row.mistake_type && row.mistake_type !== "No Mistake") {
          conceptMap[concept].mistakes.push(row.mistake_type);
        }
      });

      const weakAreas = Object.entries(conceptMap)
        .map(([concept, val]) => ({ concept, ...val }))
        .sort((a, b) => b.count - a.count);

      // Build Study Plan (mistakes only, exclude "No Mistake")
      const mistakeCounts: Record<string, number> = {};
      data.forEach((row: AttemptData) => {
        const topic = row.concept_type || "Unknown";
        if (row.mistake_type && row.mistake_type !== "No Mistake") {
          mistakeCounts[topic] = (mistakeCounts[topic] || 0) + 1;
        }
      });

      const studyPlan = Object.entries(mistakeCounts)
        .map(([topic, mistakes]) => {
          let priority: "High" | "Medium" | "Low";
          let time: number;
          if (mistakes >= 5) { priority = "High"; time = 10; }
          else if (mistakes >= 2) { priority = "Medium"; time = 5; }
          else { priority = "Low"; time = 3; }
          return { topic, mistakes, priority, time };
        })
        .sort((a, b) => b.mistakes - a.mistakes);

      const totalTime = studyPlan.reduce((sum, item) => sum + item.time, 0);

      // Last coach note
      const lastAttempt = data[0];
      const lastCoachNote = (lastAttempt.coach_note && lastAttempt.mistake_type !== "No Mistake")
        ? lastAttempt.coach_note : null;
      const lastMistakeType = (lastAttempt.mistake_type && lastAttempt.mistake_type !== "No Mistake")
        ? lastAttempt.mistake_type : null;

      // Count same mistake type
      let mistakeTypeCount = 0;
      if (lastMistakeType) {
        mistakeTypeCount = data.filter(
          (r: AttemptData) => r.mistake_type === lastMistakeType
        ).length;
      }

      setAnalytics({
        weakAreas,
        studyPlan,
        totalTime,
        lastCoachNote,
        lastMistakeType,
        mistakeTypeCount,
      });
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, refetch: fetchAnalytics };
}