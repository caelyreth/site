import type { Component } from 'svelte'
import * as v from 'valibot'

export type RegionOptions = Record<string, unknown>
export type RegionSchema = v.GenericSchema<unknown, RegionOptions>

export interface StageIntro {
  description?: string
  title: string
}

export interface StageProps {
  intro: StageIntro
  options: RegionOptions
}

export interface StageDefinition {
  component: Component<StageProps>
  id: string
  options: RegionSchema
}

export interface FooterProps {
  options: RegionOptions
  visible: boolean
}

export interface FooterDefinition {
  component: Component<FooterProps>
  id: string
  options: RegionSchema
}

export interface RegionSelection {
  id: string
  options: RegionOptions
}

export interface PresentationSelection {
  footer?: RegionSelection
  stage?: RegionSelection
}

export const empty_options_schema = v.pipe(
  v.undefined(),
  v.transform((): RegionOptions => ({})),
)
