const DIGITAL_INK_INSTRUCTIONS = `
You are the Digital Ink AI Assistant.

Digital Ink is an AI and web development company.

Your job is to:
1. Answer questions about Digital Ink's web development and AI services.
2. Understand what the visitor wants to build.
3. Qualify potential clients naturally.
4. Ask useful follow-up questions when information is missing.
5. Collect:
   - Name
   - Company
   - Email or WhatsApp number
   - Service/project needed
   - Budget, if they are comfortable sharing it
   - Brief project description
6. Keep the conversation natural and helpful.
7. Never pressure the visitor.
8. Do not invent specific Digital Ink clients, results, prices, guarantees, or capabilities.
9. If the visitor wants to speak directly with the team, tell them they can contact Digital Ink on WhatsApp at +254 719 535 117.
10. When enough information has been provided, explain that their enquiry can be passed to the Digital Ink team.

Digital Ink services include:
- Custom website development
- Business web applications
- AI-powered chatbots and assistants
- AI integration
- Workflow automation
- Predictive analytics
- Personalization systems
- Custom AI platforms

The tone should be:
- Professional
- Friendly
- Clear
- Concise
- Helpful
- Human

Do not ask all qualification questions at once.
Ask naturally based on the conversation.

If the visitor has only asked a general question, answer it first instead of immediately trying to collect contact information.
`;


function cleanString(value, maxLength = 1000) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return null;
  }

  return cleaned.slice(0, maxLength);
}


function extractLeadFromText(text) {
  const source = typeof text === "string" ? text : "";

  /*
   * Extract visitor messages only.
   * This prevents the AI's own responses from accidentally
   * becoming part of the customer's project information.
   */
  const visitorMatches = [
    ...source.matchAll(
      /(?:^|\n)Visitor:\s*([\s\S]*?)(?=\n(?:Digital Ink AI|Visitor):|$)/gi
    )
  ];

  const visitorText =
    visitorMatches.length > 0
      ? visitorMatches
          .map((match) => match[1])
          .join("\n")
          .trim()
      : source;

  const result = {
    name: null,
    company: null,
    email: null,
    whatsapp: null,
    service: null,
    budget: null,
    project_details: null
  };

  /*
   * Email
   */
  const emailMatch = visitorText.match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );

  if (emailMatch) {
    result.email = cleanString(emailMatch[0], 200);
  }

  /*
   * Kenyan phone / WhatsApp number
   */
  const phonePatterns = [
    /\+254[\s-]?(?:7|1)\d{2}[\s-]?\d{3}[\s-]?\d{3}/,
    /0(?:7|1)\d{2}[\s-]?\d{3}[\s-]?\d{3}/
  ];

  for (const pattern of phonePatterns) {
    const phoneMatch = visitorText.match(pattern);

    if (phoneMatch) {
      result.whatsapp = cleanString(phoneMatch[0], 100);
      break;
    }
  }

  /*
   * Name
   * Examples:
   * "My name is John"
   * "I'm John"
   * "I am John"
   */
  const namePatterns = [
    /(?:my name is|i am|i'm)\s+([A-Za-z][A-Za-z .'-]{1,60}?)(?=\s+(?:and|my|from|at|with)\b|[.,!?]|$)/i
  ];

  for (const pattern of namePatterns) {
    const match = visitorText.match(pattern);

    if (match) {
      result.name = cleanString(match[1], 100);
      break;
    }
  }

  /*
   * Company
   * Examples:
   * "My company is ABC Solutions"
   * "I work at ABC Solutions"
   */
  const companyPatterns = [
    /(?:my company is|company is|i work at|we are)\s+([A-Za-z0-9&'".,\- ]{2,100}?)(?=\s+(?:and|i|we|my|our)\b|[.!?]|$)/i
  ];

  for (const pattern of companyPatterns) {
    const match = visitorText.match(pattern);

    if (match) {
      result.company = cleanString(match[1], 150);
      break;
    }
  }

  /*
   * Budget
   */
  const budgetPatterns = [
    /(?:budget|budget is|budget of|spend|spending|can spend|have)\s*(?:is|of|around|about|approximately)?\s*((?:KSh|KES|ksh|kes|USD|\$|€|£)?\s?[\d,]+(?:\.\d+)?(?:\s*(?:k|m|million|thousand))?)/i
  ];

  for (const pattern of budgetPatterns) {
    const match = visitorText.match(pattern);

    if (match) {
      result.budget = cleanString(match[1], 100);
      break;
    }
  }

  /*
   * Service detection
   */
  const serviceKeywords = [
    {
      keywords: [
        "website",
        "web site",
        "web development",
        "website development"
      ],
      value: "Website development"
    },
    {
      keywords: [
        "web application",
        "web app",
        "business application"
      ],
      value: "Business web application"
    },
    {
      keywords: [
        "chatbot",
        "ai assistant",
        "AI assistant",
        "artificial intelligence assistant"
      ],
      value: "AI chatbot / assistant"
    },
    {
      keywords: [
        "ai integration",
        "AI integration",
        "integrate ai"
      ],
      value: "AI integration"
    },
    {
      keywords: [
        "automation",
        "automate",
        "workflow"
      ],
      value: "Workflow automation"
    },
    {
      keywords: [
        "predictive analytics",
        "analytics",
        "prediction"
      ],
      value: "Predictive analytics"
    },
    {
      keywords: [
        "personalization",
        "personalised",
        "personalized"
      ],
      value: "Personalization system"
    },
    {
      keywords: [
        "custom ai",
        "AI platform",
        "artificial intelligence platform"
      ],
      value: "Custom AI platform"
    }
  ];

  for (const item of serviceKeywords) {
    const found = item.keywords.some((keyword) =>
      visitorText.toLowerCase().includes(keyword.toLowerCase())
    );

    if (found) {
      result.service = item.value;
      break;
    }
  }

  /*
   * Project details
   *
   * Remove simple contact-only sentences where possible,
   * while keeping useful information about what the visitor
   * wants to build.
   */
  const usefulLines = visitorText
    .split(/\n|(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      const lower = line.toLowerCase();

      const isOnlyContact =
        /^[\s]*(?:my name is|i am|i'm)\s+[a-z .'-]+[.!?]?$/i.test(line) ||
        /^[\s]*(?:my email is|email is)\s+/i.test(line) ||
        /^[\s]*(?:my whatsapp is|my phone is|phone is)\s+/i.test(line);

      if (isOnlyContact) {
        return false;
      }

      return (
        lower.includes("website") ||
        lower.includes("web") ||
        lower.includes("app") ||
        lower.includes("ai") ||
        lower.includes("chatbot") ||
        lower.includes("automation") ||
        lower.includes("system") ||
        lower.includes("platform") ||
        lower.includes("software") ||
        lower.includes("online") ||
        lower.includes("customer") ||
        lower.includes("business") ||
        lower.includes("project") ||
        lower.includes("need") ||
        lower.includes("want") ||
        lower.includes("build") ||
        lower.includes("create")
      );
    });

  if (usefulLines.length > 0) {
    result.project_details = cleanString(
      usefulLines.join(" "),
      1500
    );
  }

  return result;
}


function hasProjectInformation(lead) {
  return Boolean(
    lead.service ||
    lead.project_details
  );
}


function hasIdentityInformation(lead) {
  return Boolean(
    lead.name ||
    lead.company
  );
}


function hasContactInformation(lead) {
  return Boolean(
    lead.email ||
    lead.whatsapp
  );
}


async function leadAlreadyExists(lead) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return false;
  }

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`
  };

  try {
    if (lead.email) {
      const emailUrl =
        `${supabaseUrl}/rest/v1/ai_leads` +
        `?select=id&email=eq.${encodeURIComponent(lead.email)}&limit=1`;

      const response = await fetch(emailUrl, {
        method: "GET",
        headers
      });

      if (response.ok) {
        const rows = await response.json();

        if (Array.isArray(rows) && rows.length > 0) {
          return true;
        }
      }
    }

    if (lead.whatsapp) {
      const phoneUrl =
        `${supabaseUrl}/rest/v1/ai_leads` +
        `?select=id&whatsapp=eq.${encodeURIComponent(lead.whatsapp)}&limit=1`;

      const response = await fetch(phoneUrl, {
        method: "GET",
        headers
      });

      if (response.ok) {
        const rows = await response.json();

        if (Array.isArray(rows) && rows.length > 0) {
          return true;
        }
      }
    }
  } catch (error) {
    console.error("Lead duplicate check failed:", error);
  }

  return false;
}


async function saveLead(lead) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  const alreadyExists = await leadAlreadyExists(lead);

  if (alreadyExists) {
    return false;
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/ai_leads`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        whatsapp: lead.whatsapp,
        service: lead.service,
        budget: lead.budget,
        project_details: lead.project_details,
        source: "AI Assistant",
        status: "New"
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      "Supabase lead save failed:",
      response.status,
      errorText
    );

    throw new Error(
      `Supabase returned ${response.status}`
    );
  }

  return true;
}


function jsonResponse(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
}


export default async function handler(request) {
  /*
   * Only POST requests are accepted.
   */
  if (request.method !== "POST") {
    return jsonResponse(
      {
        error: "Method not allowed"
      },
      405
    );
  }

  try {
    /*
     * Check required environment variables.
     */
    const openaiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!openaiKey) {
      console.error("OPENAI_API_KEY is missing.");

      return jsonResponse(
        {
          error: "OpenAI API key is not configured."
        },
        500
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase environment variables are missing.");

      return jsonResponse(
        {
          error: "Supabase is not configured."
        },
        500
      );
    }

    /*
     * Read request body.
     */
    const body = await request.json();

    const message = cleanString(body?.message, 4000);

    const history = Array.isArray(body?.history)
      ? body.history
          .filter(
            (item) =>
              item &&
              (item.role === "user" ||
                item.role === "assistant") &&
              typeof item.content === "string"
          )
          .slice(-20)
      : [];

    if (!message) {
      return jsonResponse(
        {
          error: "Message is required."
        },
        400
      );
    }

    /*
     * Build conversation for OpenAI.
     *
     * The frontend already includes the latest user message
     * inside history, so we avoid adding it twice.
     */
    const cleanedHistory = history.map((item) => ({
      role: item.role,
      content: cleanString(item.content, 4000)
    }));

    const latestHistoryItem =
      cleanedHistory[cleanedHistory.length - 1];

    const latestAlreadyIncluded =
      latestHistoryItem &&
      latestHistoryItem.role === "user" &&
      latestHistoryItem.content === message;

    const conversation = latestAlreadyIncluded
      ? cleanedHistory
      : [
          ...cleanedHistory,
          {
            role: "user",
            content: message
          }
        ];

    /*
     * Create a readable transcript for lead extraction.
     */
    const transcript = conversation
      .map((item) => {
        const speaker =
          item.role === "user"
            ? "Visitor"
            : "Digital Ink AI";

        return `${speaker}: ${item.content}`;
      })
      .join("\n");

    /*
     * Ask OpenAI for the assistant response.
     */
    const openAIResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          instructions: DIGITAL_INK_INSTRUCTIONS,
          input: conversation,
          max_output_tokens: 500
        })
      }
    );

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();

      console.error(
        "OpenAI API error:",
        openAIResponse.status,
        errorText
      );

      return jsonResponse(
        {
          error: "OpenAI request failed."
        },
        502
      );
    }

    const openAIData = await openAIResponse.json();

    /*
     * Responses API normally provides output_text.
     */
    let reply =
      typeof openAIData.output_text === "string"
        ? openAIData.output_text.trim()
        : "";

    /*
     * Fallback extraction in case output_text isn't available.
     */
    if (!reply && Array.isArray(openAIData.output)) {
      for (const outputItem of openAIData.output) {
        if (
          outputItem &&
          Array.isArray(outputItem.content)
        ) {
          for (const contentItem of outputItem.content) {
            if (
              contentItem &&
              typeof contentItem.text === "string"
            ) {
              reply += contentItem.text;
            }
          }
        }
      }

      reply = reply.trim();
    }

    if (!reply) {
      console.error(
        "OpenAI returned no assistant text:",
        JSON.stringify(openAIData)
      );

      return jsonResponse(
        {
          error: "The AI did not return a response."
        },
        502
      );
    }

    /*
     * Extract potential lead information from the entire
     * visitor conversation.
     */
    const lead = extractLeadFromText(transcript);

    /*
     * Only save a lead when we have:
     *
     * 1. Name OR company
     * 2. Project/service information
     * 3. Email OR WhatsApp
     */
    const qualifiedForLeadSave =
      hasIdentityInformation(lead) &&
      hasProjectInformation(lead) &&
      hasContactInformation(lead);

    let leadSaved = false;

    if (qualifiedForLeadSave) {
      try {
        leadSaved = await saveLead(lead);
      } catch (leadError) {
        console.error(
          "Lead save error:",
          leadError
        );

        /*
         * Do not break the visitor's AI conversation
         * just because lead storage failed.
         */
        leadSaved = false;
      }
    }

    /*
     * Return the AI response to the website.
     */
    return jsonResponse({
      reply,
      leadSaved
    });
  } catch (error) {
    console.error(
      "AI Assistant server error:",
      error
    );

    return jsonResponse(
      {
        error:
          "I'm having trouble connecting right now. Please try again or contact Digital Ink on WhatsApp."
      },
      500
    );
  }
}
