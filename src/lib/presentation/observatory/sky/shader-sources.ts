import ground_fragment_source from './shaders/ground.frag.glsl?raw'
import ground_vertex_source from './shaders/ground.vert.glsl?raw'
import projection_source from './shaders/projection.glsl?raw'
import trail_fragment_source from './shaders/trail.frag.glsl?raw'
import trail_vertex_source from './shaders/trail.vert.glsl?raw'

const projection_marker = '/* @include projection */'

export const trail_fragment_shader = trail_fragment_source
export const trail_vertex_shader = trail_vertex_source.replace(
  projection_marker,
  projection_source,
)
export const ground_fragment_shader = ground_fragment_source
export const ground_vertex_shader = ground_vertex_source
