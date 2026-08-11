import { reduced_motion as motion_preference } from '$lib/site/reduced-motion'
import { onMount } from 'svelte'

/* oxlint-disable complexity -- Typewriter and corruption timers share one lifecycle. */

type FieldLogOptions = Readonly<{
  active: boolean
  paused: boolean
  visible: boolean
}>

type FieldRecord = {
  id: number
  text: string
}

const entries = [
  'The field holds its northern edge. A pale route crosses the dark and leaves no heat behind. Residual light gathers at the old meridian; the receiver stays open while the last thread returns.',
  'Transit note: the quiet interval is longer than predicted. Keep the aperture open until the last star settles. A weak trace is moving below the marked plane, too slow to call weather and too clean to call noise.',
  'The return signal arrives clean. Mark the change, wait for the dust to clear, and begin the next observation. Three distant points remain aligned after the route is gone; their order is unchanged.',
]
const corruption_glyphs = ['//', '::', '++', '..', 'XX', '00', '<>']
const max_records = 3

export function create_field_log_state(get_options: () => FieldLogOptions) {
  let records = $state<FieldRecord[]>([{ id: 1, text: '' }])
  let next_record_id = 2
  let entry_index = 0
  let character_index = 0
  let phase = $state<'typing' | 'holding'>('typing')
  let reduced_motion = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let corruption = $state('')
  let corruption_x = $state(48)
  let corruption_y = $state(36)
  let corruption_timer: ReturnType<typeof setTimeout> | undefined

  const status_label = $derived(
    get_options().paused &&
      (phase !== 'typing' || ends_word(current_text()))
      ? 'HOLD'
      : phase === 'typing'
        ? 'WRITE'
        : 'FILED',
  )
  const at_pause_boundary = $derived(
    get_options().paused &&
      (phase !== 'typing' || ends_word(current_text())),
  )

  function current_record() {
    return records.at(-1)
  }

  function current_text() {
    return current_record()?.text ?? ''
  }

  function ends_word(value: string) {
    const character = value.at(-1)
    return character === undefined || /[\s.,;:!?]/.test(character)
  }

  function should_finish_current_word() {
    const { paused } = get_options()
    return paused && phase === 'typing' && !ends_word(current_text())
  }

  function can_advance() {
    const { paused, visible } = get_options()
    return (
      visible &&
      !reduced_motion &&
      (!paused || should_finish_current_word())
    )
  }

  function clear_timer() {
    if (timer === undefined) return
    clearTimeout(timer)
    timer = undefined
  }

  function clear_corruption_timer() {
    if (corruption_timer === undefined) return
    clearTimeout(corruption_timer)
    corruption_timer = undefined
  }

  function can_schedule_corruption() {
    const { visible } = get_options()
    return corruption_timer === undefined && visible && !reduced_motion
  }

  function schedule_corruption(active: boolean) {
    if (!can_schedule_corruption()) return
    corruption_timer = setTimeout(
      () => {
        corruption_timer = undefined
        corruption =
          corruption_glyphs[
            Math.floor(Math.random() * corruption_glyphs.length)
          ]
        corruption_x = 34 + Math.random() * 50
        corruption_y = 18 + Math.random() * 68
        schedule_corruption(get_options().active)
      },
      active ? 900 + Math.random() * 700 : 420 + Math.random() * 400,
    )
  }

  function can_schedule_typewriter() {
    const { paused, visible } = get_options()
    return (
      timer === undefined &&
      visible &&
      !reduced_motion &&
      (!paused || should_finish_current_word())
    )
  }

  function schedule(delay: number) {
    if (!can_schedule_typewriter()) return
    timer = setTimeout(() => {
      timer = undefined
      advance()
    }, delay)
  }

  function character_delay(character: string) {
    if (character === '\n') return 520 + Math.random() * 260
    if (/[.!?]/.test(character)) return 420 + Math.random() * 360
    if (/[,;:]/.test(character)) return 180 + Math.random() * 180
    if (character === ' ') return 24 + Math.random() * 38
    return 30 + Math.random() * 68
  }

  function advance_typing() {
    const entry = entries[entry_index]
    if (character_index >= entry.length) {
      phase = 'holding'
      schedule(1200 + Math.random() * 1100)
      return
    }

    const record = current_record()
    if (!record) return
    const character = entry[character_index]
    record.text += character
    character_index += 1
    schedule(character_delay(character))
  }

  function begin_next_record() {
    entry_index = (entry_index + 1) % entries.length
    records = [...records, { id: next_record_id, text: '' }].slice(
      -max_records,
    )
    next_record_id += 1
    character_index = 0
    phase = 'typing'
    schedule(280 + Math.random() * 320)
  }

  function advance() {
    if (!can_advance()) return
    if (phase === 'typing') {
      advance_typing()
      return
    }
    begin_next_record()
  }

  function sync_typewriter() {
    const { paused } = get_options()
    if (paused) {
      if (should_finish_current_word()) {
        schedule(0)
      } else {
        clear_timer()
      }
      return
    }
    schedule(120)
  }

  function handle_reduced_motion(next_reduced_motion: boolean) {
    reduced_motion = next_reduced_motion
    if (!reduced_motion) return
    clear_timer()
    const record = current_record()
    if (!record) return
    record.text = entries[entry_index]
    character_index = record.text.length
    phase = 'holding'
  }

  $effect(() => {
    const { active, visible } = get_options()
    if (!visible || reduced_motion) {
      clear_corruption_timer()
      corruption = ''
      return
    }
    clear_corruption_timer()
    corruption = ''
    schedule_corruption(active)
  })

  $effect(() => {
    const { visible } = get_options()
    if (!visible || reduced_motion) {
      clear_timer()
      return
    }
    sync_typewriter()
  })

  onMount(() => {
    const unsubscribe = motion_preference.subscribe(handle_reduced_motion)
    return () => {
      unsubscribe()
      clear_timer()
      clear_corruption_timer()
    }
  })

  return {
    get at_pause_boundary() {
      return at_pause_boundary
    },
    get corruption() {
      return corruption
    },
    get corruption_x() {
      return corruption_x
    },
    get corruption_y() {
      return corruption_y
    },
    get records() {
      return records
    },
    get reduced_motion() {
      return reduced_motion
    },
    get status_label() {
      return status_label
    },
  }
}
