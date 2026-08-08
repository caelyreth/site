import background_fragment_source from './shaders/background.frag.glsl?raw'
import background_vertex_source from './shaders/background.vert.glsl?raw'
import edge_fragment_source from './shaders/edge.frag.glsl?raw'
import edge_vertex_source from './shaders/edge.vert.glsl?raw'
import projection_source from './shaders/projection.glsl?raw'
import route_fragment_source from './shaders/route.frag.glsl?raw'
import route_vertex_source from './shaders/route.vert.glsl?raw'
import star_fragment_source from './shaders/star.frag.glsl?raw'
import star_vertex_source from './shaders/star.vert.glsl?raw'
import trail_fragment_source from './shaders/trail.frag.glsl?raw'
import trail_vertex_source from './shaders/trail.vert.glsl?raw'

const projection_marker = '/* @include projection */'

function with_projection(source: string) {
  return source.replace(projection_marker, projection_source)
}

export const edge_fragment_shader = edge_fragment_source
export const edge_vertex_shader = with_projection(edge_vertex_source)
export const background_fragment_shader = background_fragment_source
export const background_vertex_shader = background_vertex_source
export const route_fragment_shader = route_fragment_source
export const route_vertex_shader = with_projection(route_vertex_source)
export const star_fragment_shader = star_fragment_source
export const star_vertex_shader = with_projection(star_vertex_source)
export const trail_fragment_shader = trail_fragment_source
export const trail_vertex_shader = trail_vertex_source
