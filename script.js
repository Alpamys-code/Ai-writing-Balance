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

function renderCondition(key){
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
const zoneDetail = document.getElementById("zoneDetail");
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

    if(card.dataset.zone === "red"){
      zoneTag.style.color = "var(--red)";
      zoneIcon.style.color = "var(--red)";
      zoneIcon.style.background = "rgba(255,102,122,.1)";
    } else if(card.dataset.zone === "yellow"){
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
    setTimeout(() => btn.textContent = original, 1600);
  });
});

const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add("visible");
  });
}, {threshold: 0.08}) : null;

document.querySelectorAll(".reveal").forEach(el => observer ? observer.observe(el) : el.classList.add("visible"));

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const target = document.querySelector(link.getAttribute("href"));
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:"smooth", block:"start"});
    }
  });
});


// Essay Lab tabs: sample essay, AI-style evaluation and reusable template.
const essayTabs = document.querySelectorAll(".essay-tab");
const essayPanels = document.querySelectorAll("[data-essay-panel]");
essayTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    essayTabs.forEach(t => t.classList.remove("active"));
    essayPanels.forEach(panel => panel.classList.remove("active"));
    tab.classList.add("active");
    const target = document.querySelector(`[data-essay-panel="${tab.dataset.essayTab}"]`);
    if (target) target.classList.add("active");
  });
});


// Floating FAQs
const faqFab = document.getElementById("faqFab");
const faqOverlay = document.getElementById("faqOverlay");
const faqClose = document.getElementById("faqClose");

function setFaq(open){
  faqOverlay.classList.toggle("open", open);
  faqOverlay.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
  if(open) faqClose.focus(); else faqFab.focus();
  document.querySelector("main").inert = open;
  document.querySelector("header").inert = open;
  document.querySelector("footer").inert = open;
}
faqFab.addEventListener("click", () => setFaq(true));
faqClose.addEventListener("click", () => setFaq(false));
faqOverlay.addEventListener("click", e => {
  if(e.target === faqOverlay) setFaq(false);
});
document.addEventListener("keydown", e => {
  if(e.key === "Escape" && faqOverlay.classList.contains("open")) setFaq(false);
});

// Accessible mutually exclusive controls, including arrow-key navigation.
function accessibleChoices(selector, update) {
  const buttons = [...document.querySelectorAll(selector)];
  buttons.forEach((button, index) => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    button.addEventListener('click', () => buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button))));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length-1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus(); buttons[next].click();
    });
  });
}
accessibleChoices('.condition-tab'); accessibleChoices('.zone-card'); accessibleChoices('.essay-tab');
const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.getElementById('mainNav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open)); mainNav.classList.toggle('menu-open', open);
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded','false'); mainNav.classList.remove('menu-open');
}));
const essayText = [...document.querySelectorAll('.essay-text p')].map(p => {
  const clone = p.cloneNode(true); clone.querySelector('strong')?.remove(); return clone.textContent.trim();
}).join(' ');
document.getElementById('sampleWordCount').textContent = essayText.split(/\s+/).filter(Boolean).length + ' words · teaching example';
document.addEventListener('keydown', event => {
  if (event.key !== 'Tab' || !faqOverlay.classList.contains('open')) return;
  const elements = [...faqOverlay.querySelectorAll('button, summary, a[href]')];
  const first = elements[0], last = elements[elements.length-1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
