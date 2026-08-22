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
    tag: "GREEN · GENERALLY ALLOWED",
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

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add("visible");
  });
}, {threshold: 0.08});

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

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
