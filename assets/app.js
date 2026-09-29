document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('header nav');
  if (menu && nav) menu.addEventListener('click', () => nav.classList.toggle('open'));

  const generate = document.querySelector('#generateBtn');
  if (generate) generate.addEventListener('click', () => {
    const input = document.querySelector('#aiInput');
    const output = document.querySelector('#aiOutput');
    const value = input.value.trim() || 'your business';
    output.innerHTML = '<span class="muted">Thinking…</span>';
    setTimeout(() => {
      output.innerHTML = `<h3>${escapeHtml(value)}</h3><p><strong>Positioning:</strong> A smarter digital experience built to turn attention into action.</p><p><strong>Homepage idea:</strong> Lead with one clear customer promise, then use an intelligent assistant to answer questions and qualify intent.</p><p><strong>CTA:</strong> “Get your tailored plan →”</p><small>Demo output. Connect an AI API through a secure server/Supabase Edge Function for production.</small>`;
    }, 650);
  });

  const form = document.querySelector('#contactForm');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = document.querySelector('#formStatus');
    status.textContent = 'Demo mode: your form is working. Connect Supabase to store and notify on real submissions.';
    status.classList.add('show');
  });

  const assistant = document.querySelector('#assistantBtn');
  if (assistant) assistant.addEventListener('click', () => {
    alert('AI assistant demo: connect your preferred AI provider and Supabase Edge Function to make this production-ready.');
  });

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
});