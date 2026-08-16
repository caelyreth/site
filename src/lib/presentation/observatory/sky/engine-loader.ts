import type { SkyFieldEngine } from './engine'

type SkyFieldEngineFactory = (
  target: HTMLCanvasElement,
  initial_dark?: boolean,
) => SkyFieldEngine

let pending_engine_load: Promise<SkyFieldEngineFactory> | undefined

export function load_sky_field_engine() {
  pending_engine_load ??= import('./engine').then(
    ({ create_sky_field_engine }) => create_sky_field_engine,
  )

  return pending_engine_load
}
