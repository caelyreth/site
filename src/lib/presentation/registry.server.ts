import type { PageFrontmatter } from '$lib/content/schema'
import { z } from 'zod'
/* oxlint-disable typescript/prefer-readonly-parameter-types -- Inputs are parsed without mutation. */

import type {
  FooterDefinition,
  PresentationSelection,
  RegionSelection,
  StageDefinition,
} from './contract'

const stage_modules = import.meta.glob('../graphics/*/loader.ts', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

const footer_modules = import.meta.glob('../footers/*/loader.ts', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

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
): RegionRegistry<Definition> {
  function get(id: string) {
    const definition = modules[`../${region}s/${id}/loader.ts`]
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

const stages = create_registry<StageDefinition>('graphic', stage_modules)
const footers = create_registry<FooterDefinition>('footer', footer_modules)

export function select_presentation(
  frontmatter: Readonly<PageFrontmatter>,
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
