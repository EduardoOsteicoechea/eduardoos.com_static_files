function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createHighlightedQuote(text, emphasized) {
  const wrapper = document.createElement("p");
  const highlights = Array.isArray(emphasized)
    ? emphasized.filter((item) => typeof item === "string" && item.trim())
    : [];

  if (!highlights.length) {
    wrapper.textContent = text;
    return wrapper;
  }

  const pattern = highlights
    .map((item) => item.trim())
    .sort((a, b) => b.length - a.length)
    .map((item) => escapeRegExp(item))
    .join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = String(text).split(regex);

  for (const part of parts) {
    if (!part) continue;
    const isHighlight = highlights.some(
      (term) => term.toLowerCase() === part.toLowerCase()
    );

    if (isHighlight) {
      const span = document.createElement("span");
      span.className = "highlight";
      span.textContent = part;
      wrapper.appendChild(span);
    } else {
      wrapper.appendChild(document.createTextNode(part));
    }
  }

  return wrapper;
}

function renderHeader(metadata, target) {
  const title = metadata.title || "Untitled Article";
  const subtitle = metadata.subtitle || metadata.description || "";
  const byline = [metadata.author, metadata.date].filter(Boolean).join(" - ");

  const h1 = document.createElement("h1");
  h1.textContent = title;
  target.appendChild(h1);

  if (subtitle) {
    const p = document.createElement("p");
    p.textContent = subtitle;
    target.appendChild(p);
  }

  if (byline) {
    const p = document.createElement("p");
    p.textContent = byline;
    target.appendChild(p);
  }
}

function renderProseSection(section, main) {
  const wrapper = document.createElement("section");
  if (section.title) {
    const h2 = document.createElement("h2");
    h2.textContent = section.title;
    wrapper.appendChild(h2);
  }

  const paragraphs = Array.isArray(section.paragraphs)
    ? section.paragraphs
    : section.content
      ? [section.content]
      : [];

  for (const paragraph of paragraphs) {
    const p = document.createElement("p");
    p.className = "prose";
    p.textContent = String(paragraph);
    wrapper.appendChild(p);
  }

  main.appendChild(wrapper);
}

function renderQuoteSection(section, main) {
  const wrapper = document.createElement("section");
  if (section.title) {
    const h2 = document.createElement("h2");
    h2.textContent = section.title;
    wrapper.appendChild(h2);
  }

  const quote = document.createElement("blockquote");
  quote.className = "biblical-quote";
  quote.appendChild(
    createHighlightedQuote(
      String(section.text || section.quote || ""),
      section.emphasized
    )
  );
  wrapper.appendChild(quote);
  main.appendChild(wrapper);
}

function renderQuizSection(section, main) {
  const wrapper = document.createElement("section");
  if (section.title) {
    const h2 = document.createElement("h2");
    h2.textContent = section.title;
    wrapper.appendChild(h2);
  }

  const details = document.createElement("details");
  details.className = "quiz";

  const summary = document.createElement("summary");
  summary.textContent = section.question || "Quiz";
  details.appendChild(summary);

  const content = document.createElement("div");
  content.className = "quiz-content";

  if (Array.isArray(section.options) && section.options.length) {
    const list = document.createElement("ol");
    for (const option of section.options) {
      const item = document.createElement("li");
      item.textContent = String(option);
      list.appendChild(item);
    }
    content.appendChild(list);
  }

  if (section.answer) {
    const answer = document.createElement("p");
    answer.className = "prose";
    answer.textContent = `Answer: ${String(section.answer)}`;
    content.appendChild(answer);
  }

  details.appendChild(content);
  wrapper.appendChild(details);
  main.appendChild(wrapper);
}

function renderArticle(sections, main) {
  for (const section of sections) {
    const type = (section.type || "").toLowerCase();
    if (type === "quote") {
      renderQuoteSection(section, main);
      continue;
    }
    if (type === "quiz") {
      renderQuizSection(section, main);
      continue;
    }
    renderProseSection(section, main);
  }
}

async function loadArticle() {
  const header = document.querySelector("#article-header");
  const main = document.querySelector("#article-content");
  const params = new URLSearchParams(window.location.search);
  const defaultArticlePath = "series/romanos/pablo/brutalidad";
  const articlePath = params.get("article") || defaultArticlePath;
  const dataUrl = `data/${articlePath}/data.json`;

  if (!header || !main) {
    return;
  }

  try {
    const response = await fetch(dataUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load article data: ${response.status}`);
    }

    const payload = await response.json();
    const metadata = payload.metadata || payload;
    const sections = Array.isArray(payload.sections) ? payload.sections : [];

    renderHeader(metadata, header);
    renderArticle(sections, main);
  } catch (error) {
    header.innerHTML = "";
    main.innerHTML = "";

    const title = document.createElement("h1");
    title.textContent = "Article unavailable";
    header.appendChild(title);

    const message = document.createElement("p");
    message.className = "prose";
    message.textContent =
      error instanceof Error ? error.message : `Unable to load ${dataUrl}.`;
    main.appendChild(message);
  }
}

loadArticle();
