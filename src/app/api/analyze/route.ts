import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req: Request) {
  const body = await req.json();

  const prompt = `
Question:
${body.question}

Correct Answer:
2A

Student Answer:
${body.answer}

Reasoning:
${body.reasoning}

Act as a JEE Physics tutor.
Give concise feedback.
`;

  try {
    const result = await model.generateContent(prompt);

    // Normalize different possible response shapes into a string
    let feedback = "";
    const r: any = result;

    if (!r) {
      feedback = "No response from model.";
    } else if (typeof r === "string") {
      feedback = r;
    } else if (r.response && typeof r.response.text === "function") {
      try {
        feedback = r.response.text();
      } catch (e) {
        feedback = String(r.response);
      }
    } else if (r.output && Array.isArray(r.output) && r.output.length) {
      // Newer clients may place text inside output -> content
      const out = r.output[0];
      if (out.content && Array.isArray(out.content)) {
        const txtParts = out.content
          .map((c: any) => c.text || c["text"])
          .filter(Boolean);
        feedback = txtParts.join("\n") || JSON.stringify(out);
      } else if (out.text) {
        feedback = out.text;
      } else {
        feedback = JSON.stringify(out);
      }
    } else if (r.output_text) {
      feedback = r.output_text;
    } else {
      // Fallback to stringifying the result
      feedback = JSON.stringify(r);
    }

    return NextResponse.json({ feedback });
  } catch (err) {
    console.error("Error generating feedback:", err);
    return NextResponse.json(
      { feedback: "Error generating feedback from AI." },
      { status: 500 }
    );
  }
}