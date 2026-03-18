/**
 * Fencer model builder.
 *
 * Coordinate convention (world space):
 *   +Z = toward opponent (fencer faces +Z)
 *   +X = fencer's right (sword arm side for right-handed)
 *   +Y = up
 *
 * Joint hierarchy: each group's origin IS the joint pivot.
 * Meshes extend in local -Y from their parent group origin.
 * The root group is placed at floor level.
 *
 * En-garde height ~1.60 m (knees bent from 1.78 m standing).
 */

import * as THREE from 'three';

// ── Dimensions (metres) ──────────────────────────────────────────────────────
const D = {
  // Body
  headR: 0.115,
  neckR: 0.055, neckH: 0.09,
  torsoW: 0.32, torsoH: 0.50, torsoD: 0.17,
  // Upper arm (including shoulder cap)
  uArmR: 0.055, uArmH: 0.29,
  // Forearm
  fArmR: 0.045, fArmH: 0.25,
  // Hand
  handW: 0.08, handH: 0.09, handD: 0.035,
  // Thigh
  thighR: 0.075, thighH: 0.40,
  // Shin
  shinR: 0.060, shinH: 0.36,
  // Foot
  footW: 0.10, footH: 0.06, footD: 0.26,
  // Shoe/ankle
  ankleR: 0.055, ankleH: 0.08,
};

// ── Materials ────────────────────────────────────────────────────────────────
function makeMat(color, roughness = 0.7, metalness = 0.0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

const MATS = {
  suit:   makeMat(0x1a2a4a),          // dark blue fencing suit
  mask:   makeMat(0x2d3748),          // dark mask
  glove:  makeMat(0xb8860b, 0.9),    // dark gold glove
  skin:   makeMat(0xd4956a, 0.8),    // skin tone
  shoe:   makeMat(0x1a1a2e, 0.9),    // dark shoe
  chest:  makeMat(0xe8e8e8, 0.5),    // white plastron/chest protector
};

function box(w, h, d, mat) {
  const g = new THREE.BoxGeometry(w, h, d);
  return new THREE.Mesh(g, mat);
}

function cyl(rT, rB, h, mat, segs = 8) {
  const g = new THREE.CylinderGeometry(rT, rB, h, segs);
  return new THREE.Mesh(g, mat);
}

function sph(r, mat, segs = 10) {
  const g = new THREE.SphereGeometry(r, segs, segs);
  return new THREE.Mesh(g, mat);
}

/** Create one limb segment: cylinder mesh, origin at proximal end, extending -Y */
function limb(r, h, mat, segs = 8) {
  const m = cyl(r * 0.9, r, h, mat, segs);
  m.position.y = -h / 2;
  return m;
}

// ── Main builder ─────────────────────────────────────────────────────────────
export function buildFencer(isAttacker = false) {
  // Colour-code the two fencers slightly
  const suitColor = isAttacker ? 0x2a1a4a : 0x1a2a4a;
  const suitMat   = makeMat(suitColor);

  const root = new THREE.Group();
  root.name  = isAttacker ? 'attacker' : 'defender';

  // ── Pelvis / hip ────────────────────────────────────────────────────────
  const pelvis = new THREE.Group(); pelvis.name = 'pelvis';
  // In en-garde the pelvis is ~0.90 m above floor
  pelvis.position.set(0, 0.90, 0);
  root.add(pelvis);

  // ── Torso ───────────────────────────────────────────────────────────────
  const torso = new THREE.Group(); torso.name = 'torso';
  torso.position.set(0, 0, 0); // relative to pelvis
  pelvis.add(torso);

  const torsoMesh = box(D.torsoW, D.torsoH, D.torsoD, suitMat);
  torsoMesh.position.set(0, D.torsoH / 2, 0);
  torso.add(torsoMesh);

  // Chest plastron overlay
  const plastron = box(D.torsoW * 0.80, D.torsoH * 0.65, D.torsoD * 0.55, MATS.chest);
  plastron.position.set(0, D.torsoH * 0.55, D.torsoD * 0.3);
  torso.add(plastron);

  // ── Head / mask ─────────────────────────────────────────────────────────
  const headGroup = new THREE.Group(); headGroup.name = 'head';
  headGroup.position.set(0, D.torsoH + 0.04, 0); // on top of torso
  torso.add(headGroup);

  // Neck
  const neckMesh = cyl(D.neckR, D.neckR, D.neckH, MATS.skin);
  neckMesh.position.set(0, D.neckH / 2, 0);
  headGroup.add(neckMesh);

  // Head sphere
  const headMesh = sph(D.headR, MATS.mask);
  headMesh.position.set(0, D.neckH + D.headR, 0);
  headGroup.add(headMesh);

  // Mask bib (box in front of face)
  const maskBib = box(D.headR * 1.8, D.headR * 1.2, D.headR * 0.5, MATS.mask);
  maskBib.position.set(0, D.neckH + D.headR * 0.8, D.headR * 0.75);
  headGroup.add(maskBib);

  // ── Right arm (sword arm) ────────────────────────────────────────────────
  // rShoulder group origin = shoulder joint
  const rShoulder = new THREE.Group(); rShoulder.name = 'rShoulder';
  rShoulder.position.set(D.torsoW / 2 + 0.02, D.torsoH - 0.04, 0);
  torso.add(rShoulder);

  const rUArm = limb(D.uArmR, D.uArmH, suitMat);
  rShoulder.add(rUArm);

  const rElbow = new THREE.Group(); rElbow.name = 'rElbow';
  rElbow.position.set(0, -D.uArmH, 0);
  rShoulder.add(rElbow);

  // Forearm group (also handles forearm twist / supination)
  const rForearm = new THREE.Group(); rForearm.name = 'rForearm';
  rForearm.position.set(0, 0, 0);
  rElbow.add(rForearm);

  const rFArmMesh = limb(D.fArmR, D.fArmH, suitMat);
  rForearm.add(rFArmMesh);

  const rWrist = new THREE.Group(); rWrist.name = 'rWrist';
  rWrist.position.set(0, -D.fArmH, 0);
  rForearm.add(rWrist);

  // Hand
  const rHandMesh = box(D.handW, D.handH, D.handD, MATS.glove);
  rHandMesh.position.set(0, -D.handH / 2, 0);
  rWrist.add(rHandMesh);

  // Weapon attachment point (at end of hand)
  const rWeaponMount = new THREE.Group(); rWeaponMount.name = 'rWeaponMount';
  rWeaponMount.position.set(0, -D.handH, 0);
  rWrist.add(rWeaponMount);

  // ── Left arm (off-hand / balance arm) ───────────────────────────────────
  const lShoulder = new THREE.Group(); lShoulder.name = 'lShoulder';
  lShoulder.position.set(-(D.torsoW / 2 + 0.02), D.torsoH - 0.04, 0);
  torso.add(lShoulder);

  const lUArm = limb(D.uArmR, D.uArmH, suitMat);
  lShoulder.add(lUArm);

  const lElbow = new THREE.Group(); lElbow.name = 'lElbow';
  lElbow.position.set(0, -D.uArmH, 0);
  lShoulder.add(lElbow);

  const lForearm = new THREE.Group(); lForearm.name = 'lForearm';
  lForearm.position.set(0, 0, 0);
  lElbow.add(lForearm);

  const lFArmMesh = limb(D.fArmR, D.fArmH, suitMat);
  lForearm.add(lFArmMesh);

  const lWrist = new THREE.Group(); lWrist.name = 'lWrist';
  lWrist.position.set(0, -D.fArmH, 0);
  lForearm.add(lWrist);

  const lHandMesh = box(D.handW, D.handH, D.handD, MATS.glove);
  lHandMesh.position.set(0, -D.handH / 2, 0);
  lWrist.add(lHandMesh);

  // ── Right leg (front / leading leg) ─────────────────────────────────────
  const rHip = new THREE.Group(); rHip.name = 'rHip';
  rHip.position.set(0.10, 0, 0);
  pelvis.add(rHip);

  const rThigh = limb(D.thighR, D.thighH, suitMat, 10);
  rHip.add(rThigh);

  const rKnee = new THREE.Group(); rKnee.name = 'rKnee';
  rKnee.position.set(0, -D.thighH, 0);
  rHip.add(rKnee);

  const rShin = limb(D.shinR, D.shinH, suitMat, 10);
  rKnee.add(rShin);

  const rAnkle = new THREE.Group(); rAnkle.name = 'rAnkle';
  rAnkle.position.set(0, -D.shinH, 0);
  rKnee.add(rAnkle);

  const rFootMesh = box(D.footW, D.footH, D.footD, MATS.shoe);
  rFootMesh.position.set(0, -D.footH / 2, D.footD * 0.15);
  rAnkle.add(rFootMesh);

  // ── Left leg (back / trailing leg) ──────────────────────────────────────
  const lHip = new THREE.Group(); lHip.name = 'lHip';
  lHip.position.set(-0.10, 0, 0);
  pelvis.add(lHip);

  const lThigh = limb(D.thighR, D.thighH, suitMat, 10);
  lHip.add(lThigh);

  const lKnee = new THREE.Group(); lKnee.name = 'lKnee';
  lKnee.position.set(0, -D.thighH, 0);
  lHip.add(lKnee);

  const lShin = limb(D.shinR, D.shinH, suitMat, 10);
  lKnee.add(lShin);

  const lAnkle = new THREE.Group(); lAnkle.name = 'lAnkle';
  lAnkle.position.set(0, -D.shinH, 0);
  lKnee.add(lAnkle);

  const lFootMesh = box(D.footW, D.footH, D.footD, MATS.shoe);
  lFootMesh.position.set(0, -D.footH / 2, D.footD * 0.15);
  lAnkle.add(lFootMesh);

  // ── Return joint map ─────────────────────────────────────────────────────
  const joints = {
    root, pelvis, torso, headGroup,
    rShoulder, rElbow, rForearm, rWrist, rWeaponMount,
    lShoulder, lElbow, lForearm, lWrist,
    rHip, rKnee, rAnkle,
    lHip, lKnee, lAnkle,
  };

  return { root, joints };
}

/**
 * Apply a pose to a fencer's joints.
 * pose = { jointName: { x, y, z } } where values are Euler angles in radians.
 * Only supplied joints are changed; unspecified joints keep current rotation.
 */
export function applyPose(joints, pose) {
  for (const [name, rot] of Object.entries(pose)) {
    const joint = joints[name];
    if (!joint) continue;
    if (rot.x !== undefined) joint.rotation.x = rot.x;
    if (rot.y !== undefined) joint.rotation.y = rot.y;
    if (rot.z !== undefined) joint.rotation.z = rot.z;
  }
}
