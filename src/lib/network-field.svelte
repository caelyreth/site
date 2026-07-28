<script lang="ts">
  import { onMount } from 'svelte'

  type FieldController = {
    destroy: () => void
    setActive: (active: boolean) => void
  }
  type SkyMap = {
    directions: Float32Array
    magnitudes: Float32Array
    edgeNodes: Uint16Array
    edgeWeights: Float32Array
  }
  type Three = typeof import('three')
  type SkyData = typeof import('$lib/sky-map-data.generated')
  type PulseChangeHandler = (active: boolean) => void

  const SIGNAL_PALETTES = {
    light: [0x765d56, 0x756c4f, 0x596f5d, 0x4f6f75, 0x596a87, 0x6b607b],
    dark: [0xc2a097, 0xbdb187, 0x9caf9b, 0x8fb2b5, 0x96a8c4, 0xab9db8],
  } as const

  const {
    motionActive,
    onPulseChange,
  }: {
    motionActive: boolean
    onPulseChange?: PulseChangeHandler
  } = $props()

  let canvas = $state<HTMLCanvasElement>()
  let controller: FieldController | undefined

  function decodeSkyMap(skyData: SkyData): SkyMap {
    const { SKY_EDGES, SKY_NODES, SKY_NODE_STRIDE } = skyData
    const nodeCount = SKY_NODES.length / SKY_NODE_STRIDE
    const edgeCount = SKY_EDGES.length / 3
    const directions = new Float32Array(nodeCount * 3)
    const magnitudes = new Float32Array(nodeCount)
    const edgeNodes = new Uint16Array(edgeCount * 2)
    const edgeWeights = new Float32Array(edgeCount)

    for (let index = 0; index < nodeCount; index += 1) {
      const packed = index * SKY_NODE_STRIDE
      const point = index * 3
      directions[point] = SKY_NODES[packed] / 32767
      directions[point + 1] = SKY_NODES[packed + 1] / 32767
      directions[point + 2] = SKY_NODES[packed + 2] / 32767
      magnitudes[index] = SKY_NODES[packed + 3] / 100
    }

    for (let index = 0; index < edgeCount; index += 1) {
      const packed = index * 3
      const edge = index * 2
      edgeNodes[edge] = SKY_EDGES[packed]
      edgeNodes[edge + 1] = SKY_EDGES[packed + 1]
      edgeWeights[index] = [1, 0.76, 0.56][SKY_EDGES[packed + 2] - 1]
    }

    return { directions, magnitudes, edgeNodes, edgeWeights }
  }

  function choosePixelRatio(width: number, height: number) {
    const nativeRatio = Math.min(window.devicePixelRatio || 1, 2)
    const pixelBudget = 3_200_000
    const budgetRatio = Math.sqrt(pixelBudget / Math.max(1, width * height))
    return Math.max(1, Math.min(nativeRatio, budgetRatio))
  }

  function createSkyMapField(
    target: HTMLCanvasElement,
    three: Three,
    skyData: SkyData,
    reportPulseChange?: PulseChangeHandler,
  ): FieldController {
    const { SKY_SOURCE_NODES, SKY_VIEW_BASIS } = skyData
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

    const skyMap = decodeSkyMap(skyData)
    const scene = new three.Scene()
    const camera = new three.Camera()
    const sharedUniforms = {
      uResolution: { value: new three.Vector2(1, 1) },
      uPixelRatio: { value: 1 },
      uAspect: { value: 1 },
      uMapScale: { value: 0.48 },
      uRight: {
        value: new three.Vector3(
          SKY_VIEW_BASIS[0],
          SKY_VIEW_BASIS[1],
          SKY_VIEW_BASIS[2],
        ),
      },
      uUp: {
        value: new three.Vector3(
          SKY_VIEW_BASIS[3],
          SKY_VIEW_BASIS[4],
          SKY_VIEW_BASIS[5],
        ),
      },
      uForward: {
        value: new three.Vector3(
          SKY_VIEW_BASIS[6],
          SKY_VIEW_BASIS[7],
          SKY_VIEW_BASIS[8],
        ),
      },
      uHalfWidth: { value: 1.32 },
      uPulseDistance: { value: 0 },
      uPulseActive: { value: 0 },
      uHeadWidth: { value: 0.075 },
      uTailWidth: { value: 0.31 },
      uSourceRadius: { value: 0.04 },
      uInk: { value: new three.Color(0xffffff) },
      uSignalInk: { value: new three.Color(0xffffff) },
      uBaseAlpha: { value: 0.2 },
    }
    const projectionShader = `
      vec2 projectSky(vec3 point, out float depth) {
        vec3 direction = normalize(point);
        vec3 local = vec3(
          dot(direction, uRight),
          dot(direction, uUp),
          dot(direction, uForward)
        );
        float denominator = max(0.08, 1.0 + local.z);
        vec2 stereographic = 2.0 * local.xy / denominator;
        depth = clamp((local.z + 1.0) * 0.5, 0.0, 1.0);
        // Conventional celestial-chart orientation: north is up and right
        // ascension increases toward the left as seen from inside the sphere.
        return stereographic * vec2(-uMapScale / uAspect, -uMapScale) + 0.5;
      }
    `
    const edgeMaterial = new three.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      uniforms: sharedUniforms,
      vertexShader: `
        precision highp float;

        attribute vec3 aStart;
        attribute vec3 aEnd;
        attribute float aDistanceStart;
        attribute float aDistanceEnd;
        attribute float aWeight;
        uniform vec2 uResolution;
        uniform float uAspect;
        uniform float uMapScale;
        uniform float uHalfWidth;
        uniform vec3 uRight;
        uniform vec3 uUp;
        uniform vec3 uForward;
        varying float vSide;
        varying float vSignalDistance;
        varying float vWeight;
        varying float vDepth;

        ${projectionShader}

        vec3 arcPoint(float along) {
          return normalize(mix(aStart, aEnd, along));
        }

        void main() {
          float along = position.x;
          float depth;
          vec2 point = projectSky(arcPoint(along), depth);
          float tangentStep = 0.022;
          float unusedDepth;
          vec2 before = projectSky(arcPoint(max(0.0, along - tangentStep)), unusedDepth);
          vec2 after = projectSky(arcPoint(min(1.0, along + tangentStep)), unusedDepth);
          vec2 direction = normalize((after - before) * uResolution);
          vec2 normal = vec2(-direction.y, direction.x);
          vec2 clip = vec2(point.x * 2.0 - 1.0, 1.0 - point.y * 2.0);
          float depthWidth = mix(0.78, 1.0, depth);
          vec2 normalClip =
            vec2(normal.x, -normal.y) *
            (2.0 * uHalfWidth * depthWidth / uResolution);

          clip += normalClip * position.y;
          vSide = position.y;
          vSignalDistance = mix(aDistanceStart, aDistanceEnd, along);
          vWeight = aWeight;
          vDepth = depth;
          gl_Position = vec4(clip, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform float uPulseDistance;
        uniform float uPulseActive;
        uniform float uHeadWidth;
        uniform float uTailWidth;
        uniform float uSourceRadius;
        uniform vec3 uInk;
        uniform vec3 uSignalInk;
        uniform float uBaseAlpha;
        varying float vSide;
        varying float vSignalDistance;
        varying float vWeight;
        varying float vDepth;

        void main() {
          float antialias = max(fwidth(vSide) * 1.18, 0.012);
          float coverage = 1.0 - smoothstep(0.34 - antialias, 0.34 + antialias, abs(vSide));
          float behind = uPulseDistance - vSignalDistance;
          float head = 1.0 - smoothstep(uHeadWidth * 0.2, uHeadWidth, abs(behind));
          float wake =
            smoothstep(0.0, uHeadWidth * 0.34, behind) *
            (1.0 - smoothstep(uHeadWidth, uTailWidth, behind)) *
            0.32;
          float source =
            (1.0 - smoothstep(0.0, uSourceRadius, vSignalDistance)) *
            (1.0 - smoothstep(uSourceRadius * 1.4, uTailWidth, uPulseDistance));
          float activation = max(head, max(wake, source)) * uPulseActive;
          float depthTone = mix(0.68, 1.0, vDepth);
          float baseIntensity = uBaseAlpha * vWeight;
          float signalIntensity = activation * 0.84;
          float combinedIntensity = baseIntensity + signalIntensity;
          float alpha = combinedIntensity * coverage * depthTone;
          vec3 ink = mix(
            uInk,
            uSignalInk,
            signalIntensity / max(combinedIntensity, 0.001)
          );

          if (alpha < 0.002) discard;
          gl_FragColor = vec4(ink, alpha);
          #include <colorspace_fragment>
        }
      `,
    })
    const starMaterial = new three.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      uniforms: sharedUniforms,
      vertexShader: `
        precision highp float;

        attribute vec3 aPoint;
        attribute float aMagnitude;
        attribute float aDistance;
        uniform float uAspect;
        uniform float uMapScale;
        uniform float uPixelRatio;
        uniform float uPulseDistance;
        uniform float uPulseActive;
        uniform float uHeadWidth;
        uniform float uSourceRadius;
        uniform vec3 uRight;
        uniform vec3 uUp;
        uniform vec3 uForward;
        varying float vActivation;
        varying float vBrightness;
        varying float vDepth;

        ${projectionShader}

        void main() {
          float depth;
          vec2 point = projectSky(aPoint, depth);
          float head = 1.0 - smoothstep(
            uHeadWidth * 0.25,
            uHeadWidth,
            abs(uPulseDistance - aDistance)
          );
          float source = 1.0 - smoothstep(0.0, uSourceRadius, aDistance);
          float brightnessBase = clamp((6.25 - aMagnitude) / 7.75, 0.015, 1.0);
          vBrightness = pow(brightnessBase, 1.28);
          vActivation = max(head, source) * uPulseActive;
          vDepth = depth;
          gl_Position = vec4(point.x * 2.0 - 1.0, 1.0 - point.y * 2.0, 0.0, 1.0);
          gl_PointSize =
            (0.82 + vBrightness * 3.4 + vActivation * 2.15) *
            uPixelRatio *
            mix(0.82, 1.0, depth);
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform vec3 uInk;
        uniform vec3 uSignalInk;
        uniform float uBaseAlpha;
        varying float vActivation;
        varying float vBrightness;
        varying float vDepth;

        void main() {
          float radius = length(gl_PointCoord - 0.5) * 2.0;
          float antialias = max(fwidth(radius) * 1.15, 0.04);
          float coverage = 1.0 - smoothstep(0.72 - antialias, 0.72 + antialias, radius);
          float depthTone = mix(0.62, 1.0, vDepth);
          float baseIntensity = uBaseAlpha * 0.72 + vBrightness * 0.88;
          float signalIntensity = vActivation * 0.82;
          float combinedIntensity = baseIntensity + signalIntensity;
          float alpha = combinedIntensity * coverage * depthTone;
          vec3 ink = mix(
            uInk,
            uSignalInk,
            signalIntensity / max(combinedIntensity, 0.001)
          );

          if (alpha < 0.002) discard;
          gl_FragColor = vec4(ink, alpha);
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
    let previousRenderTime = 0
    let sourceIndex = -1
    let signalColorIndex = -1
    let reportedPulseActive = false
    let signalStartedAt = performance.now()
    let maxSignalDistance = Math.PI / 2
    const signalSpeed = 0.72 / 1000
    const minimumFrameDuration = 1000 / 60
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let edgeGeometry: import('three').InstancedBufferGeometry | undefined
    let starGeometry: import('three').BufferGeometry | undefined
    let edgeMesh: import('three').Mesh | undefined
    let starPoints: import('three').Points | undefined

    function pointAt(index: number) {
      const offset = index * 3
      return [
        skyMap.directions[offset],
        skyMap.directions[offset + 1],
        skyMap.directions[offset + 2],
      ] as const
    }

    function angularDistance(a: readonly number[], b: readonly number[]) {
      const cosine = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
      return Math.acos(Math.max(-1, Math.min(1, cosine)))
    }

    function isProjectedInside(point: readonly number[]) {
      const right =
        point[0] * SKY_VIEW_BASIS[0] +
        point[1] * SKY_VIEW_BASIS[1] +
        point[2] * SKY_VIEW_BASIS[2]
      const up =
        point[0] * SKY_VIEW_BASIS[3] +
        point[1] * SKY_VIEW_BASIS[4] +
        point[2] * SKY_VIEW_BASIS[5]
      const forward =
        point[0] * SKY_VIEW_BASIS[6] +
        point[1] * SKY_VIEW_BASIS[7] +
        point[2] * SKY_VIEW_BASIS[8]
      const denominator = Math.max(0.08, 1 + forward)
      const x = 0.5 - ((2 * right) / denominator) * 0.48 / sharedUniforms.uAspect.value
      const y = 0.5 - ((2 * up) / denominator) * 0.48
      return x >= 0 && x <= 1 && y >= 0 && y <= 1
    }

    function installSkyMap() {
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

      const edgeCount = skyMap.edgeNodes.length / 2
      const starts = new Float32Array(edgeCount * 3)
      const ends = new Float32Array(edgeCount * 3)
      for (let index = 0; index < edgeCount; index += 1) {
        const startNode = skyMap.edgeNodes[index * 2] * 3
        const endNode = skyMap.edgeNodes[index * 2 + 1] * 3
        starts.set(skyMap.directions.subarray(startNode, startNode + 3), index * 3)
        ends.set(skyMap.directions.subarray(endNode, endNode + 3), index * 3)
      }

      edgeGeometry = new three.InstancedBufferGeometry()
      edgeGeometry.setAttribute('position', new three.Float32BufferAttribute(ribbon, 3))
      edgeGeometry.setIndex(ribbonIndices)
      edgeGeometry.setAttribute('aStart', new three.InstancedBufferAttribute(starts, 3))
      edgeGeometry.setAttribute('aEnd', new three.InstancedBufferAttribute(ends, 3))
      edgeGeometry.setAttribute(
        'aDistanceStart',
        new three.InstancedBufferAttribute(new Float32Array(edgeCount), 1),
      )
      edgeGeometry.setAttribute(
        'aDistanceEnd',
        new three.InstancedBufferAttribute(new Float32Array(edgeCount), 1),
      )
      edgeGeometry.setAttribute(
        'aWeight',
        new three.InstancedBufferAttribute(skyMap.edgeWeights, 1),
      )
      edgeGeometry.instanceCount = edgeCount

      starGeometry = new three.BufferGeometry()
      starGeometry.setAttribute(
        'position',
        new three.BufferAttribute(new Float32Array(skyMap.magnitudes.length * 3), 3),
      )
      starGeometry.setAttribute('aPoint', new three.BufferAttribute(skyMap.directions, 3))
      starGeometry.setAttribute(
        'aMagnitude',
        new three.BufferAttribute(skyMap.magnitudes, 1),
      )
      starGeometry.setAttribute(
        'aDistance',
        new three.BufferAttribute(new Float32Array(skyMap.magnitudes.length), 1),
      )

      edgeMesh = new three.Mesh(edgeGeometry, edgeMaterial)
      edgeMesh.frustumCulled = false
      edgeMesh.renderOrder = 0
      starPoints = new three.Points(starGeometry, starMaterial)
      starPoints.frustumCulled = false
      starPoints.renderOrder = 1
      scene.add(edgeMesh, starPoints)
    }

    function applySource(now: number, selectNewSource = true) {
      if (!edgeGeometry || !starGeometry) return
      if (selectNewSource || sourceIndex < 0) {
        let next = SKY_SOURCE_NODES[Math.floor(Math.random() * SKY_SOURCE_NODES.length)]
        if (next === sourceIndex && SKY_SOURCE_NODES.length > 1) {
          const current = SKY_SOURCE_NODES.indexOf(next)
          next = SKY_SOURCE_NODES[(current + 1) % SKY_SOURCE_NODES.length]
        }
        sourceIndex = next
      }

      const source = pointAt(sourceIndex)
      const nodeDistances = new Float32Array(skyMap.magnitudes.length)
      const starDistance = starGeometry.getAttribute('aDistance') as import('three').BufferAttribute
      const edgeStartDistance = edgeGeometry.getAttribute(
        'aDistanceStart',
      ) as import('three').InstancedBufferAttribute
      const edgeEndDistance = edgeGeometry.getAttribute(
        'aDistanceEnd',
      ) as import('three').InstancedBufferAttribute

      maxSignalDistance = 0
      for (let index = 0; index < skyMap.magnitudes.length; index += 1) {
        const point = pointAt(index)
        const distance = angularDistance(source, point)
        nodeDistances[index] = distance
        starDistance.setX(index, distance)
        if (isProjectedInside(point)) maxSignalDistance = Math.max(maxSignalDistance, distance)
      }
      for (let index = 0; index < skyMap.edgeNodes.length / 2; index += 1) {
        edgeStartDistance.setX(index, nodeDistances[skyMap.edgeNodes[index * 2]])
        edgeEndDistance.setX(index, nodeDistances[skyMap.edgeNodes[index * 2 + 1]])
      }
      starDistance.needsUpdate = true
      edgeStartDistance.needsUpdate = true
      edgeEndDistance.needsUpdate = true

      if (selectNewSource) {
        signalStartedAt = now
        sharedUniforms.uPulseDistance.value = 0
      }
    }

    const render = () => renderer.render(scene, camera)
    const updateSignalColor = (selectNewColor = false) => {
      const colorCount = SIGNAL_PALETTES.light.length
      if (selectNewColor || signalColorIndex < 0) {
        let next = Math.floor(Math.random() * colorCount)
        if (next === signalColorIndex && colorCount > 1) {
          next = (next + 1 + Math.floor(Math.random() * (colorCount - 1))) % colorCount
        }
        signalColorIndex = next
      }

      const dark = document.documentElement.classList.contains('dark')
      const palette = dark ? SIGNAL_PALETTES.dark : SIGNAL_PALETTES.light
      sharedUniforms.uSignalInk.value.setHex(
        palette[signalColorIndex],
        three.SRGBColorSpace,
      )
    }
    const updateTheme = () => {
      const dark = document.documentElement.classList.contains('dark')
      const lightness = dark ? 0.9 : 0.18
      sharedUniforms.uInk.value.setRGB(lightness, lightness, lightness, three.SRGBColorSpace)
      sharedUniforms.uBaseAlpha.value = dark ? 0.18 : 0.2
      updateSignalColor()
    }
    const resize = () => {
      const bounds = target.getBoundingClientRect()
      const width = Math.max(1, bounds.width)
      const height = Math.max(1, bounds.height)
      const pixelRatio = choosePixelRatio(width, height)

      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(width, height, false)
      sharedUniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio)
      sharedUniforms.uPixelRatio.value = pixelRatio
      sharedUniforms.uAspect.value = width / height
      sharedUniforms.uHalfWidth.value = 1.32 * pixelRatio
      target.dataset.networkDpr = pixelRatio.toFixed(2)
      applySource(performance.now(), false)
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
    const reportPulse = (nextActive: boolean) => {
      if (nextActive === reportedPulseActive) return
      reportedPulseActive = nextActive
      reportPulseChange?.(nextActive)
    }
    const stop = () => {
      stopFrame()
      stopTimer()
      pulseRunning = false
      reportPulse(false)
    }
    const beginPulse = () => {
      if (!active || disposed) return
      stopTimer()
      pulseRunning = true
      target.dataset.networkMode = 'pulse'
      const now = performance.now()
      previousRenderTime = 0
      sharedUniforms.uPulseActive.value = 1
      updateSignalColor(true)
      applySource(now)
      reportPulse(true)
      stopFrame()
      frame = requestAnimationFrame(animate)
    }
    const enterIdle = () => {
      pulseRunning = false
      reportPulse(false)
      stopFrame()
      sharedUniforms.uPulseActive.value = 0
      sharedUniforms.uPulseDistance.value = 0
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

      previousRenderTime = now
      const pulseDistance = (now - signalStartedAt) * signalSpeed
      if (pulseDistance > maxSignalDistance + sharedUniforms.uHeadWidth.value) {
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
        sharedUniforms.uPulseActive.value = 0
        sharedUniforms.uPulseDistance.value = 0
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

    installSkyMap()
    updateTheme()
    resizeObserver.observe(target)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    reducedMotion.addEventListener('change', handleReducedMotion)
    target.dataset.networkState = 'ready'
    target.dataset.networkSource = 'hipparcos-constellations'
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
        if (edgeMesh) scene.remove(edgeMesh)
        if (starPoints) scene.remove(starPoints)
        edgeGeometry?.dispose()
        starGeometry?.dispose()
        edgeMaterial.dispose()
        starMaterial.dispose()
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

    void Promise.all([import('three'), import('$lib/sky-map-data.generated')])
      .then(([three, skyData]) => {
        if (unmounted || !canvas) return
        controller = createSkyMapField(canvas, three, skyData, onPulseChange)
        controller.setActive(motionActive)
      })
      .catch((error: unknown) => {
        if (!canvas) return
        onPulseChange?.(false)
        canvas.dataset.networkState = 'failed'
        console.error('Unable to initialize the observation sky map.', error)
      })

    return () => {
      unmounted = true
      controller?.destroy()
    }
  })
</script>

<canvas aria-hidden="true" bind:this={canvas} class="network-field"></canvas>

<style>
/* Hallmark · component: celestial observation field · genre: atmospheric · theme: project custom
 * J2000 catalogue stars and constellation segments; angular signal pulse; non-interactive surface
 * pre-emit critique: P5 H5 E4 S5 R5 V5
 */
.network-field {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: max(0, calc(1 - var(--p, 0) * 1.25));
}

@media (prefers-reduced-motion: reduce) {
  .network-field {
    opacity: max(0, calc(0.72 - var(--p, 0) * 1.05));
  }
}
</style>
