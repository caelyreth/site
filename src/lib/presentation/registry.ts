import type { Component } from 'svelte'

import type {
  FooterProps,
  PresentationSelection,
  RegionSelection,
  RegionOptions,
  StageProps,
} from './contract'

const stage_components = import.meta.glob<Component<StageProps>>(
  './stages/*/view.svelte',
  {
    eager: true,
    import: 'default',
  },
)

const footer_components = import.meta.glob<Component<FooterProps>>(
  './footers/*/view.svelte',
  {
    eager: true,
    import: 'default',
  },
)

interface ResolvedFooter {
  component: Component<FooterProps>
  options: RegionOptions
}

interface ResolvedStage {
  component: Component<StageProps>
  options: RegionOptions
}

export interface ResolvedPresentation {
  footer?: ResolvedFooter
  stage?: ResolvedStage
}

function component_for<ComponentType>(
  components: Record<string, ComponentType>,
  path: string,
  region: string,
) {
  const component = components[path]
  if (component) return component
  throw new Error(`Unknown ${region} component at "${path}".`)
}

function resolve_region<ComponentType>(
  selection: RegionSelection | undefined,
  components: Record<string, ComponentType>,
  path_for: (id: string) => string,
  region: string,
) {
  if (!selection) return undefined
  return {
    component: component_for(components, path_for(selection.id), region),
    options: selection.options,
  }
}

export function resolve_presentation(
  selection: PresentationSelection,
): ResolvedPresentation {
  return {
    footer: resolve_region(
      selection.footer,
      footer_components,
      (id) => `./footers/${id}/view.svelte`,
      'footer',
    ),
    stage: resolve_region(
      selection.stage,
      stage_components,
      (id) => `./stages/${id}/view.svelte`,
      'stage',
    ),
  }
}
