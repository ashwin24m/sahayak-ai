export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const { task, text, image } = body;

    let instruction = "";

    if (task === "summarize") {
      instruction = "Summarize clearly.";
    } else if (task === "explain") {
      instruction = "Explain in simple terms.";
    } else if (task === "keypoints") {
      instruction = "Give bullet points.";
    }

    const prompt = `
You are a helpful document assistant.

${instruction}

If an image is provided, extract and understand it.

Document/Text:
${text || "No text provided"}
`;

    // Build parts safely
    let parts = [{ text: prompt }];

    if (image) {
      parts.push({
        inline_data: {
          mime_type: image.match(/^data:(.*?);/)[1],
          data: image.split(",")[1]
        }
      });
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