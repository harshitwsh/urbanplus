import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useApp } from '../../context/AppContext';
import { 
  Globe, 
  Layers, 
  MapPin, 
  Flame, 
  Activity, 
  Crosshair, 
  Info, 
  ChevronRight,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldAlert,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ThreeDGlobeViewProps {
  onSwitchToCesium?: () => void;
}

export const ThreeDGlobeView: React.FC<ThreeDGlobeViewProps> = ({ onSwitchToCesium }) => {
  const { roadDefects, buses, setSelectedDefect, setActiveTab } = useApp();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<any | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(50);

  // Hotspots mapped on the 3D Satellite Globe
  const HOTSPOT_CLUSTERS = [
    {
      id: 'cluster-sec29',
      name: 'Sector 29 Critical Risk Cluster',
      lat: 28.4680,
      lng: 77.0620,
      incidentCount: 24,
      riskScore: 94,
      severity: 'CRITICAL',
      primaryIssue: 'Severe Deep Pothole & Waterlogging Assembly',
      description: 'High-density collision hotspot near Sector 29 market junction. 24 fused AI sightings in past 48h.'
    },
    {
      id: 'cluster-iffco',
      name: 'IFFCO Chowk Flyover Junction',
      lat: 28.4720,
      lng: 77.0725,
      incidentCount: 18,
      riskScore: 88,
      severity: 'HIGH',
      primaryIssue: 'Asphalt Degradation & Traffic Bottleneck',
      description: 'Major arterial corridor linking MG Road. Speed reduction from 60km/h to 14km/h.'
    },
    {
      id: 'cluster-golfcourse',
      name: 'Golf Course Road Rapid Transit Hub',
      lat: 28.4595,
      lng: 77.0266,
      incidentCount: 31,
      riskScore: 91,
      severity: 'CRITICAL',
      primaryIssue: 'Multi-Lane Pothole Matrix #UP-10482',
      description: 'Primary BEL surveillance corridor. 6 public fleet buses continuously reporting live telemetry.'
    },
    {
      id: 'cluster-cybercity',
      name: 'Cyber City Underpass Node',
      lat: 28.4950,
      lng: 77.0890,
      incidentCount: 12,
      riskScore: 76,
      severity: 'MEDIUM',
      primaryIssue: 'Drainage Overflow & Structural Crack',
      description: 'Commercial hub underpass. AI camera detected surface cracking near pillar 14.'
    }
  ];

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);

  // Setup Three.js Apple Maps / Snapchat Style Photorealistic 3D Earth Globe
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // Deep space background

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Realistic Solar & Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const atmosphereLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    atmosphereLight.position.set(-5, -3, -5);
    scene.add(atmosphereLight);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Texture Loader for Photorealistic NASA / Satellite Earth Textures
    const textureLoader = new THREE.TextureLoader();

    // Create high-detail photorealistic Earth satellite surface texture
    const earthDayTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
      undefined,
      undefined,
      () => {
        // Fallback procedural detailed Earth texture if offline
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1e3a8a'; // Deep ocean blue
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Realistic green & brown continent shapes
          ctx.fillStyle = '#15803d'; // Landmass green
          ctx.beginPath(); ctx.arc(1450, 420, 220, 0, Math.PI * 2); ctx.fill(); // Asia/India
          ctx.fillStyle = '#b45309'; // Desert brown
          ctx.beginPath(); ctx.arc(1100, 480, 240, 0, Math.PI * 2); ctx.fill(); // Africa/Europe
          ctx.fillStyle = '#166534';
          ctx.beginPath(); ctx.arc(600, 450, 280, 0, Math.PI * 2); ctx.fill(); // Americas
        }
        return new THREE.CanvasTexture(canvas);
      }
    );

    const earthSpecularMap = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'
    );
    const earthNormalMap = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg'
    );
    const earthCloudsTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png'
    );

    // 1. Photorealistic 3D Earth Globe Sphere
    const globeGeo = new THREE.SphereGeometry(2, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      map: earthDayTexture,
      specularMap: earthSpecularMap,
      normalMap: earthNormalMap,
      specular: new THREE.Color(0x38bdf8),
      shininess: 25,
      wireframe: false
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // 2. Realistic Rotating Cloud Sphere Layer
    const cloudsGeo = new THREE.SphereGeometry(2.03, 64, 64);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: earthCloudsTexture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    globeGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // 3. Apple Maps / Snapchat Map Blue Atmosphere Glow Ring
    const atmosphereGeo = new THREE.SphereGeometry(2.1, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // 4. Starfield Outer Space Background
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 60;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xe2e8f0, size: 0.07, transparent: true, opacity: 0.7 });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 5. Place 3D Glowing Beacons on Earth Surface
    const radius = 2.02;
    HOTSPOT_CLUSTERS.forEach((hotspot) => {
      // Lat/Lng to 3D Cartesian spherical coordinates
      const phi = (90 - hotspot.lat) * (Math.PI / 180);
      const theta = (hotspot.lng + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      // Glowing Beacon Pin Mesh
      const color = hotspot.severity === 'CRITICAL' ? 0xdc2626 : 0xd97706;
      const markerGeo = new THREE.SphereGeometry(0.07, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.set(x, y, z);
      (markerMesh as any)._hotspotData = hotspot;
      globeGroup.add(markerMesh);

      // Vertical Laser Light Pillar
      const cylinderGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.5, 8);
      const cylinderMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
      const pillarMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
      pillarMesh.position.set(x * 1.12, y * 1.12, z * 1.12);
      pillarMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x, y, z).normalize());
      globeGroup.add(pillarMesh);
    });

    // Orient Globe towards India (Lat ~28.45°, Lng ~77.02°)
    globeGroup.rotation.y = -1.35;
    globeGroup.rotation.x = 0.45;

    // Interactive Drag Controls (Smooth Orbit Rotation & Dampening)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !globeGroupRef.current) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroupRef.current.rotation.y += deltaX * 0.005;
      globeGroupRef.current.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Smooth Scroll Wheel Zoom Control
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z = Math.max(3.1, Math.min(10, cameraRef.current.position.z + e.deltaY * 0.003));
      setZoomLevel(Math.round(((10 - cameraRef.current.position.z) / 6.9) * 100));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop (60 FPS Smooth Rendering)
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isAutoRotating && globeGroupRef.current && !isDragging) {
        globeGroupRef.current.rotation.y += 0.002;
      }

      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0004;
      }

      starField.rotation.y += 0.0002;
      renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isAutoRotating]);

  // Controlled Zoom Actions
  const handleZoomIn = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(3.1, cameraRef.current.position.z - 0.8);
    setZoomLevel(Math.round(((10 - cameraRef.current.position.z) / 6.9) * 100));
  };

  const handleZoomOut = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.min(10, cameraRef.current.position.z + 0.8);
    setZoomLevel(Math.round(((10 - cameraRef.current.position.z) / 6.9) * 100));
  };

  const handleResetView = () => {
    if (!cameraRef.current || !globeGroupRef.current) return;
    cameraRef.current.position.z = 6;
    globeGroupRef.current.rotation.y = -1.35;
    globeGroupRef.current.rotation.x = 0.45;
    setZoomLevel(50);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#060913] select-none font-sans text-white relative">
      {/* Top Header Controls Bar (Apple / Snapchat Style 3D Globe) */}
      <div className="p-3 bg-[#0F172A]/90 backdrop-blur-md border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-3 z-20 text-xs shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-[#38BDF8] animate-spin-slow" />
            <div>
              <h2 className="font-bold text-white font-mono text-sm leading-tight flex items-center space-x-2">
                <span>APPLE / SNAPCHAT STYLE 3D SATELLITE GLOBE</span>
                <span className="px-2 py-0.5 bg-[#0284C7] text-white text-[10px] rounded font-bold">PHOTOREALISTIC 3D</span>
              </h2>
              <p className="text-[11px] text-[#94A3B8]">Photorealistic 3D Earth satellite globe with cloud layers, atmosphere glow & spatial pins</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          {/* Auto Rotation Toggle */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition flex items-center space-x-1.5 ${
              isAutoRotating ? 'bg-[#0284C7] text-white border-[#38BDF8]' : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
            <span>Orbit: {isAutoRotating ? 'ON' : 'OFF'}</span>
          </button>

          {/* Switch to Full 3D Cesium GIS Engine */}
          {onSwitchToCesium && (
            <button
              onClick={onSwitchToCesium}
              className="px-3 py-1.5 bg-[#0369A1] hover:bg-[#0284C7] text-white font-semibold rounded-lg border border-[#38BDF8] transition flex items-center space-x-1"
            >
              <span>3D Cesium GIS Engine</span>
            </button>
          )}

          {/* Switch to 2D City Map */}
          <button
            onClick={() => setActiveTab('map')}
            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center space-x-1 shadow-md"
          >
            <span>← Switch to 2D Map</span>
          </button>
        </div>
      </div>

      {/* Main 3D Globe Canvas Container */}
      <div className="flex-1 relative w-full h-full flex flex-col md:flex-row overflow-hidden">
        {/* Three.js 3D WebGL Canvas */}
        <div ref={containerRef} className="flex-1 relative w-full h-full cursor-grab active:cursor-grabbing">
          {/* Top Left Floating Telemetry Badge */}
          <div className="absolute top-4 left-4 z-10 bg-[#0F172A]/90 backdrop-blur-md border border-[#334155] p-3.5 rounded-xl shadow-2xl text-white font-mono text-xs max-w-sm space-y-2">
            <div className="flex items-center justify-between border-b border-[#334155] pb-2">
              <span className="font-bold text-[#38BDF8] flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-[#059669]" />
                <span>SPATIAL GLOBE TELEMETRY</span>
              </span>
              <span className="px-2 py-0.5 bg-[#0284C7]/20 text-[#38BDF8] rounded border border-[#0284C7]/40 font-bold text-[10px]">
                60 FPS SATELLITE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-[#1E293B] rounded border border-[#334155]">
                <span className="text-[#94A3B8] block text-[10px]">Active Hotspots</span>
                <span className="text-white font-bold text-sm">4 Critical Nodes</span>
              </div>
              <div className="p-2 bg-[#1E293B] rounded border border-[#334155]">
                <span className="text-[#94A3B8] block text-[10px]">Zoom Level</span>
                <span className="text-[#38BDF8] font-bold text-sm">{zoomLevel}% Smooth</span>
              </div>
            </div>
          </div>

          {/* Floating Controls (Right Side) */}
          <div className="absolute right-4 top-4 z-20 flex flex-col space-y-2 font-mono text-xs">
            <button
              onClick={handleZoomIn}
              title="Smooth Zoom In"
              className="w-10 h-10 bg-[#0F172A]/90 hover:bg-[#1E293B] text-white border border-[#334155] rounded-xl shadow-xl flex items-center justify-center font-bold transition"
            >
              <ZoomIn className="w-4 h-4 text-[#38BDF8]" />
            </button>

            <button
              onClick={handleZoomOut}
              title="Smooth Zoom Out"
              className="w-10 h-10 bg-[#0F172A]/90 hover:bg-[#1E293B] text-white border border-[#334155] rounded-xl shadow-xl flex items-center justify-center font-bold transition"
            >
              <ZoomOut className="w-4 h-4 text-[#38BDF8]" />
            </button>

            <button
              onClick={handleResetView}
              title="Reset 3D Camera View"
              className="w-10 h-10 bg-[#0F172A]/90 hover:bg-[#1E293B] text-white border border-[#334155] rounded-xl shadow-xl flex items-center justify-center font-bold transition"
            >
              <Crosshair className="w-4 h-4 text-[#059669]" />
            </button>
          </div>

          {/* Cluster Selection Quick Buttons (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 max-w-lg font-mono text-xs">
            {HOTSPOT_CLUSTERS.map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  setSelectedCluster(h);
                  if (globeGroupRef.current) {
                    globeGroupRef.current.rotation.y = -((h.lng + 180) * (Math.PI / 180));
                    globeGroupRef.current.rotation.x = (90 - h.lat) * (Math.PI / 180) - Math.PI / 2;
                  }
                }}
                className={`px-3 py-1.5 rounded-lg border shadow-lg backdrop-blur-md transition flex items-center space-x-1.5 ${
                  selectedCluster?.id === h.id
                    ? 'bg-[#2563EB] text-white border-[#38BDF8] font-bold'
                    : 'bg-[#0F172A]/90 text-[#94A3B8] border-[#334155] hover:border-blue-400'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{h.name.split(' ')[0]} ({h.incidentCount})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Cluster Details Drawer (Right Side) */}
        {selectedCluster ? (
          <div className="w-full md:w-96 bg-[#0F172A] border-t md:border-t-0 md:border-l border-[#1E293B] p-4 flex flex-col justify-between overflow-y-auto shadow-2xl z-10 font-sans text-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#DC2626] animate-ping" />
                  <span className="font-bold text-sm text-white font-mono">{selectedCluster.name}</span>
                </div>
                <button onClick={() => setSelectedCluster(null)} className="text-[#94A3B8] hover:text-white font-bold text-base">
                  ✕
                </button>
              </div>

              <div className="p-3 bg-[#450a0a]/50 border border-[#991b1b] rounded-xl space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#fca5a5] font-bold">SPATIAL RISK RATING</span>
                  <span className="px-2 py-0.5 bg-[#DC2626] text-white rounded font-bold text-[11px]">
                    {selectedCluster.riskScore}/100 {selectedCluster.severity}
                  </span>
                </div>
                <p className="text-[11px] text-[#f87171] pt-1">{selectedCluster.primaryIssue}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs">3D Spatial Diagnostic Metrics</h4>
                <div className="p-3 bg-[#1E293B] border border-[#334155] rounded-xl space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Total Fused Incidents:</span>
                    <span className="font-bold text-white">{selectedCluster.incidentCount} Detections</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Coordinates:</span>
                    <span className="font-bold text-[#38BDF8]">{selectedCluster.lat.toFixed(4)}°, {selectedCluster.lng.toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Monitored Fleets:</span>
                    <span className="font-bold text-[#059669]">{buses.length} Buses Live</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs">AI Risk Diagnostics</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{selectedCluster.description}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1E293B] space-y-2">
              <button
                onClick={() => {
                  setSelectedDefect(roadDefects[0]);
                  setActiveTab('fusion');
                }}
                className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition shadow-sm flex items-center justify-center space-x-1.5"
              >
                <span>Inspect Evidence Fusion Data</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex w-80 bg-[#0F172A] border-l border-[#1E293B] p-5 flex-col items-center justify-center text-center space-y-3 text-xs">
            <Info className="w-8 h-8 text-[#38BDF8]" />
            <h4 className="font-bold text-white">Select a 3D Cluster Node</h4>
            <p className="text-[#94A3B8]">Click any hotspot button or 3D beacon on the rotating globe to inspect spatial diagnostics.</p>
          </div>
        )}
      </div>
    </div>
  );
};
