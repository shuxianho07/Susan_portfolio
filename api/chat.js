module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20 ||
      messages.some(msg => !msg || !['user', 'assistant'].includes(msg.role) ||
        typeof msg.text !== 'string' || !msg.text.trim() || msg.text.length > 2000) ||
      messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Invalid messages format.' });
  }

  if (!apiKey) {
    return res.status(503).json({ error: 'The assistant is temporarily unavailable.' });
  }

  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    const systemInstruction = `You are the interactive portfolio assistant for Susan Ho.
Susan is a Data Analyst & Backend Engineer studying Honours Math & Financial Analysis at the University of Waterloo.

Her Work Experience:
1. Founder & Full-Stack Developer at Financial Literacy EdTech Venture (2023 - 2025): Scaled platform to 60K+ users. Built proprietary data pipelines, SQL databases, and architected backend APIs.
2. Finance & Data Analyst (Intern) at City of Markham (Dec 2024 - Jul 2025): Automated ETL pipelines consolidating legacy data across 5 systems using SQL and Python. Built Power BI dashboards.
3. Data Analyst (Intern) at Adobe (Dec 2023 - Mar 2024): Conducted cohort analyses on large-scale user telemetry data (100M+ events) to identify retention drivers.

Her Projects:
- Flight Ticket Predictor: Trained Random Forest model, exported to ONNX. Built .NET 8 REST API backend, deployed in Docker.
- Futures Market Analysis Model: Processed 50K+ high-frequency futures records daily using Python/Pandas and PostgreSQL.
- Automated Financial Reporting System: Automated reporting using VBA, SQL, Power BI, reducing time from 6 hours to 30 mins.

Skills:
- Languages: Python, SQL, C#, JavaScript, HTML/CSS
- ML/Data: Random Forest, ONNX, Pandas, ETL, Power BI, Seaborn, Plotly
- Backend/DevOps: REST APIs, .NET, Docker, Node.js

Rules:
1. Keep answers concise, friendly, and conversational (1-3 short sentences).
2. ONLY answer questions related to Susan's professional experience, skills, projects, or contact info (s39ho@uwaterloo.ca or LinkedIn/GitHub).
3. If asked about something unrelated, politely steer the conversation back to her portfolio.
4. Do not output markdown lists if you can avoid it; use natural conversational paragraphs.`;

    // Map frontend messages to Gemini format
    const geminiContents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const body = {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: geminiContents,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 250,
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to answer that.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Chat API Error:', error.name);
    return res.status(502).json({ error: 'Failed to generate response.' });
  }
}
