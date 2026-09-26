const Groq = require("groq-sdk");

const skillsyncInformation = `skillSYNC is an educational and training platform founded by Minahal Salahudin, an automation engineer and cybersecurity specialist. The initiative is designed to bridge the gap between traditional education and the evolving tech job market by training students and fresh graduates in high-demand, future-focused technical skills. Key Focus Areas & Features Core Technical Training: The platform offers intensive workshops, bootcamps, and courses focusing heavily on AI workflows, large language models (LLMs), automation engineering, and full-stack development. Practical Learning: Rather than focusing solely on theory, it teaches advanced topics like Context Engineering and "red teaming" (testing AI security perimeters against jailbreaks) through hands-on, multi-project labs. Real-World Experience: Students actively build production-ready projects—such as AI recruiting tools, automated customer support bots, and workflow systems—using tools like n8n, Make.com, and LangGraph. The skillIT Connection: It operates alongside a sister placement initiative called skillIT. Once students complete their training in the community, vetted engineers are connected with companies looking to hire talent to build customized business automation and AI infrastructure.`;

const systemPrompt = `You are a concise, helpful assistant for Skillsync. Answer only questions about Skillsync using the information below. Keep answers under 4 sentences unless the user asks for more detail. For unrelated requests, reply exactly: I can only answer questions about Skillsync. Do not invent facts. If the answer is not in the information below, say "I don't know."\n\nSkillsync information: ${skillsyncInformation}`;

module.exports = async function handler(request, response) {
  if (request.method === "GET") {
    return response.redirect(302, "/");
  }

  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed." });
  }

  const userMessages = request.body?.messages;
  const validMessages = Array.isArray(userMessages) && userMessages.every(
    (message) => message
      && (message.role === "user" || message.role === "assistant")
      && typeof message.content === "string",
  );

  if (!validMessages) {
    return response.status(400).json({ error: "messages must be a list of user and assistant messages" });
  }

  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.DEFAULT_MODEL || "llama-3.3-70b-versatile",
      max_tokens: Number(process.env.MAX_TOKENS || 500),
      messages: [
        { role: "system", content: systemPrompt },
        ...userMessages.slice(-20),
      ],
    });

    return response.status(200).json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "The assistant could not respond." });
  }
};
