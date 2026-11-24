import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Layers, RotateCcw, ChevronDown, ChevronUp, Compass } from 'lucide-react';
import campusFallbackImg from '../../assets/images/model_engineering_campus_1795489145677.jpg';

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
    discipline: 'TRK-01 · SOFTWARE & CLOUD SYSTEMS',
    note: 'Distributed platforms, enterprise APIs & cloud systems wing',
    cameraPos: [8.4, 5.4, 8.6],
    targetPos: [1.3, 1.35, 1.1],
  },
  {
    code: '02',
    label: 'Civil & Structural',
    discipline: 'TRK-02 · CIVIL & STRUCTURAL ENGINEERING',
    note: 'Cantilevered steel truss span & CAD/BIM coordination bay',
    cameraPos: [-8.6, 5.2, 8.2],
    targetPos: [-1.4, 1.35, 1.0],
  },
  {
    code: '03',
    label: 'Electrical & Power',
    discipline: 'TRK-03 · ELECTRICAL & POWER SYSTEMS',
    note: 'Substation transformer assembly & high-voltage telemetry bay',
    cameraPos: [-8.2, 5.3, -8.5],
    targetPos: [-1.3, 1.35, -1.1],
  },
  {
    code: '04',
    label: 'QA/QC & Supervision',
    discipline: 'TRK-04 · QA/QC & FIELD SUPERVISION',
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
    grad.addColorStop(0, 'rgba(3, 8, 16, 0.72)');
    grad.addColorStop(0.55, 'rgba(5, 13, 24, 0.36)');
    grad.addColorStop(1, 'rgba(10, 27, 46, 0)');
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
  onStatusChange?: (status: string, settled: boolean) => void;
  className?: string;
}

export const EngineeringCampusModel: React.FC<EngineeringCampusModelProps> = ({
  onStatusChange,
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
      onStatusChange?.('OPEN', true);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    onStatusChange?.('ACTIVE', false);

    let width = Math.max(container.clientWidth, 320);
    let height = Math.max(container.clientHeight, 320);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A1B2E');
    scene.fog = new THREE.FogExp2('#0A1B2E', 0.026);

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
      onStatusChange?.('OPEN', true);
      return;
    }

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
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
    controls.autoRotateSpeed = 0.45;

    const handleUserInteract = () => {
      stateRef.current.cameraTransitioning = false;
      controls.autoRotate = false;
    };
    controls.addEventListener('start', handleUserInteract);

    // Three-point + Ambient Lighting
    const hemiLight = new THREE.HemisphereLight('#B9CCE0', '#06111F', 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF3E0', 2.4);
    keyLight.position.set(10, 14, 9);
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

    const rimLight = new THREE.DirectionalLight('#7FB3E6', 1.35);
    rimLight.position.set(-10, 8, -9);
    scene.add(rimLight);

    // Track disposed resources
    const disposables: Array<{ dispose: () => void }> = [envTarget];
    const trackDisp = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // Materials with varied roughness & metalness
    const slateMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#112236',
        roughness: 0.82,
        metalness: 0.1,
      })
    );
    const prussianPanelMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#1B3A5C',
        roughness: 0.44,
        metalness: 0.48,
      })
    );
    const titaniumMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#D7E2EE',
        roughness: 0.24,
        metalness: 0.88,
      })
    );
    const darkSteelMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#5C7691',
        roughness: 0.34,
        metalness: 0.82,
      })
    );
    const brassMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#CFA15A',
        roughness: 0.25,
        metalness: 0.9,
      })
    );
    const glassMat = trackDisp(
      new THREE.MeshPhysicalMaterial({
        color: '#88B4DC',
        roughness: 0.12,
        metalness: 0.08,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.62,
      })
    );
    const warmInteriorMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#FCE1B6',
        emissive: '#F2B86B',
        emissiveIntensity: 0.85,
        roughness: 0.45,
        metalness: 0.05,
      })
    );
    const plinthLineMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#7E97B0',
        roughness: 0.55,
        metalness: 0.3,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    const redBeaconMat = trackDisp(
      new THREE.MeshStandardMaterial({
        color: '#C0392B',
        emissive: '#C0392B',
        emissiveIntensity: 0.55,
        roughness: 0.3,
        metalness: 0.2,
      })
    );

    // Contact shadow & architectural survey floor
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

    const gridHelper = new THREE.GridHelper(28, 28, '#284F78', '#152E4A');
    gridHelper.position.y = -0.03;
    scene.add(gridHelper);

    // Master Campus Group + 4 Explodable Architectural Layers
    const campusRoot = new THREE.Group();
    scene.add(campusRoot);

    const layerPlinth = new THREE.Group();
    const layerCore = new THREE.Group();
    const layerWings = new THREE.Group();
    const layerCanopy = new THREE.Group();
    campusRoot.add(layerPlinth, layerCore, layerWings, layerCanopy);

    // --- LAYER 0: Beveled Architectural Slate Plinth & Calibration Rings ---
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
    const plinthMesh = new THREE.Mesh(plinthGeom, slateMat);
    plinthMesh.position.y = 0;
    plinthMesh.receiveShadow = true;
    plinthMesh.castShadow = true;
    layerPlinth.add(plinthMesh);

    const upperDeck = new THREE.Mesh(
      trackDisp(new THREE.BoxGeometry(6.6, 0.1, 6.6)),
      prussianPanelMat
    );
    upperDeck.position.y = 0.35;
    upperDeck.receiveShadow = true;
    layerPlinth.add(upperDeck);

    // Concentric calibration rings on plinth deck
    [2.35, 3.05].forEach((r) => {
      const ring = new THREE.Mesh(
        trackDisp(new THREE.RingGeometry(r - 0.025, r, 64)),
        plinthLineMat
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.405;
      layerPlinth.add(ring);
    });

    // --- LAYER 1: Central Glass Atrium & Titanium Structural Columns ---
    const atriumGlass = new THREE.Mesh(
      trackDisp(new THREE.BoxGeometry(2.35, 2.35, 2.35)),
      glassMat
    );
    atriumGlass.position.y = 1.58;
    layerCore.add(atriumGlass);

    // Warm glowing interior floor plates inside atrium
    [0.75, 1.35, 1.95, 2.52].forEach((fy) => {
      const slab = new THREE.Mesh(
        trackDisp(new THREE.BoxGeometry(2.05, 0.08, 2.05)),
        warmInteriorMat
      );
      slab.position.y = fy;
      layerCore.add(slab);
    });

    // Structural titanium perimeter columns around atrium
    const colGeom = trackDisp(new THREE.CylinderGeometry(0.055, 0.055, 2.55, 12));
    const colOffsets = [
      [-1.22, -1.22],
      [1.22, -1.22],
      [-1.22, 1.22],
      [1.22, 1.22],
      [0, -1.22],
      [0, 1.22],
      [-1.22, 0],
      [1.22, 0],
    ];
    colOffsets.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(colGeom, titaniumMat);
      col.position.set(cx, 1.65, cz);
      col.castShadow = true;
      layerCore.add(col);
    });

    // --- LAYER 2: 4 Cantilevered Engineering Track Wings ---
    const wingBeacons: Record<'01' | '02' | '03' | '04', THREE.Mesh> = {} as any;
    const wingCollars: Record<'01' | '02' | '03' | '04', THREE.Mesh> = {} as any;

    const createWingBase = (
      code: '01' | '02' | '03' | '04',
      px: number,
      pz: number
    ): THREE.Group => {
      const g = new THREE.Group();
      g.position.set(px, 0, pz);

      // Ground-floor podium support pier
      const pier = new THREE.Mesh(
        trackDisp(new THREE.BoxGeometry(1.1, 0.72, 1.1)),
        prussianPanelMat
      );
      pier.position.y = 0.76;
      pier.castShadow = true;
      pier.receiveShadow = true;
      g.add(pier);

      // Main cantilevered volume
      const body = new THREE.Mesh(
        trackDisp(new THREE.BoxGeometry(1.85, 1.22, 1.85)),
        prussianPanelMat
      );
      body.position.y = 1.72;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      // Glass curtain strip & warm glowing strip
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

      // Titanium roof fascia frame
      const fascia = new THREE.Mesh(
        trackDisp(new THREE.BoxGeometry(1.98, 0.08, 1.98)),
        titaniumMat
      );
      fascia.position.y = 2.34;
      g.add(fascia);

      // Selection beacon pin & collar on wing corner
      const collarMat = trackDisp(
        new THREE.MeshStandardMaterial({
          color: '#F4F7F5',
          emissive: '#F4F7F5',
          emissiveIntensity: 0.2,
          roughness: 0.3,
          metalness: 0.5,
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
        redBeaconMat.clone()
      );
      beacon.position.set(px > 0 ? 0.85 : -0.85, 2.55, pz > 0 ? 0.85 : -0.85);
      g.add(beacon);
      trackDisp(beacon.material as THREE.Material);
      wingBeacons[code] = beacon;

      return g;
    };

    // Wing 01 (+X, +Z): Software & Cloud — precision solar/cooling louver fins
    const wing01 = createWingBase('01', 1.75, 1.75);
    for (let i = -2; i <= 2; i++) {
      const fin = new THREE.Mesh(
        trackDisp(new THREE.BoxGeometry(2.04, 0.035, 0.08)),
        titaniumMat
      );
      fin.position.set(0, 1.48 + (i + 2) * 0.14, 0.98);
      wing01.add(fin);
    }
    layerWings.add(wing01);

    // Wing 02 (-X, +Z): Civil & Structural — diagonal Warren steel truss frame
    const wing02 = createWingBase('02', -1.75, 1.75);
    const trussPts = [
      new THREE.Vector3(-0.92, 2.38, -0.92),
      new THREE.Vector3(0.92, 2.38, -0.92),
      new THREE.Vector3(0.92, 2.38, 0.92),
      new THREE.Vector3(-0.92, 2.38, 0.92),
    ];
    const trussApex = new THREE.Vector3(0, 2.86, 0);
    trussPts.forEach((pt, i) => {
      wing02.add(createStrut(pt, trussApex, 0.032, titaniumMat));
      wing02.add(createStrut(pt, trussPts[(i + 1) % 4], 0.028, darkSteelMat));
    });
    layerWings.add(wing02);

    // Wing 03 (-X, -Z): Electrical & Power — LatheGeometry stepped ceramic bushings + copper coils
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

    // Wing 04 (+X, -Z): QA/QC & Supervision — calibrated observatory dome ring
    const wing04 = createWingBase('04', 1.75, -1.75);
    const obsRing = new THREE.Mesh(
      trackDisp(new THREE.TorusGeometry(0.58, 0.04, 12, 36)),
      titaniumMat
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

    // --- LAYER 3: Canopy Space-Frame Roof Truss & Rotating Compass Crown ---
    const canopyY = 2.95;
    const canopyPlate = new THREE.Mesh(
      trackDisp(new THREE.BoxGeometry(4.45, 0.09, 4.45)),
      titaniumMat
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

    // Space-frame diagonal chords beneath canopy
    const span = 2.05;
    for (let x = -span; x <= span; x += span) {
      for (let z = -span; z <= span; z += span) {
        if (x === 0 && z === 0) continue;
        const bottomNode = new THREE.Vector3(x * 0.65, canopyY, z * 0.65);
        const topNode = new THREE.Vector3(x, canopyY + 0.36, z);
        layerCanopy.add(createStrut(bottomNode, topNode, 0.028, darkSteelMat));
      }
    }

    // Rotating precision brass telemetry spire at roof apex
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
      titaniumMat
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

    // Resize Observer
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

    // WebGL Context Loss Recovery
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    // Animation & Demand-Coalesced Loop
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

      // Damped Exploded-View Layer Separation
      const targetExplode = stateRef.current.exploded ? 1 : 0;
      explodeProgress = THREE.MathUtils.damp(explodeProgress, targetExplode, 6.5, dt);
      layerCore.position.y = explodeProgress * 0.45;
      layerWings.position.y = explodeProgress * 1.15;
      layerCanopy.position.y = explodeProgress * 2.15;

      // Wing Beacon & Selection Highlight
      (['01', '02', '03', '04'] as const).forEach((code) => {
        const isSel = stateRef.current.activeTrack === code;
        const bMat = wingBeacons[code].material as THREE.MeshStandardMaterial;
        const cMat = wingCollars[code].material as THREE.MeshStandardMaterial;
        bMat.emissiveIntensity = THREE.MathUtils.damp(
          bMat.emissiveIntensity,
          isSel ? 1.8 : 0.35,
          8,
          dt
        );
        cMat.emissiveIntensity = THREE.MathUtils.damp(
          cMat.emissiveIntensity,
          isSel ? 1.0 : 0.12,
          8,
          dt
        );
      });

      // Gentle live rotation of telemetry spire
      if (!isSoftwareGl) {
        crownGroup.rotation.y += dt * 0.42;
        gyroInner.rotation.x += dt * 0.55;
      }

      // Smooth damped camera preset transitions
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

    // Initial render
    scheduleNextFrame();
    onStatusChange?.('OPEN', true);

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
  }, [reducedMotion, forceInteractive, contextLost, onStatusChange]);

  const activeSpec =
    ENGINEERING_TRACK_SPECS.find((t) => t.code === activeTrack) || ENGINEERING_TRACK_SPECS[0];

  const showFallbackImage = contextLost || (reducedMotion && !forceInteractive);

  return (
    <div
      className={`relative w-full h-[460px] sm:h-[520px] lg:h-[560px] border border-[rgba(244,247,245,0.28)] bg-[#0A1B2E] overflow-hidden select-none ${className}`}
    >
      {/* Top Inspection Bar — Solid/Translucent Surface (No backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute top-0 inset-x-0 z-10 flex items-center justify-between gap-3 px-4 py-3 bg-[#0A1B2E]/88 border-b border-[rgba(185,204,224,0.18)]">
        <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--exposure)] font-semibold tracking-wider">
          <Compass className="w-3.5 h-3.5 text-[var(--chalk)]" />
          <span>
            {activeTrack
              ? activeSpec.discipline
              : 'MIHORA ENGINEERING CAMPUS · 3D ARCHITECTURAL MODEL'}
          </span>
        </div>
        <span className="hidden sm:inline text-[10px] font-mono text-[var(--chalk-dim)]">
          DRAG TO ORBIT · SCROLL TO ZOOM
        </span>
      </div>

      {/* Isolated 3D WebGL Mount or Reduced-Motion / Fallback Architectural Render */}
      {showFallbackImage ? (
        <div className="relative w-full h-full">
          <img
            src={campusFallbackImg}
            alt="MIHORA engineering and academic research campus scale architectural model"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1B2E] via-transparent to-[#0A1B2E]/50" />
          {reducedMotion && !forceInteractive && !contextLost && (
            <button
              type="button"
              onClick={() => setForceInteractive(true)}
              className="absolute bottom-4 right-4 px-3.5 py-2 text-[11px] font-mono font-semibold text-[var(--edge)] bg-[var(--exposure)] hover:bg-white rounded-[var(--radius-xs)] cursor-pointer"
            >
              Launch Interactive 3D View
            </button>
          )}
        </div>
      ) : (
        <div
          ref={mountRef}
          aria-label="Interactive 3D architectural model of the MIHORA engineering and academic campus"
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        />
      )}

      {/* Single Collapsible Bottom-Center Dock (Solid/Translucent — Zero backdrop-filter over WebGL) */}
      {!showFallbackImage && (
        <div className="pointer-events-none absolute bottom-3 inset-x-3 z-10 flex flex-col items-center gap-2">
          {controlsCollapsed ? (
            <button
              type="button"
              onClick={() => setControlsCollapsed(false)}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-mono font-semibold text-[var(--exposure)] bg-[#0F2740]/95 border border-[var(--rule-strong)] rounded-[var(--radius-xs)] hover:bg-[var(--prussian)] transition-colors cursor-pointer"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Model Controls</span>
            </button>
          ) : (
            <div className="pointer-events-auto max-w-full bg-[#0F2740]/94 border border-[rgba(244,247,245,0.28)] rounded-[var(--radius-xs)] p-2 shadow-[0_14px_34px_rgba(3,9,18,0.75)] flex flex-wrap items-center justify-center gap-1.5">
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
                    className={`px-2.5 py-1.5 text-[11px] font-mono rounded-[var(--radius-xs)] border transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[var(--exposure)] text-[var(--edge)] border-[var(--exposure)] font-semibold'
                        : 'bg-[#14304E] text-[var(--chalk)] border-[rgba(185,204,224,0.24)] hover:text-[var(--exposure)] hover:border-[var(--exposure)]'
                    }`}
                  >
                    {track.code} · {track.label}
                  </button>
                );
              })}

              <span className="hidden sm:inline-block w-px h-5 bg-[rgba(185,204,224,0.22)] mx-0.5" />

              <button
                type="button"
                aria-pressed={exploded}
                onClick={() => setExploded((prev) => !prev)}
                className={`px-2.5 py-1.5 text-[11px] font-mono rounded-[var(--radius-xs)] border inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  exploded
                    ? 'bg-[var(--exposure)] text-[var(--edge)] border-[var(--exposure)] font-semibold'
                    : 'bg-[#14304E] text-[var(--chalk)] border-[rgba(185,204,224,0.24)] hover:text-[var(--exposure)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{exploded ? 'Assemble' : 'Explode'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTrack(null);
                  setExploded(false);
                }}
                title="Reset 3D view"
                aria-label="Reset 3D view"
                className="p-1.5 text-[var(--chalk)] bg-[#14304E] border border-[rgba(185,204,224,0.24)] rounded-[var(--radius-xs)] hover:text-[var(--exposure)] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setControlsCollapsed(true)}
                title="Hide controls"
                aria-label="Hide controls"
                className="p-1.5 text-[var(--chalk)] bg-[#14304E] border border-[rgba(185,204,224,0.24)] rounded-[var(--radius-xs)] hover:text-[var(--exposure)] transition-colors cursor-pointer"
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
