import "server-only";

type GeminiPart = { text?: string };

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    groundingMetadata?: {
      webSearchQueries?: string[];
      groundingChunks?: Array<{ web?: { title?: string; uri?: string } }>;
      groundingSupports?: Array<{
        segment?: { startIndex?: number; endIndex?: number; text?: string };
        groundingChunkIndices?: number[];
      }>;
    };
  }>;
  error?: { message?: string };
};

export class GeminiError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function generateGroundedJson<T>(prompt: string): Promise<{
  value: T;
  sources: { title?: string; uri?: string }[];
  webSearchQueries: string[];
}> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new GeminiError("GEMINI_API_KEY is not configured on the server.", 503);
  }

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      tools: [{ google_search: {} }],
      generationConfig: {
        temperature: 0.2,
      },
    }),
  });

  const data = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new GeminiError(
      data.error?.message ?? "Gemini request failed.",
      response.status,
    );
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new GeminiError("Gemini returned an empty response.");
  }

  const groundingMetadata = data.candidates?.[0]?.groundingMetadata;
  const sources =
    groundingMetadata?.groundingChunks
      ?.map((chunk) => chunk.web)
      .filter((source): source is { title?: string; uri?: string } =>
        Boolean(source),
      )
      .filter(
        (source, index, all) =>
          index === all.findIndex((candidate) => candidate.uri === source.uri),
      ) ?? [];

  return {
    value: parseJsonFromGroundedText<T>(text),
    sources,
    webSearchQueries: groundingMetadata?.webSearchQueries ?? [],
  };
}

function parseJsonFromGroundedText<T>(text: string): T {
  const stripped = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(stripped) as T;
  } catch {
    const objectStart = stripped.indexOf("{");
    const arrayStart = stripped.indexOf("[");
    const start =
      objectStart === -1
        ? arrayStart
        : arrayStart === -1
          ? objectStart
          : Math.min(objectStart, arrayStart);
    const end = Math.max(stripped.lastIndexOf("}"), stripped.lastIndexOf("]"));

    if (start >= 0 && end > start) {
      return JSON.parse(stripped.slice(start, end + 1)) as T;
    }
  }

  throw new GeminiError("Gemini did not return parseable JSON.");
}
