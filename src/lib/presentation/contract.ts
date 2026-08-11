import type { Component } from 'svelte'
import type { z } from 'zod'

/* oxlint-disable typescript/prefer-readonly-parameter-types -- Definitions are readonly contracts. */

export type RegionOptions = Record<string, unknown>
export type RegionSchema = z.ZodType<RegionOptions>

export type StageSignal = Readonly<{
  color: string
}>

export type StageProps = {
  on_signal?: (signal: StageSignal | undefined) => void
  options: RegionOptions
}

export type StageDefinition = Readonly<{
  component: Component<StageProps>
  id: string
  options: RegionSchema
}>

export type FooterProps = {
  options: RegionOptions
  visible: boolean
}

export type FooterDefinition = Readonly<{
  component: Component<FooterProps>
  id: string
  options: RegionSchema
}>

export type RegionSelection = Readonly<{
  id: string
  options: RegionOptions
}>

export type PresentationSelection = Readonly<{
  footer?: RegionSelection
  stage?: RegionSelection
}>

export function define_stage(definition: Readonly<StageDefinition>) {
  return definition
}

export function define_footer(definition: Readonly<FooterDefinition>) {
  return definition
}
