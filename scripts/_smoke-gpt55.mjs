import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const schema = {
  type: "object",
  properties: {
    status: { type: "string" },
    diacritice_test: { type: "string" },
  },
  required: ["status", "diacritice_test"],
  additionalProperties: false,
};

async function call(withTemp) {
  const req = {
    model: "gpt-5.5",
    messages: [
      { role: "system", content: "Răspunzi strict în JSON conform schemei." },
      { role: "user", content: "Status: 'ok'. diacritice_test: scrie 'țară șură îmi ăsta â' exact." },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "smoke", strict: true, schema },
    },
  };
  if (withTemp) req.temperature = 0.2;
  const t0 = Date.now();
  const res = await client.chat.completions.create(req);
  return {
    ms: Date.now() - t0,
    content: res.choices[0].message.content,
    usage: res.usage,
    model: res.model,
  };
}

try {
  const r = await call(true);
  console.log("CU temperature=0.2: OK", JSON.stringify(r, null, 1));
} catch (e) {
  console.log("CU temperature=0.2: EROARE →", e.status, e.message?.slice(0, 200));
  try {
    const r = await call(false);
    console.log("FĂRĂ temperature: OK", JSON.stringify(r, null, 1));
  } catch (e2) {
    console.log("FĂRĂ temperature: EROARE →", e2.status, e2.message?.slice(0, 300));
  }
}
