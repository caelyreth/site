import type { create_sky_map_engine } from './engine'
import type { SkyMapPayload } from './types'

interface SkyMapEngineLoad {
  create_engine: typeof create_sky_map_engine
  sky_data: SkyMapPayload
}

let pending_engine_load: Promise<SkyMapEngineLoad> | undefined

async function create_engine_load() {
  const [engine, sky_data] = await Promise.all([
    import('./engine'),
    import('$lib/data/sky-map-data.generated'),
  ])
  return {
    create_engine: engine.create_sky_map_engine,
    sky_data,
  }
}

export function load_sky_map_engine() {
  pending_engine_load ??= create_engine_load()

  return pending_engine_load
}
