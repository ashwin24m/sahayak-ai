export async function handler(event) {
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
You are a helpful assistant.

${instruction}

Document:
${text || ""}
`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              ...(image ? [{
                inline_data: {
                  mime_type: "image/png",
                  data: image.split(",")[1]
                }
              }] : [])
            ]
          }
        ]
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
}