import { onNavigate } from '$app/navigation'
import type { OnNavigate } from '@sveltejs/kit'

export function install_view_transitions(
  should_transition: (navigation: OnNavigate) => boolean,
) {
  onNavigate((navigation) => {
    if (
      typeof document === 'undefined' ||
      !should_transition(navigation) ||
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    return new Promise((continue_navigation) => {
      const transition = document.startViewTransition(async () => {
        continue_navigation()
        await navigation.complete
      })

      // Interrupted transitions reject their finished promise by design.
      void transition.finished.catch(() => {})
    })
  })
}
