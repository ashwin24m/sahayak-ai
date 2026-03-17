let images = [];

const preview = document.getElementById("preview");

document.getElementById("fileInput").addEventListener("change", async (e) => {
  for (let file of e.target.files) {
    const reader = new FileReader();

    const base64 = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    images.push(base64);
  }

  renderPreview();
});

function renderPreview() {
  preview.innerHTML = "";

  images.forEach((img, index) => {
    const div = document.createElement("div");

    div.innerHTML = `
      <img src="${img}">
      <span class="remove" onclick="removeImage(${index})">×</span>
    `;

    preview.appendChild(div);
  });
}

function removeImage(index) {
  images.splice(index, 1);
  renderPreview();
}

let results = {};

async function simplify() {
  const doubt = document.getElementById("doubt").value;
  const lang = document.querySelector('input[name="lang"]:checked').value;
  const output = document.getElementById("output");

  if (images.length === 0) {
    output.textContent = "❌ Please upload at least one image.";
    return;
  }

  output.textContent = "⏳ Understanding your content...";

  const tasks = ["summarize", "explain", "keypoints"];

  results = {};

  for (let task of tasks) {
    const res = await fetch("/.netlify/functions/ai", {
      method: "POST",
      body: JSON.stringify({
        task,
        text: doubt,
        images,
        lang
      })
    });

    const data = await res.json();

    results[task] =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  }

  showTab("summary");
}

function showTab(type) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

  const output = document.getElementById("output");

  if (type === "summary") {
    document.querySelectorAll(".tab")[0].classList.add("active");
    output.textContent = results.summarize;
  }

  if (type === "explain") {
    document.querySelectorAll(".tab")[1].classList.add("active");
    output.textContent = results.explain;
  }

  if (type === "points") {
    document.querySelectorAll(".tab")[2].classList.add("active");
    output.textContent = results.keypoints;
  }
}