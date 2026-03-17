export async function handler(event){
  try{
    const {task,text,images,lang}=JSON.parse(event.body);

    let instruction="";
    if(task==="summarize") instruction="Give a short summary.";
    if(task==="explain") instruction="Explain simply for students.";
    if(task==="keypoints") instruction="Give bullet points.";

    const langRule = lang==="kannada"
      ? "Respond ONLY in simple Kannada."
      : "Respond ONLY in English.";

    const prompt=`
You are an expert teacher.

${instruction}
${langRule}

Format:
Title:
Explanation:
Examples:
Conclusion:

Text:
${text || "Use image content"}
`;

    let parts=[{text:prompt}];

    if(images){
      images.forEach(img=>{
        parts.push({
          inline_data:{
            mime_type:img.match(/^data:(.*?);/)[1],
            data:img.split(",")[1]
          }
        });
      });
    }

    const response=await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{parts}]})
      }
    );

    const data=await response.json();

    return {
      statusCode:200,
      headers:{"Access-Control-Allow-Origin":"*"},
      body:JSON.stringify(data)
    };

  }catch(err){
    return {
      statusCode:500,
      body:JSON.stringify({error:err.message})
    };
  }
}