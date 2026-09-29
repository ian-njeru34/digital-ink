document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     MOBILE NAVIGATION
  ========================= */

  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('header nav');

  if (menu && nav) {
    menu.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }


  /* =========================
     AI LAB DEMO
  ========================= */

  const generate = document.querySelector('#generateBtn');

  if (generate) {
    generate.addEventListener('click', () => {

      const input = document.querySelector('#aiInput');
      const output = document.querySelector('#aiOutput');

      const value = input.value.trim() || 'your business';

      output.innerHTML = '<span class="muted">Thinking…</span>';

      setTimeout(() => {

        output.innerHTML = `
          <h3>${escapeHtml(value)}</h3>

          <p>
            <strong>Positioning:</strong>
            A smarter digital experience built to turn attention into action.
          </p>

          <p>
            <strong>Homepage idea:</strong>
            Lead with one clear customer promise, then use an intelligent
            assistant to answer questions and qualify intent.
          </p>

          <p>
            <strong>CTA:</strong>
            “Get your tailored plan →”
          </p>

          <small>
            Demo output.
          </small>
        `;

      }, 650);
    });
  }


  /* =========================
     CONTACT FORM → WHATSAPP
  ========================= */

  const form = document.querySelector('#contactForm');

  if (form) {

    form.addEventListener('submit', (e) => {

      e.preventDefault();

      const data = new FormData(form);

      const name = data.get('name') || '';
      const email = data.get('email') || '';
      const company = data.get('company') || '';
      const service = data.get('service') || '';
      const message = data.get('message') || '';

      const whatsappMessage = [
        'Hello Digital Ink, I would like to make an enquiry.',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company || 'Not provided'}`,
        `Service: ${service}`,
        '',
        'Project details:',
        message
      ].join('\n');

      const whatsappUrl =
        `https://wa.me/254719535117?text=${encodeURIComponent(whatsappMessage)}`;

      window.open(
        whatsappUrl,
        '_blank',
        'noopener,noreferrer'
      );

      const status = document.querySelector('#formStatus');

      if (status) {
        status.textContent =
          'Opening WhatsApp with your enquiry…';

        status.classList.add('show');
      }

    });

  }


  /* =========================
     DIGITAL INK AI ASSISTANT
  ========================= */

  const assistantButton =
    document.querySelector('#assistantBtn');

  if (assistantButton) {

    assistantButton.addEventListener(
      'click',
      openAssistant
    );

  }


  /*
    Conversation memory.

    This stores only the current assistant conversation
    in the visitor's browser while the chat is open.

    It does NOT contain any API keys.
  */

  let assistantHistory = [];


  function openAssistant() {

    if (document.querySelector('#digitalInkAssistant')) {
      return;
    }

    /*
      Start a fresh conversation every time
      the assistant window is opened.
    */

    assistantHistory = [];

    const assistant = document.createElement('div');

    assistant.id = 'digitalInkAssistant';

    assistant.innerHTML = `

      <div class="di-assistant-window">

        <div class="di-assistant-header">

          <div>
            <strong>Digital Ink AI</strong>
            <span>Online</span>
          </div>

          <button
            type="button"
            class="di-assistant-close"
            aria-label="Close AI Assistant"
          >
            ×
          </button>

        </div>


        <div
          class="di-assistant-messages"
          id="diAssistantMessages"
        >

          <div class="di-message di-message-ai">

            <strong>Digital Ink AI</strong>

            <p>
              Hi 👋 I'm the Digital Ink AI Assistant.
            </p>

            <p>
              I can answer questions about our services
              and help understand what you're looking to build.
            </p>

            <p>
              What would you like to build?
            </p>

          </div>

        </div>


        <form
          class="di-assistant-input"
          id="diAssistantForm"
        >

          <input
            type="text"
            id="diAssistantInput"
            placeholder="Ask Digital Ink..."
            autocomplete="off"
            required
          />

          <button
            type="submit"
            aria-label="Send message"
          >
            ➤
          </button>

        </form>

      </div>

    `;

    document.body.appendChild(assistant);


    const closeButton =
      assistant.querySelector('.di-assistant-close');

    closeButton.addEventListener(
      'click',
      () => {
        assistant.remove();
        assistantHistory = [];
      }
    );


    const assistantForm =
      assistant.querySelector('#diAssistantForm');

    assistantForm.addEventListener(
      'submit',
      sendAssistantMessage
    );


    const input =
      assistant.querySelector('#diAssistantInput');

    input.focus();

  }


  /* =========================
     SEND AI ASSISTANT MESSAGE
  ========================= */

  async function sendAssistantMessage(event) {

    event.preventDefault();

    const form = event.currentTarget;

    const input =
      form.querySelector('#diAssistantInput');

    const messages =
      document.querySelector('#diAssistantMessages');

    const message =
      input.value.trim();

    if (!message) {
      return;
    }


    /* Add visitor message to the screen */

    const userMessage =
      document.createElement('div');

    userMessage.className =
      'di-message di-message-user';

    userMessage.textContent =
      message;

    messages.appendChild(userMessage);


    /*
      Save visitor message to conversation history
      BEFORE sending it to the server.
    */

    assistantHistory.push({
      role: 'user',
      content: message
    });


    input.value = '';

    messages.scrollTop =
      messages.scrollHeight;


    /* Thinking indicator */

    const thinking =
      document.createElement('div');

    thinking.className =
      'di-message di-message-ai';

    thinking.innerHTML =
      '<span class="di-thinking">Thinking…</span>';

    messages.appendChild(thinking);

    messages.scrollTop =
      messages.scrollHeight;


    try {

      /*
        Send both:
        1. The latest visitor message
        2. Recent conversation history
      */

      const response =
        await fetch('/api/ai-assistant', {

          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            message: message,
            history: assistantHistory
          })

        });


      const data =
        await response.json();


      thinking.remove();


      if (!response.ok) {

        throw new Error(
          data.error ||
          'The AI assistant could not respond.'
        );

      }


      const reply =
        data.reply ||
        'I am sorry, I could not generate a response.';


      /*
        Save the AI response to conversation history.
      */

      assistantHistory.push({
        role: 'assistant',
        content: reply
      });


      const aiMessage =
        document.createElement('div');

      aiMessage.className =
        'di-message di-message-ai';


      aiMessage.innerHTML = `
        <strong>Digital Ink AI</strong>
        <p>${escapeHtml(reply)}</p>
      `;


      messages.appendChild(aiMessage);


      /*
        If the server successfully saved a lead,
        show a subtle confirmation.
      */

      if (data.leadSaved === true) {

        const savedMessage =
          document.createElement('div');

        savedMessage.className =
          'di-message di-message-ai';

        savedMessage.innerHTML = `
          <strong>Digital Ink AI</strong>
          <p>
            Your enquiry has been recorded.
            Our team can follow up with you directly.
          </p>
        `;

        messages.appendChild(savedMessage);

      }


    } catch (error) {

      thinking.remove();


      const errorMessage =
        document.createElement('div');

      errorMessage.className =
        'di-message di-message-ai';


      errorMessage.innerHTML = `
        <strong>Digital Ink AI</strong>
        <p>
          I'm having trouble connecting right now.
          Please try again or contact Digital Ink on WhatsApp.
        </p>
      `;


      messages.appendChild(errorMessage);


      console.error(
        'Digital Ink AI error:',
        error
      );

    }


    messages.scrollTop =
      messages.scrollHeight;

  }


  /* =========================
     SECURITY HELPER
  ========================= */

  function escapeHtml(value) {

    return String(value).replace(
      /[&<>"']/g,

      character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[character])

    );

  }

});
