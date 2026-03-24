const cache = new Map();
const usage = new Map();

export async function handler(event) {
  try {
    const ip = event.headers["x-forwarded-for"] || "unknown";

    // ===== Usage Limit =====
    const limit = 20; // requests per hour
    const now = Date.now();
    const user = usage.get(ip) || { count: 0, time: now };

    if (now - user.time > 3600000) {
      user.count = 0;
      user.time = now;
    }

    user.count++;
    usage.set(ip, user);

    if (user.count > limit) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: "Limit exceeded. Try later." })
      };
    }

    const { text, images, lang } = JSON.parse(event.body);

    const langRule =
      lang === "kannada"
        ? "Respond ONLY in simple Kannada."
        : "Respond ONLY in English.";

    const prompt = `
You are an expert teacher.

${langRule}

Return STRICT JSON in this format:
{
  "summary": "",
  "explanation": "",
  "keypoints": ["", "", ""],
  "worksheet": [
    {
      "question": "",
      "answer": ""
    }
  ]
}

Explain clearly for students.

Text:
${text || "Use image content"}
`;

    // ===== Cache Key =====
    const key = JSON.stringify({ text, images, lang });

    if (cache.has(key)) {
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(cache.get(key))
      };
    }

    let parts = [{ text: prompt }];

    if (images) {
      images.forEach(img => {
        parts.push({
          inline_data: {
            mime_type: img.match(/^data:(.*?);/)[1],
            data: img.split(",")[1]
          }
        });
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts }] })
      }
    );

    const data = await response.json();

    const raw =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { summary: raw, explanation: raw, keypoints: [], worksheet: [] };
    }

    cache.set(key, parsed);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(parsed)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
