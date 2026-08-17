import type { Engine } from './engine'

type EngineFactory = (
  target: HTMLCanvasElement,
  initial_dark?: boolean,
) => Engine

let pending_load: Promise<EngineFactory> | undefined

export function load_engine() {
  pending_load ??= import('./engine').then(({ create_engine }) => create_engine)

  return pending_load
}
