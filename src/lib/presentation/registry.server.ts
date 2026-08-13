import type { PresentationFrontmatter } from '$lib/content/schema'
import * as v from 'valibot'

import type {
  FooterDefinition,
  PresentationSelection,
  RegionSelection,
  StageDefinition,
} from './contract'

const stage_modules = import.meta.glob<StageDefinition>(
  './stages/*/definition.server.ts',
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

type RegionDefinition = StageDefinition | FooterDefinition

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

const stages = create_registry<StageDefinition>(
  'stage',
  stage_modules,
  (id) => `./stages/${id}/definition.server.ts`,
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
    footer: frontmatter.footer
      ? footers.parse(frontmatter.footer, frontmatter.footer_options)
      : undefined,
    stage: frontmatter.graphics
      ? stages.parse(frontmatter.graphics, frontmatter.graphics_options)
      : undefined,
  }
}
