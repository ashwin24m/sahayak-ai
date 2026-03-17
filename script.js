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
    const base64 = await new Promise(res=>{
      reader.onload = ()=>res(reader.result);
      reader.readAsDataURL(file);
    });
    images.push(base64);
  }
  renderPreview();
});

function renderPreview() {
  preview.innerHTML = "";
  images.forEach((img,i)=>{
    const div=document.createElement("div");
    div.innerHTML=`<img src="${img}">
    <span class="remove" onclick="removeImage(${i})">×</span>`;
    preview.appendChild(div);
  });
}

function removeImage(i){
  images.splice(i,1);
  renderPreview();
}

async function simplify(){
  const doubt=document.getElementById("doubt").value;
  const lang=document.querySelector('input[name="lang"]:checked').value;
  const output=document.getElementById("output");

  if(images.length===0){
    output.textContent="Upload at least one image.";
    return;
  }

  results={summarize:"loading",explain:"loading",keypoints:"loading"};
  showTab("summarize");

  ["summarize","explain","keypoints"].forEach(t=>{
    runTask(t,doubt,lang);
  });
}

async function runTask(task,doubt,lang){
  const res=await fetch("/.netlify/functions/ai",{
    method:"POST",
    body:JSON.stringify({task,text:doubt,images,lang})
  });

  const data=await res.json();
  results[task]=data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  showTab(task);
}

function format(text){
  return text.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<b>$1</b>");
}

function showTab(tab){
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  const output=document.getElementById("output");

  if(tab==="summarize") document.querySelectorAll(".tab")[0].classList.add("active");
  if(tab==="explain") document.querySelectorAll(".tab")[1].classList.add("active");
  if(tab==="keypoints") document.querySelectorAll(".tab")[2].classList.add("active");

  if(results[tab]==="loading"){
    output.innerHTML=`<div class="loader"><div></div><div></div><div></div></div>`;
  } else {
    output.innerHTML=format(results[tab]);
  }
}

/* PWA */
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("/service-worker.js");
}