<script lang="ts">
  import type { LessonJson } from "../../routes/bible-series-romans-paul/+page";

  let { lesson }: { lesson: LessonJson } = $props();

  let isCopied = $state(false);


  // Calculate total words and reading time based on article prose
  let wordCount = $derived.by(() => {
    let count = 0;
    for (const section of lesson.sections) {
      if (section.type === "prose" && section.content) {
        for (const paragraph of section.content) {
          count += paragraph.trim().split(/\s+/).filter(w => w.length > 0).length;
        }
      }
    }
    return count;
  });

  // Calculate reading time
  let readingTimeMin = $derived(Math.max(1, Math.ceil(wordCount / 200)));

  // Intelligently extract youtube_url from its dedicated section block (ignoring if missing)
  let youtubeSection = $derived(lesson.sections.find(s => s.type === "youtube"));
  let youtubeUrl = $derived(youtubeSection ? youtubeSection.youtube_url : null);

  function copyArticle() {
    let text = "";
    
    for (const section of lesson.sections) {
      text += `## ${section.title}\n\n`;
      if (Array.isArray(section.content)) {
        for (const paragraph of section.content) {
          text += `${paragraph}\n\n`;
        }
      }
    }

    navigator.clipboard.writeText(text.trim()).then(() => {
      isCopied = true;
      setTimeout(() => {
        isCopied = false;
      }, 2000);
    });
  }

  function printArticle() {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${lesson.titulo_de_enseñanza}</title>
        <style>
          @page { margin: 20mm; }
          body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            line-height: 1.6; 
            color: #000; 
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { margin-bottom: 24px; font-size: 26px; text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
          h2 { margin-top: 30px; font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          p { margin-bottom: 14px; font-size: 14px; }
        </style>
      </head>
      <body>
        <h1>${lesson.titulo_de_enseñanza}</h1>
    `;

    for (const section of lesson.sections) {
      html += `<h2>${section.title}</h2>`;
      if (Array.isArray(section.content)) {
        for (const paragraph of section.content) {
          html += `<p>${paragraph}</p>`;
        }
      }
    }

    html += `</body></html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      // We use setTimeout to ensure browser has rendered the iframe DOM before printing
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Cleanup after print dialog closes
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }, 250);
    }
  }
</script>

<div class="article-actions">
  <div class="meta-stats">
    <span>⏱️ {readingTimeMin} min</span>
    <span class="dot">•</span>
    <span>{wordCount} p.</span>
  </div>

  <div class="actions-group">


    <!-- Copy Article -->
    <button 
    class="action-btn copy-btn" 
    class:copied={isCopied}
    onclick={copyArticle} 
    aria-label="Copiar texto del artículo"
  >
    {#if isCopied}
    <!-- Check icon -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    {:else}
      <!-- Copy icon -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    {/if}
  </button>

  <!-- YouTube Link -->
  {#if youtubeUrl}
    <a 
      class="action-btn yt-btn" 
      href={youtubeUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Ver video de YouTube"
    >
      <!-- YouTube Logo SVG -->
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    </a>
  {/if}

  <!-- Print Button -->
  <button 
    class="action-btn print-btn" 
    onclick={printArticle}
    aria-label="Imprimir o guardar como PDF"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true">
      <polyline points="6 9 6 2 18 2 18 9"></polyline>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
      <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
  </button>
  </div>
</div>

<style>
  .article-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin: 0 15px 15px 15px;
  }

  .meta-stats {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: calc(13.5px * var(--text-zoom, 1));
    color: var(--meta-color, #868e96);
    font-weight: 500;
  }
  
  .dot {
    color: var(--dot-color, #ced4da);
    font-size: calc(11px * var(--text-zoom, 1));
  }

  .actions-group {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 35px;
    height: 35px;
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
    border: none;
    flex: none;
  }

  .action-btn svg {
    transition: transform 0.2s;
  }

  .action-btn:hover svg {
    transform: scale(1.1);
  }



  /* Copy Button (neutral/gray style) */
  .copy-btn {
    background-color: var(--copy-btn-bg);
    color: var(--copy-btn-color);
    border: 1px solid var(--copy-btn-border);
  }

  .copy-btn:hover {
    background-color: var(--copy-btn-hover-bg);
    border-color: var(--copy-btn-hover-border);
    color: var(--copy-btn-hover-color);
  }

  .copy-btn.copied {
    background-color: #d4edda;
    border-color: #28a745;
    color: #155724;
  }

  /* YouTube Button (red brand style) */
  .yt-btn {
    background-color: #FF0000;
    color: #ffffff;
    /* border: 1px solid #cc0000; */
  }

  .yt-btn:hover {
    background-color: #cc0000;
    /* border-color: #aa0000; */
  }

  /* Print Button */
  .print-btn {
    background-color: var(--print-btn-bg);
    color: var(--print-btn-color);
    border: 1px solid var(--print-btn-border);
  }

  .print-btn:hover {
    background-color: var(--print-btn-hover-bg);
    border-color: var(--print-btn-hover-border);
    color: var(--print-btn-hover-color);
  }
</style>
