<script lang="ts">
  import { onMount } from 'svelte'

  type Node = {
    x: number
    y: number
  }
  type Edge = {
    start: number
    end: number
    length: number
    weight: number
  }
  type Network = {
    nodes: Node[]
    edges: Edge[]
    spacing: number
  }
  type FieldController = {
    destroy: () => void
    setActive: (active: boolean) => void
  }
  type Three = typeof import('three')
  type DelaunayConstructor = typeof import('d3-delaunay').Delaunay

  const { motionActive }: { motionActive: boolean } = $props()

  let canvas = $state<HTMLCanvasElement>()
  let controller: FieldController | undefined

  function createRandom(seed: number) {
    let state = seed >>> 0
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0
      return state / 4294967296
    }
  }

  function buildNetwork(
    width: number,
    height: number,
    Delaunay: DelaunayConstructor,
  ): Network {
    const compact = width < 720
    const spacing = compact ? 66 : width > 1900 ? 92 : 82
    const overscan = spacing * 1.35
    const columns = Math.ceil((width + overscan * 2) / spacing)
    const rows = Math.ceil((height + overscan * 2) / spacing)
    const seed = Math.round(width / 160) * 73856093 ^ Math.round(height / 120) * 19349663
    const random = createRandom(seed)
    const nodes: Node[] = []

    for (let row = 0; row <= rows; row += 1) {
      for (let column = 0; column <= columns; column += 1) {
        if (random() < 0.07 && row > 0 && column > 0 && row < rows && column < columns) {
          continue
        }
        const offset = row % 2 === 0 ? 0 : spacing * 0.19
        const x =
          -overscan + column * spacing + offset + (random() - 0.5) * spacing * 0.76
        const y = -overscan + row * spacing + (random() - 0.5) * spacing * 0.72
        nodes.push({ x, y })
      }
    }

    const delaunay = Delaunay.from(
      nodes,
      (node) => node.x,
      (node) => node.y,
    )
    const edgesByKey = new Map<string, Edge>()
    const triangles = delaunay.triangles

    function addEdge(startIndex: number, endIndex: number) {
      const start = Math.min(startIndex, endIndex)
      const end = Math.max(startIndex, endIndex)
      const key = `${start}:${end}`
      if (edgesByKey.has(key)) return

      const from = nodes[start]
      const to = nodes[end]
      const length = Math.hypot(to.x - from.x, to.y - from.y)
      if (length > spacing * 2.15) return

      const lengthWeight = 1 - Math.min(1, Math.max(0, length / (spacing * 2.15)))
      edgesByKey.set(key, {
        start,
        end,
        length,
        weight: 0.48 + lengthWeight * 0.3 + random() * 0.18,
      })
    }

    for (let index = 0; index < triangles.length; index += 3) {
      const a = triangles[index]
      const b = triangles[index + 1]
      const c = triangles[index + 2]
      addEdge(a, b)
      addEdge(b, c)
      addEdge(c, a)
    }

    return { nodes, edges: [...edgesByKey.values()], spacing }
  }

  function graphDistances(network: Network, sourceIndex: number) {
    const { nodes, edges } = network
    const adjacency: { node: number; distance: number }[][] = Array.from(
      { length: nodes.length },
      () => [],
    )
    for (const edge of edges) {
      const cost = edge.length * (1.02 + (1 - edge.weight) * 0.16)
      adjacency[edge.start].push({ node: edge.end, distance: cost })
      adjacency[edge.end].push({ node: edge.start, distance: cost })
    }

    const distances = new Float32Array(nodes.length)
    distances.fill(Number.POSITIVE_INFINITY)
    distances[sourceIndex] = 0
    const visited = new Uint8Array(nodes.length)

    for (let count = 0; count < nodes.length; count += 1) {
      let current = -1
      let currentDistance = Number.POSITIVE_INFINITY
      for (let index = 0; index < nodes.length; index += 1) {
        if (!visited[index] && distances[index] < currentDistance) {
          current = index
          currentDistance = distances[index]
        }
      }
      if (current === -1) break

      visited[current] = 1
      for (const neighbour of adjacency[current]) {
        const candidate = currentDistance + neighbour.distance
        if (candidate < distances[neighbour.node]) distances[neighbour.node] = candidate
      }
    }

    return distances
  }

  function choosePixelRatio(width: number, height: number) {
    const nativeRatio = Math.min(window.devicePixelRatio || 1, 2)
    const pixelBudget = 3_200_000
    const budgetRatio = Math.sqrt(pixelBudget / Math.max(1, width * height))
    return Math.max(1, Math.min(nativeRatio, budgetRatio))
  }

  function createNetworkField(
    target: HTMLCanvasElement,
    three: Three,
    Delaunay: DelaunayConstructor,
  ): FieldController {
    const context = target.getContext('webgl2', {
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    })
    if (!context) {
      target.dataset.networkState = 'unsupported'
      target.hidden = true
      return { destroy: () => {}, setActive: () => {} }
    }

    const renderer = new three.WebGLRenderer({
      alpha: true,
      antialias: false,
      canvas: target,
      context,
      powerPreference: 'low-power',
    })
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = three.SRGBColorSpace
    renderer.sortObjects = false

    const scene = new three.Scene()
    const camera = new three.Camera()
    const sharedUniforms = {
      uTime: { value: 0 },
      uResolution: { value: new three.Vector2(1, 1) },
      uPixelRatio: { value: 1 },
      uHalfWidth: { value: 1.4 },
      uPulseDistance: { value: 0 },
      uHeadWidth: { value: 38 },
      uTailWidth: { value: 170 },
      uSourceRadius: { value: 28 },
      uInk: { value: new three.Color(0xffffff) },
      uBaseAlpha: { value: 0.2 },
    }
    const edgeMaterial = new three.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      uniforms: sharedUniforms,
      vertexShader: `
        precision highp float;

        attribute vec2 aStart;
        attribute vec2 aEnd;
        attribute float aDistanceStart;
        attribute float aDistanceEnd;
        attribute float aWeight;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uHalfWidth;
        varying float vSide;
        varying float vSignalDistance;
        varying float vWeight;
        varying float vDepthScale;

        vec2 deform(vec2 point) {
          float horizontal =
            sin(point.y * 7.1 + uTime * 0.19) * 0.0034 +
            sin((point.x + point.y) * 11.3 - uTime * 0.11) * 0.0018;
          float vertical =
            sin(point.x * 8.6 - uTime * 0.16) * 0.0038 +
            sin((point.x - point.y) * 9.7 + uTime * 0.09) * 0.0017;
          return point + vec2(horizontal, vertical);
        }

        vec2 projectSurface(vec2 point, out float depthScale) {
          float aspect = uResolution.x / uResolution.y;
          vec2 plane = (point - 0.5) * vec2(aspect, 1.0);
          vec2 domePoint = plane * vec2(0.7, 1.0);
          float height =
            exp(-dot(domePoint, domePoint) * 1.35) * 0.13 +
            sin(plane.x * 2.8 + plane.y * 1.2 + uTime * 0.08) * 0.032 +
            sin(plane.y * 4.1 - plane.x * 0.6 - uTime * 0.06) * 0.018 -
            0.045;
          vec3 surface = vec3(plane, height);

          // A shallow pitch and yaw expose the height field without needing a
          // perspective camera or another render pass.
          vec3 pitched = vec3(
            surface.x,
            surface.y * 0.9135 - surface.z * 0.4067,
            surface.y * 0.4067 + surface.z * 0.9135
          );
          vec3 turned = vec3(
            pitched.x * 0.9945 - pitched.z * 0.1045,
            pitched.y,
            pitched.x * 0.1045 + pitched.z * 0.9945
          );
          depthScale = 1.0 / (1.0 - turned.z * 0.31);
          return vec2(turned.x / aspect, turned.y) * depthScale + 0.5;
        }

        void main() {
          float along = position.x;
          float depth;
          vec2 point = projectSurface(deform(mix(aStart, aEnd, along)), depth);

          float tangentStep = 0.025;
          float beforeDepth;
          float afterDepth;
          vec2 before = projectSurface(
            deform(mix(aStart, aEnd, max(0.0, along - tangentStep))),
            beforeDepth
          );
          vec2 after = projectSurface(
            deform(mix(aStart, aEnd, min(1.0, along + tangentStep))),
            afterDepth
          );
          vec2 direction = normalize((after - before) * uResolution);
          vec2 normal = vec2(-direction.y, direction.x);
          vec2 clip = vec2(point.x * 2.0 - 1.0, 1.0 - point.y * 2.0);
          vec2 normalClip =
            vec2(normal.x, -normal.y) *
            (2.0 * uHalfWidth * depth / uResolution);

          clip += normalClip * position.y;
          vSide = position.y;
          vSignalDistance = mix(aDistanceStart, aDistanceEnd, along);
          vWeight = aWeight;
          vDepthScale = depth;
          gl_Position = vec4(clip, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform float uPulseDistance;
        uniform float uHeadWidth;
        uniform float uTailWidth;
        uniform float uSourceRadius;
        uniform vec3 uInk;
        uniform float uBaseAlpha;
        varying float vSide;
        varying float vSignalDistance;
        varying float vWeight;
        varying float vDepthScale;

        void main() {
          float antialias = max(fwidth(vSide) * 1.18, 0.012);
          float coverage = 1.0 - smoothstep(0.34 - antialias, 0.34 + antialias, abs(vSide));
          float behind = uPulseDistance - vSignalDistance;
          float head = 1.0 - smoothstep(uHeadWidth * 0.22, uHeadWidth, abs(behind));
          float wake =
            smoothstep(0.0, uHeadWidth * 0.36, behind) *
            (1.0 - smoothstep(uHeadWidth, uTailWidth, behind)) *
            0.34;
          float source =
            (1.0 - smoothstep(0.0, uSourceRadius, vSignalDistance)) *
            (1.0 - smoothstep(uSourceRadius * 1.4, uTailWidth, uPulseDistance));
          float activation = max(head, max(wake, source));
          float depthTone = mix(0.7, 1.08, smoothstep(0.84, 1.16, vDepthScale));
          float alpha =
            (uBaseAlpha * vWeight + activation * 0.82) * coverage * depthTone;

          if (alpha < 0.002) discard;
          gl_FragColor = vec4(uInk, alpha);
          #include <colorspace_fragment>
        }
      `,
    })
    const nodeMaterial = new three.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      uniforms: sharedUniforms,
      vertexShader: `
        precision highp float;

        attribute vec2 aPoint;
        attribute float aDistance;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uPixelRatio;
        uniform float uPulseDistance;
        uniform float uHeadWidth;
        uniform float uSourceRadius;
        varying float vActivation;
        varying float vDepthScale;

        vec2 deform(vec2 point) {
          float horizontal =
            sin(point.y * 7.1 + uTime * 0.19) * 0.0034 +
            sin((point.x + point.y) * 11.3 - uTime * 0.11) * 0.0018;
          float vertical =
            sin(point.x * 8.6 - uTime * 0.16) * 0.0038 +
            sin((point.x - point.y) * 9.7 + uTime * 0.09) * 0.0017;
          return point + vec2(horizontal, vertical);
        }

        vec2 projectSurface(vec2 point, out float depthScale) {
          float aspect = uResolution.x / uResolution.y;
          vec2 plane = (point - 0.5) * vec2(aspect, 1.0);
          vec2 domePoint = plane * vec2(0.7, 1.0);
          float height =
            exp(-dot(domePoint, domePoint) * 1.35) * 0.13 +
            sin(plane.x * 2.8 + plane.y * 1.2 + uTime * 0.08) * 0.032 +
            sin(plane.y * 4.1 - plane.x * 0.6 - uTime * 0.06) * 0.018 -
            0.045;
          vec3 surface = vec3(plane, height);
          vec3 pitched = vec3(
            surface.x,
            surface.y * 0.9135 - surface.z * 0.4067,
            surface.y * 0.4067 + surface.z * 0.9135
          );
          vec3 turned = vec3(
            pitched.x * 0.9945 - pitched.z * 0.1045,
            pitched.y,
            pitched.x * 0.1045 + pitched.z * 0.9945
          );
          depthScale = 1.0 / (1.0 - turned.z * 0.31);
          return vec2(turned.x / aspect, turned.y) * depthScale + 0.5;
        }

        void main() {
          float depth;
          vec2 point = projectSurface(deform(aPoint), depth);
          float head = 1.0 - smoothstep(uHeadWidth * 0.28, uHeadWidth, abs(uPulseDistance - aDistance));
          float source = 1.0 - smoothstep(0.0, uSourceRadius, aDistance);
          vActivation = max(head, source);
          vDepthScale = depth;
          gl_Position = vec4(point.x * 2.0 - 1.0, 1.0 - point.y * 2.0, 0.0, 1.0);
          gl_PointSize = (1.15 + vActivation * 2.35) * uPixelRatio * depth;
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform vec3 uInk;
        uniform float uBaseAlpha;
        varying float vActivation;
        varying float vDepthScale;

        void main() {
          float radius = length(gl_PointCoord - 0.5) * 2.0;
          float antialias = max(fwidth(radius) * 1.2, 0.04);
          float coverage = 1.0 - smoothstep(0.72 - antialias, 0.72 + antialias, radius);
          float depthTone = mix(0.7, 1.08, smoothstep(0.84, 1.16, vDepthScale));
          float alpha =
            (uBaseAlpha * 1.35 + vActivation * 0.78) * coverage * depthTone;

          if (alpha < 0.002) discard;
          gl_FragColor = vec4(uInk, alpha);
          #include <colorspace_fragment>
        }
      `,
    })

    let requestedActive = false
    let active = false
    let disposed = false
    let frame = 0
    let idleTimer = 0
    let pulseRunning = false
    let motionTime = 0
    let previousFrameTime = 0
    let previousRenderTime = 0
    let topologyKey = ''
    let network: Network | undefined
    let edgeGeometry: import('three').InstancedBufferGeometry | undefined
    let nodeGeometry: import('three').BufferGeometry | undefined
    let edgeMesh: import('three').Mesh | undefined
    let nodePoints: import('three').Points | undefined
    let sourceIndex = -1
    let signalStartedAt = performance.now()
    let maxSignalDistance = 1
    const signalSpeed = 360 / 1000
    const minimumFrameDuration = 1000 / 60
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    function disposeNetwork() {
      if (edgeMesh) scene.remove(edgeMesh)
      if (nodePoints) scene.remove(nodePoints)
      edgeGeometry?.dispose()
      nodeGeometry?.dispose()
      edgeGeometry = undefined
      nodeGeometry = undefined
      edgeMesh = undefined
      nodePoints = undefined
    }

    function applySource(now: number) {
      if (!network || !edgeGeometry || !nodeGeometry) return

      const candidates = network.nodes
        .map((node, index) => ({ node, index }))
        .filter(({ node }) => {
          const inside = node.x > 0 && node.y > 0 && node.x < target.clientWidth && node.y < target.clientHeight
          const x = node.x / Math.max(1, target.clientWidth)
          const y = node.y / Math.max(1, target.clientHeight)
          return inside && (x < 0.3 || x > 0.7 || y < 0.24 || y > 0.76)
        })
      if (candidates.length === 0) return

      let next = candidates[Math.floor(Math.random() * candidates.length)].index
      if (next === sourceIndex && candidates.length > 1) {
        const current = candidates.findIndex((candidate) => candidate.index === next)
        next = candidates[(current + 1) % candidates.length].index
      }
      sourceIndex = next

      const distances = graphDistances(network, sourceIndex)
      const edgeStartDistance = edgeGeometry.getAttribute(
        'aDistanceStart',
      ) as import('three').InstancedBufferAttribute
      const edgeEndDistance = edgeGeometry.getAttribute(
        'aDistanceEnd',
      ) as import('three').InstancedBufferAttribute
      const nodeDistance = nodeGeometry.getAttribute('aDistance') as import('three').BufferAttribute

      maxSignalDistance = 0
      network.edges.forEach((edge, index) => {
        edgeStartDistance.setX(index, distances[edge.start])
        edgeEndDistance.setX(index, distances[edge.end])
      })
      distances.forEach((distance, index) => {
        nodeDistance.setX(index, distance)
        const node = network!.nodes[index]
        const insideViewport =
          node.x >= 0 &&
          node.y >= 0 &&
          node.x <= target.clientWidth &&
          node.y <= target.clientHeight
        if (insideViewport && Number.isFinite(distance)) {
          maxSignalDistance = Math.max(maxSignalDistance, distance)
        }
      })
      edgeStartDistance.needsUpdate = true
      edgeEndDistance.needsUpdate = true
      nodeDistance.needsUpdate = true
      signalStartedAt = now
      sharedUniforms.uPulseDistance.value = 0
    }

    function installNetwork(width: number, height: number) {
      disposeNetwork()
      network = buildNetwork(width, height, Delaunay)

      const ribbon: number[] = []
      const ribbonIndices: number[] = []
      const ribbonSegments = 4
      for (let point = 0; point <= ribbonSegments; point += 1) {
        const along = point / ribbonSegments
        ribbon.push(along, -1, 0, along, 1, 0)
      }
      for (let segment = 0; segment < ribbonSegments; segment += 1) {
        const start = segment * 2
        const end = start + 2
        ribbonIndices.push(start, start + 1, end, end, start + 1, end + 1)
      }
      const starts: number[] = []
      const ends: number[] = []
      const weights: number[] = []
      for (const edge of network.edges) {
        const start = network.nodes[edge.start]
        const end = network.nodes[edge.end]
        starts.push(start.x / width, start.y / height)
        ends.push(end.x / width, end.y / height)
        weights.push(edge.weight)
      }

      edgeGeometry = new three.InstancedBufferGeometry()
      edgeGeometry.setAttribute('position', new three.Float32BufferAttribute(ribbon, 3))
      edgeGeometry.setIndex(ribbonIndices)
      edgeGeometry.setAttribute('aStart', new three.InstancedBufferAttribute(new Float32Array(starts), 2))
      edgeGeometry.setAttribute('aEnd', new three.InstancedBufferAttribute(new Float32Array(ends), 2))
      edgeGeometry.setAttribute(
        'aDistanceStart',
        new three.InstancedBufferAttribute(new Float32Array(network.edges.length), 1),
      )
      edgeGeometry.setAttribute(
        'aDistanceEnd',
        new three.InstancedBufferAttribute(new Float32Array(network.edges.length), 1),
      )
      edgeGeometry.setAttribute(
        'aWeight',
        new three.InstancedBufferAttribute(new Float32Array(weights), 1),
      )
      edgeGeometry.instanceCount = network.edges.length

      const nodePositions = new Float32Array(network.nodes.length * 3)
      const nodePointsNormalized = new Float32Array(network.nodes.length * 2)
      network.nodes.forEach((node, index) => {
        nodePointsNormalized[index * 2] = node.x / width
        nodePointsNormalized[index * 2 + 1] = node.y / height
      })
      nodeGeometry = new three.BufferGeometry()
      nodeGeometry.setAttribute('position', new three.BufferAttribute(nodePositions, 3))
      nodeGeometry.setAttribute('aPoint', new three.BufferAttribute(nodePointsNormalized, 2))
      nodeGeometry.setAttribute(
        'aDistance',
        new three.BufferAttribute(new Float32Array(network.nodes.length), 1),
      )

      edgeMesh = new three.Mesh(edgeGeometry, edgeMaterial)
      edgeMesh.frustumCulled = false
      edgeMesh.renderOrder = 0
      nodePoints = new three.Points(nodeGeometry, nodeMaterial)
      nodePoints.frustumCulled = false
      nodePoints.renderOrder = 1
      scene.add(edgeMesh, nodePoints)
      applySource(performance.now())
      if (!pulseRunning) {
        sharedUniforms.uPulseDistance.value = -sharedUniforms.uTailWidth.value
      }
    }

    const render = () => renderer.render(scene, camera)
    const updateTheme = () => {
      const dark = document.documentElement.classList.contains('dark')
      const lightness = dark ? 0.88 : 0.19
      sharedUniforms.uInk.value.setRGB(lightness, lightness, lightness, three.SRGBColorSpace)
      sharedUniforms.uBaseAlpha.value = dark ? 0.18 : 0.21
    }
    const resize = () => {
      const bounds = target.getBoundingClientRect()
      const width = Math.max(1, bounds.width)
      const height = Math.max(1, bounds.height)
      const pixelRatio = choosePixelRatio(width, height)
      const nextTopologyKey = `${Math.round(width / 160)}:${Math.round(height / 120)}`

      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(width, height, false)
      sharedUniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio)
      sharedUniforms.uPixelRatio.value = pixelRatio
      sharedUniforms.uHalfWidth.value = 1.4 * pixelRatio
      target.dataset.networkDpr = pixelRatio.toFixed(2)

      if (nextTopologyKey !== topologyKey) {
        topologyKey = nextTopologyKey
        installNetwork(width, height)
      }
      render()
    }
    const stopFrame = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }
    const stopTimer = () => {
      if (idleTimer) window.clearTimeout(idleTimer)
      idleTimer = 0
    }
    const stop = () => {
      stopFrame()
      stopTimer()
      pulseRunning = false
    }
    const beginPulse = () => {
      if (!active || disposed || !network) return
      stopTimer()
      pulseRunning = true
      target.dataset.networkMode = 'pulse'
      const now = performance.now()
      previousFrameTime = now
      previousRenderTime = 0
      applySource(now)
      stopFrame()
      frame = requestAnimationFrame(animate)
    }
    const enterIdle = () => {
      pulseRunning = false
      stopFrame()
      sharedUniforms.uPulseDistance.value = -sharedUniforms.uTailWidth.value
      target.dataset.networkMode = 'idle'
      render()
      if (!active || disposed) return
      idleTimer = window.setTimeout(beginPulse, 2600 + Math.random() * 3000)
    }
    const animate = (now: number) => {
      if (!active || disposed || !pulseRunning) return

      if (
        previousRenderTime > 0 &&
        now - previousRenderTime < minimumFrameDuration * 0.9
      ) {
        frame = requestAnimationFrame(animate)
        return
      }

      motionTime += Math.min(32, Math.max(0, now - previousFrameTime)) / 1000
      previousFrameTime = now
      previousRenderTime = now
      sharedUniforms.uTime.value = motionTime
      const pulseDistance = (now - signalStartedAt) * signalSpeed
      if (pulseDistance > maxSignalDistance + sharedUniforms.uHeadWidth.value * 0.7) {
        enterIdle()
        return
      }
      sharedUniforms.uPulseDistance.value = pulseDistance
      render()
      frame = requestAnimationFrame(animate)
    }
    const syncActivity = () => {
      const nextActive = requestedActive && !reducedMotion.matches
      if (nextActive === active) return
      active = nextActive
      stop()

      if (active) {
        beginPulse()
      } else {
        sharedUniforms.uPulseDistance.value = -sharedUniforms.uTailWidth.value
        target.dataset.networkMode = 'stopped'
        render()
      }
    }
    const resizeObserver = new ResizeObserver(resize)
    const themeObserver = new MutationObserver(() => {
      updateTheme()
      render()
    })
    const handleReducedMotion = () => syncActivity()

    updateTheme()
    resizeObserver.observe(target)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    reducedMotion.addEventListener('change', handleReducedMotion)
    target.dataset.networkState = 'ready'
    resize()

    return {
      setActive(nextActive) {
        requestedActive = nextActive
        syncActivity()
      },
      destroy() {
        disposed = true
        stop()
        resizeObserver.disconnect()
        themeObserver.disconnect()
        reducedMotion.removeEventListener('change', handleReducedMotion)
        disposeNetwork()
        edgeMaterial.dispose()
        nodeMaterial.dispose()
        renderer.dispose()
      },
    }
  }

  $effect(() => {
    controller?.setActive(motionActive)
  })

  onMount(() => {
    if (!canvas) return
    let unmounted = false

    void Promise.all([import('three'), import('d3-delaunay')])
      .then(([three, { Delaunay }]) => {
        if (unmounted || !canvas) return
        controller = createNetworkField(canvas, three, Delaunay)
        controller.setActive(motionActive)
      })
      .catch((error: unknown) => {
        if (!canvas) return
        canvas.dataset.networkState = 'failed'
        console.error('Unable to initialize the observation network field.', error)
      })

    return () => {
      unmounted = true
      controller?.destroy()
    }
  })
</script>

<canvas aria-hidden="true" bind:this={canvas} class="network-field"></canvas>

<style>
/* Hallmark · component: observation neural field · genre: atmospheric · theme: project custom
 * responsive Delaunay links with graph-distance signal propagation; non-interactive surface
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 */
.network-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  display: block;
  pointer-events: none;
  opacity: max(0, calc(1 - var(--p, 0) * 1.25));
}

@media (prefers-reduced-motion: reduce) {
  .network-field {
    opacity: max(0, calc(0.72 - var(--p, 0) * 1.05));
  }
}
</style>
