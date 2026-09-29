# Digital Ink Website

A Vercel/GitHub-ready multi-page website for Digital Ink, an AI integration and web development company.

## Included

- Responsive homepage: **We Build Websites That Think.**
- Services page with interactive-style service demos
- Case Studies page with clearly marked illustrative placeholders
- AI Lab with a working local demo generator
- About page
- Contact page with demo form behavior
- Shared header/footer and responsive navigation
- Supabase starter SQL schema
- `.env.example` for future Supabase integration
- `vercel.json`

## Deploy to GitHub + Vercel

1. Create a new GitHub repository, for example `digital-ink-website`.
2. Upload **all files and folders inside this ZIP** to the repository.
3. In Vercel, choose **Add New → Project**, import the GitHub repository and deploy.
4. No build command is required for this starter.
5. Open your Vercel URL.

## Supabase setup

Create a Supabase project. In SQL Editor, run `supabase/schema.sql`.

Then add your project values to a secure server-side integration when you are ready. Do not expose a Supabase service-role key in browser JavaScript.

The static starter intentionally does not pretend to have production AI or database functionality. The AI Lab and contact form demonstrate the front-end experience. The next step is to connect them through Supabase Edge Functions / your chosen AI provider.

## Replace before launch

- `hello@digitalink.co.ke` with your real business email
- Illustrative case-study metrics with verified client results
- Team placeholder with real team photos/bios
- The supplied Digital Ink logo is included as `assets/digital-ink-logo.png` and `assets/favicon.png`
- Connect a real booking calendar
- Connect Supabase for lead storage
- Connect your preferred AI model through a secure server-side function

## Suggested production architecture

Visitor → Vercel frontend → Supabase Auth / Database → Supabase Edge Function → AI provider

Never place private AI API keys or Supabase service-role keys in client-side JavaScript.
