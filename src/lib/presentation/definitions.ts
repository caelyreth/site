/* oxlint-disable typescript/prefer-readonly-parameter-types -- Loader definitions adapt Svelte component contracts. */
import type { Component } from 'svelte'

export type RegionOptions = Record<string, unknown>

export type ObservatoryFrameSignal = Readonly<{
  color: string
}>

export type ObservatoryGraphicProps = {
  options: RegionOptions
  on_frame_signal?: (signal: ObservatoryFrameSignal | undefined) => void
}

export type ObservatoryGraphicDefinition = Readonly<{
  id: string
  region: 'observatory'
  component: Component<ObservatoryGraphicProps>
  normalize_options: (value: unknown) => RegionOptions
}>

export type FooterProps = {
  is_footer_visible: boolean
  options: RegionOptions
}

export type FooterDefinition = Readonly<{
  id: string
  component: Component<FooterProps>
  normalize_options: (value: unknown) => RegionOptions
}>

export function define_observatory_graphic(
  definition: Readonly<ObservatoryGraphicDefinition>,
) {
  return definition
}

export function define_footer(definition: Readonly<FooterDefinition>) {
  return definition
}
