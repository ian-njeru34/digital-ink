# Digital Ink V2

Xtranet-inspired professional technology-company structure, with an original Digital Ink visual identity and AI/conversion-first experience.

## Prices
Launch Website KSh 5,000; Business Website KSh 12,000; AI Business Assistant KSh 25,500; E-commerce from KSh 25,500; Business Automation from KSh 25,500; Custom Web Application from KSh 51,000.

## GitHub
Replace the old website files in the Digital Ink repository with this folder and commit.

## Supabase
Run `supabase.sql` in SQL Editor. Put the Project URL and public anon/publishable key in `config.js`. Never put a service_role/secret key in browser code.

## Vercel
Deploy the GitHub repository. No build command is required.

## AI
The AI Lab has a local demo response engine. For real OpenAI integration, use a secure server-side endpoint and set `window.DIGITAL_INK_AI_ENDPOINT`. Never expose an OpenAI secret key in JavaScript.

## Lead conversion
Multiple CTAs, service preselection, AI consultation, WhatsApp fallback and Supabase lead capture are included. Production admin access should use Supabase Auth and admin-only RLS.
