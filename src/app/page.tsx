"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [feedback, setFeedback] = useState("");
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [supabaseStatus, setSupabaseStatus] = useState<string>("checking...");

  // Test Supabase connection on mount
  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        console.log("Testing Supabase connection...");
        console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
        
        // Simple test query
        const { data, error } = await supabase
          .from("attempts")
          .select("*")
          .limit(1);
        
        if (error) {
          console.error("Supabase test failed:", error);
          setSupabaseStatus(`❌ Failed: ${error.message}`);
          setError(`Supabase connection error: ${error.message}`);
        } else {
          console.log("Supabase test successful:", data);
          setSupabaseStatus("✅ Connected");
          // Load attempts only if connection works
          await loadAttempts();
        }
      } catch (err: any) {
        console.error("Supabase test error:", err);
        setSupabaseStatus(`❌ Error: ${err.message || "Unknown error"}`);
        setError(`Failed to connect to Supabase: ${err.message || "Check your environment variables"}`);
      }
    };

    testSupabaseConnection();
  }, []);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError("Please provide an answer");
      return;
    }

    setLoading(true);
    setError("");
    setFeedback("");

    try {
      // 1. Call the AI API
      console.log("Calling API...");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question:
            "A resistor of 10Ω is connected across a 20V battery. Find the current.",
          answer,
          reasoning,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Request failed");
      }

      const data = await res.json();
      const fb = data.feedback || "No feedback returned";
      setFeedback(fb);

      // save to supabase and handle supabase response
      const { data: insertData, error: insertError } = await supabase
        .from("attempts")
        .insert([
          {
            question:
              "A resistor of 10Ω is connected across a 20V battery. Find the current.",
            user_answer: answer,
            ai_feedback: fb,
          },
        ]);

      if (insertError) {
        console.error("Supabase insert error", insertError);
        setFeedback((prev) => prev + "\n\n(Save failed: " + insertError.message + ")");
      } else {
        // reload attempts after successful insert
        await loadAttempts();
      }

      // 4. Clear form
      setAnswer("");
      setReasoning("");

    } catch (err: any) {
      console.error("Error in handleSubmit:", err);
      setError(err.message || "Error getting feedback. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadAttempts = async () => {
    try {
      console.log("Loading attempts...");
      const { data, error } = await supabase
        .from("attempts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading attempts:", error);
        setError(`Error loading attempts: ${error.message}`);
        return;
      }

      console.log("Loaded attempts:", data);
      setAttempts(data || []);
    } catch (err: any) {
      console.error("Error in loadAttempts:", err);
      setError(`Error loading attempts: ${err.message}`);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Current Electricity Tutor</h1>

      {/* Supabase Status */}
      <div className="mb-4 p-2 bg-gray-100 rounded">
        <span className="font-semibold">Supabase Status: </span>
        <span className={supabaseStatus.includes("✅") ? "text-green-600" : "text-red-600"}>
          {supabaseStatus}
        </span>
      </div>

      <div className="border p-6 rounded-lg">
        <h2 className="font-bold mb-4">Question</h2>
        <p>A resistor of 10Ω is connected across a 20V battery. Find the current.</p>
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

      <button
        className="bg-blue-600 text-white px-6 py-2 mt-4 rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleSubmit}
        disabled={loading || supabaseStatus.includes("❌")}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>

      {error && (
        <div className="mt-4 border border-red-500 p-4 rounded bg-red-50">
          <h2 className="font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {feedback && (
        <div className="mt-6 border p-4 rounded bg-green-50">
          <h2 className="font-bold mb-2 text-green-700">AI Feedback</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{feedback}</p>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Past Attempts</h2>
        {attempts.length === 0 ? (
          <p className="text-gray-500">No attempts yet.</p>
        ) : (
          attempts.map((attempt: any) => (
            <div key={attempt.id} className="border p-4 mb-4 rounded">
              <p className="text-sm text-gray-500">
                {new Date(attempt.created_at).toLocaleString()}
              </p>
              <p className="mt-2">
                <strong>Answer:</strong> {attempt.user_answer}
              </p>
              <p className="mt-1">
                <strong>Feedback:</strong> {attempt.ai_feedback}
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}