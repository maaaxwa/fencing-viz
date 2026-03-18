/**
 * Three.js scene setup: renderer, lights, floor, environment.
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

export function createScene(container) {
  // ── Renderer ─────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  // ── Scene ─────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1f2e);
  scene.fog        = new THREE.Fog(0x1a1f2e, 10, 30);

  // ── Cameras ───────────────────────────────────────────────────────────────
  const aspect = container.clientWidth / container.clientHeight;

  // 3rd-person camera: side-on view of both fencers
  const camThird = new THREE.PerspectiveCamera(50, aspect, 0.01, 100);
  camThird.position.set(-4.5, 1.8, 0);
  camThird.lookAt(0, 1.2, 0);

  // Fencer POV (defender's perspective, looking toward attacker)
  const camPOV = new THREE.PerspectiveCamera(70, aspect, 0.01, 100);
  // Will be positioned relative to defender fencer dynamically

  // Free orbit camera
  const camFree = new THREE.PerspectiveCamera(55, aspect, 0.01, 100);
  camFree.position.set(3, 2.5, 3);
  camFree.lookAt(0, 1.2, 0);

  // Orbit controls (free camera only)
  const controls = new OrbitControls(camFree, renderer.domElement);
  controls.target.set(0, 1.2, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enabled = false; // enabled only in free cam mode

  // ── Lights ────────────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0x334466, 0.8);
  scene.add(ambient);

  // Main overhead key light (simulates gymnasium overhead)
  const keyLight = new THREE.DirectionalLight(0xfff5e0, 2.0);
  keyLight.position.set(2, 8, 2);
  keyLight.castShadow = true;
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far  = 20;
  keyLight.shadow.camera.left = -4;
  keyLight.shadow.camera.right = 4;
  keyLight.shadow.camera.top  = 4;
  keyLight.shadow.camera.bottom = -4;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.bias = -0.002;
  scene.add(keyLight);

  // Fill light from the side
  const fillLight = new THREE.DirectionalLight(0x8899cc, 0.6);
  fillLight.position.set(-3, 4, -2);
  scene.add(fillLight);

  // Rim light from behind
  const rimLight = new THREE.DirectionalLight(0xaaccff, 0.4);
  rimLight.position.set(0, 3, -5);
  scene.add(rimLight);

  // ── Fencing piste (strip) ──────────────────────────────────────────────────
  // Piste runs 14 m along Z (the fencing-line axis between the two fencers).
  // Width is 2 m along X. Fencers are separated along Z.
  const pisteGeo = new THREE.BoxGeometry(2.0, 0.02, 14);
  const pisteMat = new THREE.MeshStandardMaterial({
    color:     0x2a3a5a,
    roughness: 0.8,
    metalness: 0.1,
  });
  const piste = new THREE.Mesh(pisteGeo, pisteMat);
  piste.position.set(0, -0.01, 0);
  piste.receiveShadow = true;
  scene.add(piste);

  // Piste centre line (runs across width at Z = 0)
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const centreLine = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.025, 0.04), lineMat);
  centreLine.position.set(0, 0, 0);
  scene.add(centreLine);

  // En-garde lines at Z = ±2 m (orange)
  for (const zOff of [-2, 2]) {
    const eg = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.025, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xffaa00 }),
    );
    eg.position.set(0, 0, zOff);
    scene.add(eg);
  }

  // Floor (gymnasium floor extending outside piste)
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x14191e, roughness: 1.0 });
  const floor    = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.015;
  floor.receiveShadow = true;
  scene.add(floor);

  // ── Resize handler ─────────────────────────────────────────────────────────
  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    for (const cam of [camThird, camPOV, camFree]) {
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    }
  }
  window.addEventListener('resize', onResize);

  return { renderer, scene, camThird, camPOV, camFree, controls };
}

/**
 * Update the POV camera to sit at the defender's eye level, looking toward attacker.
 * Call each frame when POV mode is active.
 */
export function updatePOVCamera(camPOV, defenderRoot) {
  // Eye position: slightly forward and up from the head group
  const eyeOffset = new THREE.Vector3(0.06, 1.68, 0.10);
  const worldPos  = eyeOffset.clone();
  defenderRoot.localToWorld(worldPos);
  camPOV.position.copy(worldPos);
  // Look toward the attacker (in the +Z direction of the piste)
  const lookTarget = worldPos.clone().add(
    new THREE.Vector3(0, -0.05, 1).applyQuaternion(defenderRoot.quaternion),
  );
  camPOV.lookAt(lookTarget);
}
