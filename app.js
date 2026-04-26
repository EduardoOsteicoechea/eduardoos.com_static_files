const ARTICLE_CATALOG = [
  {
    title: "La brutalidad de Pablo",
    serie: "Romanos",
    path: "series/romanos/pablo/brutalidad"
  },
  {
    title: "El llamado de Pablo",
    serie: "Romanos",
    path: "series/romanos/pablo/llamado"
  },
  {
    title: "El origen de Pablo",
    serie: "Romanos",
    path: "series/romanos/pablo/origen"
  }
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getHighlightedHtml(text, phrases) {
  const value = String(text ?? "");
  const highlights = Array.isArray(phrases)
    ? phrases.filter((item) => typeof item === "string" && item.trim())
    : [];

  if (!highlights.length) {
    return escapeHtml(value);
  }

  const pattern = highlights
    .map((item) => item.trim())
    .sort((a, b) => b.length - a.length)
    .map((item) => escapeRegExp(item))
    .join("|");
  const regex = new RegExp(pattern, "gi");
  let cursor = 0;
  let result = "";
  let match = regex.exec(value);

  while (match) {
    const matchedText = match[0];
    const startIndex = match.index;

    if (startIndex > cursor) {
      result += escapeHtml(value.slice(cursor, startIndex));
    }

    result += `<strong class="accent-highlight">${escapeHtml(matchedText)}</strong>`;
    cursor = startIndex + matchedText.length;
    match = regex.exec(value);
  }

  if (cursor < value.length) {
    result += escapeHtml(value.slice(cursor));
  }

  return result;
}

function createEmphasizedFragment(text, phrases) {
  const fragment = document.createDocumentFragment();
  const value = String(text ?? "");
  const highlights = Array.isArray(phrases)
    ? phrases.filter((item) => typeof item === "string" && item.trim())
    : [];

  if (!highlights.length) {
    fragment.appendChild(document.createTextNode(value));
    return fragment;
  }

  const pattern = highlights
    .map((item) => item.trim())
    .sort((a, b) => b.length - a.length)
    .map((item) => escapeRegExp(item))
    .join("|");
  const regex = new RegExp(`(${pattern})`, "g");
  const parts = value.split(regex);
  const lookup = new Set(highlights.map((item) => item.trim()));

  for (const part of parts) {
    if (!part) continue;
    if (lookup.has(part)) {
      const strong = document.createElement("strong");
      strong.className = "accent-highlight";
      strong.textContent = part;
      fragment.appendChild(strong);
      continue;
    }
    fragment.appendChild(document.createTextNode(part));
  }

  return fragment;
}

function renderHeader(metadata, target) {
  target.innerHTML = "";
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

  const paragraphs = Array.isArray(section.content)
    ? section.content
    : Array.isArray(section.paragraphs)
      ? section.paragraphs
      : typeof section.content === "string"
        ? [section.content]
        : [];
  const phrases = section.emphasyzed_phrases || section.emphasized_phrases || [];

  for (const paragraph of paragraphs) {
    if (typeof paragraph !== "string") continue;
    const p = document.createElement("p");
    p.className = "prose";
    p.appendChild(createEmphasizedFragment(paragraph, phrases));
    wrapper.appendChild(p);
  }

  main.appendChild(wrapper);
}

function renderQuoteSection(title, text, emphasized, reference, main) {
  const wrapper = document.createElement("section");
  if (title) {
    const h2 = document.createElement("h2");
    h2.textContent = title;
    wrapper.appendChild(h2);
  }

  const quote = document.createElement("blockquote");
  quote.className = "biblical-quote";
  const paragraph = document.createElement("p");
  paragraph.appendChild(createEmphasizedFragment(String(text || ""), emphasized));
  quote.appendChild(paragraph);
  if (reference) {
    const cite = document.createElement("cite");
    cite.className = "biblical-reference";
    cite.textContent = `— ${String(reference)}`;
    quote.appendChild(cite);
  }
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

function renderArticle(lesson, main) {
  const header = document.getElementById("article-header");
  const lessonTitle = lesson.titulo_de_enseñanza || lesson.title || "Untitled Article";
  const lessonSerie = lesson.serie || lesson.series || "Sin serie";
  const lessonQuote = lesson.texto_nbla || lesson.subtitle || lesson.description || "";

  if (header) {
    header.innerHTML = `
      <nav class="breadcrumb"><a href="?">Inicio</a> > <span style="text-transform: capitalize;">${escapeHtml(lessonSerie)}</span> > ${escapeHtml(lessonTitle)}</nav>
      <p><span class="serie-tag">${escapeHtml(lessonSerie)}</span></p>
      <h1>${escapeHtml(lessonTitle)}</h1>
      <p>${escapeHtml(lessonQuote)}</p>
    `;
  }

  document.title = `${lessonTitle} | Eduardo Osteicoechea`;
  const sections = Array.isArray(lesson.sections) ? lesson.sections : [];
  main.innerHTML = "";
  for (const section of sections) {
    const type = (section.type || "").toLowerCase();
    if (type === "prose") {
      const wrapper = document.createElement("section");
      if (section.title) {
        const h2 = document.createElement("h2");
        h2.textContent = section.title;
        wrapper.appendChild(h2);
      }

      if (Array.isArray(section.content)) {
        const prosePhrases =
          section.emphasyzed_phrases || section.emphasized_phrases || [];
        for (const paragraph of section.content) {
          if (typeof paragraph !== "string") continue;
          const p = document.createElement("p");
          p.className = "prose";
          p.innerHTML = getHighlightedHtml(paragraph, prosePhrases);
          wrapper.appendChild(p);
        }
      }

      if (Array.isArray(section.biblical_quotes)) {
        for (const quoteItem of section.biblical_quotes) {
          const quoteText = quoteItem?.text || quoteItem?.quote || "";
          if (!quoteText) continue;

          const quote = document.createElement("blockquote");
          quote.className = "biblical-quote";
          const paragraph = document.createElement("p");
          paragraph.innerHTML = getHighlightedHtml(
            quoteText,
            quoteItem?.emphasized
          );
          quote.appendChild(paragraph);
          if (quoteItem?.reference) {
            const cite = document.createElement("cite");
            cite.className = "biblical-reference";
            cite.textContent = `— ${String(quoteItem.reference)}`;
            quote.appendChild(cite);
          }
          wrapper.appendChild(quote);
        }
      }

      main.appendChild(wrapper);
      continue;
    }

    if (type === "quote") {
      renderQuoteSection(
        section.title,
        section.text || section.quote || "",
        section.emphasized,
        section.reference,
        main
      );
      continue;
    }
    if (type === "quiz") {
      renderQuizSection(section, main);
      continue;
    }
    renderProseSection(section, main);
  }
}

function renderCatalog(indexView) {
  indexView.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = "Biblical Articles";
  indexView.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "article-grid";

  for (const article of ARTICLE_CATALOG) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "article-card";
    button.addEventListener("click", () => {
      window.location.search = `?article=${encodeURIComponent(article.path)}`;
    });

    const cardTitle = document.createElement("h2");
    cardTitle.textContent = article.title;
    button.appendChild(cardTitle);

    const cardSerie = document.createElement("p");
    cardSerie.textContent = article.serie;
    button.appendChild(cardSerie);

    grid.appendChild(button);
  }

  indexView.appendChild(grid);
}

async function loadArticle() {
  const indexView = document.querySelector("#index-view");
  const articleView = document.querySelector("#article-view");
  const header = document.querySelector("#article-header");
  const main = document.querySelector("#article-content");
  const params = new URLSearchParams(window.location.search);
  const articlePath = params.get("article");

  if (!indexView || !articleView || !header || !main) {
    return;
  }

  if (!articlePath) {
    articleView.style.display = "none";
    indexView.style.display = "";
    renderCatalog(indexView);
    return;
  }

  indexView.style.display = "none";
  articleView.style.display = "";
  const dataUrl = `data/${articlePath}/data.json`;

  try {
    const response = await fetch(dataUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load article data: ${response.status}`);
    }

    const payload = await response.json();
    renderArticle(payload, main);
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
