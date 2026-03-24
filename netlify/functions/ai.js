const cache = new Map();

export async function handler(event) {
  try {
    const { text, images, lang, classLevel, syllabus, mode } = JSON.parse(event.body);

    const prompt = `
You are Arivu AI, an expert teacher.

STRICT RULES:
- If images are unclear or irrelevant, return:
{ "error": "Invalid or unclear image. Please upload a proper textbook page." }

- Understand syllabus context:
Syllabus: ${syllabus}
Class: ${classLevel}

- Mode: ${mode}

- Generate BOTH Kannada and English responses.

Return STRICT JSON:

{
  "valid": true,
  "student": {
    "kannada": {
      "summary": "",
      "explanation": "",
      "related_chapters": [],
      "keypoints": []
    },
    "english": {
      "summary": "",
      "explanation": "",
      "related_chapters": [],
      "keypoints": []
    }
  },
  "teacher": {
    "lesson_plan": "",
    "teaching_steps": [],
    "real_life_examples": []
  }
}

Keep explanations:
- short
- precise
- student-friendly
- syllabus-aligned

Text:
${text || "Use image"}
`;

    const key = JSON.stringify({ text, images, classLevel, syllabus });

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

    let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { error: "AI parsing failed" };
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
