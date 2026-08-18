import { createContext } from 'svelte'

import type {
  ConstellationIndexFrontmatter,
  RecordIndexFrontmatter,
} from './schema'

export interface LibraryConfig {
  constellations: ConstellationIndexFrontmatter
  records: RecordIndexFrontmatter
}

export const [get_library_config, set_library_config] = createContext<{
  current: LibraryConfig
}>()
