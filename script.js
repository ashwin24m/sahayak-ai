let images = [];
let results = {
  summarize: null,
  explain: null,
  keypoints: null
};

const preview = document.getElementById("preview");
const fileInput = document.getElementById("fileInput");

fileInput.addEventListener("change", async (e) => {
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

  images.forEach((img, i) => {
    const div = document.createElement("div");
    div.style.position = "relative";

    div.innerHTML = `
      <img src="${img}">
      <span class="remove" onclick="removeImage(${i})">×</span>
    `;

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

  if (images.length === 0) {
    alert("Upload at least one image");
    return;
  }

  results = {
    summarize: "loading",
    explain: "loading",
    keypoints: "loading"
  };

  showTab("summarize");

  runTask("summarize", doubt, lang);
  runTask("explain", doubt, lang);
  runTask("keypoints", doubt, lang);
}

async function runTask(task, doubt, lang) {
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

  showTab(task);
}

function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

  const output = document.getElementById("output");

  document.querySelectorAll(".tab").forEach(t => {
    if (t.innerText.toLowerCase().includes(tab)) {
      t.classList.add("active");
    }
  });

  if (results[tab] === "loading") {
    output.innerHTML = `
      <div class="loader">
        <div></div><div></div><div></div>
      </div>
    `;
  } else {
    output.textContent = results[tab];
  }
}