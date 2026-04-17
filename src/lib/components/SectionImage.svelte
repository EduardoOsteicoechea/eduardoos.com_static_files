<script lang="ts">
  let {
    src,
    alt = "",
    caption
  }: {
    src: string;
    alt?: string;
    caption?: string;
  } = $props();
</script>

<div class="section-image-wrapper">
  <img class="section-image" {src} {alt} loading="lazy" />
  {#if caption}
    <p class="section-image-caption">{caption}</p>
  {/if}
</div>

<style>
  .section-image-wrapper {
   display: flex;
   align-items: center;
   justify-content: center;
    margin: 0rem 0;
    display: grid;
    gap: 0.45rem;
    max-height: 400px;
  }

  .section-image {
    height: 100%;
    max-height: 400px;
    width: auto;
    border-radius: var(--radius-1);
    display: block;
  }

  .section-image-caption {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.85;
  }
</style>
