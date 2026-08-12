<script lang="ts">
  interface DirectoryEntry {
    detail: string
    title: string
  }

  /* oxlint-disable prefer-const -- Component props can update with the document. */
  let { entries = [] }: { entries?: DirectoryEntry[] } = $props()
</script>

<div class="directory">
  {#each entries as entry, index (entry.title)}
    <div class:last={index === entries.length - 1} class="directory-row">
      <span class="directory-name font-serif">{entry.title}</span>
      <span class="directory-detail">{entry.detail}</span>
    </div>
  {/each}
</div>

<style>
  .directory {
    margin-top: 1.5rem;
  }

  .directory-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(8rem, 1fr);
    gap: 1rem;
    padding-block: 1rem;
    border-top: 1px solid var(--color-rule);
    align-items: baseline;
  }

  .directory-row.last {
    border-bottom: 1px solid var(--color-rule);
  }

  .directory-name {
    color: var(--color-text);
    font-weight: 700;
  }

  .directory-detail {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    text-align: right;
  }

  @media (max-width: 38rem) {
    .directory-row {
      grid-template-columns: minmax(0, 1fr);
      gap: 0.35rem;
    }

    .directory-detail {
      text-align: left;
    }
  }
</style>
