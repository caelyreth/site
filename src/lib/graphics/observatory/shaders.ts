import backgroundFragmentSource from './shaders/background.frag.glsl?raw'
import backgroundVertexSource from './shaders/background.vert.glsl?raw'
import edgeFragmentSource from './shaders/edge.frag.glsl?raw'
import edgeVertexSource from './shaders/edge.vert.glsl?raw'
import projectionSource from './shaders/projection.glsl?raw'
import routeFragmentSource from './shaders/route.frag.glsl?raw'
import routeVertexSource from './shaders/route.vert.glsl?raw'
import starFragmentSource from './shaders/star.frag.glsl?raw'
import starVertexSource from './shaders/star.vert.glsl?raw'
import trailFragmentSource from './shaders/trail.frag.glsl?raw'
import trailVertexSource from './shaders/trail.vert.glsl?raw'

const projectionMarker = '/* @include projection */'

function withProjection(source: string) {
  return source.replace(projectionMarker, projectionSource)
}

export const edgeFragmentShader = edgeFragmentSource
export const edgeVertexShader = withProjection(edgeVertexSource)
export const backgroundFragmentShader = backgroundFragmentSource
export const backgroundVertexShader = backgroundVertexSource
export const routeFragmentShader = routeFragmentSource
export const routeVertexShader = withProjection(routeVertexSource)
export const starFragmentShader = starFragmentSource
export const starVertexShader = withProjection(starVertexSource)
export const trailFragmentShader = trailFragmentSource
export const trailVertexShader = trailVertexSource
