const { config } = require("../orchestrator/config");

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}$/);
    if (match) return JSON.parse(match[0]);
    throw error;
  }
}

async function generateJson({ system, user, schemaName }) {
  if (config.runMode === "demo") {
    throw new Error("OpenAI provider was called in demo mode");
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required when AI_RUN_MODE is not demo");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: config.temperature,
      max_tokens: config.maxOutputTokens,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${system}\n\nRispondi solo con JSON valido. Non includere markdown o testo fuori dal JSON. Schema logico richiesto: ${schemaName}.`,
        },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  const text = payload.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI response did not include message content");
  return extractJson(text);
}

module.exports = { generateJson };
