// api/ai-assistant.js

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = "gpt-5.6-luna";

const DIGITAL_INK_INSTRUCTIONS = `
You are Digital Ink AI, the AI assistant for Digital Ink, a Kenya-based company specializing in web development, AI integration, and business automation.

Your job is to:
1. Answer visitor questions clearly and naturally.
2. Understand what the visitor's business needs.
3. Recommend an appropriate Digital Ink service when relevant.
4. Qualify potential clients without being pushy.
5. Collect useful project information.
6. Encourage the visitor to contact Digital Ink when they are ready.

Digital Ink services and current prices:

- Launch Website — KSh 5,000
- Business Website — KSh 12,000
- AI Business Assistant — KSh 25,500
- E-commerce — From KSh 25,500
- Business Automation — From KSh 25,500
- Custom Web Application — From KSh 51,000

Other services may include:
- AI chatbots
- AI integration
- Workflow automation
- Predictive analytics
- Personalization systems
- Custom AI platforms
- Custom web applications

Important rules:

- Be helpful, professional and conversational.
- Do not pressure visitors into buying.
- Do not invent clients, projects, results, testimonials or guarantees.
- Do not promise something that Digital Ink has not explicitly stated.
- Use the prices above when discussing pricing.
- If a service has a "From" price, make it clear that the final price depends on requirements.
- Ask sensible follow-up questions when more information is needed.
- Do not repeatedly ask for information the visitor has already provided.
- If the visitor gives their name, company, project, service, email or WhatsApp number, remember it during the conversation.
- Try to understand the visitor's project before recommending a solution.
- Useful qualification information includes:
  name,
  company/business,
  email,
  WhatsApp/phone,
  desired service,
  project requirements,
  budget,
  timeline.

Digital Ink WhatsApp:
+254 719 535 117

When appropriate, tell the visitor they can contact Digital Ink on WhatsApp.

Do not claim that you have personally contacted anyone.
Do not claim that a human team member is currently watching the conversation unless that is actually established by the website.

Keep normal responses reasonably concise. Avoid unnecessarily long answers.
`;

// ------------------------------------------------------------
// Utility functions
// ------------------------------------------------------------

function cleanString(value, maxLength = 1000) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizePhone(value) {
  const phone = cleanString(value, 100);

  if (!phone) {
    return "";
  }

  return phone;
}

function extractEmail(text) {
  const match = text.match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );

  return match ? match[0].toLowerCase() : "";
}

function extractPhone(text) {
  const match = text.match(
    /(?:\+?254|0)\s*\d(?:[\s-]*\d){8,11}/
  );

  return match ? match[0].replace(/[^\d+]/g, "") : "";
}

function extractName(text) {
  const patterns = [
    /\bmy name is\s+([A-Za-z][A-Za-z .'-]{1,60})/i,
    /\bi am\s+([A-Za-z][A-Za-z .'-]{1,60})/i,
    /\bi'm\s+([A-Za-z][A-Za-z .'-]{1,60})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return cleanString(match[1], 100);
    }
  }

  return "";
}

function extractCompany(text) {
  const patterns = [
    /\bmy company is\s+(.+?)(?:\.|,|$)/i,
    /\bmy business is\s+(.+?)(?:\.|,|$)/i,
    /\bcompany:\s*(.+?)(?:\.|,|$)/i,
    /\bbusiness:\s*(.+?)(?:\.|,|$)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return cleanString(match[1], 150);
    }
  }

  return "";
}

function extractBudget(text) {
  const patterns = [
    /\b(?:budget|budget is|my budget is)\s*(?:is|of)?\s*(?:ksh|kes|sh)?\s*([\d,]+(?:\.\d+)?)/i,
    /\b(?:ksh|kes)\s*([\d,]+(?:\.\d+)?)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return cleanString(match[1], 50);
    }
  }

  return "";
}

function detectService(text) {
  const lower = text.toLowerCase();

  if (
    lower.includes("e-commerce") ||
    lower.includes("ecommerce") ||
    lower.includes("online store") ||
    lower.includes("online shop")
  ) {
    return "E-commerce";
  }

  if (
    lower.includes("ai chatbot") ||
    lower.includes("ai assistant") ||
    lower.includes("chatbot") ||
    lower.includes("ai assistant")
  ) {
    return "AI Business Assistant";
  }

  if (
    lower.includes("automation") ||
    lower.includes("automate") ||
    lower.includes("workflow")
  ) {
    return "Business Automation";
  }

  if (
    lower.includes("web application") ||
    lower.includes("web app") ||
    lower.includes("custom application")
  ) {
    return "Custom Web Application";
  }

  if (
    lower.includes("business website") ||
    lower.includes("company website") ||
    lower.includes("professional website")
  ) {
    return "Business Website";
  }

  if (
    lower.includes("website") ||
    lower.includes("web site")
  ) {
    return "Website";
  }

  return "";
}

function extractProjectDetails(text) {
  const lower = text.toLowerCase();

  const projectIndicators = [
    "website",
    "web app",
    "web application",
    "chatbot",
    "ai",
    "automation",
    "ecommerce",
    "e-commerce",
    "online store",
    "online shop",
    "platform",
    "system",
    "application",
    "software"
  ];

  const containsProjectInformation = projectIndicators.some(
    (item) => lower.includes(item)
  );

  if (!containsProjectInformation) {
    return "";
  }

  return cleanString(text, 1200);
}

// ------------------------------------------------------------
// Lead extraction
// ------------------------------------------------------------

function extractLeadFromText(text) {
  const fullText = cleanString(text, 12000);

  const name = extractName(fullText);
  const company = extractCompany(fullText);
  const email = extractEmail(fullText);
  const phone = normalizePhone(extractPhone(fullText));
  const budget = extractBudget(fullText);
  const service = detectService(fullText);
  const projectDetails = extractProjectDetails(fullText);

  return {
    name,
    company,
    email,
    phone,
    budget,
    service,
    project_details: projectDetails
  };
}

function hasQualifiedLead(lead) {
  const hasIdentity = Boolean(lead.name);
  const hasProject = Boolean(
    lead.service || lead.project_details
  );
  const hasContact = Boolean(
    lead.email || lead.phone
  );

  return hasIdentity && hasProject && hasContact;
}

// ------------------------------------------------------------
// Supabase
// ------------------------------------------------------------

async function saveLead(lead) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Supabase environment variables are missing."
    );

    return false;
  }

  const messageParts = [];

  if (lead.project_details) {
    messageParts.push(
      `Project: ${lead.project_details}`
    );
  }

  if (lead.budget) {
    messageParts.push(
      `Budget: KSh ${lead.budget}`
    );
  }

  const message =
    messageParts.join("\n") ||
    "Lead qualified through Digital Ink AI.";

  const payload = {
    name: lead.name,
    business: lead.company || null,
    email: lead.email || null,
    phone: lead.phone || null,
    service: lead.service || null,
    message,
    source: "AI Assistant",
    status: "new",
    notes: lead.budget
      ? `Budget mentioned: KSh ${lead.budget}`
      : null
  };

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/leads`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          Prefer: "return=minimal"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Supabase lead save failed:",
        response.status,
        errorText
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Supabase lead save error:",
      error
    );

    return false;
  }
}

// ------------------------------------------------------------
// JSON response helper
// ------------------------------------------------------------

function jsonResponse(res, statusCode, data) {
  res.status(statusCode);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  return res.json(data);
}

// ------------------------------------------------------------
// OpenAI request with timeout
// ------------------------------------------------------------

async function callOpenAI(message, history) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing."
    );
  }

  const controller = new AbortController();

  // Prevent another 300-second Vercel timeout.
  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    const safeHistory = Array.isArray(history)
      ? history
          .slice(-10)
          .filter(
            (item) =>
              item &&
              typeof item === "object" &&
              (item.role === "user" ||
                item.role === "assistant")
          )
          .map((item) => ({
            role: item.role,
            content: cleanString(
              item.content || item.text || "",
              2000
            )
          }))
          .filter((item) => item.content)
      : [];

    const input = [
      ...safeHistory,
      {
        role: "user",
        content: cleanString(message, 4000)
      }
    ];

    const response = await fetch(
      OPENAI_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          instructions:
            DIGITAL_INK_INSTRUCTIONS,
          input,
          max_output_tokens: 350
        }),
        signal: controller.signal
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "OpenAI API error:",
        response.status,
        errorText
      );

      throw new Error(
        `OpenAI API returned ${response.status}`
      );
    }

    const data = await response.json();

    let outputText = "";

    if (
      typeof data.output_text === "string"
    ) {
      outputText = data.output_text;
    }

    if (
      !outputText &&
      Array.isArray(data.output)
    ) {
      for (const item of data.output) {
        if (
          Array.isArray(item.content)
        ) {
          for (const content of item.content) {
            if (
              typeof content.text === "string"
            ) {
              outputText += content.text;
            }
          }
        }
      }
    }

    outputText = cleanString(
      outputText,
      4000
    );

    if (!outputText) {
      throw new Error(
        "OpenAI returned an empty response."
      );
    }

    return outputText;
  } finally {
    clearTimeout(timeout);
  }
}

// ------------------------------------------------------------
// Vercel serverless function
// ------------------------------------------------------------

export default async function handler(
  req,
  res
) {
  // Only allow POST requests.
  if (req.method !== "POST") {
    return jsonResponse(res, 405, {
      error: "Method not allowed."
    });
  }

  try {
    // IMPORTANT:
    // Vercel's Node.js serverless runtime provides
    // req.body. It does NOT provide request.json().
    const body = req.body || {};

    const message = cleanString(
      body.message,
      4000
    );

    const history = Array.isArray(
      body.history
    )
      ? body.history
      : [];

    if (!message) {
      return jsonResponse(res, 400, {
        error: "Message is required."
      });
    }

    // --------------------------------------------------------
    // Generate AI response
    // --------------------------------------------------------

    const reply = await callOpenAI(
      message,
      history
    );

    // --------------------------------------------------------
    // Extract possible lead information
    //
    // We inspect the current message plus recent history.
    // This avoids another OpenAI API call and keeps the
    // response faster.
    // --------------------------------------------------------

    const recentConversation = [
      ...history
        .slice(-10)
        .map((item) => {
          if (!item) return "";

          return cleanString(
            item.content ||
              item.text ||
              "",
            2000
          );
        }),
      message
    ]
      .filter(Boolean)
      .join("\n");

    const lead =
      extractLeadFromText(
        recentConversation
      );

    let leadSaved = false;

    // --------------------------------------------------------
    // Save only a sufficiently qualified lead.
    // --------------------------------------------------------

    if (hasQualifiedLead(lead)) {
      leadSaved = await saveLead(lead);
    }

    return jsonResponse(res, 200, {
      reply,
      leadSaved
    });
  } catch (error) {
    console.error(
      "AI Assistant server error:",
      error
    );

    // Give the browser a useful response rather than
    // allowing the function to hang until Vercel's timeout.
    if (
      error &&
      error.name === "AbortError"
    ) {
      return jsonResponse(res, 504, {
        error:
          "The AI service took too long to respond.",
        reply:
          "I'm sorry, the AI service is taking longer than expected. Please try again, or contact Digital Ink on WhatsApp at +254 719 535 117."
      });
    }

    return jsonResponse(res, 500, {
      error:
        "AI Assistant server error.",
      reply:
        "I'm having trouble connecting right now. Please try again in a moment, or contact Digital Ink on WhatsApp at +254 719 535 117."
    });
  }
}
