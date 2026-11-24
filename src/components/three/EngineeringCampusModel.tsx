import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Layers, RotateCcw, ChevronDown, ChevronUp, Compass } from 'lucide-react';
import campusDaylightFallbackImg from '../../assets/images/studio_campus_daylight_1795500975982.jpg';

export interface EngineeringTrackSpec {
  code: '01' | '02' | '03' | '04';
  label: string;
  discipline: string;
  note: string;
  cameraPos: [number, number, number];
  targetPos: [number, number, number];
}

export const ENGINEERING_TRACK_SPECS: EngineeringTrackSpec[] = [
  {
    code: '01',
    label: 'Software & Cloud',
    discipline: 'Software & Cloud Systems',
    note: 'Distributed platforms, enterprise APIs & cloud engineering wing',
    cameraPos: [8.4, 5.4, 8.6],
    targetPos: [1.3, 1.35, 1.1],
  },
  {
    code: '02',
    label: 'Civil & Structural',
    discipline: 'Civil & Structural Engineering',
    note: 'Cantilevered steel truss span & CAD/BIM coordination bay',
    cameraPos: [-8.6, 5.2, 8.2],
    targetPos: [-1.4, 1.35, 1.0],
  },
  {
    code: '03',
    label: 'Electrical & Power',
    discipline: 'Electrical & Power Systems',
    note: 'Substation transformer assembly & high-voltage telemetry bay',
    cameraPos: [-8.2, 5.3, -8.5],
    targetPos: [-1.3, 1.35, -1.1],
  },
  {
    code: '04',
    label: 'QA/QC & Supervision',
    discipline: 'QA/QC & Field Supervision',
    note: 'Accredited inspection gallery & compliance verification wing',
    cameraPos: [8.5, 5.5, -8.2],
    targetPos: [1.3, 1.35, -1.1],
  },
];

const OVERVIEW_CAMERA: [number, number, number] = [10.4, 6.4, 10.6];
const OVERVIEW_TARGET: [number, number, number] = [0, 1.25, 0];

function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER));
    const lose = gl.getExtension('WEBGL_lose_context');
    lose?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(renderer);
  } catch {
    return true;
  }
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 126);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.24)');
    grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.09)');
    grad.addColorStop(1, 'rgba(236, 234, 228, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createStrut(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  material: THREE.Material
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  const geom = new THREE.CylinderGeometry(radius, radius, length, 8);
  const mesh = new THREE.Mesh(geom, material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

interface EngineeringCampusModelProps {
  className?: string;
}

export const EngineeringCampusModel: React.FC<EngineeringCampusModelProps> = ({
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeTrack, setActiveTrack] = useState<'01' | '02' | '03' | '04' | null>(null);
  const [exploded, setExploded] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [forceInteractive, setForceInteractive] = useState(false);

  const stateRef = useRef<{
    targetCameraPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    cameraTransitioning: boolean;
    exploded: boolean;
    activeTrack: '01' | '02' | '03' | '04' | null;
    requestRender: () => void;
  }>({
    targetCameraPos: new THREE.Vector3(...OVERVIEW_CAMERA),
    targetLookAt: new THREE.Vector3(...OVERVIEW_TARGET),
    cameraTransitioning: false,
    exploded: false,
    activeTrack: null,
    requestRender: () => {},
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    stateRef.current.exploded = exploded;
    stateRef.current.requestRender();
  }, [exploded]);

  useEffect(() => {
    stateRef.current.activeTrack = activeTrack;
    if (activeTrack) {
      const spec = ENGINEERING_TRACK_SPECS.find((t) => t.code === activeTrack);
      if (spec) {
        stateRef.current.targetCameraPos.set(...spec.cameraPos);
        stateRef.current.targetLookAt.set(...spec.targetPos);
        stateRef.current.cameraTransitioning = true;
      }
    } else {
      stateRef.current.targetCameraPos.set(...OVERVIEW_CAMERA);
      stateRef.current.targetLookAt.set(...OVERVIEW_TARGET);
      stateRef.current.cameraTransitioning = true;
    }
    stateRef.current.requestRender();
  }, [activeTrack]);

  useEffect(() => {
    if ((reducedMotion && !forceInteractive) || contextLost) {
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let width = Math.max(container.clientWidth, 320);
    let height = Math.max(container.clientHeight, 320);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#ECEAE4');
    scene.fog = new THREE.FogExp2('#ECEAE4', 0.024);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(...OVERVIEW_CAMERA);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setContextLost(true);
      return;
    }

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.target.set(...OVERVIEW_TARGET);
    controls.minDistance = 6.2;
    controls.maxDistance = 20;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.enablePan = false;
    controls.autoRotate = !isSoftwareGl;
    controls.autoRotateSpeed = 0.4;

    const handleUserInteract = () => {
      stateRef.current.cameraTransitioning = false;
      controls.autoRotate = false;
    };
    controls.addEventListener('start', handleUserInteract);

    // Warm Architectural Daylight Lighting
    const hemiLight = new THREE.HemisphereLight('#FFFFFF', '#D6D1C7', 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF9EE', 2.2);
    keyLight.position.set(11, 16, 9);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 36;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#DBEAFE', 1.0);
    rimLight.position.set(-10, 8, -9);
    scene.add(rimLight);

    const disposables: Array<{ dispose: () => void }> = [envTarget];
    const trackDisp = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // Museum Architectural Maquette Materials (Limestone, Slate, Brushed Steel, Brass, Crystal Glass)
    const limestoneMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#DEDAD0',
        roughness: 0.85,
        metalness: 0.04,
      })
    );
    const pavilionStoneMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#F5F3EE',
        roughness: 0.65,
        metalness: 0.06,
      })
    );
    const darkSlateMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#1E293B',
        roughness: 0.45,
        metalness: 0.45,
      })
    );
    const titaniumMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#CBD5E1',
        roughness: 0.24,
        metalness: 0.88,
      })
    );
    const brassMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#C69249',
        roughness: 0.25,
        metalness: 0.9,
      })
    );
    const glassMat = trackDisp(
      new THREE.MeshPhysicalMaterial({
        color: '#93C5FD',
        roughness: 0.1,
        metalness: 0.06,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        transparent: true,
        opacity: 0.56,
      })
    );
    const warmInteriorMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#FEF3C7',
        emissive: '#F59E0B',
        emissiveIntensity: 0.28,
        roughness: 0.55,
        metalness: 0.05,
      })
    );
    const plinthLineMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#94A3B8',
        roughness: 0.6,
        metalness: 0.2,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    const cobaltPinMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#143A7B',
        emissive: '#143A7B',
        emissiveIntensity: 0.25,
        roughness: 0.28,
        metalness: 0.35,
      })
    );

    const shadowTex = trackDisp(createContactShadowTexture());
    const contactPlane = new THREE.Mesh(
      trackDisp(new THREE.PlaneGeometry(14, 14)),
      trackDisp(
        new THREE.MeshBasicMaterial({
          map: shadowTex,
          transparent: true,
          depthWrite: false,
        })
      )
    );
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = -0.02;
    scene.add(contactPlane);

    const gridHelper = new THREE.GridHelper(28, 28, '#D6D2C9', '#E2DFD7');
    gridHelper.position.y = -0.03;
    scene.add(gridHelper);

    const campusRoot = new THREE.Group();
    scene.add(campusRoot);

    const layerPlinth = new THREE.Group();
    const layerCore = new THREE.Group();
    const layerWings = new THREE.Group();
    const layerCanopy = new THREE.Group();
    campusRoot.add(layerPlinth, layerCore, layerWings, layerCanopy);

    // Layer 0: Limestone Plinth
    const plinthShape = new THREE.Shape();
    const pw = 3.85;
    const pd = 3.85;
    const ch = 0.35;
    plinthShape.moveTo(-pw + ch, -pd);
    plinthShape.lineTo(pw - ch, -pd);
    plinthShape.lineTo(pw, -pd + ch);
    plinthShape.lineTo(pw, pd - ch);
    plinthShape.lineTo(pw - ch, pd);
    plinthShape.lineTo(-pw + ch, pd);
    plinthShape.lineTo(-pw, pd - ch);
    plinthShape.lineTo(-pw, -pd + ch);
    plinthShape.closePath();

    const plinthGeom = trackDisp(
      new THREE.ExtrudeGeometry(plinthShape, {
        depth: 0.28,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.04,
        bevelSegments: 2,
      })
    );
    plinthGeom.rotateX(-Math.PI / 2);
    const plinthMesh = new THREE.Mesh(plinthGeom, limestoneMat);
    plinthMesh.receiveShadow = true;
    plinthMesh.castShadow = true;
    layerPlinth.add(plinthMesh);

    const upperDeck = new THREE.Mesh(
      trackDisp(new THREE.BoxGeometry(6.6, 0.1, 6.6)),
      pavilionStoneMat
    );
    upperDeck.position.y = 0.35;
    upperDeck.receiveShadow = true;
    layerPlinth.add(upperDeck);

    [2.35, 3.05].forEach((r) => {
      const ring = new THREE.Mesh(
        trackDisp(new THREE.RingGeometry(r - 0.02, r, 64)),
        plinthLineMat
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.405;
      layerPlinth.add(ring);
    });

    // Layer 1: Central Glass Atrium & Titanium Columns
    const atriumGlass = new THREE.Mesh(
      trackDisp(new THREE.BoxGeometry(2.35, 2.35, 2.35)),
      glassMat
    );
    atriumGlass.position.y = 1.58;
    layerCore.add(atriumGlass);

    [0.75, 1.35, 1.95, 2.52].forEach((fy) => {
      const slab = new THREE.Mesh(
        trackDisp(new THREE.BoxGeometry(2.05, 0.08, 2.05)),
        warmInteriorMat
      );
      slab.position.y = fy;
      layerCore.add(slab);
    });

    const colGeom = trackDisp(new THREE.CylinderGeometry(0.055, 0.055, 2.55, 12));
    [
      [-1.22, -1.22],
      [1.22, -1.22],
      [-1.22, 1.22],
      [1.22, 1.22],
      [0, -1.22],
      [0, 1.22],
      [-1.22, 0],
      [1.22, 0],
    ].forEach(([cx, cz]) => {
      const col = new THREE.Mesh(colGeom, darkSlateMat);
      col.position.set(cx, 1.65, cz);
      col.castShadow = true;
      layerCore.add(col);
    });

    // Layer 2: 4 Cantilevered Engineering Track Wings
    const wingBeacons: Record<'01' | '02' | '03' | '04', THREE.Mesh> = {} as any;
    const wingCollars: Record<'01' | '02' | '03' | '04', THREE.Mesh> = {} as any;

    const createWingBase = (
      code: '01' | '02' | '03' | '04',
      px: number,
      pz: number
    ): THREE.Group => {
      const g = new THREE.Group();
      g.position.set(px, 0, pz);

      const pier = new THREE.Mesh(
        trackDisp(new THREE.BoxGeometry(1.1, 0.72, 1.1)),
        darkSlateMat
      );
      pier.position.y = 0.76;
      pier.castShadow = true;
      pier.receiveShadow = true;
      g.add(pier);

      const body = new THREE.Mesh(
        trackDisp(new THREE.BoxGeometry(1.85, 1.22, 1.85)),
        pavilionStoneMat
      );
      body.position.y = 1.72;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      const glaze = new THREE.Mesh(
        trackDisp(new THREE.BoxGeometry(1.92, 0.68, 1.92)),
        glassMat
      );
      glaze.position.y = 1.72;
      g.add(glaze);

      const coreGlow = new THREE.Mesh(
        trackDisp(new THREE.BoxGeometry(1.55, 0.34, 1.55)),
        warmInteriorMat
      );
      coreGlow.position.y = 1.72;
      g.add(coreGlow);

      const fascia = new THREE.Mesh(
        trackDisp(new THREE.BoxGeometry(1.98, 0.08, 1.98)),
        brassMat
      );
      fascia.position.y = 2.34;
      g.add(fascia);

      const collarMat = trackDisp(
        new THREE.MeshStandardMaterial({
          color: '#143A7B',
          emissive: '#143A7B',
          emissiveIntensity: 0.08,
          roughness: 0.3,
          metalness: 0.4,
        })
      );
      const collar = new THREE.Mesh(
        trackDisp(new THREE.BoxGeometry(2.08, 0.05, 2.08)),
        collarMat
      );
      collar.position.y = 0.43;
      g.add(collar);
      wingCollars[code] = collar;

      const beacon = new THREE.Mesh(
        trackDisp(new THREE.SphereGeometry(0.11, 16, 16)),
        cobaltPinMat.clone()
      );
      beacon.position.set(px > 0 ? 0.85 : -0.85, 2.55, pz > 0 ? 0.85 : -0.85);
      g.add(beacon);
      trackDisp(beacon.material as THREE.Material);
      wingBeacons[code] = beacon;

      return g;
    };

    const wing01 = createWingBase('01', 1.75, 1.75);
    for (let i = -2; i <= 2; i++) {
      const fin = new THREE.Mesh(
        trackDisp(new THREE.BoxGeometry(2.04, 0.035, 0.08)),
        brassMat
      );
      fin.position.set(0, 1.48 + (i + 2) * 0.14, 0.98);
      wing01.add(fin);
    }
    layerWings.add(wing01);

    const wing02 = createWingBase('02', -1.75, 1.75);
    const trussPts = [
      new THREE.Vector3(-0.92, 2.38, -0.92),
      new THREE.Vector3(0.92, 2.38, -0.92),
      new THREE.Vector3(0.92, 2.38, 0.92),
      new THREE.Vector3(-0.92, 2.38, 0.92),
    ];
    const trussApex = new THREE.Vector3(0, 2.86, 0);
    trussPts.forEach((pt, i) => {
      wing02.add(createStrut(pt, trussApex, 0.032, darkSlateMat));
      wing02.add(createStrut(pt, trussPts[(i + 1) % 4], 0.028, titaniumMat));
    });
    layerWings.add(wing02);

    const wing03 = createWingBase('03', -1.75, -1.75);
    const insulatorPoints = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.11, 0),
      new THREE.Vector2(0.08, 0.12),
      new THREE.Vector2(0.12, 0.18),
      new THREE.Vector2(0.07, 0.28),
      new THREE.Vector2(0.11, 0.34),
      new THREE.Vector2(0.05, 0.45),
      new THREE.Vector2(0, 0.48),
    ];
    const insulatorGeom = trackDisp(new THREE.LatheGeometry(insulatorPoints, 18));
    [-0.45, 0, 0.45].forEach((bx) => {
      const bushing = new THREE.Mesh(insulatorGeom, brassMat);
      bushing.position.set(bx, 2.38, -0.35);
      bushing.castShadow = true;
      wing03.add(bushing);
    });
    const coilDrum = new THREE.Mesh(
      trackDisp(new THREE.CylinderGeometry(0.24, 0.24, 0.36, 20)),
      brassMat
    );
    coilDrum.position.set(0, 2.56, 0.38);
    wing03.add(coilDrum);
    layerWings.add(wing03);

    const wing04 = createWingBase('04', 1.75, -1.75);
    const obsRing = new THREE.Mesh(
      trackDisp(new THREE.TorusGeometry(0.58, 0.04, 12, 36)),
      darkSlateMat
    );
    obsRing.rotation.x = Math.PI / 2;
    obsRing.position.set(0, 2.56, 0);
    wing04.add(obsRing);
    const obsLens = new THREE.Mesh(
      trackDisp(new THREE.CylinderGeometry(0.36, 0.42, 0.2, 24)),
      glassMat
    );
    obsLens.position.set(0, 2.48, 0);
    wing04.add(obsLens);
    layerWings.add(wing04);

    // Layer 3: Canopy Space-Frame & Brass Crown
    const canopyY = 2.95;
    const canopyPlate = new THREE.Mesh(
      trackDisp(new THREE.BoxGeometry(4.45, 0.09, 4.45)),
      pavilionStoneMat
    );
    canopyPlate.position.y = canopyY + 0.38;
    canopyPlate.castShadow = true;
    layerCanopy.add(canopyPlate);

    const canopyGlassSkylight = new THREE.Mesh(
      trackDisp(new THREE.BoxGeometry(2.15, 0.14, 2.15)),
      glassMat
    );
    canopyGlassSkylight.position.y = canopyY + 0.43;
    layerCanopy.add(canopyGlassSkylight);

    const span = 2.05;
    for (let x = -span; x <= span; x += span) {
      for (let z = -span; z <= span; z += span) {
        if (x === 0 && z === 0) continue;
        const bottomNode = new THREE.Vector3(x * 0.65, canopyY, z * 0.65);
        const topNode = new THREE.Vector3(x, canopyY + 0.36, z);
        layerCanopy.add(createStrut(bottomNode, topNode, 0.028, titaniumMat));
      }
    }

    const crownGroup = new THREE.Group();
    crownGroup.position.y = canopyY + 0.56;
    const mast = new THREE.Mesh(
      trackDisp(new THREE.CylinderGeometry(0.035, 0.06, 0.95, 16)),
      brassMat
    );
    mast.position.y = 0.45;
    crownGroup.add(mast);

    const gyroOuter = new THREE.Mesh(
      trackDisp(new THREE.TorusGeometry(0.46, 0.022, 10, 36)),
      darkSlateMat
    );
    gyroOuter.position.y = 0.55;
    crownGroup.add(gyroOuter);

    const gyroInner = new THREE.Mesh(
      trackDisp(new THREE.TorusGeometry(0.32, 0.02, 10, 32)),
      brassMat
    );
    gyroInner.position.y = 0.55;
    gyroInner.rotation.y = Math.PI / 2;
    crownGroup.add(gyroInner);
    layerCanopy.add(crownGroup);

    const handleResize = () => {
      if (!container) return;
      width = Math.max(container.clientWidth, 320);
      height = Math.max(container.clientHeight, 320);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      stateRef.current.requestRender();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    let rafId = 0;
    let isDisposed = false;
    let isVisible = true;
    let lastTime = performance.now();
    let explodeProgress = 0;

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
        if (isVisible) scheduleNextFrame();
      },
      { threshold: 0.05 }
    );
    visibilityObserver.observe(container);

    const renderScene = (now: number) => {
      if (isDisposed) return;
      rafId = 0;

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const targetExplode = stateRef.current.exploded ? 1 : 0;
      explodeProgress = THREE.MathUtils.damp(explodeProgress, targetExplode, 6.5, dt);
      layerCore.position.y = explodeProgress * 0.45;
      layerWings.position.y = explodeProgress * 1.15;
      layerCanopy.position.y = explodeProgress * 2.15;

      (['01', '02', '03', '04'] as const).forEach((code) => {
        const isSel = stateRef.current.activeTrack === code;
        const bMat = wingBeacons[code].material as THREE.MeshStandardMaterial;
        const cMat = wingCollars[code].material as THREE.MeshStandardMaterial;
        bMat.emissiveIntensity = THREE.MathUtils.damp(
          bMat.emissiveIntensity,
          isSel ? 1.4 : 0.15,
          8,
          dt
        );
        cMat.emissiveIntensity = THREE.MathUtils.damp(
          cMat.emissiveIntensity,
          isSel ? 0.85 : 0.05,
          8,
          dt
        );
      });

      if (!isSoftwareGl) {
        crownGroup.rotation.y += dt * 0.42;
        gyroInner.rotation.x += dt * 0.55;
      }

      if (stateRef.current.cameraTransitioning) {
        camera.position.x = THREE.MathUtils.damp(
          camera.position.x,
          stateRef.current.targetCameraPos.x,
          5.5,
          dt
        );
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          stateRef.current.targetCameraPos.y,
          5.5,
          dt
        );
        camera.position.z = THREE.MathUtils.damp(
          camera.position.z,
          stateRef.current.targetCameraPos.z,
          5.5,
          dt
        );
        controls.target.x = THREE.MathUtils.damp(
          controls.target.x,
          stateRef.current.targetLookAt.x,
          6,
          dt
        );
        controls.target.y = THREE.MathUtils.damp(
          controls.target.y,
          stateRef.current.targetLookAt.y,
          6,
          dt
        );
        controls.target.z = THREE.MathUtils.damp(
          controls.target.z,
          stateRef.current.targetLookAt.z,
          6,
          dt
        );

        if (
          camera.position.distanceTo(stateRef.current.targetCameraPos) < 0.03 &&
          controls.target.distanceTo(stateRef.current.targetLookAt) < 0.03
        ) {
          stateRef.current.cameraTransitioning = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      const stillSettling =
        Math.abs(explodeProgress - targetExplode) > 0.002 ||
        stateRef.current.cameraTransitioning;

      if (isVisible && !document.hidden && (!isSoftwareGl || stillSettling)) {
        scheduleNextFrame();
      }
    };

    const scheduleNextFrame = () => {
      if (isDisposed || rafId) return;
      rafId = window.requestAnimationFrame(renderScene);
    };

    stateRef.current.requestRender = () => {
      scheduleNextFrame();
    };

    const onControlChange = () => {
      if (isSoftwareGl) scheduleNextFrame();
    };
    controls.addEventListener('change', onControlChange);

    scheduleNextFrame();

    return () => {
      isDisposed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      controls.removeEventListener('start', handleUserInteract);
      controls.removeEventListener('change', onControlChange);
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });

      disposables.forEach((d) => {
        try {
          d.dispose();
        } catch {
          // ignore
        }
      });

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion, forceInteractive, contextLost]);

  const activeSpec =
    ENGINEERING_TRACK_SPECS.find((t) => t.code === activeTrack) || ENGINEERING_TRACK_SPECS[0];

  const showFallbackImage = contextLost || (reducedMotion && !forceInteractive);

  return (
    <div
      className={`relative w-full h-[460px] sm:h-[520px] lg:h-[560px] rounded-2xl border border-[#E4E2DA] bg-[#ECEAE4] overflow-hidden select-none shadow-[0_20px_50px_-24px_rgba(15,23,42,0.18)] ${className}`}
    >
      {/* Top Studio Bar — Solid Translucent White (No backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute top-0 inset-x-0 z-10 flex items-center justify-between gap-3 px-4 py-3 bg-white/92 border-b border-[#E4E2DA]">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
          <Compass className="w-4 h-4 text-[#143A7B]" />
          <span>
            {activeTrack ? activeSpec.discipline : 'MIHORA Engineering & Academic Campus'}
          </span>
        </div>
        <span className="hidden sm:inline text-[11px] font-medium text-slate-500">
          Drag to orbit · Scroll to zoom
        </span>
      </div>

      {showFallbackImage ? (
        <div className="relative w-full h-full">
          <img
            src={campusDaylightFallbackImg}
            alt="MIHORA engineering and academic research campus architectural scale model"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          {reducedMotion && !forceInteractive && !contextLost && (
            <button
              type="button"
              onClick={() => setForceInteractive(true)}
              className="absolute bottom-4 right-4 px-4 py-2 text-xs font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-lg shadow-md cursor-pointer"
            >
              Launch Interactive 3D View
            </button>
          )}
        </div>
      ) : (
        <div
          ref={mountRef}
          aria-label="Interactive 3D architectural scale model of the MIHORA engineering and academic campus"
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        />
      )}

      {/* Single Collapsible Bottom-Center Dock (No backdrop-filter over WebGL) */}
      {!showFallbackImage && (
        <div className="pointer-events-none absolute bottom-3.5 inset-x-3 z-10 flex flex-col items-center gap-2">
          {controlsCollapsed ? (
            <button
              type="button"
              onClick={() => setControlsCollapsed(false)}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white/96 border border-[#CBD5E1] rounded-lg shadow-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ChevronUp className="w-3.5 h-3.5 text-[#143A7B]" />
              <span>Model Controls</span>
            </button>
          ) : (
            <div className="pointer-events-auto max-w-full bg-white/96 border border-[#E4E2DA] rounded-xl p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.12)] flex flex-wrap items-center justify-center gap-1.5">
              {ENGINEERING_TRACK_SPECS.map((track) => {
                const isSelected = activeTrack === track.code;
                return (
                  <button
                    key={track.code}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() =>
                      setActiveTrack((prev) => (prev === track.code ? null : track.code))
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#143A7B] text-white font-semibold shadow-xs'
                        : 'bg-[#F7F6F2] text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {track.label}
                  </button>
                );
              })}

              <span className="hidden sm:inline-block w-px h-5 bg-slate-200 mx-0.5" />

              <button
                type="button"
                aria-pressed={exploded}
                onClick={() => setExploded((prev) => !prev)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  exploded
                    ? 'bg-[#143A7B] text-white font-semibold'
                    : 'bg-[#F7F6F2] text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{exploded ? 'Assemble' : 'Explode View'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTrack(null);
                  setExploded(false);
                }}
                title="Reset 3D view"
                aria-label="Reset 3D view"
                className="p-1.5 text-slate-600 bg-[#F7F6F2] rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setControlsCollapsed(true)}
                title="Hide controls"
                aria-label="Hide controls"
                className="p-1.5 text-slate-600 bg-[#F7F6F2] rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
