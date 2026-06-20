"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Home() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<string>("checking...");

  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase
          .from("attempts")
          .select("*")
          .limit(1);

        if (error) {
          setSupabaseStatus(`❌ Failed: ${error.message}`);
        } else {
          setSupabaseStatus("✅ Connected");
          await loadAttempts();
        }
      } catch (err: any) {
        setSupabaseStatus(`❌ Error: ${err.message || "Unknown error"}`);
      }
    };

    testSupabaseConnection();
  }, []);

  const loadAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from("attempts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        setAttempts(data || []);
      }
    } catch (err: any) {
      console.error("Error loading attempts:", err);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Current Electricity Tutor</h1>

      <div className="mb-4 p-2 bg-gray-100 rounded">
        <span className="font-semibold">Supabase Status: </span>
        <span className={supabaseStatus.includes("✅") ? "text-green-600" : "text-red-600"}>
          {supabaseStatus}
        </span>
      </div>

      <Link
        href="/practice"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 mb-8"
      >
        Start Practice
      </Link>

      

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Past Attempts</h2>
        {attempts.length === 0 ? (
          <p className="text-gray-500">No attempts yet. Go practice!</p>
        ) : (
          attempts.map((attempt: any) => (
            <div key={attempt.id} className="border p-4 mb-4 rounded">
              <p className="text-sm text-gray-500">
                {new Date(attempt.created_at).toLocaleString()}
              </p>
              <p className="mt-2">
                <strong>Question:</strong> {attempt.question}
              </p>
              <p>
                <strong>Answer:</strong> {attempt.user_answer}
              </p>
              <p>
                <strong>Mistake Type:</strong> {attempt.mistake_type || "N/A"}
              </p>
              <p>
                <strong>Concept:</strong> {attempt.concept || "N/A"}
              </p>
              <p>
                <strong>Difficulty:</strong> {attempt.difficulty || "N/A"}
              </p>
              <p>
                <strong>Feedback:</strong> {attempt.ai_feedback}
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}