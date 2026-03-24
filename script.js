let images = [];
let result = null;
let currentLang = "kannada";

async function simplify() {
  const text = document.getElementById("doubt").value;
  const classLevel = document.getElementById("classLevel").value;
  const syllabus = document.getElementById("syllabus").value;
  const mode = document.getElementById("mode").value;

  const output = document.getElementById("output");

  if (images.length === 0) {
    output.textContent = "Upload a valid textbook image.";
    return;
  }

  output.innerHTML = "Loading...";

  const res = await fetch("/.netlify/functions/ai", {
    method: "POST",
    body: JSON.stringify({ text, images, classLevel, syllabus, mode })
  });

  const data = await res.json();

  if (data.error) {
    output.textContent = data.error;
    return;
  }

  result = data;

  showTab("summary");
}

function getStudent() {
  return result.student[currentLang];
}

function showTab(tab) {
  const output = document.getElementById("output");

  if (!result) return;

  if (tab === "summary") {
    output.innerHTML = getStudent().summary;
  }

  if (tab === "explanation") {
    output.innerHTML = getStudent().explanation;
  }

  if (tab === "chapters") {
    output.innerHTML = getStudent().related_chapters.map(c => "• " + c).join("<br>");
  }

  if (tab === "points") {
    output.innerHTML = getStudent().keypoints.map(p => "• " + p).join("<br>");
  }

  if (tab === "teacher") {
    const t = result.teacher;
    output.innerHTML = `
      <b>Lesson Plan:</b><br>${t.lesson_plan}<br><br>
      <b>Steps:</b><br>${t.teaching_steps.join("<br>")}<br><br>
      <b>Real-life:</b><br>${t.real_life_examples.join("<br>")}
    `;
  }
}

function switchLang(lang) {
  currentLang = lang;
  showTab("summary");
}
