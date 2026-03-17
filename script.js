async function sendTask(taskType) {
  const text = document.getElementById("textInput").value.trim();
  const files = document.getElementById("fileInput").files;
  const output = document.getElementById("output");

  const lang = document.querySelector('input[name="lang"]:checked').value;

  if (!text && files.length === 0) {
    output.textContent = "❌ Please provide text or upload image(s)";
    return;
  }

  output.textContent = "⏳ Thinking...";

  const images = [];

  for (let file of files) {
    const reader = new FileReader();

    const base64 = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    images.push(base64);
  }

  try {
    const res = await fetch("/.netlify/functions/ai", {
      method: "POST",
      body: JSON.stringify({
        task: taskType,
        text,
        images,
        lang
      })
    });

    const data = await res.json();

    console.log(data);

    if (data.error) {
      output.textContent = "Error: " + data.error.message;
      return;
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

    output.textContent = result || "No usable response.";

  } catch (err) {
    output.textContent = "Error connecting to server.";
  }
}