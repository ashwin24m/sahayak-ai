let images = [];
let result = null;

const preview = document.getElementById("preview");
const fileInput = document.getElementById("fileInput");

fileInput.addEventListener("change", async (e) => {
  for (let file of e.target.files) {
    const reader = new FileReader();
    const base64 = await new Promise(res => {
      reader.onload = () => res(reader.result);
      reader.readAsDataURL(file);
    });
    images.push(base64);
  }
  renderPreview();
});

function renderPreview() {
  preview.innerHTML = "";
  images.forEach((img, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<img src="${img}">
    <span class="remove" onclick="removeImage(${i})">×</span>`;
    preview.appendChild(div);
  });
}

function removeImage(i) {
  images.splice(i, 1);
  renderPreview();
}

async function simplify() {
  const doubt = document.getElementById("doubt").value;
  const lang = document.querySelector('input[name="lang"]:checked').value;
  const output = document.getElementById("output");

  if (images.length === 0) {
    output.textContent = "Upload at least one image.";
    return;
  }

  output.innerHTML = `<div class="loader"><div></div><div></div><div></div></div>`;

  const res = await fetch("/.netlify/functions/ai", {
    method: "POST",
    body: JSON.stringify({ text: doubt, images, lang })
  });

  const data = await res.json();
  result = data;

  showTab("summary");
}

function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

  const output = document.getElementById("output");

  if (tab === "summary") {
    document.querySelectorAll(".tab")[0].classList.add("active");
    output.innerHTML = format(result.summary);
  }

  if (tab === "explain") {
    document.querySelectorAll(".tab")[1].classList.add("active");
    output.innerHTML = format(result.explanation);
  }

  if (tab === "keypoints") {
    document.querySelectorAll(".tab")[2].classList.add("active");
    output.innerHTML = result.keypoints.map(p => `• ${p}`).join("<br>");
  }

  if (tab === "worksheet") {
    output.innerHTML = result.worksheet
      .map(q => `<b>Q:</b> ${q.question}<br><b>A:</b> ${q.answer}<br><br>`)
      .join("");
  }
}

function format(text) {
  return text?.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}
