import edgeFragmentSource from './shaders/edge.frag.glsl?raw'
import edgeVertexSource from './shaders/edge.vert.glsl?raw'
import projectionSource from './shaders/projection.glsl?raw'
import starFragmentSource from './shaders/star.frag.glsl?raw'
import starVertexSource from './shaders/star.vert.glsl?raw'

const projectionMarker = '/* @include projection */'

function withProjection(source: string) {
  return source.replace(projectionMarker, projectionSource)
}

export const edgeFragmentShader = edgeFragmentSource
export const edgeVertexShader = withProjection(edgeVertexSource)
export const starFragmentShader = starFragmentSource
export const starVertexShader = withProjection(starVertexSource)
