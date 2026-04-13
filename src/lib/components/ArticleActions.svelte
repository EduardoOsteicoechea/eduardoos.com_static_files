<script lang="ts">
  import type { LessonJson } from "../../routes/bible-series-romans-paul/+page";

  let { lesson }: { lesson: LessonJson } = $props();

  let isCopied = $state(false);

  function copyArticle() {
    let text = "";
    
    for (const section of lesson.sections) {
      text += `## ${section.title}\n\n`;
      for (const paragraph of section.content) {
        text += `${paragraph}\n\n`;
      }
    }

    navigator.clipboard.writeText(text.trim()).then(() => {
      isCopied = true;
      setTimeout(() => {
        isCopied = false;
      }, 2000);
    });
  }
</script>

<div class="article-actions">
  <!-- Copy Article -->
  <button 
    class="action-btn copy-btn" 
    class:copied={isCopied}
    onclick={copyArticle} 
    aria-label="Copiar texto del artículo"
  >
    {#if isCopied}
      <!-- Check icon -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>¡Copiado!</span>
    {:else}
      <!-- Copy icon -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span>Copiar Lección</span>
    {/if}
  </button>

  <!-- YouTube Link -->
  {#if lesson.youtube_url}
    <a 
      class="action-btn yt-btn" 
      href={lesson.youtube_url} 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Ver video de YouTube"
    >
      <!-- YouTube Logo SVG -->
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
      <span>Ver en YouTube</span>
    </a>
  {/if}
</div>

<style>
  .article-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    margin: 0 15px 20px 15px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 42px;
    padding: 0 16px;
    border-radius: 6px;
    font-size: calc(14px * var(--text-zoom, 1));
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
    border: none;
    flex: 1;
  }

  /* Copy Button (neutral/gray style) */
  .copy-btn {
    background-color: #f1f3f5;
    color: #495057;
    border: 1px solid #dee2e6;
  }

  .copy-btn:hover {
    background-color: #e9ecef;
    border-color: #ced4da;
    color: #212529;
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

  @media (max-width: 380px) {
    .action-btn {
      padding: 0 10px;
      font-size: calc(13px * var(--text-zoom, 1));
    }
  }
</style>
