import { NextRequest, NextResponse } from "next/server";

// Ваш OpenRouter API-ключ
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";

// URL OpenRouter Chat API
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid format: messages should be an array" }, { status: 400 });
    }

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenRouter error:", response.status, text);
      return NextResponse.json({ error: `API error: ${text}` }, { status: 502 });
    }

    const payload = await response.json();
    const aiMessage = payload.choices?.[0]?.message?.content;

    if (!aiMessage) {
      console.error("No message in response:", payload);
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    return NextResponse.json({ response: aiMessage });
  } catch (err) {
    console.error("Request failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
