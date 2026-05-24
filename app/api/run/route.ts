import { streamText } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const runRequestSchema = z.object({
  prompt: z.string().min(10, "Prompt is too short.").max(20000, "Prompt is too long."),
  model: z.string().optional(),
});

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = runRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  if (!process.env.AI_GATEWAY_API_KEY) {
    return Response.json(
      {
        error:
          "AI_GATEWAY_API_KEY is not set. Get a free key at https://vercel.com/ai-gateway and add it to your .env.local.",
      },
      { status: 500 },
    );
  }

  const { prompt, model } = parsed.data;

  const result = streamText({
    model: model ?? "openai/gpt-4o-mini",
    prompt,
  });

  return result.toTextStreamResponse();
}
