/* oxlint-disable typescript/prefer-readonly-parameter-types -- Resolver input mirrors parsed document contracts. */
import type { PageFrontmatter } from '$lib/content/types'
import type { Component } from 'svelte'

import type {
  FooterDefinition,
  ObservatoryGraphicDefinition,
  RegionOptions,
} from './definitions'

const key_pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const graphics = import.meta.glob('../graphics/*/loader.ts', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

const footers = import.meta.glob('../footers/*/loader.ts', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

type ResolvedPresentation = Readonly<{
  footer?: Readonly<{
    definition: FooterDefinition
    options: RegionOptions
  }>
  graphic?: Readonly<{
    definition: ObservatoryGraphicDefinition
    options: RegionOptions
  }>
}>

function is_record(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' && value !== null && !Array.isArray(value)
  )
}

function is_component(value: unknown): value is Component {
  return typeof value === 'function'
}

function valid_key(value: string, region: string) {
  if (key_pattern.test(value)) return value
  throw new Error(
    `Invalid ${region} key "${value}". Use lowercase kebab-case names.`,
  )
}

function available_keys(modules: Readonly<Record<string, unknown>>) {
  return Object.keys(modules)
    .map((path) => path.split('/').at(-2))
    .filter((key): key is string => key !== undefined)
    .sort()
}

function graphic_definition(id: string) {
  const definition = graphics[`../graphics/${id}/loader.ts`]
  if (is_record(definition) && definition.region === 'observatory') {
    return definition
  }
  throw new Error(
    `Unknown observatory graphic "${id}". Available graphics: ${available_keys(graphics).join(', ') || 'none'}.`,
  )
}

function footer_definition(id: string) {
  const definition = footers[`../footers/${id}/loader.ts`]
  if (is_record(definition)) return definition
  throw new Error(
    `Unknown footer "${id}". Available footers: ${available_keys(footers).join(', ') || 'none'}.`,
  )
}

function resolve_graphic(key: string) {
  const id = valid_key(key, 'graphic')
  const definition = graphic_definition(id)
  if (
    definition.id !== id ||
    typeof definition.normalize_options !== 'function' ||
    !is_component(definition.component)
  ) {
    throw new Error(
      `Graphic loader "${id}" does not match the loader contract.`,
    )
  }
  return definition as ObservatoryGraphicDefinition
}

function resolve_footer(key: string) {
  const id = valid_key(key, 'footer')
  const definition = footer_definition(id)
  if (
    definition.id !== id ||
    typeof definition.normalize_options !== 'function' ||
    !is_component(definition.component)
  ) {
    throw new Error(
      `Footer loader "${id}" does not match the loader contract.`,
    )
  }
  return definition as FooterDefinition
}

function normalize_options(
  definition: Pick<
    ObservatoryGraphicDefinition | FooterDefinition,
    'id' | 'normalize_options'
  >,
  value: unknown,
) {
  const options = definition.normalize_options(value)
  if (is_record(options)) return options
  throw new Error(
    `Presentation loader "${definition.id}" must return an options object.`,
  )
}

export function resolve_presentation(
  frontmatter: PageFrontmatter,
): ResolvedPresentation {
  const graphic = frontmatter.graphics
    ? (() => {
        const definition = resolve_graphic(frontmatter.graphics)
        return {
          definition,
          options: normalize_options(
            definition,
            frontmatter.graphics_options,
          ),
        }
      })()
    : undefined
  const footer = frontmatter.footer
    ? (() => {
        const definition = resolve_footer(frontmatter.footer)
        return {
          definition,
          options: normalize_options(
            definition,
            frontmatter.footer_options,
          ),
        }
      })()
    : undefined

  return { footer, graphic }
}
