"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface TopicStats {
  topic: string;
  mistakes: number;
  priority: "High" | "Medium" | "Low";
  time: number;
}

export default function StudyPlan() {
  const [plan, setPlan] = useState<TopicStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    fetchAndBuildPlan();
  }, []);

  const fetchAndBuildPlan = async () => {
    try {
      const { data, error } = await supabase
        .from("attempts")
        .select("concept_type, mistake_type");

      if (error) throw error;

      // Count mistakes per topic (exclude "No Mistake")
      const topicCounts: Record<string, number> = {};
      data?.forEach((attempt: any) => {
        const topic = attempt.concept_type || "Unknown";
        if (attempt.mistake_type && attempt.mistake_type !== "No Mistake") {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }
      });

      // Convert to array and sort by mistakes (highest first)
      const sorted = Object.entries(topicCounts)
        .map(([topic, mistakes]) => {
          let priority: "High" | "Medium" | "Low";
          let time: number;

          if (mistakes >= 5) {
            priority = "High";
            time = 10;
          } else if (mistakes >= 2) {
            priority = "Medium";
            time = 5;
          } else {
            priority = "Low";
            time = 3;
          }

          return { topic, mistakes, priority, time };
        })
        .sort((a, b) => b.mistakes - a.mistakes);

      setPlan(sorted);
      setTotalTime(sorted.reduce((sum, item) => sum + item.time, 0));
    } catch (err) {
      console.error("Error building study plan:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-800 rounded w-40"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-800/50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (plan.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">📅 Today's Study Plan</h2>
        <div className="text-center py-6 bg-gray-900/30 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-500">
            No mistakes yet! Start practicing to get your personalized study plan.
          </p>
        </div>
      </div>
    );
  }

  const getIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return "🔥";
      case "Medium":
        return "⚡";
      case "Low":
        return "📘";
      default:
        return "📘";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-400";
      case "Medium":
        return "text-amber-400";
      case "Low":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">📅 Today's Study Plan</h2>

      <div className="space-y-2">
        {plan.map((item, index) => (
          <div
            key={item.topic}
            className="flex items-center justify-between px-4 py-3 bg-gray-900/50 rounded-lg border border-gray-800"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{getIcon(item.priority)}</span>
              <div>
                <p className="text-sm font-medium text-gray-200">
                  {index + 1}. {item.topic}
                </p>
                <p className={`text-xs ${getPriorityColor(item.priority)}`}>
                  Priority: {item.priority}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">{item.time} min</p>
              <p className="text-xs text-gray-500">{item.mistakes} mistake{item.mistakes > 1 ? "s" : ""}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between px-4 py-2 bg-gray-900/30 rounded-lg border border-gray-800">
        <span className="text-sm text-gray-400">Total Time</span>
        <span className="text-sm font-semibold text-gray-200">{totalTime} mins</span>
      </div>
    </div>
  );
}