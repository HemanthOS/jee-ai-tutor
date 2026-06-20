"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { questions } from "@/app/questions";
import Link from "next/link";

export default function PracticePage() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<typeof questions[0] | null>(null);
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [feedback, setFeedback] = useState("");
  const [mistakeType, setMistakeType] = useState("");
  const [conceptType, setConceptType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Set random question only on client side
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setQuestionIndex(randomIndex);
    setQuestion(questions[randomIndex]);
  }, []);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError("Please provide an answer");
      return;
    }

    if (!question) return;

    setLoading(true);
    setError("");
    setSubmitted(false);

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
      setSubmitted(true);

      const { error: insertError } = await supabase.from("attempts").insert([
        {
          question: question.question,
          user_answer: answer,
          ai_feedback: data.feedback || "",
          mistake_type: data.mistake_type || "",
          concept_type: data.concept || "",
          difficulty: data.difficulty || "",
        },
      ]).select();

      if (insertError) {
        console.error("Supabase insert error:", insertError.message);
      }
    } catch (err: any) {
      setError(err.message || "Error getting feedback. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * questions.length);
    } while (newIndex === questionIndex && questions.length > 1);

    setQuestionIndex(newIndex);
    setQuestion(questions[newIndex]);
    setAnswer("");
    setReasoning("");
    setFeedback("");
    setMistakeType("");
    setConceptType("");
    setDifficulty("");
    setError("");
    setSubmitted(false);
  };

  if (!question) {
    return <p className="p-8">Loading...</p>;
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-3xl font-bold mb-6">Practice</h1>

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
            <p><strong>Feedback:</strong> {feedback}</p>
          </div>
        </div>
      )}
    </main>
  );
}