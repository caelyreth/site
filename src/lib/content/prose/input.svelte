<script lang="ts">
  const { ...attributes }: Record<string, unknown> = $props()
</script>

<input {...attributes} />

<style>
  input[type='checkbox'] {
    width: 0.8125rem;
    height: 0.8125rem;
    margin: 0 0.45rem 0 0;
    accent-color: var(--color-accent);
    vertical-align: -0.1em;
  }
</style>
