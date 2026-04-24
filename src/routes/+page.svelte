<script lang="ts">
  const homepageMetaDescription =
    "Architecturally trained BIM Modeler & Full Stack Developer. Bridging design and technology with custom Revit APIs, AI integrations, and cloud solutions.";

  const siteNavigationJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://eduardoos.com/#person",
        name: "Eduardo Osteicoechea",
        jobTitle: "BIM Modeler & Full Stack Developer",
        url: "https://eduardoos.com/"
      },
      {
        "@type": "WebSite",
        "@id": "https://eduardoos.com/#website",
        name: "Eduardo Osteicoechea",
        url: "https://eduardoos.com/",
        publisher: {
          "@id": "https://eduardoos.com/#person"
        },
        author: {
          "@id": "https://eduardoos.com/#person"
        }
      },
      {
        "@type": "SiteNavigationElement",
        name: "Home",
        description: "Landing page with core navigation and project entry points.",
        url: "https://eduardoos.com/",
        inLanguage: "en",
        isPartOf: {
          "@id": "https://eduardoos.com/#website"
        }
      },
      {
        "@type": "SiteNavigationElement",
        name: "BIM Viewer",
        description: "Interactive BIM viewer for geometry exploration and model context.",
        url: "https://eduardoos.com/bim/viewer",
        inLanguage: "en",
        isPartOf: {
          "@id": "https://eduardoos.com/#website"
        }
      },
      {
        "@type": "SiteNavigationElement",
        name: "Bible",
        description: "Biblical studies and structured lesson content.",
        url: "https://eduardoos.com/biblia",
        inLanguage: "en",
        isPartOf: {
          "@id": "https://eduardoos.com/#website"
        }
      }
    ]
  };
</script>

<svelte:head>
  <title>Eduardo Osteicoechea</title>
  <meta name="description" content={homepageMetaDescription} />
  <meta property="og:title" content="Eduardo Osteicoechea" />
  <meta property="og:description" content={homepageMetaDescription} />
  <script type="application/ld+json">
    {JSON.stringify(siteNavigationJsonLd)}
  </script>
</svelte:head>

<div class="page route-index-page">
  <header class="route-index-header hero-container" aria-labelledby="home-hero-heading">
    <p class="home-hero-eyebrow">Portfolio &amp; studies</p>
    <h1 id="home-hero-heading">Eduardo Osteicoechea</h1>
    <p class="home-hero-lead">
      Architecturally trained BIM modeler and full-stack developer—bridging design, Revit automation, and
      cloud tooling.
    </p>
    <div class="route-card-grid home-hero-actions">
      <a class="route-card" href="/bim/viewer">
        <h2>BIM viewer</h2>
        <p>Explore interactive model context and geometry.</p>
      </a>
      <a class="route-card" href="/biblia">
        <h2>Bible studies</h2>
        <p>Structured lessons and reading notes.</p>
      </a>
      <a class="route-card" href="/dashboard">
        <h2>Article dashboard</h2>
        <p>Create and manage lesson articles (sign-in required).</p>
      </a>
    </div>
  </header>

  <section class="home-recent-articles" aria-labelledby="recent-articles-heading">
    <div class="route-index-header">
      <h2 id="recent-articles-heading">Recent articles</h2>
      <p class="home-section-intro">
        Published lessons and posts will appear here once the public catalog is wired to the article API.
      </p>
    </div>
    <ul class="route-card-grid home-article-placeholder-list" role="list">
      <li>
        <article class="route-card home-article-placeholder-card" aria-busy="true">
          <h3>Coming soon</h3>
          <p>No public article feed yet—this block is reserved for recent titles and summaries.</p>
        </article>
      </li>
    </ul>
  </section>
</div>

<style>
  .home-hero-eyebrow {
    margin: 0;
    font-size: var(--font-size-4);
    line-height: var(--line-height-4);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .home-hero-lead {
    margin: 0;
    max-width: 36rem;
    font-size: var(--font-size-6);
    line-height: var(--line-height-6);
    color: var(--text-main);
  }

  .home-hero-actions {
    margin-top: 0.5rem;
  }

  .home-section-intro {
    margin: 0;
    max-width: 40rem;
    font-size: var(--font-size-5);
    line-height: var(--line-height-5);
    color: var(--text-muted);
  }

  .home-recent-articles {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-clear);
  }

  .home-article-placeholder-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .home-article-placeholder-card {
    cursor: default;
  }

  .home-article-placeholder-card:hover {
    transform: none;
    border-color: var(--border-clear);
    background-color: var(--accordion-bg);
  }
</style>
