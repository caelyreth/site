<script lang="ts">
  let dark = $state(false)

  $effect(() => {
    dark = document.documentElement.classList.contains('dark')
  })

  function applyTheme(next: boolean) {
    dark = next
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  function toggle() {
    const next = !dark

    if (!document.startViewTransition) {
      applyTheme(next)
      return
    }

    document.startViewTransition(() => applyTheme(next))
  }
</script>

<button
  type="button"
  onclick={toggle}
  class="theme-toggle"
  aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
  aria-pressed={dark}
  title={dark ? 'Light mode' : 'Dark mode'}
>
  <span
    class={dark ? 'i-ri-sun-line' : 'i-ri-moon-line'}
    text-lg
    aria-hidden="true"
  ></span>
</button>

<style>
/* theme toggle — colors come from context (--toggle-*), so it works
   both over the dark window and on the docked paper bar */
.theme-toggle {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  cursor: pointer;
  border: 1px solid var(--toggle-line, var(--color-rule));
  color: var(--toggle-ink, var(--color-ink-2));
  background: transparent;
  transition:
    color var(--dur-micro) var(--ease-out),
    border-color var(--dur-micro) var(--ease-out);
}
.theme-toggle:hover {
  color: var(--color-accent);
}
</style>
