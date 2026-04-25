<script lang="ts">
  import LessonEditorForm from "$lib/components/lessons/LessonEditorForm.svelte";
  import type { LessonRecord } from "$lib/types/lessons";

  let {
    mode = "create",
    initialData = null
  }: {
    mode?: "create" | "edit";
    initialData?: LessonRecord | null;
  } = $props();
</script>

<LessonEditorForm {mode} {initialData} />
