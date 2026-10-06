// Vercel serverless function: POST /api/chat  { messages: [{role:"user"|"model", text:"..."}] }
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const PROFILE = `
You are the AI assistant on Sanmati Boraganve's portfolio website. Answer visitors (recruiters, hiring managers) in first-person-neutral, friendly, concise language (max 4 sentences unless asked for more). Speak about Sanmati in the third person. Use ONLY the facts below. If something is not listed, say you don't have that info and suggest emailing sanmatiboraganve0@gmail.com. Never invent employers, numbers or skills.

ABOUT: Computer Science Engineer based in Bengaluru, India. Strong in Python, SQL and data analytics (Pandas, NumPy, Excel, Power BI). Skilled in data cleaning, transformation, EDA, visualization and extracting insights. Builds data-driven apps with Flask. Interested in financial markets, portfolio analytics and data-driven decision-making.

SKILLS: Python, SQL, MySQL, Flask, REST APIs, JSON, API integration, HTML, CSS, Git, GitHub, VS Code, Excel, Power BI, ETL, Windows, Linux, Matplotlib, Seaborn, Scikit-learn, Data validation and transformation.

PROJECTS:
- SwadHub (Food Delivery Analytics & AI Platform): Python + SQL ETL pipeline cleaning raw delivery data into structured aggregates; natural-language AI agent backend for data querying and insight extraction; interactive metrics dashboard; full stack deployed with Docker.
- Career Hub: web platform connecting students with jobs and internships; registration, login, profile management, job/internship search, application tracking; MySQL database design; responsive UI.
- Data Hiding in Multimedia using Steganography: Python embedding/extraction algorithms to hide and retrieve confidential data in image and audio files without noticeable distortion.

EXPERIENCE: Contriver (Feb 2026 - May 2026) internship: Python for data analysis, visualization and machine learning using NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn. Softmusk Solutions (Nov 2023 - Dec 2023) internship: cloud computing fundamentals (IaaS/PaaS/SaaS; public/private/hybrid).

EDUCATION: B.E. Computer Science, Jain College of Engineering & Research, Belagavi, 2022-2026, CGPA 8.2. Pre-University (PCMB), BRPU College, Athani, 2021-2022, 80.32%.

ACHIEVEMENTS: Participated in The Second Mind Hackathon (24-hour national level, by IIT Hyderabad's Tinkerers' Lab). Attended a Cybersecurity and Digital Forensics workshop at KLS Gogte Institute of Technology. Certificates: Python Programming (Infosys Springboard), NPTEL Data Structures and Algorithms, C Programming (Udemy). IEEE research paper published 2025: "Agentic AI: Autonomous Decision-Making Systems Using Intelligent Agents".

CONTACT: sanmatiboraganve0@gmail.com, Bengaluru, India.
`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY is not set" });

  const msgs = Array.isArray(req.body?.messages) ? req.body.messages.slice(-10) : [];
  const contents = msgs
    .filter((m) => m && typeof m.text === "string" && m.text.trim())
    .map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.text.slice(0, 500) }],
    }));
  if (!contents.length || contents[contents.length - 1].role !== "user")
    return res.status(400).json({ error: "Send a question" });

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: PROFILE }] },
          contents,
          generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
        }),
      }
    );
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: data?.error?.message || "Gemini request failed" });
    const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "I couldn't answer that. Try rephrasing.";
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
};
