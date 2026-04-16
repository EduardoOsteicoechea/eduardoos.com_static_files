<script lang="ts">
  import { page } from "$app/stores";

  type BreadcrumbItem = {
    label: string;
    href?: string;
  };

  const labelMap: Record<string, string> = {
    biblia: "Biblia",
    series: "Series",
    romanos: "Romanos",
    pablo: "Pablo",
    origen: "Origen",
    brutalidad: "Brutalidad",
  };

  function toTitle(text: string) {
    return text
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  let items = $derived.by(() => {
    const path = $page.url.pathname.replace(/\/$/, "");
    const segments = path.split("/").filter(Boolean);
    let currentPath = "";

    return segments.map((segment, index) => {
      currentPath += `/${segment}`;
      return {
        label: labelMap[segment] ?? toTitle(segment),
        href: index < segments.length - 1 ? currentPath : undefined,
      } satisfies BreadcrumbItem;
    });
  });
</script>

<nav class="breadcrumb-nav" aria-label="Breadcrumb">
  <ol class="breadcrumb-list">
    {#each items as item, i}
      <li class="breadcrumb-item">
        {#if item.href && i < items.length - 1}
          <a href={item.href}>{item.label}</a>
        {:else}
          <span aria-current="page">{item.label}</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
