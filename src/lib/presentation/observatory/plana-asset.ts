import plana_figure_source from '$lib/assets/illustrations/plana-figure.svg?raw'

const plana_palette = [
  ['#fafafa', '--plana-tone-0'],
  ['#f7f6f7', '--plana-tone-1'],
  ['#e3dddf', '--plana-tone-2'],
  ['#bfb3b6', '--plana-tone-3'],
  ['#7d767a', '--plana-tone-4'],
  ['#323033', '--plana-tone-5'],
  ['#201f22', '--plana-tone-6'],
  ['#161517', '--plana-tone-7'],
] as const

function recolor_plana(clip_id: string) {
  let figure = plana_figure_source
    .replaceAll('url(#a)', `url(#${clip_id})`)
    .replace('id="a"', `id="${clip_id}"`)
  for (const [source, tone] of plana_palette) {
    figure = figure.replaceAll(source, `var(${tone})`)
  }
  return figure
}

export const plana_layers = {
  far: recolor_plana('plana-far-clip'),
  interference: recolor_plana('plana-interference-clip'),
  near: recolor_plana('plana-near-clip'),
} as const
