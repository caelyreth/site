import { createContext } from 'svelte'

import type { EntryCollection } from './entries'
import type {
  ConstellationIndexFrontmatter,
  EntryIndexFrontmatter,
} from './schema'

export interface LibraryConfig {
  constellations: ConstellationIndexFrontmatter
  entries: Record<EntryCollection, EntryIndexFrontmatter>
}

export const [get_library_config, set_library_config] = createContext<{
  current: LibraryConfig
}>()
