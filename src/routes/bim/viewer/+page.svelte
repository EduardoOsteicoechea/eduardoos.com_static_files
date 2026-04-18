<script lang="ts">
  import ThreeViewer from "$lib/components/ThreeViewer.svelte";

  let { data } = $props();
  let selectedData = $state<Record<string, any> | null>(null);
</script>

<svelte:head>
  <title>{data.title}</title>
</svelte:head>

<div class="bim-viewer-shell">
  <ThreeViewer
    modelUrl={data.modelUrl}
    onElementSelect={(d) => {
      selectedData = d;
    }}
  />

  {#if selectedData}
    <aside class="selection-panel">
      <h2>Selected BIM Element</h2>
      <pre>{JSON.stringify(selectedData, null, 2)}</pre>
    </aside>
  {/if}
</div>

<style>
  :global(html, body) {
    margin: 0;
    overflow: hidden;
    height: 100%;
    min-height: 100%;
  }

  .bim-viewer-shell {
    position: relative;
    width: 100%;
    height: 100svh;
    min-height: 100%;
  }

  .selection-panel {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 20;
    width: min(420px, calc(100vw - 32px));
    max-height: calc(100svh - 32px);
    overflow: auto;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid rgb(255 255 255 / 0.18);
    background: rgb(14 20 33 / 0.9);
    color: #f5f8ff;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    box-shadow: 0 10px 30px rgb(0 0 0 / 0.35);
    backdrop-filter: blur(6px);
  }

  .selection-panel h2 {
    margin: 0 0 8px;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .selection-panel pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.8rem;
    line-height: 1.4;
  }
</style>
