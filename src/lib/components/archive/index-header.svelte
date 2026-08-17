<script lang="ts">
  interface Props {
    description: string
    kind: 'constellations' | 'records'
    title: string
  }

  let { description, kind, title }: Props = $props()
</script>

<header
  class:constellations={kind === 'constellations'}
  class="archive-index-header"
>
  <p class="micro-label kind">
    {kind === 'records' ? '留存的文字' : '彼此回响的主题'}
  </p>
  <h1>{title}</h1>
  <p>{description}</p>
</header>

<style>
  .archive-index-header {
    display: block;
    min-width: 0;
    padding-bottom: clamp(1.5rem, 4vw, 2.75rem);
    border-bottom: 1px solid var(--color-boundary);
  }

  .kind {
    margin: 0 0 1rem;
    color: var(--color-muted);
  }

  h1 {
    margin: 0;
    color: var(--color-text);
    font-family: var(--font-stack-serif);
    font-size: clamp(2rem, 3.25vw, 3.25rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.18;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  p {
    max-width: 34rem;
    margin: 1rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    line-height: 1.6;
  }

  @media (width >= 48rem) {
    .archive-index-header.constellations p:not(.kind) {
      max-width: 30rem;
    }
  }
</style>
