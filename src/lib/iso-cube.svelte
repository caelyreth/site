<script lang="ts">
  const { wire = false }: { wire?: boolean } = $props()
</script>

{#if wire}
  <svg viewBox="0 0 100 116" fill="none" aria-hidden="true" w-full h-auto>
    <path
      d="M50 2 98 29 50 56 2 29Z M2 29v58l48 27 48-27V29 M50 56v58"
      stroke="var(--space-line)"
    />
  </svg>
{:else}
  <svg viewBox="0 0 100 116" aria-hidden="true" w-full h-auto>
    <path d="M50 2 98 29 50 56 2 29Z" fill="var(--cube-hi)" />
    <path d="M2 29 50 56v58L2 87Z" fill="var(--cube-mid)" />
    <path d="M50 56 98 29v58l-48 27Z" fill="var(--cube-lo)" />
  </svg>
{/if}
