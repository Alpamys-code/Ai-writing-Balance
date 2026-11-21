// ============================================================================
// SCRIBE AI — EXTERNAL SERVICES CONFIGURATION (GitHub Pages Compatible)
// ============================================================================
// Fill in your public keys below after following the steps in SETUP.md.
// IMPORTANT: Only use PUBLIC / ANON keys here. Never put secret or service-role
// keys or email passwords in frontend JavaScript.
// ============================================================================

window.SCRIBE_CONFIG = {
  // After deploying the free Cloudflare Workers AI backend, paste its /api/coach URL here.
  // Leave empty until connected. No AI or fake assessment runs while disconnected.
  // No paid API key is needed. Never put private credentials in frontend code.
  coach: { endpoint: "https://scribe-writing-coach.alpakuday2010.workers.dev/api/coach" },
  // 1. SUPABASE CONFIGURATION (Shared Cross-Device Reviews Database)
  // Get these from: Supabase Dashboard -> Project Settings -> API
  supabase: {
    url: "", // e.g., "https://your-project-id.supabase.co"
    anonKey: "", // e.g., "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    tableName: "scribe_reviews"
  },

  // 2. EMAIL NOTIFICATION CONFIGURATION (Sends every submission to alpakuday2010@gmail.com)
  // Choose "emailjs" or "formspree" as your provider:
  email: {
    provider: "emailjs", // Options: "emailjs" or "formspree"
    recipientEmail: "alpakuday2010@gmail.com",

    // Option A: EmailJS (https://www.emailjs.com/)
    emailjs: {
      publicKey: "",   // Account -> API Keys -> Public Key
      serviceId: "",   // Email Services -> Service ID
      templateId: ""   // Email Templates -> Template ID
    },

    // Option B: Formspree (https://formspree.io/)
    formspree: {
      endpoint: ""     // e.g., "https://formspree.io/f/yourFormId"
    }
  }
};
