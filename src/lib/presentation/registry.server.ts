import type { PresentationFrontmatter } from '$lib/content/schema'
import * as v from 'valibot'

import type {
  BackgroundDefinition,
  FooterDefinition,
  ForegroundDefinition,
  PresentationSelection,
  RegionSelection,
} from './contract'

const background_modules = import.meta.glob<BackgroundDefinition>(
  './backgrounds/*/definition.server.ts',
  {
    eager: true,
    import: 'default',
  },
)

const foreground_modules = import.meta.glob<ForegroundDefinition>(
  './foregrounds/*/definition.server.ts',
  {
    eager: true,
    import: 'default',
  },
)

const footer_modules = import.meta.glob<FooterDefinition>(
  './footers/*/definition.server.ts',
  {
    eager: true,
    import: 'default',
  },
)

type RegionDefinition =
  | BackgroundDefinition
  | FooterDefinition
  | ForegroundDefinition

interface RegionRegistry {
  parse: (id: string, value: unknown) => RegionSelection
}

function module_ids(modules: Record<string, RegionDefinition>) {
  return Object.keys(modules)
    .map((path) => path.split('/').at(-2))
    .filter((id): id is string => id !== undefined)
    .sort()
}

function create_registry<Definition extends RegionDefinition>(
  region: string,
  modules: Record<string, Definition>,
  path_for: (id: string) => string,
): RegionRegistry {
  function definition_for(id: string) {
    const definition = modules[path_for(id)]
    if (!definition || definition.id !== id) {
      throw new Error(
        `Unknown ${region} "${id}". Available ${region}s: ${module_ids(modules).join(', ') || 'none'}.`,
      )
    }
    return definition
  }

  function parse(id: string, value: unknown) {
    const definition = definition_for(id)
    const result = v.safeParse(definition.options, value)
    if (result.success) return { id, options: result.output }
    throw new Error(
      `Invalid options for ${region} "${id}": ${v.summarize(result.issues)}`,
    )
  }

  return { parse }
}

const backgrounds = create_registry<BackgroundDefinition>(
  'background',
  background_modules,
  (id) => `./backgrounds/${id}/definition.server.ts`,
)
const foregrounds = create_registry<ForegroundDefinition>(
  'foreground',
  foreground_modules,
  (id) => `./foregrounds/${id}/definition.server.ts`,
)
const footers = create_registry<FooterDefinition>(
  'footer',
  footer_modules,
  (id) => `./footers/${id}/definition.server.ts`,
)

export function select_presentation(
  frontmatter: PresentationFrontmatter,
): PresentationSelection {
  return {
    background: frontmatter.background
      ? backgrounds.parse(
          frontmatter.background,
          frontmatter.background_options,
        )
      : undefined,
    footer: frontmatter.footer
      ? footers.parse(frontmatter.footer, frontmatter.footer_options)
      : undefined,
    foreground: frontmatter.foreground
      ? foregrounds.parse(
          frontmatter.foreground,
          frontmatter.foreground_options,
        )
      : undefined,
  }
}
