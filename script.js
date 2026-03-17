function sendTask(taskType) {
  const text = document.getElementById("textInput").value;
  const fileInput = document.getElementById("fileInput");
  const output = document.getElementById("output");

  output.textContent = "Processing...";

  const sendRequest = (imageData = null) => {
    fetch("/.netlify/functions/ai", {
      method: "POST",
      body: JSON.stringify({
        task: taskType,
        text: text,
        image: imageData
      })
    })
    .then(res => res.json())
    .then(data => {
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      output.textContent = result;
    })
    .catch(err => {
      console.error(err);
      output.textContent = "Error";
    });
  };

  if (fileInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = () => sendRequest(reader.result);
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    sendRequest();
  }
}