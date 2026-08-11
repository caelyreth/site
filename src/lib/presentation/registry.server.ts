import type { PresentationFrontmatter } from '$lib/content/schema'
import { z } from 'zod'
/* oxlint-disable typescript/prefer-readonly-parameter-types -- Inputs are parsed without mutation. */

import type {
  FooterDefinition,
  PresentationSelection,
  RegionSelection,
  StageDefinition,
} from './contract'

const stage_modules = import.meta.glob('./stages/*/definition.server.ts', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

const footer_modules = import.meta.glob(
  './footers/*/definition.server.ts',
  {
    eager: true,
    import: 'default',
  },
) as Record<string, unknown>

type RegionDefinition = StageDefinition | FooterDefinition

type RegionRegistry<Definition extends RegionDefinition> = Readonly<{
  get: (id: string) => Definition
  parse: (id: string, value: unknown) => RegionSelection
}>

function module_ids(modules: Readonly<Record<string, unknown>>) {
  return Object.keys(modules)
    .map((path) => path.split('/').at(-2))
    .filter((id): id is string => id !== undefined)
    .sort()
}

function is_record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function has_options_schema(value: unknown) {
  return is_record(value) && 'safeParse' in value
}

function is_definition(value: unknown): value is RegionDefinition {
  if (!is_record(value)) return false
  const definition = value
  return (
    typeof definition.id === 'string' &&
    typeof definition.component === 'function' &&
    has_options_schema(definition.options)
  )
}

function create_registry<Definition extends RegionDefinition>(
  region: string,
  modules: Readonly<Record<string, unknown>>,
  path_for: (id: string) => string,
): RegionRegistry<Definition> {
  function get(id: string) {
    const definition = modules[path_for(id)]
    if (!is_definition(definition) || definition.id !== id) {
      throw new Error(
        `Unknown ${region} "${id}". Available ${region}s: ${module_ids(modules).join(', ') || 'none'}.`,
      )
    }
    return definition as Definition
  }

  function parse(id: string, value: unknown) {
    const definition = get(id)
    const result = definition.options.safeParse(value)
    if (result.success) return { id, options: result.data }
    throw new Error(
      `Invalid options for ${region} "${id}": ${z.prettifyError(result.error)}`,
    )
  }

  return { get, parse }
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
  frontmatter: Readonly<PresentationFrontmatter>,
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
