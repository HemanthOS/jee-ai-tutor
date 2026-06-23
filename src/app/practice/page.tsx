"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { questions } from "@/app/questions";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useanalytics";

export default function PracticePage() {
  const { analytics, refetch } = useAnalytics();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<typeof questions[0] | null>(null);
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [feedback, setFeedback] = useState("");
  const [mistakeType, setMistakeType] = useState("");
  const [conceptType, setConceptType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [coachNote, setCoachNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [weakestTopic, setWeakestTopic] = useState<string | null>(null);
  const [showCoachReminder, setShowCoachReminder] = useState(false);
  const [coachAcknowledged, setCoachAcknowledged] = useState(false);
  const [showImprovement, setShowImprovement] = useState(false);
  const [prevMistakeCount, setPrevMistakeCount] = useState(0);

  // Derived from analytics — NO extra queries
  const lastCoachNote = analytics?.lastCoachNote || "";
  const lastMistakeType = analytics?.lastMistakeType || "";
  const mistakeTypeCount = analytics?.mistakeTypeCount || 0;

  // WeakAreas data
  const weakAreasData = (analytics?.weakAreas || []).map((area) => ({
    concept: area.concept,
    count: area.count,
    mistakes: area.mistakes,
  }));

  // StudyPlan data
  const studyPlanData = (analytics?.studyPlan || []).map((item) => ({
    topic: item.topic,
    mistakes: item.mistakes,
    priority: item.priority,
    time: item.time,
  }));
  const totalTime = analytics?.totalTime || 0;

  useEffect(() => {
    if (analytics) {
      // Coach reminder
      if (analytics.lastCoachNote && analytics.lastMistakeType) {
        setShowCoachReminder(true);
        setCoachAcknowledged(false);
        setPrevMistakeCount(analytics.mistakeTypeCount);
      }
      // Weakest topic
      if (analytics.studyPlan.length > 0) {
        setWeakestTopic(analytics.studyPlan[0].topic);
      }
    }
  }, [analytics]);

  // Pick question using analytics data — NO extra query
  // Pick question using analytics data — NO extra query
const pickSmartQuestion = useCallback(() => {
  if (!analytics) return;
  
  const weakest = analytics.studyPlan.length > 0 ? analytics.studyPlan[0].topic : null;
  setWeakestTopic(weakest);

  const pool = weakest
    ? questions.filter((q) => q.topic === weakest)
    : questions;

  if (pool.length === 0) return;

  const randomIndex = Math.floor(Math.random() * pool.length);
  const selected = pool[randomIndex];

  // Find the actual index in the full questions array
  const actualIndex = questions.findIndex((q) => q.id === selected.id);
  setQuestionIndex(actualIndex >= 0 ? actualIndex : 0);
  setQuestion(selected);
}, [analytics]);

useEffect(() => {
  if (analytics) pickSmartQuestion();
}, [analytics, pickSmartQuestion]);
  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError("Please provide an answer");
      return;
    }

    if (!question) return;

    setLoading(true);
    setError("");
    setSubmitted(false);
    setShowImprovement(false);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question,
          answer,
          reasoning,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();

      setFeedback(data.feedback || "");
      setMistakeType(data.mistake_type || "");
      setConceptType(data.concept || "");
      setDifficulty(data.difficulty || "");
      setCoachNote(data.coach_note || "");
      setSubmitted(true);

      // Check improvement from analytics cache
      if (analytics && data.mistake_type === analytics.lastMistakeType) {
        if (analytics.mistakeTypeCount <= prevMistakeCount) {
          setShowImprovement(true);
        }
      }

      const { error: insertError } = await supabase.from("attempts").insert([
        {
          question: question.question,
          user_answer: answer,
          ai_feedback: data.feedback || "",
          mistake_type: data.mistake_type || "",
          concept_type: data.concept || "",
          difficulty: data.difficulty || "",
          coach_note: data.coach_note || "",
        },
      ]);

      if (insertError) {
        console.error("Supabase insert error:", insertError.message);
      }

      // Refresh analytics after insert
      refetch();
    } catch (err: any) {
      setError(err.message || "Error getting feedback. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    setAnswer("");
    setReasoning("");
    setFeedback("");
    setMistakeType("");
    setConceptType("");
    setDifficulty("");
    setCoachNote("");
    setError("");
    setSubmitted(false);
    setShowCoachReminder(false);
    setCoachAcknowledged(false);
    setShowImprovement(false);
    pickSmartQuestion();
  };

  if (!question || !analytics) {
    return <p className="p-8">Loading...</p>;
  }

  // Coach Reminder Screen
  if (showCoachReminder && !coachAcknowledged) {
    return (
      <main className="max-w-3xl mx-auto p-8">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-6">Practice</h1>

        <div className="border-2 border-amber-400 p-6 rounded-lg bg-amber-50 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-xl font-bold text-amber-800">Coach Reminder</h2>
          </div>

          <p className="text-amber-700 mb-2">
            Last time you made a <strong>{lastMistakeType}</strong>.
          </p>

          <div className="bg-white p-4 rounded border border-amber-200 mt-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Today's advice:</p>
            <p className="text-gray-800 italic">"{lastCoachNote}"</p>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <span>✓</span> Don't rush calculations
            </p>
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <span>✓</span> Write units
            </p>
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <span>✓</span> Verify final answer
            </p>
          </div>

          <button
            className="mt-6 bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700 w-full"
            onClick={() => setCoachAcknowledged(true)}
          >
            I Understand — Show Me the Question
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-3xl font-bold mb-6">Practice</h1>

      {weakestTopic && (
        <div className="mb-4 p-4 rounded bg-amber-50 border border-amber-300">
          <h2 className="font-bold text-amber-800">🎯 Recommended Focus</h2>
          <p className="text-amber-700">
            <strong>{weakestTopic}</strong> — You've made the most mistakes in this topic.
          </p>
        </div>
      )}

      {/* Inline Study Plan */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">📅 Today's Study Plan</h2>
        {studyPlanData.length === 0 ? (
          <div className="text-center py-6 bg-gray-900/30 rounded-lg border border-gray-800">
            <p className="text-sm text-gray-500">No mistakes yet! Start practicing.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {studyPlanData.map((item, i) => (
                <div key={item.topic} className="flex items-center justify-between px-4 py-3 bg-gray-900/50 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-3">
                    <span>{item.priority === "High" ? "🔥" : item.priority === "Medium" ? "⚡" : "📘"}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-200">{i + 1}. {item.topic}</p>
                      <p className={`text-xs ${item.priority === "High" ? "text-red-400" : item.priority === "Medium" ? "text-amber-400" : "text-blue-400"}`}>
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
          </>
        )}
      </div>

      {/* Inline Weak Areas */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-400 mb-3">Your Weak Areas</h2>
        {weakAreasData.length === 0 ? (
          <div className="text-center py-8 bg-gray-900/30 rounded-lg border border-gray-800">
            <p className="text-sm text-gray-500">No attempts yet. Start practicing!</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {weakAreasData.map((area) => (
              <div key={area.concept} className="flex items-center justify-between px-4 py-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm text-gray-300 truncate">{area.concept}</span>
                </div>
                <span className="text-sm text-gray-500">{area.count} attempt{area.count > 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showImprovement && (
        <div className="mb-4 p-4 rounded bg-emerald-50 border border-emerald-300">
          <p className="text-emerald-700 text-center font-medium">
            🎉 Nice! You're improving on <strong>{mistakeType}</strong>!
          </p>
        </div>
      )}

      <div className="border p-6 rounded-lg mb-6">
        <h2 className="font-bold mb-4">Question</h2>
        <p>{question.question}</p>
      </div>

      <input
        className="border p-2 w-full mt-4"
        placeholder="Your answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={loading}
      />

      <textarea
        className="border p-2 w-full mt-4"
        placeholder="Explain your reasoning"
        value={reasoning}
        onChange={(e) => setReasoning(e.target.value)}
        disabled={loading}
        rows={4}
      />

      <div className="flex gap-4 mt-4">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        <button
          className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          onClick={nextQuestion}
          disabled={loading}
        >
          Next Question
        </button>
      </div>

      {error && (
        <div className="mt-4 border border-red-500 p-4 rounded bg-red-50">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {submitted && feedback && (
        <div className="mt-6 border p-4 rounded bg-green-50">
          <h2 className="font-bold mb-2 text-green-700">AI Feedback</h2>
          <div className="space-y-2">
            <p><strong>Mistake Type:</strong> {mistakeType || "N/A"}</p>
            <p><strong>Concept:</strong> {conceptType || "N/A"}</p>
            <p><strong>Difficulty:</strong> {difficulty || "N/A"}</p>
            {coachNote && (
              <div className="bg-white p-3 rounded border border-gray-200 mt-2">
                <p className="text-sm font-medium text-gray-600">💡 Coach Note:</p>
                <p className="text-gray-800 italic">"{coachNote}"</p>
              </div>
            )}
            <p><strong>Feedback:</strong> {feedback}</p>
          </div>
        </div>
      )}
    </main>
  );
}