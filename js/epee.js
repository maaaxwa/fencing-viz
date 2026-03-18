/**
 * Épée weapon model builder.
 *
 * Real-world dimensions:
 *   Blade: 90 cm (max per FIE rules)
 *   Guard (coquille): ~13.5 cm diameter, ~2 cm deep
 *   Grip:  ~14 cm
 *   Pommel: ~4 cm
 *   Total: ~110 cm
 *
 * Local orientation: the BLADE TIP is in the -Y direction from the weapon
 * group origin, which sits at the grip centre (where the hand wraps).
 * When the arm is posed pointing forward (+Z world), the weapon mount group
 * is also pointing in +Z, so the blade extends further along +Z.
 *
 * Actually: weapon group's local -Y = blade direction.
 * Because the limb hierarchy goes in -Y (down), when the arm points forward
 * (+Z), the weapon's local -Y also maps to +Z (forward).
 */

import * as THREE from 'three';

// Épée dimensions (metres)
const GRIP_H   = 0.14;
const POMMEL_H = 0.04;
const POMMEL_R = 0.022;
const GUARD_R  = 0.068; // bell-guard radius
const GUARD_T  = 0.020; // guard thickness
const BLADE_L  = 0.90;
const BLADE_R0 = 0.007; // blade base radius
const BLADE_R1 = 0.002; // blade tip radius

// Materials
const bladeMat  = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.9 });
const guardMat  = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.4, metalness: 0.8 });
const gripMat   = new THREE.MeshStandardMaterial({ color: 0x5c3d1e, roughness: 0.9, metalness: 0.0 });
const pommelMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.5, metalness: 0.7 });

export function buildEpee() {
  const group = new THREE.Group();
  group.name  = 'epee';

  // ── Pommel (at +Y end – butt of weapon) ─────────────────────────────────
  const pommelGeo = new THREE.CylinderGeometry(POMMEL_R * 0.7, POMMEL_R, POMMEL_H, 8);
  const pommelMesh = new THREE.Mesh(pommelGeo, pommelMat);
  // Pommel sits above grip centre: +Y from origin by half of grip + half pommel
  pommelMesh.position.y = GRIP_H / 2 + POMMEL_H / 2;
  group.add(pommelMesh);

  // ── Grip / handle ────────────────────────────────────────────────────────
  // Pistol grip approximated by a slightly tapered cylinder
  const gripGeo  = new THREE.CylinderGeometry(0.016, 0.020, GRIP_H, 8);
  const gripMesh = new THREE.Mesh(gripGeo, gripMat);
  gripMesh.position.y = 0; // centred at group origin
  group.add(gripMesh);

  // Grip wrap lines (decorative)
  for (let i = 0; i < 4; i++) {
    const wrapGeo  = new THREE.TorusGeometry(0.021, 0.003, 6, 16);
    const wrapMesh = new THREE.Mesh(wrapGeo, bladeMat);
    wrapMesh.rotation.x = Math.PI / 2;
    wrapMesh.position.y = -GRIP_H / 2 + (GRIP_H / 5) * (i + 0.5);
    group.add(wrapMesh);
  }

  // ── Bell guard (coquille) ────────────────────────────────────────────────
  // Flat disc at the blade end of the grip
  const guardGeo  = new THREE.CylinderGeometry(GUARD_R, GUARD_R * 0.95, GUARD_T, 20);
  const guardMesh = new THREE.Mesh(guardGeo, guardMat);
  guardMesh.position.y = -(GRIP_H / 2 + GUARD_T / 2);
  group.add(guardMesh);

  // Guard dome (slight convexity toward the hand)
  const domeGeo  = new THREE.SphereGeometry(GUARD_R, 20, 8, 0, Math.PI * 2, 0, Math.PI * 0.35);
  const domeMesh = new THREE.Mesh(domeGeo, guardMat);
  domeMesh.rotation.x = Math.PI;
  domeMesh.position.y = -(GRIP_H / 2);
  group.add(domeMesh);

  // ── Blade ────────────────────────────────────────────────────────────────
  // Tapered cylinder: wider at guard, narrower at tip
  const bladeGeo  = new THREE.CylinderGeometry(BLADE_R1, BLADE_R0, BLADE_L, 6);
  const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
  // Blade starts just below guard and extends in -Y (toward blade tip)
  bladeMesh.position.y = -(GRIP_H / 2 + GUARD_T + BLADE_L / 2);
  group.add(bladeMesh);

  // Blade tip (small sphere)
  const tipGeo  = new THREE.SphereGeometry(BLADE_R1 * 1.5, 6, 6);
  const tipMesh = new THREE.Mesh(tipGeo, guardMat);
  tipMesh.position.y = -(GRIP_H / 2 + GUARD_T + BLADE_L);
  group.add(tipMesh);

  // ── Visual debug: blade direction indicator (thin line along -Y) ---------
  // (not needed in production, but helps verify orientation)

  // Expose the tip world position helper
  group.userData.bladeTip = new THREE.Vector3(0, -(GRIP_H / 2 + GUARD_T + BLADE_L), 0);
  group.userData.totalLength = POMMEL_H + GRIP_H + GUARD_T + BLADE_L; // ~1.12 m

  return group;
}
