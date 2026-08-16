import type { create_sky_map_engine } from './engine'

interface SkyMapEngineLoad {
  create_engine: typeof create_sky_map_engine
}

let pending_engine_load: Promise<SkyMapEngineLoad> | undefined

async function create_engine_load() {
  const engine = await import('./engine')
  return {
    create_engine: engine.create_sky_map_engine,
  }
}

export function load_sky_map_engine() {
  pending_engine_load ??= create_engine_load()

  return pending_engine_load
}
