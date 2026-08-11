<script lang="ts">
  const { ...attributes }: Record<string, unknown> = $props()
</script>

<hr {...attributes} />

<style>
  hr {
    height: 1px;
    margin: 3.5rem 0 0;
    border: 0;
    background: var(--color-rule);
  }
</style>
