export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const { task, text, images, lang } = body;

    let instruction = "";

    if (task === "summarize") {
      instruction = "Give a short and clear summary.";
    } else if (task === "explain") {
      instruction = "Explain like teaching a school student.";
    } else if (task === "keypoints") {
      instruction = "Give bullet points only.";
    }

    const languageInstruction =
      lang === "kannada"
        ? "Respond ONLY in Kannada language."
        : "Respond ONLY in English.";

    const prompt = `
You are an expert teacher.

${instruction}

${languageInstruction}

If images are provided, extract the content carefully.

Also:
- Give clean formatting
- Add simple examples if needed
- If topic is unclear or irrelevant, say "Invalid input"

Text:
${text || "No text provided"}
`;

    let parts = [{ text: prompt }];

    if (images && images.length > 0) {
      for (let img of images) {
        parts.push({
          inline_data: {
            mime_type: img.match(/^data:(.*?);/)[1],
            data: img.split(",")[1]
          }
        });
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts }]
        })
      }
    );

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}