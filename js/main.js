/**
 * Main entry point for the Épée Fencing Visualizer.
 *
 * Scene layout (fencer facing +Z = toward opponent):
 *   Defender at Z = +1.8, facing -Z (toward attacker)
 *   Attacker at Z = -1.8, facing +Z (toward defender)
 *
 * The defender's root is rotated 180° around Y so they face the attacker.
 * All pose definitions are written from the defender's perspective;
 * the attacker uses a mirrored version for offense sequences.
 */

import * as THREE           from 'three';
import { createScene, updatePOVCamera } from './scene.js';
import { buildFencer, applyPose }       from './fencer.js';
import { buildEpee }                    from './epee.js';
import { Animator }                     from './animator.js';
import { UI }                           from './ui.js';
import {
  EN_GARDE, FEINT,
  DEFENSE_MOVES, OFFENSE_MOVES,
} from './poses.js';

// ── Scene ─────────────────────────────────────────────────────────────────────
const container = document.getElementById('canvas-container');
const { renderer, scene, camThird, camPOV, camFree, controls } = createScene(container);

let activeCamera = camThird;

// ── Fencer A – Defender ───────────────────────────────────────────────────────
const defenderData = buildFencer(false);
const defenderRoot = defenderData.root;
// Defender stands at Z = +1.8, facing -Z (toward the attacker)
defenderRoot.position.set(0, 0, 1.8);
defenderRoot.rotation.y = Math.PI; // face toward -Z (toward attacker at -Z)
scene.add(defenderRoot);

// Attach épée to defender's weapon mount
const defenderEpee = buildEpee();
defenderData.joints.rWeaponMount.add(defenderEpee);
// Orient the épée so the blade extends in the same direction as the arm (-Y local)
// The weapon group's -Y should be the blade direction.
// The weapon mount is at the end of the hand in -Y of wrist; no extra rotation needed
// because the épée group's geometry already has the blade going in -Y.

// ── Fencer B – Attacker ───────────────────────────────────────────────────────
const attackerData = buildFencer(true);
const attackerRoot = attackerData.root;
// Attacker at Z = -1.8, facing +Z (toward defender)
attackerRoot.position.set(0, 0, -1.8);
// attackerRoot.rotation.y = 0; // already faces +Z
scene.add(attackerRoot);

const attackerEpee = buildEpee();
attackerData.joints.rWeaponMount.add(attackerEpee);

// ── Snap both fencers to en-garde on load ─────────────────────────────────────
applyPose(defenderData.joints, EN_GARDE);
applyPose(attackerData.joints, EN_GARDE);

// Enable shadows on all meshes
scene.traverse(obj => {
  if (obj.isMesh) {
    obj.castShadow    = true;
    obj.receiveShadow = true;
  }
});

// ── Animators ─────────────────────────────────────────────────────────────────
const defenderAnim = new Animator(defenderData.joints);
const attackerAnim = new Animator(attackerData.joints);

// ── State ─────────────────────────────────────────────────────────────────────
let currentMode   = 'defense';
let currentMove   = DEFENSE_MOVES[0];

// ── Helpers ───────────────────────────────────────────────────────────────────
function resetToEnGarde() {
  defenderAnim.stop();
  attackerAnim.stop();
  defenderAnim.snap(EN_GARDE);
  attackerAnim.snap(EN_GARDE);
}

function playDefenseAnimation(move) {
  resetToEnGarde();
  // Defender: en-garde → parry
  defenderAnim.play(
    [EN_GARDE, move.defenderPose],
    [1.4],
  );
  // Attacker: stays in en-garde (they attacked, but we focus on the parry)
  attackerAnim.play(
    [EN_GARDE, FEINT],
    [1.0],
  );
}

function playOffenseAnimation(move) {
  resetToEnGarde();

  // Phase 1: attacker feints (0 → 0.8s)
  // Phase 2: defender parries (0.8 → 1.6s)
  // Phase 3: attacker disengages + lunges (1.6 → 2.8s)

  const defenderPoses    = [EN_GARDE, EN_GARDE, move.parryTriggered];
  const defenderDuration = [0.8, 0.7];

  const attackerPoses    = [EN_GARDE, FEINT, move.disengagePose];
  const attackerDuration = [0.8, 1.2];

  defenderAnim.play(defenderPoses, defenderDuration);
  attackerAnim.play(attackerPoses, attackerDuration);
}

// ── UI ────────────────────────────────────────────────────────────────────────
const ui = new UI({
  onModeChange(mode) {
    currentMode = mode;
    resetToEnGarde();
  },
  onMoveSelect(move, mode) {
    currentMove = move;
    resetToEnGarde();
    // Auto-play on selection
    if (mode === 'defense') playDefenseAnimation(move);
    else                    playOffenseAnimation(move);
  },
  onCameraChange(cam) {
    if (cam === 'third') {
      activeCamera = camThird;
      controls.enabled = false;
    } else if (cam === 'pov') {
      activeCamera = camPOV;
      controls.enabled = false;
    } else {
      activeCamera = camFree;
      controls.enabled = true;
    }
  },
  onPlay() {
    if (currentMode === 'defense') playDefenseAnimation(currentMove);
    else                           playOffenseAnimation(currentMove);
  },
  onReset: resetToEnGarde,
});

// ── Render loop ───────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();

  defenderAnim.update(dt);
  attackerAnim.update(dt);
  controls.update();

  if (activeCamera === camPOV) {
    updatePOVCamera(camPOV, defenderRoot);
  }

  renderer.render(scene, activeCamera);
}

animate();
