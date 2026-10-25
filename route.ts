import { NextResponse } from "next/server";

// Keep all AI provider keys on the server. This endpoint is intentionally
// a secure integration placeholder until you add your provider and policy.
export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "AI is not configured. Add OPENAI_API_KEY on the server and implement your chosen model call." },
      { status: 501 }
    );
  }
  const body = await request.json().catch(() => null);
  if (!body || !["tag-item", "suggest-outfits"].includes(body.task)) {
    return NextResponse.json({ error: "Provide task: tag-item or suggest-outfits." }, { status: 400 });
  }
  return NextResponse.json({
    error: "Provider call not implemented yet.",
    message: "Connect your chosen AI model here. Do not send provider keys to the browser."
  }, { status: 501 });
}