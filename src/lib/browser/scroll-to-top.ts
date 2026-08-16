import { reduced_motion } from './reduced-motion'

export function scroll_to_top() {
  window.scrollTo({
    top: 0,
    behavior: reduced_motion.current ? 'auto' : 'smooth',
  })
}
