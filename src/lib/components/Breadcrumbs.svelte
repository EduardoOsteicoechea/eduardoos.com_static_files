<script lang="ts">
  import { page } from "$app/stores";

  type BreadcrumbSegment = {
    name: string;
    path: string;
  };

  const formatSegmentName = (segment: string): string =>
    decodeURIComponent(segment)
      .replace(/-/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const buildSegments = (pathname: string): BreadcrumbSegment[] => {
    const parts = pathname.split("/").filter(Boolean);
    const segments: BreadcrumbSegment[] = [{ name: "Home", path: "/" }];

    let currentPath = "";
    for (const part of parts) {
      currentPath += `/${part}`;
      segments.push({
        name: formatSegmentName(part),
        path: currentPath
      });
    }

    return segments;
  };

  let segments: BreadcrumbSegment[] = [{ name: "Home", path: "/" }];
  $: segments = buildSegments($page.url.pathname);
</script>

<nav class="breadcrumbs" aria-label="Breadcrumb">
  <ol class="breadcrumbs-list">
    {#each segments as segment, index (segment.path)}
      {@const isLast = index === segments.length - 1}
      <li class="breadcrumbs-item">
        {#if isLast}
          <span class="breadcrumbs-current" aria-current="page">{segment.name}</span>
        {:else}
          <a class="breadcrumbs-link" href={segment.path}>{segment.name}</a>
          <span class="breadcrumbs-separator" aria-hidden="true">/</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  .breadcrumbs {
    margin: 0 0 0.75rem;
  }

  .breadcrumbs-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .breadcrumbs-item {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: var(--font-size-4);
    line-height: var(--line-height-4);
  }

  .breadcrumbs-link {
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .breadcrumbs-link:hover {
    color: var(--btn-nav-hover);
    text-decoration: underline;
  }

  .breadcrumbs-current {
    color: var(--text-main);
    font-weight: 600;
  }

  .breadcrumbs-separator {
    color: var(--text-muted);
  }
</style>
