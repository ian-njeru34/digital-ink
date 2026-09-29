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


## Industry evidence

The website uses published sources rather than fabricated client results:

- McKinsey Global Survey on the State of AI (2025): 88% reported AI use in at least one business function; only 7% reported full organizational scaling in the cited chart.
- McKinsey “Next best experience” (2025): analysis reports 15–20% customer-satisfaction improvement, 5–8% revenue increase and 20–30% lower cost to serve for AI-powered next-best experiences.
- Communications Authority of Kenya: June 2025 reporting included 83.5% smartphone penetration and 58.5 million data subscriptions.
- web.dev Core Web Vitals: good targets include LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the 75th percentile.
- W3C WCAG 2.2: current W3C Recommendation for web accessibility.

These figures are contextual industry evidence, not promises about Digital Ink client results. Replace/add client case studies only when the underlying results can be verified.

### WhatsApp enquiries
The Contact page sends submitted enquiry details to Digital Ink on WhatsApp at +254 719 535 117 using a pre-filled WhatsApp message. No Supabase connection is required for this basic enquiry flow.
### Selected Builds marquee
The site includes an animated right-to-left portfolio stripe immediately before the footer. It uses live visual previews in iframes rather than displaying project URLs. Each preview card is also clickable and opens the displayed project in a new browser tab. The current preview is Inkora Ventures (`https://inkora-vert.vercel.app/`). Add additional `.work-preview` cards in the HTML when more completed sites are ready to showcase.

