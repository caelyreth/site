<script lang="ts">
  const { ...attributes }: Record<string, unknown> = $props()
</script>

<br {...attributes} />
