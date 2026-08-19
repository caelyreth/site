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

const plana_path_source = plana_figure_source.match(
  /<g clip-path="url\(#a\)">(?<paths>.*)<\/g><defs>/,
)?.groups?.paths

if (!plana_path_source) {
  throw new Error('Unable to read Plana illustration paths')
}

type PlanaPart = {
  paths: string[]
  source: string
  tone: string
}

const plana_parts: PlanaPart[] = []

for (const [path] of plana_path_source.matchAll(/<path\b[^>]*>/g)) {
  const palette = plana_palette.find(([source]) => path.includes(source))

  if (!palette) {
    throw new Error('Plana illustration contains an unknown paint color')
  }

  const [source, tone] = palette
  const current = plana_parts.at(-1)

  if (current?.source === source) {
    current.paths.push(path)
  } else {
    plana_parts.push({ paths: [path], source, tone })
  }
}

export const plana_segments = plana_parts.map(({ tone }, index) => ({
  id: `plana-part-${index}`,
  tone,
}))

export const plana_defs = [
  '<clipPath id="plana-clip"><path d="M0 0h1593v1800H0z"/></clipPath>',
  ...plana_parts.map(
    ({ paths, source }, index) =>
      `<symbol id="plana-part-${index}" viewBox="0 0 1593 1800"><g clip-path="url(#plana-clip)">${paths.join('').replaceAll(source, 'context-fill')}</g></symbol>`,
  ),
].join('')
