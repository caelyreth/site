<script lang="ts">
  interface Props {
    description: string
    title: string
  }

  let { description, title }: Props = $props()
</script>

<header class="archive-index-header">
  <h1>{title}</h1>
  <p>{description}</p>
</header>

<style>
  .archive-index-header {
    display: grid;
    width: min(100%, 56rem);
    margin-inline-start: auto;
    gap: clamp(1.5rem, 4vw, 2.75rem);
    padding-bottom: clamp(1.75rem, 4vw, 3rem);
    border-bottom: 1px solid var(--color-boundary);
  }

  h1 {
    margin: 0;
    color: var(--color-text);
    font-family: var(--font-stack-serif);
    font-size: clamp(2.5rem, 4vw, 4rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }

  p {
    max-width: 32rem;
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    line-height: 1.6;
  }

  @media (width < 32rem) {
    h1 {
      font-size: clamp(2.25rem, 12vw, 3rem);
    }
  }
</style>
