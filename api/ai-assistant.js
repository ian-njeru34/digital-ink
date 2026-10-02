// api/ai-assistant.js

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = "gpt-5.6-luna";

// ============================================================
// DIGITAL INK AI INSTRUCTIONS
// ============================================================

const DIGITAL_INK_INSTRUCTIONS = `
You are Digital Ink AI, the AI assistant for Digital Ink, a Kenya-based company specializing in web development, AI integration, and business automation.

Your responsibilities:
- Answer visitor questions clearly and naturally.
- Understand what the visitor's business needs.
- Recommend suitable Digital Ink services.
- Qualify potential clients without being pushy.
- Collect useful project information.
- Help visitors contact Digital Ink when they are ready.

CURRENT DIGITAL INK SERVICES AND PRICES:

Launch Website — KSh 5,000
Business Website — KSh 12,000
AI Business Assistant — KSh 25,500
E-commerce — From KSh 25,500
Business Automation — From KSh 25,500
Custom Web Application — From KSh 51,000

Other services:
- AI chatbots
- AI integration
- Workflow automation
- Predictive analytics
- Personalization systems
- Custom AI platforms
- Custom web applications

IMPORTANT:
- Be helpful, professional and conversational.
- Do not pressure visitors.
- Do not invent clients, projects, testimonials, results or guarantees.
- Use the prices above when discussing pricing.
- Explain that "From" prices depend on requirements.
- Do not repeatedly ask for information the visitor has already provided.
- Remember information already provided during the conversation.
- Ask useful follow-up questions.
- Try to understand the project before recommending a solution.

Useful information to collect:
- name
- company/business
- email
- WhatsApp/phone
- desired service
- project requirements
- budget
- timeline

Digital Ink WhatsApp:
+254 719 535 117

When appropriate, tell the visitor they can contact Digital Ink on WhatsApp.

Do not claim to have contacted anyone.
Do not claim a human is currently watching the conversation unless that is actually established.

Keep answers concise and useful.
`;

// ============================================================
// BASIC HELPERS
// ============================================================

function cleanString(value, maxLength = 1000) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

// ============================================================
// EMAIL DETECTION
// ============================================================

function extractEmail(text) {
  const match = String(text).match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );

  return match
    ? match[0].toLowerCase()
    : "";
}

// ============================================================
// PHONE DETECTION
// Supports:
// +254712345678
// +254 712 345 678
// 0712345678
// 0712 345 678
// ============================================================

function extractPhone(text) {
  const source = String(text);

  const patterns = [
    /\+254[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}/,
    /254[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}/,
    /0\d{3}[\s-]?\d{3}[\s-]?\d{3}/
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);

    if (match) {
      let phone = match[0].replace(
        /[\s-]/g,
        ""
      );

      if (
        phone.startsWith("0") &&
        phone.length === 10
      ) {
        phone = "+254" + phone.substring(1);
      }

      if (
        phone.startsWith("254") &&
        !phone.startsWith("+254")
      ) {
        phone = "+" + phone;
      }

      return phone;
    }
  }

  return "";
}

// ============================================================
// NAME DETECTION
// ============================================================

function extractName(text) {
  const patterns = [
    /\bmy name is\s+([A-Za-z][A-Za-z .'-]{1,60})(?=\.|,|;|\n|$)/i,

    /\bi am\s+([A-Za-z][A-Za-z .'-]{1,60})(?=\.|,|;|\n|$)/i,

    /\bi'm\s+([A-Za-z][A-Za-z .'-]{1,60})(?=\.|,|;|\n|$)/i,

    /\bname:\s*([A-Za-z][A-Za-z .'-]{1,60})(?=\.|,|;|\n|$)/i
  ];

  for (const pattern of patterns) {
    const match = String(text).match(
      pattern
    );

    if (match) {
      return cleanString(
        match[1],
        100
      );
    }
  }

  return "";
}

// ============================================================
// COMPANY DETECTION
// ============================================================

function extractCompany(text) {
  const patterns = [
    /\bmy company is\s+(.+?)(?=\.|,|;|\n|$)/i,

    /\bmy business is\s+(.+?)(?=\.|,|;|\n|$)/i,

    /\bcompany:\s*(.+?)(?=\.|,|;|\n|$)/i,

    /\bbusiness:\s*(.+?)(?=\.|,|;|\n|$)/i,

    /\bcompany name is\s+(.+?)(?=\.|,|;|\n|$)/i
  ];

  for (const pattern of patterns) {
    const match = String(text).match(
      pattern
    );

    if (match) {
      return cleanString(
        match[1],
        150
      );
    }
  }

  return "";
}

// ============================================================
// BUDGET DETECTION
// ============================================================

function extractBudget(text) {
  const patterns = [
    /\b(?:my\s+)?budget(?:\s+is)?\s*(?:ksh|kes|sh)?\s*([\d,]+(?:\.\d+)?)/i,

    /\b(?:ksh|kes)\s*([\d,]+(?:\.\d+)?)/i
  ];

  for (const pattern of patterns) {
    const match = String(text).match(
      pattern
    );

    if (match) {
      return cleanString(
        match[1],
        50
      );
    }
  }

  return "";
}

// ============================================================
// SERVICE DETECTION
// ============================================================

function detectService(text) {
  const lower = String(text)
    .toLowerCase();

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
    lower.includes("chatbot")
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

// ============================================================
// PROJECT DETECTION
// ============================================================

function extractProjectDetails(text) {
  const source = String(text);

  const lower = source.toLowerCase();

  const indicators = [
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
    "software",
    "portal",
    "booking system",
    "management system"
  ];

  const hasProjectInformation =
    indicators.some(
      (item) =>
        lower.includes(item)
    );

  if (!hasProjectInformation) {
    return "";
  }

  return cleanString(
    source,
    2000
  );
}

// ============================================================
// LEAD EXTRACTION
// ============================================================

function extractLeadFromText(text) {
  const fullText =
    cleanString(text, 15000);

  const name =
    extractName(fullText);

  const company =
    extractCompany(fullText);

  const email =
    extractEmail(fullText);

  const phone =
    extractPhone(fullText);

  const budget =
    extractBudget(fullText);

  const service =
    detectService(fullText);

  const projectDetails =
    extractProjectDetails(
      fullText
    );

  return {
    name,
    company,
    email,
    phone,
    budget,
    service,
    project_details:
      projectDetails
  };
}

// ============================================================
// LEAD QUALIFICATION
//
// A lead is considered qualified when:
// - there is contact information
// - there is a project/service
//
// Name is NOT required because the database can receive a
// fallback name if the visitor has not provided one.
// ============================================================

function hasQualifiedLead(lead) {
  const hasContact =
    Boolean(
      lead.email ||
      lead.phone
    );

  const hasProject =
    Boolean(
      lead.service ||
      lead.project_details
    );

  return (
    hasContact &&
    hasProject
  );
}

// ============================================================
// SUPABASE LEAD SAVE
// ============================================================

async function saveLead(lead) {
  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey
  ) {
    console.error(
      "AI LEAD ERROR: Supabase environment variables are missing."
    );

    return {
      success: false,
      reason:
        "Supabase environment variables are missing."
    };
  }

  // The leads table requires name.
  // If the visitor did not provide one, use a clear
  // placeholder rather than rejecting the lead.
  const leadName =
    lead.name ||
    "AI Assistant Visitor";

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
    "Lead captured through Digital Ink AI.";

  const payload = {
    name: leadName,

    business:
      lead.company || null,

    email:
      lead.email || null,

    phone:
      lead.phone || null,

    service:
      lead.service || null,

    message,

    source:
      "AI Assistant",

    status:
      "new",

    notes:
      lead.budget
        ? `Budget mentioned: KSh ${lead.budget}`
        : "Lead captured by Digital Ink AI."
  };

  console.log(
    "AI LEAD: attempting Supabase save:",
    JSON.stringify({
      name: payload.name,
      business: payload.business,
      email: payload.email,
      phone: payload.phone,
      service: payload.service
    })
  );

  try {
    const response =
      await fetch(
        `${supabaseUrl}/rest/v1/leads`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            apikey:
              supabaseAnonKey,

            Authorization:
              `Bearer ${supabaseAnonKey}`,

            Prefer:
              "return=representation"
          },

          body:
            JSON.stringify(
              payload
            )
        }
      );

    const responseText =
      await response.text();

    if (!response.ok) {
      console.error(
        "AI LEAD: Supabase rejected lead:",
        response.status,
        responseText
      );

      return {
        success: false,
        reason:
          `Supabase ${response.status}: ${responseText}`
      };
    }

    console.log(
      "AI LEAD: SUCCESSFULLY SAVED TO SUPABASE"
    );

    return {
      success: true,
      reason:
        "Lead successfully saved."
    };
  } catch (error) {
    console.error(
      "AI LEAD: Supabase connection error:",
      error
    );

    return {
      success: false,
      reason:
        error.message ||
        "Supabase connection error."
    };
  }
}

// ============================================================
// JSON RESPONSE
// ============================================================

function jsonResponse(
  res,
  statusCode,
  data
) {
  res.status(statusCode);

  res.setHeader(
    "Content-Type",
    "application/json"
  );

  res.setHeader(
    "Cache-Control",
    "no-store"
  );

  return res.json(data);
}

// ============================================================
// OPENAI
// ============================================================

async function callOpenAI(
  message,
  history
) {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing."
    );
  }

  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      controller.abort();
    }, 30000);

  try {
    const safeHistory =
      Array.isArray(history)
        ? history
            .slice(-10)
            .filter(
              (item) =>
                item &&
                typeof item ===
                  "object" &&
                (
                  item.role ===
                    "user" ||
                  item.role ===
                    "assistant"
                )
            )
            .map(
              (item) => ({
                role:
                  item.role,

                content:
                  cleanString(
                    item.content ||
                      item.text ||
                      "",
                    2000
                  )
              })
            )
            .filter(
              (item) =>
                item.content
            )
        : [];

    const input = [
      ...safeHistory,

      {
        role: "user",

        content:
          cleanString(
            message,
            4000
          )
      }
    ];

    const response =
      await fetch(
        OPENAI_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${apiKey}`
          },

          body:
            JSON.stringify({
              model:
                OPENAI_MODEL,

              instructions:
                DIGITAL_INK_INSTRUCTIONS,

              input,

              max_output_tokens:
                350
            }),

          signal:
            controller.signal
        }
      );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "OpenAI API error:",
        response.status,
        errorText
      );

      throw new Error(
        `OpenAI API returned ${response.status}`
      );
    }

    const data =
      await response.json();

    let outputText = "";

    if (
      typeof data.output_text ===
      "string"
    ) {
      outputText =
        data.output_text;
    }

    if (
      !outputText &&
      Array.isArray(
        data.output
      )
    ) {
      for (
        const item of data.output
      ) {
        if (
          Array.isArray(
            item.content
          )
        ) {
          for (
            const content of
              item.content
          ) {
            if (
              typeof content.text ===
              "string"
            ) {
              outputText +=
                content.text;
            }
          }
        }
      }
    }

    outputText =
      cleanString(
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

// ============================================================
// VERCEL SERVERLESS HANDLER
// ============================================================

export default async function handler(
  req,
  res
) {
  if (
    req.method !==
    "POST"
  ) {
    return jsonResponse(
      res,
      405,
      {
        error:
          "Method not allowed."
      }
    );
  }

  try {
    // Vercel Node.js function:
    // use req.body, NOT request.json()
    const body =
      req.body || {};

    const message =
      cleanString(
        body.message,
        4000
      );

    const history =
      Array.isArray(
        body.history
      )
        ? body.history
        : [];

    if (!message) {
      return jsonResponse(
        res,
        400,
        {
          error:
            "Message is required."
        }
      );
    }

    // --------------------------------------------------------
    // Get AI response
    // --------------------------------------------------------

    const reply =
      await callOpenAI(
        message,
        history
      );

    // --------------------------------------------------------
    // Build complete conversation for lead extraction
    // --------------------------------------------------------

    const conversationParts =
      history
        .slice(-10)
        .map(
          (item) => {
            if (!item) {
              return "";
            }

            return cleanString(
              item.content ||
                item.text ||
                "",
              2000
            );
          }
        )
        .filter(Boolean);

    conversationParts.push(
      message
    );

    const conversation =
      conversationParts.join(
        "\n"
      );

    // --------------------------------------------------------
    // Extract lead
    // --------------------------------------------------------

    const lead =
      extractLeadFromText(
        conversation
      );

    console.log(
      "AI LEAD EXTRACTION:",
      JSON.stringify({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        service: lead.service,
        budget: lead.budget,
        hasProject:
          Boolean(
            lead.service ||
              lead.project_details
          )
      })
    );

    let leadSaved =
      false;

    let leadSaveReason =
      "Lead not yet qualified.";

    // --------------------------------------------------------
    // Save qualified lead
    // --------------------------------------------------------

    if (
      hasQualifiedLead(
        lead
      )
    ) {
      const saveResult =
        await saveLead(
          lead
        );

      leadSaved =
        saveResult.success;

      leadSaveReason =
        saveResult.reason;
    } else {
      const missing = [];

      if (
        !lead.email &&
        !lead.phone
      ) {
        missing.push(
          "email or WhatsApp"
        );
      }

      if (
        !lead.service &&
        !lead.project_details
      ) {
        missing.push(
          "project/service"
        );
      }

      leadSaveReason =
        `Missing: ${missing.join(
          ", "
        )}`;
    }

    // --------------------------------------------------------
    // Return response
    // --------------------------------------------------------

    return jsonResponse(
      res,
      200,
      {
        reply,

        leadSaved,

        // This is useful while testing.
        // It lets us see exactly what the server detected.
        leadStatus:
          leadSaveReason
      }
    );
  } catch (error) {
    console.error(
      "AI Assistant server error:",
      error
    );

    if (
      error &&
      error.name ===
        "AbortError"
    ) {
      return jsonResponse(
        res,
        504,
        {
          error:
            "The AI service took too long to respond.",

          reply:
            "I'm sorry, the AI service is taking longer than expected. Please try again, or contact Digital Ink on WhatsApp at +254 719 535 117."
        }
      );
    }

    return jsonResponse(
      res,
      500,
      {
        error:
          "AI Assistant server error.",

        reply:
          "I'm having trouble connecting right now. Please try again in a moment, or contact Digital Ink on WhatsApp at +254 719 535 117."
      }
    );
  }
}
