<script lang="ts">
  import BimElementSidebar from "$lib/components/BimElementSidebar.svelte";
  import ThreeViewer from "$lib/components/ThreeViewer.svelte";
  import type { BimElementRef, BimElementSummary, FilterMode } from "$lib/types/bim";

  let { data } = $props();

  let selectedId = $state<string | null>(null);
  let selectedData = $state<BimElementRef | null>(null);
  let catalog = $state<BimElementSummary[]>([]);
  let filterMode = $state<FilterMode>("none");

  function handleCatalogReady(newCatalog: BimElementSummary[]) {
    catalog = newCatalog;
  }

  function handleViewerSelect(ref: BimElementRef | null) {
    selectedData = ref;
    selectedId = ref?.id ?? null;
  }

  function handleSidebarSelect(id: string) {
    selectedId = id;
  }
</script>

<svelte:head>
  <title>{data.title}</title>
</svelte:head>

<div class="bim-viewer-shell">
  <div class="bim-viewer-left">
    <div class="bim-viewer-filters">
      <label class="bim-viewer-filters__label">
        Filter
        <select class="bim-viewer-filters__select" bind:value={filterMode}>
          <option value="none">Show all</option>
          <option value="isolate">Isolate selection</option>
        </select>
      </label>
    </div>

    <BimElementSidebar elements={catalog} {selectedId} onSelect={handleSidebarSelect} />
  </div>

  <div class="bim-viewer-stage">
    <ThreeViewer
      modelUrl={data.modelUrl}
      {selectedId}
      {filterMode}
      onElementSelect={handleViewerSelect}
      onCatalogReady={handleCatalogReady}
    />
  </div>

  {#if selectedId}
    <aside class="selection-panel">
      <h2>Selection</h2>

      {#if selectedData?.computed && Object.keys(selectedData.computed).length > 0}
        <section class="selection-panel__computed" aria-label="Computed operations">
          <h3 class="selection-panel__computed-title">Computed operations</h3>
          <dl class="selection-panel__dl">
            {#each Object.entries(selectedData.computed) as [key, value] (key)}
              <div class="selection-panel__dl-row">
                <dt class="selection-panel__dt">{key}</dt>
                <dd class="selection-panel__dd">
                  {typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : String(value)}
                </dd>
              </div>
            {/each}
          </dl>
        </section>
      {/if}

      {#if selectedData}
        <h3 class="selection-panel__raw-title">Raw BIM metadata</h3>
        <pre class="selection-panel__pre">{JSON.stringify(selectedData, null, 2)}</pre>
      {:else}
        <p class="selection-panel__meta">
          <span class="selection-panel__label">id</span>
          <code>{selectedId}</code>
        </p>
        <p class="selection-panel__hint">
          Resolving element data from the viewer…
        </p>
      {/if}
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
    display: flex;
    flex-direction: row;
    align-items: stretch;
    position: relative;
    width: 100%;
    height: 100svh;
    min-height: 100%;
  }

  .bim-viewer-left {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    height: 100%;
    flex-shrink: 0;
  }

  .bim-viewer-filters {
    flex-shrink: 0;
    padding: 10px 12px 8px;
    border-bottom: 1px solid rgb(255 255 255 / 0.08);
    background: rgb(10 14 22 / 0.98);
  }

  .bim-viewer-filters__label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgb(255 255 255 / 0.5);
  }

  .bim-viewer-filters__select {
    max-width: 100%;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid rgb(255 255 255 / 0.12);
    background: rgb(18 24 38 / 0.95);
    color: #e8ecf4;
    font: inherit;
    font-size: 0.85rem;
    text-transform: none;
    letter-spacing: normal;
    cursor: pointer;
  }

  .bim-viewer-stage {
    flex: 1;
    min-width: 0;
    position: relative;
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

  .selection-panel__computed {
    margin: 0 0 14px;
    padding: 10px 10px 12px;
    border-radius: 8px;
    border: 1px solid rgb(0 255 120 / 0.22);
    background: rgb(0 40 24 / 0.35);
  }

  .selection-panel__computed-title {
    margin: 0 0 8px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgb(160 255 200 / 0.95);
  }

  .selection-panel__dl {
    margin: 0;
    display: grid;
    gap: 6px 12px;
  }

  .selection-panel__dl-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
    gap: 8px;
    align-items: baseline;
    font-size: 0.78rem;
    line-height: 1.35;
  }

  .selection-panel__dt {
    margin: 0;
    font-weight: 600;
    color: rgb(255 255 255 / 0.55);
    word-break: break-word;
  }

  .selection-panel__dd {
    margin: 0;
    color: #e8fff0;
    word-break: break-word;
  }

  .selection-panel__raw-title {
    margin: 0 0 6px;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgb(255 255 255 / 0.42);
  }

  .selection-panel__pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.8rem;
    line-height: 1.4;
  }

  .selection-panel__meta {
    margin: 0 0 8px;
    font-size: 0.8rem;
    line-height: 1.5;
  }

  .selection-panel__label {
    display: block;
    margin-bottom: 4px;
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgb(255 255 255 / 0.45);
  }

  .selection-panel__meta code {
    font-size: 0.8rem;
    word-break: break-all;
  }

  .selection-panel__hint {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.45;
    color: rgb(255 255 255 / 0.55);
  }
</style>
