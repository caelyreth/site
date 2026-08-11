import type { Component } from 'svelte'
/* oxlint-disable typescript/prefer-readonly-parameter-types -- Selections are readonly data contracts. */

import type {
  FooterProps,
  PresentationSelection,
  RegionOptions,
  StageProps,
} from './contract'

const stage_components = import.meta.glob('./stages/*/view.svelte', {
  eager: true,
  import: 'default',
}) as Record<string, Component<StageProps>>

const footer_components = import.meta.glob('./footers/*/view.svelte', {
  eager: true,
  import: 'default',
}) as Record<string, Component<FooterProps>>

export type ResolvedPresentation = Readonly<{
  footer?: Readonly<{
    component: Component<FooterProps>
    options: RegionOptions
  }>
  stage?: Readonly<{
    component: Component<StageProps>
    options: RegionOptions
  }>
}>

function component_for<ComponentType>(
  components: Readonly<Record<string, ComponentType>>,
  path: string,
  region: string,
) {
  const component = components[path]
  if (component) return component
  throw new Error(`Unknown ${region} component at "${path}".`)
}

export function resolve_presentation(
  selection: Readonly<PresentationSelection>,
): ResolvedPresentation {
  return {
    footer: selection.footer
      ? {
          component: component_for(
            footer_components,
            `./footers/${selection.footer.id}/view.svelte`,
            'footer',
          ),
          options: selection.footer.options,
        }
      : undefined,
    stage: selection.stage
      ? {
          component: component_for(
            stage_components,
            `./stages/${selection.stage.id}/view.svelte`,
            'stage',
          ),
          options: selection.stage.options,
        }
      : undefined,
  }
}
