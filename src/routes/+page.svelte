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

