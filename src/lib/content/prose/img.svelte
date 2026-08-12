<script lang="ts">
  const { ...attributes }: Record<string, unknown> = $props()
</script>

<img {...attributes} />

<style>
  img {
    display: block;
    max-width: min(100%, 18rem);
    height: auto;
    margin: 1.25rem 0 0;
    border: 1px solid var(--color-rule);
    background: var(--color-prose-surface);
  }
</style>
