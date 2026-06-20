import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req: Request) {
  const body = await req.json();

  const prompt = `
You are a JEE Physics tutor. Analyze the student's answer.

Question:
${body.question}

Correct Answer:
2A

Student Answer:
${body.answer}

Reasoning:
${body.reasoning}

Return ONLY valid JSON (no markdown, no backticks, no extra text) in this exact format:
{
  "mistake_type": "",
  "concept": "",
  "difficulty": "",
  "feedback": ""
}

Examples of mistake_type: "Formula Error", "Conceptual Mistake", "Calculation Error", "Unit Error", "No Mistake"
Examples of concept: "Ohms Law", "Kirchhoff's Law", "Series Circuits", "Parallel Circuits", "Power"
Examples of difficulty: "Easy", "Medium", "Hard"

Keep feedback concise (1-2 sentences).
`;

  try {
    const result = await model.generateContent(prompt);

    // Extract text from response
    let rawText = "";
    const r: any = result;

    if (!r) {
      rawText = "No response from model.";
    } else if (typeof r === "string") {
      rawText = r;
    } else if (r.response && typeof r.response.text === "function") {
      try {
        rawText = r.response.text();
      } catch (e) {
        rawText = String(r.response);
      }
    } else if (r.output && Array.isArray(r.output) && r.output.length) {
      const out = r.output[0];
      if (out.content && Array.isArray(out.content)) {
        const txtParts = out.content
          .map((c: any) => c.text || c["text"])
          .filter(Boolean);
        rawText = txtParts.join("\n") || JSON.stringify(out);
      } else if (out.text) {
        rawText = out.text;
      } else {
        rawText = JSON.stringify(out);
      }
    } else if (r.output_text) {
      rawText = r.output_text;
    } else {
      rawText = JSON.stringify(r);
    }

    // Clean markdown code blocks if any
    rawText = rawText.trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/```json?/g, "").replace(/```/g, "").trim();
    }

    // Parse the JSON
    const analysis = JSON.parse(rawText);

    // Return structured fields
    return NextResponse.json({
      mistake_type: analysis.mistake_type || "",
      concept: analysis.concept || "",
      difficulty: analysis.difficulty || "",
      feedback: analysis.feedback || "",
    });
  } catch (err) {
    console.error("Error generating feedback:", err);
    return NextResponse.json(
      {
        mistake_type: "Error",
        concept: "Error",
        difficulty: "Error",
        feedback: "Error generating feedback from AI.",
      },
      { status: 500 }
    );
  }
}