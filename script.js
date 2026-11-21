// ============================================================================
// 1. EXISTING INTERACTIVE SECTIONS (Experiment, Balance Zones, Copy, Essay Lab)
// ============================================================================
const conditions = {
  independent: {
    number: "01",
    tag: "HUMAN-LED",
    title: "Independent writing",
    text: "Plans and writes all content with no generative assistance.",
    learner: "Ideas + first draft + final decisions",
    ai: "No generative assistance",
    score: "20",
    color: "blue"
  },
  assisted: {
    number: "02",
    tag: "COLLABORATIVE",
    title: "AI-assisted writing",
    text: "Creates ideas and a first draft, then uses specific AI feedback and chooses the revisions.",
    learner: "Creates draft + chooses revisions",
    ai: "Explains, diagnoses + suggests limited options",
    score: "23",
    color: "cyan"
  },
  generated: {
    number: "03",
    tag: "AI-LED",
    title: "AI-generated writing",
    text: "Provides a prompt while AI generates most or all of the essay. Small surface edits may be made.",
    learner: "Prompt + small edits",
    ai: "Generates most or all of the essay",
    score: "20",
    color: "red"
  }
};

const tabs = document.querySelectorAll(".condition-tab");
const panel = document.getElementById("conditionPanel");

function renderCondition(key) {
  const c = conditions[key];
  panel.innerHTML = `
    <div class="condition-number">${c.number}</div>
    <div class="condition-main">
      <span class="tag">${c.tag}</span>
      <h3>${c.title}</h3>
      <p>${c.text}</p>
      <div class="role-grid">
        <div><span>LEARNER</span><strong>${c.learner}</strong></div>
        <div><span>AI</span><strong>${c.ai}</strong></div>
      </div>
    </div>
    <div class="condition-score">
      <span>RECORDED SCORE</span>
      <strong>${c.score}<span>/25</span></strong>
    </div>`;
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderCondition(tab.dataset.condition);
  });
});

const zoneData = {
  green: {
    tag: "GREEN · FORMATIVE USE; FOLLOW TASK RULES",
    title: "Keep the student in control.",
    text: "Use AI to explain a grammar error, offer vocabulary alternatives, ask questions about an argument, or identify unclear sentences without replacing the student's work.",
    icon: "✓"
  },
  yellow: {
    tag: "YELLOW · PERMISSION + DISCLOSURE",
    title: "Shared authorship needs transparency.",
    text: "AI may rewrite, expand, paraphrase, or generate partial wording. For assessed work, this should require teacher permission, disclosure, and substantial student revision.",
    icon: "!"
  },
  red: {
    tag: "RED · NOT FOR INDEPENDENT ASSESSMENT",
    title: "Do not outsource the target skill.",
    text: "Generating a complete assessed essay, inventing sources, answering an exam question, or hiding AI authorship replaces the performance the task is designed to measure.",
    icon: "×"
  }
};

const zoneCards = document.querySelectorAll(".zone-card");
const zoneTag = document.getElementById("zoneRuleTag");
const zoneTitle = document.getElementById("zoneDetailTitle");
const zoneText = document.getElementById("zoneDetailText");
const zoneIcon = document.querySelector(".zone-detail-icon");

zoneCards.forEach(card => {
  card.addEventListener("click", () => {
    zoneCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    const data = zoneData[card.dataset.zone];
    zoneTag.textContent = data.tag;
    zoneTitle.textContent = data.title;
    zoneText.textContent = data.text;
    zoneIcon.textContent = data.icon;

    if (card.dataset.zone === "red") {
      zoneTag.style.color = "var(--red)";
      zoneIcon.style.color = "var(--red)";
      zoneIcon.style.background = "rgba(255,102,122,.1)";
    } else if (card.dataset.zone === "yellow") {
      zoneTag.style.color = "var(--yellow)";
      zoneIcon.style.color = "var(--yellow)";
      zoneIcon.style.background = "rgba(255,209,102,.1)";
    } else {
      zoneTag.style.color = "var(--green)";
      zoneIcon.style.color = "var(--green)";
      zoneIcon.style.background = "rgba(91,228,154,.1)";
    }
  });
});

document.querySelectorAll(".copy-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const original = btn.textContent;
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = "Copied ✓";
    } catch {
      btn.textContent = "Select & copy";
    }
    setTimeout(() => (btn.textContent = original), 1600);
  });
});

const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.08 }) : null;

document.querySelectorAll(".reveal").forEach(el => (observer ? observer.observe(el) : el.classList.add("visible")));

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

const essayTabs = document.querySelectorAll(".essay-tab");
const essayPanels = document.querySelectorAll("[data-essay-panel]");
essayTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    essayTabs.forEach(t => t.classList.remove("active"));
    essayPanels.forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    const target = document.querySelector(`[data-essay-panel="${tab.dataset.essayTab}"]`);
    if (target) target.classList.add("active");
  });
});

// ============================================================================
// 2. FAQS MODAL
// ============================================================================
const faqFab = document.getElementById("faqFab");
const faqOverlay = document.getElementById("faqOverlay");
const faqClose = document.getElementById("faqClose");

function setInertBackground(isModalOpen) {
  const mainEl = document.querySelector("main");
  const headerEl = document.querySelector("header");
  const footerEl = document.querySelector("footer");
  if (mainEl) mainEl.inert = isModalOpen;
  if (headerEl) headerEl.inert = isModalOpen;
  if (footerEl) footerEl.inert = isModalOpen;
}

function setFaq(open) {
  faqOverlay.classList.toggle("open", open);
  faqOverlay.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
  setInertBackground(open);
  if (open) faqClose.focus();
  else faqFab.focus();
}

faqFab.addEventListener("click", () => setFaq(true));
faqClose.addEventListener("click", () => setFaq(false));
faqOverlay.addEventListener("click", e => {
  if (e.target === faqOverlay) setFaq(false);
});

// Accessible mutually exclusive controls & mobile nav
function accessibleChoices(selector) {
  const buttons = [...document.querySelectorAll(selector)];
  buttons.forEach((button, index) => {
    button.setAttribute("aria-pressed", String(button.classList.contains("active")));
    button.addEventListener("click", () => buttons.forEach(b => b.setAttribute("aria-pressed", String(b === button))));
    button.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
          ? buttons.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
      buttons[next].click();
    });
  });
}
accessibleChoices(".condition-tab");
accessibleChoices(".zone-card");
accessibleChoices(".essay-tab");

const menuButton = document.querySelector(".menu-toggle");
const mainNav = document.getElementById("mainNav");
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  mainNav.classList.toggle("menu-open", open);
});
mainNav.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("menu-open");
  })
);

const essayText = [...document.querySelectorAll(".essay-text p")]
  .map(p => {
    const clone = p.cloneNode(true);
    clone.querySelector("strong")?.remove();
    return clone.textContent.trim();
  })
  .join(" ");
document.getElementById("sampleWordCount").textContent =
  essayText.split(/\s+/).filter(Boolean).length + " words · teaching example";

// ============================================================================
// 3. SCRIBE AI FEEDBACK MODAL, REVIEWS & EXTERNAL INTEGRATIONS
// ============================================================================
const ILLUSTRATIVE_DEMO_REVIEWS = [
  {
    id: "demo-1",
    displayName: "Ayan S.",
    initials: "AS",
    avatarGradient: "linear-gradient(135deg, #62a8ff, #62e6ff)",
    grade: "Grade 11",
    rating: 5,
    reviewText:
      "I would like feedback that helps me see whether my position is clear, while leaving the actual revision to me.",
    isDemo: true
  },
  {
    id: "demo-2",
    displayName: "Amina K.",
    initials: "AK",
    avatarGradient: "linear-gradient(135deg, #5be49a, #62e6ff)",
    grade: "Grade 10",
    rating: 5,
    reviewText:
      "A short explanation and one useful question would be more helpful to me than a complete rewritten paragraph.",
    isDemo: true
  },
  {
    id: "demo-3",
    displayName: "Dias T.",
    initials: "DT",
    avatarGradient: "linear-gradient(135deg, #ffd166, #62a8ff)",
    grade: "Grade 9",
    rating: 5,
    reviewText:
      "My ideal writing coach would work on a phone without zooming out. One clear draft field makes sense to me.",
    isDemo: true
  },
  {
    id: "demo-4",
    displayName: "Aruzhan M.",
    initials: "AM",
    avatarGradient: "linear-gradient(135deg, #a78bfa, #62a8ff)",
    grade: "Grade 11",
    rating: 5,
    reviewText:
      "Questions about examples and counterarguments could help me think through a paragraph before I change it.",
    isDemo: true
  },
  {
    id: "demo-5", displayName: "Dana R.", initials: "DR", grade: "Grade 10", rating: 4,
    reviewText: "I would prefer two or three suggestions at a time. A long list of corrections can be hard to act on.", isDemo: true
  },
  {
    id: "demo-6", displayName: "Timur B.", initials: "TB", grade: "Grade 11", rating: 4,
    reviewText: "I want to explain my argument aloud after revising it. That would help me check whether I understand my own wording.", isDemo: true
  },
  {
    id: "demo-7", displayName: "Aliya N.", initials: "AN", grade: "Grade 9", rating: 5,
    reviewText: "It would be useful if the coach asked what my evidence actually shows instead of supplying evidence for me.", isDemo: true
  },
  {
    id: "demo-8", displayName: "Miras A.", initials: "MA", grade: "Grade 10", rating: 4,
    reviewText: "The distinction between practice guidance and real AI feedback should always be visible. I want to know what is analysing my draft.", isDemo: true
  },
  {
    id: "demo-9", displayName: "Kamila T.", initials: "KT", grade: "Grade 11", rating: 5,
    reviewText: "A reminder to check suggestions and follow the teacher's rules would make the tool more useful for schoolwork.", isDemo: true
  },
  {
    id: "demo-10", displayName: "Arman D.", initials: "AD", grade: "Grade 10", rating: 4,
    reviewText: "I would use a reflection question to record what I changed and why, so the final essay still reflects my decisions.", isDemo: true
  }
];

const feedbackFab = document.getElementById("feedbackFab");
const feedbackOverlay = document.getElementById("feedbackOverlay");
const feedbackClose = document.getElementById("feedbackClose");
const reviewsGrid = document.getElementById("reviewsGrid");
const reviewsSyncStatus = document.getElementById("reviewsSyncStatus");

const feedbackForm = document.getElementById("feedbackForm");
const fbFullName = document.getElementById("fbFullName");
const fbRating = document.getElementById("fbRating");
const fbGrade = document.getElementById("fbGrade");
const fbSchool = document.getElementById("fbSchool");
const fbReviewText = document.getElementById("fbReviewText");
const fbPublicConsent = document.getElementById("fbPublicConsent");
const fbSubmitBtn = document.getElementById("fbSubmitBtn");
const formStatusBanner = document.getElementById("formStatusBanner");

const errFullName = document.getElementById("errFullName");
const errRating = document.getElementById("errRating");
const errReviewText = document.getElementById("errReviewText");

const zeroStarBtn = document.getElementById("zeroStarBtn");
const starBtns = [...document.querySelectorAll(".star-btn")];
const ratingReadout = document.getElementById("ratingReadout");

let approvedCommunityReviews = [];
let reviewsExpanded = false;
const reviewsMore = document.getElementById("reviewsMore");
const reviewsCount = document.getElementById("reviewsCount");
reviewsMore.addEventListener("click", () => {
  reviewsExpanded = !reviewsExpanded;
  renderAllReviews();
});

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPublicDisplayName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Student";
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

function getInitials(displayName) {
  const parts = String(displayName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function renderStarsString(rating) {
  const count = Math.max(0, Math.min(5, Number(rating) || 0));
  return "★".repeat(count) + "☆".repeat(5 - count);
}

function renderAllReviews() {
  const allCards = [...approvedCommunityReviews, ...ILLUSTRATIVE_DEMO_REVIEWS];
  const visibleCards = reviewsExpanded ? allCards : allCards.slice(0, 4);
  reviewsMore.hidden = allCards.length <= 4;
  reviewsMore.setAttribute("aria-expanded", String(reviewsExpanded));
  reviewsMore.textContent = reviewsExpanded ? "Show less" : `Read ${allCards.length - 4} more ${approvedCommunityReviews.length ? "reviews" : "examples"}`;
  reviewsCount.textContent = `Showing ${visibleCards.length} of ${allCards.length} cards. Demo examples are fictional.`;
  reviewsGrid.innerHTML = visibleCards
    .map(item => {
      const safeName = escapeHtml(item.displayName);
      const safeInitials = escapeHtml(item.initials || getInitials(item.displayName));
      const safeGrade = item.grade ? escapeHtml(item.grade) : "Scribe AI User";
      const safeText = escapeHtml(item.reviewText);
      const stars = renderStarsString(item.rating);
      const gradient =
        item.avatarGradient || "linear-gradient(135deg, #5be49a, #62a8ff)";
      const badgeHtml = item.isDemo
        ? `<span class="review-tag demo-tag">Illustrative Demo Review</span>`
        : `<span class="review-tag community-tag">Community Review</span>`;

      return `
        <article class="review-card ${item.isDemo ? "" : "verified-community"}">
          <div class="review-card-top">
            <div class="reviewer-info">
              <div class="reviewer-avatar" style="background:${gradient}" aria-hidden="true">${safeInitials}</div>
              <div class="reviewer-meta">
                <strong>${safeName}</strong>
                <span>${safeGrade}</span>
              </div>
            </div>
            <div class="review-stars" aria-label="${item.rating} out of 5 stars">${stars}</div>
          </div>
          <p class="review-text">“${safeText}”</p>
          ${badgeHtml}
        </article>
      `;
    })
    .join("");
}

// Supabase Helpers (Cross-device public review retrieval & submission storage)
function getSupabaseConfig() {
  const cfg = window.SCRIBE_CONFIG?.supabase || {};
  const url = (cfg.url || "").trim().replace(/\/+$/, "");
  const anonKey = (cfg.anonKey || "").trim();
  const tableName = (cfg.tableName || "scribe_reviews").trim();
  return {
    configured: Boolean(url && anonKey),
    url,
    anonKey,
    tableName
  };
}

async function fetchApprovedCommunityReviews() {
  const sb = getSupabaseConfig();
  if (!sb.configured) {
    reviewsSyncStatus.textContent = "10 fictional examples · not research evidence";
    return;
  }

  reviewsSyncStatus.textContent = "Syncing community reviews…";
  try {
    const endpoint = `${sb.url}/rest/v1/${encodeURIComponent(
      sb.tableName
    )}?select=id,display_name,grade,rating,review_text,created_at&is_approved=eq.true&public_consent=eq.true&order=created_at.desc&limit=12`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: sb.anonKey,
        Authorization: `Bearer ${sb.anonKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error(`Supabase fetch failed (${res.status})`);
    const rows = await res.json();

    approvedCommunityReviews = (Array.isArray(rows) ? rows : []).map(row => ({
      id: `community-${row.id}`,
      displayName: row.display_name || "Student",
      initials: getInitials(row.display_name || "Student"),
      avatarGradient: "linear-gradient(135deg, #5be49a, #62e6ff)",
      grade: row.grade || "Secondary Student",
      rating: Math.max(0, Math.min(5, Number(row.rating) || 0)),
      reviewText: row.review_text || "",
      isDemo: false
    }));

    renderAllReviews();
    reviewsSyncStatus.textContent =
      approvedCommunityReviews.length > 0
        ? `${approvedCommunityReviews.length} community + ${ILLUSTRATIVE_DEMO_REVIEWS.length} illustrative demo reviews`
        : "Showing illustrative demo reviews";
  } catch (err) {
    console.warn("Could not load Supabase reviews:", err);
    reviewsSyncStatus.textContent = "Showing illustrative demo reviews";
  }
}

async function saveSubmissionToSupabase(payload) {
  const sb = getSupabaseConfig();
  if (!sb.configured) {
    return { skipped: true };
  }

  const endpoint = `${sb.url}/rest/v1/${encodeURIComponent(sb.tableName)}`;
  const row = {
    full_name: payload.fullName,
    display_name: payload.displayName,
    rating: payload.rating,
    review_text: payload.reviewText,
    grade: payload.grade || null,
    school: payload.school || null,
    public_consent: payload.publicConsent,
    eligible_for_public: payload.eligibleForPublic,
    is_approved: false, // Requires moderator approval in Supabase before public display
    submitted_at: payload.submittedAt
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: sb.anonKey,
      Authorization: `Bearer ${sb.anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(row)
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Database error (${res.status}): ${detail}`);
  }

  return { ok: true };
}

// Email Notification Helper (EmailJS or Formspree -> alpakuday2010@gmail.com)
async function sendEmailNotification(payload) {
  const emailCfg = window.SCRIBE_CONFIG?.email || {};
  const provider = (emailCfg.provider || "emailjs").toLowerCase();

  if (provider === "formspree") {
    const endpoint = (emailCfg.formspree?.endpoint || "").trim();
    if (!endpoint) return { skipped: true };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        _subject: `New Scribe AI Feedback (${payload.rating}/5 ★) — ${payload.fullName}`,
        recipient: emailCfg.recipientEmail || "alpakuday2010@gmail.com",
        full_name: payload.fullName,
        star_rating: `${payload.rating} / 5`,
        written_feedback: payload.reviewText,
        grade: payload.grade || "Not provided",
        school: payload.school || "Not provided",
        public_consent: payload.publicConsent ? "Yes" : "No",
        moderation_bucket: payload.eligibleForPublic
          ? "Public Queue (consent given, awaiting moderation)"
          : "Private Admin Feedback (no public consent)",
        submitted_at: payload.submittedAt
      })
    });

    if (!res.ok) {
      throw new Error(`Formspree error (${res.status})`);
    }
    return { ok: true };
  }

  // Default: EmailJS
  const ejs = emailCfg.emailjs || {};
  const publicKey = (ejs.publicKey || "").trim();
  const serviceId = (ejs.serviceId || "").trim();
  const templateId = (ejs.templateId || "").trim();

  if (!publicKey || !serviceId || !templateId) {
    return { skipped: true };
  }

  if (typeof window.emailjs === "undefined") {
    throw new Error("EmailJS SDK failed to load. Check your internet connection.");
  }

  window.emailjs.init({ publicKey });
  await window.emailjs.send(serviceId, templateId, {
    to_email: emailCfg.recipientEmail || "alpakuday2010@gmail.com",
    full_name: payload.fullName,
    star_rating: `${payload.rating} / 5`,
    written_feedback: payload.reviewText,
    grade: payload.grade || "Not provided",
    school: payload.school || "Not provided",
    public_consent: payload.publicConsent ? "Yes" : "No",
    moderation_bucket: payload.eligibleForPublic
      ? "Public Queue (consent given, awaiting moderation)"
      : "Private Admin Feedback (no public consent)",
    submitted_at: payload.submittedAt
  });

  return { ok: true };
}

// Star Rating Interaction (0 to 5)
function updateStarVisuals(selectedValue, hoverValue = null) {
  const activeVal = hoverValue !== null ? hoverValue : selectedValue;

  zeroStarBtn.classList.toggle("active", selectedValue === 0 && hoverValue === null);

  starBtns.forEach(btn => {
    const val = Number(btn.dataset.value);
    btn.classList.toggle("filled", selectedValue !== null && val <= selectedValue);
    btn.classList.toggle("hovered", hoverValue !== null && val <= hoverValue);
  });

  if (activeVal === null || activeVal === "") {
    ratingReadout.textContent = "Not selected";
  } else if (Number(activeVal) === 0) {
    ratingReadout.textContent = "0 / 5 stars";
  } else {
    ratingReadout.textContent = `${activeVal} / 5 ${Number(activeVal) === 1 ? "star" : "stars"}`;
  }
}

function setRatingValue(val) {
  const num = Number(val);
  fbRating.value = String(num);
  errRating.textContent = "";
  updateStarVisuals(num, null);
}

zeroStarBtn.addEventListener("click", () => setRatingValue(0));

starBtns.forEach(btn => {
  const val = Number(btn.dataset.value);
  btn.addEventListener("mouseenter", () => {
    const current = fbRating.value === "" ? null : Number(fbRating.value);
    updateStarVisuals(current, val);
  });
  btn.addEventListener("mouseleave", () => {
    const current = fbRating.value === "" ? null : Number(fbRating.value);
    updateStarVisuals(current, null);
  });
  btn.addEventListener("click", () => setRatingValue(val));
});

// Form Validation & Submission
function clearFormErrors() {
  errFullName.textContent = "";
  errRating.textContent = "";
  errReviewText.textContent = "";
}

function validateFeedbackForm() {
  clearFormErrors();
  let isValid = true;

  const fullName = fbFullName.value.trim();
  const ratingRaw = fbRating.value;
  const reviewText = fbReviewText.value.trim();

  if (!fullName || fullName.length < 2) {
    errFullName.textContent = "Please enter your full name (at least 2 characters).";
    isValid = false;
  }

  if (ratingRaw === "" || isNaN(Number(ratingRaw)) || Number(ratingRaw) < 0 || Number(ratingRaw) > 5) {
    errRating.textContent = "Please select a star rating from 0 to 5.";
    isValid = false;
  }

  if (!reviewText || reviewText.length < 10) {
    errReviewText.textContent = "Please write a brief review (at least 10 characters).";
    isValid = false;
  }

  return isValid;
}

function showStatusBanner(type, message) {
  formStatusBanner.className = `form-status-banner ${type}`;
  formStatusBanner.textContent = message;
  formStatusBanner.hidden = false;
}

feedbackForm.addEventListener("submit", async e => {
  e.preventDefault();
  formStatusBanner.hidden = true;

  if (!validateFeedbackForm()) return;

  const fullName = fbFullName.value.trim();
  const rating = Number(fbRating.value);
  const reviewText = fbReviewText.value.trim();
  const grade = fbGrade.value.trim();
  const school = fbSchool.value.trim();
  const publicConsent = fbPublicConsent.checked;
  const displayName = formatPublicDisplayName(fullName);
  const eligibleForPublic = publicConsent;
  const submittedAt = new Date().toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const payload = {
    fullName,
    displayName,
    rating,
    reviewText,
    grade,
    school,
    publicConsent,
    eligibleForPublic,
    submittedAt
  };

  fbSubmitBtn.disabled = true;
  fbSubmitBtn.querySelector(".btn-label").textContent = "Submitting…";

  try {
    const [dbResult, emailResult] = await Promise.allSettled([
      saveSubmissionToSupabase(payload),
      sendEmailNotification(payload)
    ]);

    const dbFailed = dbResult.status === "rejected";
    const emailFailed = emailResult.status === "rejected";

    if (dbFailed || emailFailed) {
      console.error("Submission partial/full error:", { dbResult, emailResult });
      throw new Error(
        "We could not complete the submission due to a connection or service configuration issue. Please try again later."
      );
    }

    const dbSkipped = dbResult.value?.skipped;
    const emailSkipped = emailResult.value?.skipped;

    if (dbSkipped && emailSkipped) {
      showStatusBanner(
        "error",
        "External database and email keys are not configured yet in config.js. Follow SETUP.md to connect Supabase and EmailJS/Formspree."
      );
      return;
    }

    const routingNote = publicConsent
      ? `Your review (as "${displayName}") is eligible for moderator approval before appearing publicly, regardless of its rating.`
      : "Your feedback is private because public display consent was not checked.";

    showStatusBanner(
      "success",
      `Thank you, ${fullName}! Your feedback has been submitted and sent to the project team. ${routingNote}`
    );

    feedbackForm.reset();
    fbRating.value = "";
    updateStarVisuals(null, null);
  } catch (err) {
    showStatusBanner("error", err.message || "Something went wrong while sending your feedback.");
  } finally {
    fbSubmitBtn.disabled = false;
    fbSubmitBtn.querySelector(".btn-label").textContent = "Submit Feedback";
  }
});

// Modal Open / Close / Escape / Outside Click / Focus Trap
function setFeedbackModal(open) {
  if (open && faqOverlay.classList.contains("open")) {
    setFaq(false);
  }
  feedbackOverlay.classList.toggle("open", open);
  feedbackOverlay.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
  setInertBackground(open);

  if (open) {
    feedbackClose.focus();
  } else {
    feedbackFab.focus();
  }
}

// Make the unconnected form's state clear before the visitor fills in personal details.
const emailSettings = window.SCRIBE_CONFIG?.email || {};
const emailReady = emailSettings.provider === "formspree"
  ? Boolean(emailSettings.formspree?.endpoint)
  : Boolean(emailSettings.emailjs?.publicKey && emailSettings.emailjs?.serviceId && emailSettings.emailjs?.templateId);
if (!getSupabaseConfig().configured && !emailReady) {
  feedbackForm.querySelectorAll("input, select, textarea, button").forEach(control => control.disabled = true);
  showStatusBanner("error", "Feedback submissions are not connected yet. The cards above are fictional examples; no personal details are collected here.");
  fbSubmitBtn.querySelector(".btn-label").textContent = "Submissions not connected";
  document.querySelector(".privacy-note").textContent = "No feedback is sent or saved while submissions are disconnected.";
}

feedbackFab.addEventListener("click", () => setFeedbackModal(true));
feedbackClose.addEventListener("click", () => setFeedbackModal(false));
feedbackOverlay.addEventListener("click", e => {
  if (e.target === feedbackOverlay) setFeedbackModal(false);
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (feedbackOverlay.classList.contains("open")) setFeedbackModal(false);
    else if (faqOverlay.classList.contains("open")) setFaq(false);
  }

  if (e.key === "Tab") {
    const activeOverlay = feedbackOverlay.classList.contains("open")
      ? feedbackOverlay
      : faqOverlay.classList.contains("open")
      ? faqOverlay
      : null;
    if (!activeOverlay) return;

    const focusables = [
      ...activeOverlay.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, a[href]'
      )
    ];
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

// Initial render of illustrative demo reviews + fetch live approved reviews if Supabase is configured
renderAllReviews();
fetchApprovedCommunityReviews();
