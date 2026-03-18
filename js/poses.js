/**
 * Pose definitions for épée fencing.
 *
 * Each pose is an object mapping joint names → { x, y, z } Euler rotations
 * (radians, order XYZ applied to joint.rotation).
 *
 * Coordinate frame reminder (fencer facing +Z):
 *   Shoulder.rotation.x ≈ -PI/2  → arm pointing forward
 *   rShoulder.rotation.y > 0     → arm swings to fencer's right (+X = outside)
 *   rShoulder.rotation.y < 0     → arm swings to fencer's left  (-X = inside)
 *   rForearm.rotation.y  > 0     → blade tip moves outside (right / +X)
 *   rForearm.rotation.y  < 0     → blade tip moves inside  (left  / -X)
 *   rForearm.rotation.x  < 0     → blade tip rises (+Y, high)
 *   rForearm.rotation.x  > 0     → blade tip drops (-Y, low)
 *   rForearm.rotation.z  > 0     → pronation (palm down / inward)
 *   rForearm.rotation.z  < 0     → supination (palm up / outward)
 *
 * Pelvis Y rotation:
 *   > 0 → body turns right (exposing less target)
 *   The body in épée is turned ~45° exposing the profile.
 *
 * Hip / knee rotation (X axis):
 *   rHip.x > 0  → right thigh tilts forward (front leg)
 *   lHip.x < 0  → left thigh tilts backward (back leg)
 *   rKnee.x < 0 → knee bends (shin swings backward relative to thigh)
 */

const PI = Math.PI;

// ── En garde ─────────────────────────────────────────────────────────────────
// Right-handed fencer, right foot forward, body ~45° to opponent.
// Sword arm extended forward, elbow slightly bent, blade aimed at opponent.
// Back arm raised for balance.
export const EN_GARDE = {
  // Body orientation
  pelvis:    { x:  0.00, y:  0.40, z:  0.00 },  // turned ~23° right
  torso:     { x:  0.08, y:  0.00, z: -0.05 },  // slight forward lean
  headGroup: { x: -0.10, y: -0.35, z:  0.00 },  // looking at opponent

  // Sword arm (right) – arm reaches forward, blade levelled at opponent
  rShoulder: { x: -1.40, y:  0.12, z: -0.15 },  // mostly forward, slightly outward
  rElbow:    { x:  0.45, y:  0.00, z:  0.00 },  // elbow bent ~25°
  rForearm:  { x:  0.00, y: -0.20, z: -0.20 },  // slight supination
  rWrist:    { x:  0.05, y:  0.00, z:  0.00 },

  // Off-arm (left) raised behind for balance
  lShoulder: { x: -0.70, y: -0.20, z:  0.55 },  // raised and angled back
  lElbow:    { x:  0.90, y:  0.00, z:  0.00 },  // elbow bent
  lForearm:  { x:  0.00, y:  0.10, z:  0.00 },

  // Right leg (leading / front leg in en garde)
  rHip:      { x:  0.30, y:  0.00, z:  0.00 },  // thigh tilted forward
  rKnee:     { x: -0.55, y:  0.00, z:  0.00 },  // knee bent
  rAnkle:    { x:  0.20, y:  0.00, z:  0.00 },  // foot level

  // Left leg (trailing / back leg)
  lHip:      { x: -0.30, y:  0.30, z:  0.00 },  // thigh angled back & outward
  lKnee:     { x: -0.40, y:  0.00, z:  0.00 },  // knee bent
  lAnkle:    { x:  0.15, y: -0.30, z:  0.00 },  // foot turned out
};

// ── The 8 classical parries ───────────────────────────────────────────────────
//
// Only the joints that change from en-garde need to be specified;
// the animator interpolates ALL joints between two full-pose snapshots,
// so we spread EN_GARDE first and then override below.

function parryPose(override) {
  return { ...EN_GARDE, ...override };
}

/**
 * Parry 1 – Prime
 * HIGH INSIDE, PRONATED
 * Arm pulled in toward body, blade pointing down and to the inside (left).
 * Hand in pronation (palm rotated inward/down).
 * Protects the inside high line.
 */
export const PARRY_1 = parryPose({
  rShoulder: { x: -1.00, y: -0.30, z:  0.40 },  // arm pulled back-inside
  rElbow:    { x:  1.00, y:  0.00, z:  0.00 },  // elbow bent sharply
  rForearm:  { x:  0.40, y:  1.20, z:  0.80 },  // pronated, blade down-left
  rWrist:    { x:  0.10, y:  0.00, z:  0.30 },
});

/**
 * Parry 2 – Seconde
 * LOW OUTSIDE, PRONATED
 * Arm drops to outside low, blade pointing down-right.
 * Protects the outside low line.
 */
export const PARRY_2 = parryPose({
  rShoulder: { x: -1.00, y:  0.40, z: -0.30 },  // arm angled outside-low
  rElbow:    { x:  0.40, y:  0.00, z:  0.00 },
  rForearm:  { x:  0.50, y:  1.10, z: -0.40 },  // pronated, blade down-right
  rWrist:    { x:  0.15, y:  0.10, z:  0.00 },
});

/**
 * Parry 3 – Tierce
 * HIGH OUTSIDE, PRONATED
 * Arm moves to outside-high, blade pointing right.
 * Hand in pronation (palm down). Like sixte but pronated.
 * Protects the outside high line.
 */
export const PARRY_3 = parryPose({
  rShoulder: { x: -1.35, y:  0.45, z: -0.35 },  // outside-high
  rElbow:    { x:  0.25, y:  0.00, z:  0.00 },
  rForearm:  { x: -0.10, y:  1.00, z: -0.35 },  // pronated, blade up-right
  rWrist:    { x: -0.05, y:  0.10, z:  0.10 },
});

/**
 * Parry 4 – Quarte
 * HIGH INSIDE, SUPINATED
 * Arm moves to the inside (left), blade pointing up-left.
 * Hand in supination (palm up). Primary inside high parry.
 * Protects the inside high line.
 */
export const PARRY_4 = parryPose({
  rShoulder: { x: -1.35, y: -0.30, z:  0.25 },  // arm inside-high
  rElbow:    { x:  0.25, y:  0.00, z:  0.00 },
  rForearm:  { x: -0.30, y: -0.45, z: -0.25 },  // supinated, blade up-left
  rWrist:    { x: -0.05, y: -0.05, z: -0.05 },
});

/**
 * Parry 5 – Quinte
 * LOW INSIDE, PRONATED  (also used as head parry in foil; in épée protects inside low-medium)
 * Arm angled to inside-low, slightly raised, pronated.
 * Protects the inside low / chest line.
 */
export const PARRY_5 = parryPose({
  rShoulder: { x: -1.15, y: -0.20, z:  0.30 },  // inside, slightly dropped
  rElbow:    { x:  0.55, y:  0.00, z:  0.00 },
  rForearm:  { x:  0.25, y:  0.80, z:  0.50 },  // pronated, blade inside-low
  rWrist:    { x:  0.10, y:  0.10, z:  0.20 },
});

/**
 * Parry 6 – Sixte
 * HIGH OUTSIDE, SUPINATED
 * Arm moves to outside-high, blade pointing up-right.
 * Hand in supination (palm up). Primary outside high parry.
 * Protects the outside high line.
 */
export const PARRY_6 = parryPose({
  rShoulder: { x: -1.35, y:  0.35, z: -0.30 },  // outside-high
  rElbow:    { x:  0.20, y:  0.00, z:  0.00 },
  rForearm:  { x: -0.35, y: -0.20, z: -0.35 },  // supinated, blade up-right
  rWrist:    { x: -0.05, y:  0.10, z: -0.05 },
});

/**
 * Parry 7 – Septime (Septième)
 * LOW INSIDE, SUPINATED
 * Arm drops to inside-low, blade pointing down-left.
 * Hand in supination. Protects the inside low line.
 */
export const PARRY_7 = parryPose({
  rShoulder: { x: -1.00, y: -0.25, z:  0.20 },  // inside, low
  rElbow:    { x:  0.35, y:  0.00, z:  0.00 },
  rForearm:  { x:  0.45, y: -0.45, z: -0.30 },  // supinated, blade down-left
  rWrist:    { x:  0.15, y: -0.05, z: -0.05 },
});

/**
 * Parry 8 – Octave
 * LOW OUTSIDE, SUPINATED
 * Arm drops to outside-low, blade pointing down-right.
 * Hand in supination. Protects the outside low line.
 */
export const PARRY_8 = parryPose({
  rShoulder: { x: -1.00, y:  0.35, z: -0.20 },  // outside, low
  rElbow:    { x:  0.35, y:  0.00, z:  0.00 },
  rForearm:  { x:  0.45, y:  0.35, z: -0.30 },  // supinated, blade down-right
  rWrist:    { x:  0.15, y:  0.05, z: -0.05 },
});

// ── Offense / Attack sequences ────────────────────────────────────────────────
// Each attack sequence has: initial feint, defender parry, attacker disengage, final attack.
// Represented as { feint, disengage, lunge } poses for the attacker,
// plus which parry is triggered on the defender.

/**
 * Lunge pose – arm fully extended, body leans forward, back leg straight.
 */
export const LUNGE = {
  pelvis:    { x:  0.00, y:  0.40, z:  0.00 },
  torso:     { x:  0.25, y:  0.00, z: -0.05 },  // lean forward significantly
  headGroup: { x: -0.15, y: -0.35, z:  0.00 },

  // Sword arm fully extended
  rShoulder: { x: -1.55, y:  0.08, z: -0.10 },
  rElbow:    { x:  0.05, y:  0.00, z:  0.00 },  // nearly straight
  rForearm:  { x:  0.00, y: -0.15, z: -0.10 },
  rWrist:    { x:  0.02, y:  0.00, z:  0.00 },

  // Back arm dropped for balance / counterweight
  lShoulder: { x: -0.20, y: -0.10, z:  0.30 },
  lElbow:    { x:  0.30, y:  0.00, z:  0.00 },
  lForearm:  { x:  0.00, y:  0.00, z:  0.00 },

  // Front leg extends far forward
  rHip:      { x:  0.75, y:  0.00, z:  0.00 },
  rKnee:     { x: -0.70, y:  0.00, z:  0.00 },
  rAnkle:    { x:  0.30, y:  0.00, z:  0.00 },

  // Back leg straightens out
  lHip:      { x: -0.45, y:  0.25, z:  0.00 },
  lKnee:     { x: -0.05, y:  0.00, z:  0.00 },  // nearly straight
  lAnkle:    { x:  0.10, y: -0.25, z:  0.00 },
};

/** Feint (initial attack extending arm to provoke a parry) */
export const FEINT = {
  ...EN_GARDE,
  rShoulder: { x: -1.50, y:  0.10, z: -0.10 },
  rElbow:    { x:  0.15, y:  0.00, z:  0.00 },
  rForearm:  { x:  0.00, y: -0.15, z: -0.15 },
  rWrist:    { x:  0.02, y:  0.00, z:  0.00 },
};

/**
 * Disengage attack poses – after the defender parries, the attacker
 * slips their blade to the opposite line and lunges.
 * Named by which parry was triggered (attacker responds by going to opposite line).
 */

// After defender takes parry 4 (inside high) → attacker disengages to outside → blade goes right-up
export const DISENGAGE_FROM_4 = {
  ...LUNGE,
  rForearm: { x: -0.25, y:  0.35, z: -0.15 },  // blade now outside high
  rWrist:   { x: -0.05, y:  0.15, z:  0.00 },
};

// After defender takes parry 6 (outside high) → attacker disengages to inside → blade goes left-up
export const DISENGAGE_FROM_6 = {
  ...LUNGE,
  rForearm: { x: -0.25, y: -0.45, z: -0.10 },  // blade now inside high
  rWrist:   { x: -0.05, y: -0.15, z:  0.00 },
};

// After defender takes parry 7 (inside low) → attacker disengages to outside → blade goes right-low
export const DISENGAGE_FROM_7 = {
  ...LUNGE,
  rForearm: { x:  0.40, y:  0.35, z: -0.15 },
  rWrist:   { x:  0.10, y:  0.15, z:  0.00 },
};

// After defender takes parry 8 (outside low) → attacker disengages to inside → blade goes left-low
export const DISENGAGE_FROM_8 = {
  ...LUNGE,
  rForearm: { x:  0.40, y: -0.45, z: -0.10 },
  rWrist:   { x:  0.10, y: -0.15, z:  0.00 },
};

// After parry 1 → disengage to outside
export const DISENGAGE_FROM_1 = {
  ...LUNGE,
  rForearm: { x: -0.20, y:  0.40, z: -0.15 },
};

// After parry 2 → disengage to inside-low
export const DISENGAGE_FROM_2 = {
  ...LUNGE,
  rForearm: { x:  0.35, y: -0.40, z: -0.10 },
};

// After parry 3 → disengage to inside-high
export const DISENGAGE_FROM_3 = {
  ...LUNGE,
  rForearm: { x: -0.25, y: -0.40, z: -0.10 },
};

// After parry 5 → disengage to outside-low
export const DISENGAGE_FROM_5 = {
  ...LUNGE,
  rForearm: { x:  0.35, y:  0.40, z: -0.15 },
};

// ── Move catalogue ────────────────────────────────────────────────────────────

export const DEFENSE_MOVES = [
  {
    id: 'parry1',
    number: 1,
    name: 'Prime',
    line: 'High Inside · Pronated',
    description: 'Arm pulled toward body, blade points down-inside. Hand pronated (palm inward). Rarely used in modern épée but effective against attacks to the inside high line.',
    defenderPose: PARRY_1,
    triggeredByAttack: 'high inside',
  },
  {
    id: 'parry2',
    number: 2,
    name: 'Seconde',
    line: 'Low Outside · Pronated',
    description: 'Arm drops to the outside (right) low, blade points down-outside. Hand pronated. Covers the low outside line including the thigh and lower torso on the weapon side.',
    defenderPose: PARRY_2,
    triggeredByAttack: 'low outside',
  },
  {
    id: 'parry3',
    number: 3,
    name: 'Tierce',
    line: 'High Outside · Pronated',
    description: 'Arm moves outside-high, blade directed right and slightly up. Hand pronated (palm down). Historical parry now largely replaced by Sixte in modern épée.',
    defenderPose: PARRY_3,
    triggeredByAttack: 'high outside',
  },
  {
    id: 'parry4',
    number: 4,
    name: 'Quarte',
    line: 'High Inside · Supinated',
    description: 'Arm moves to inside-high, blade up-left, hand supinated (palm up). The primary parry for attacks to the chest and inside high line. One of the most common parries in épée.',
    defenderPose: PARRY_4,
    triggeredByAttack: 'high inside',
  },
  {
    id: 'parry5',
    number: 5,
    name: 'Quinte',
    line: 'Low Inside · Pronated',
    description: 'Arm to inside-low, hand pronated. In épée this covers the inside chest / low chest line. In foil it is used as a head parry; in épée it sweeps the inside-low target.',
    defenderPose: PARRY_5,
    triggeredByAttack: 'low inside',
  },
  {
    id: 'parry6',
    number: 6,
    name: 'Sixte',
    line: 'High Outside · Supinated',
    description: 'Arm to outside-high, blade up-right, hand supinated. The primary parry for the outside high line. Most common parry in modern épée alongside Quarte.',
    defenderPose: PARRY_6,
    triggeredByAttack: 'high outside',
  },
  {
    id: 'parry7',
    number: 7,
    name: 'Septième',
    line: 'Low Inside · Supinated',
    description: 'Arm drops to inside-low, blade directed down-left, hand supinated. Protects the inner thigh and lower torso on the non-weapon side. Important in épée where all target is valid.',
    defenderPose: PARRY_7,
    triggeredByAttack: 'low inside',
  },
  {
    id: 'parry8',
    number: 8,
    name: 'Octave',
    line: 'Low Outside · Supinated',
    description: 'Arm drops to outside-low, blade directed down-right, hand supinated. Covers the outside low line (weapon-side thigh, lower torso). Very common in épée against low-line attacks.',
    defenderPose: PARRY_8,
    triggeredByAttack: 'low outside',
  },
];

export const OFFENSE_MOVES = [
  {
    id: 'dis1',
    number: 1,
    name: 'Disengage from Prime',
    line: 'Provoke Prime → Disengage outside',
    description: 'Feint to inside-high to draw Prime parry. As defender's blade sweeps across, duck under and extend to the outside line. Finish with a lunge to the outside-high target.',
    parryTriggered: PARRY_1,
    disengagePose: DISENGAGE_FROM_1,
  },
  {
    id: 'dis2',
    number: 2,
    name: 'Disengage from Seconde',
    line: 'Provoke Seconde → Disengage inside-low',
    description: 'Threaten the outside-low line to draw Seconde. As defender's blade moves outside-down, slip your blade to the inside-low line and lunge to the inner thigh or lower torso.',
    parryTriggered: PARRY_2,
    disengagePose: DISENGAGE_FROM_2,
  },
  {
    id: 'dis3',
    number: 3,
    name: 'Disengage from Tierce',
    line: 'Provoke Tierce → Disengage inside-high',
    description: 'Feint outside-high to draw the Tierce parry. As the pronated blade sweeps outside, disengage under to the inside-high line and extend to the chest or shoulder.',
    parryTriggered: PARRY_3,
    disengagePose: DISENGAGE_FROM_3,
  },
  {
    id: 'dis4',
    number: 4,
    name: 'Disengage from Quarte',
    line: 'Provoke Quarte → Disengage outside-high',
    description: 'Feint inside-high to draw Quarte. As defender sweeps blade inside, disengage your point under and out to the outside-high line (sixte line). Classic one-two action.',
    parryTriggered: PARRY_4,
    disengagePose: DISENGAGE_FROM_4,
  },
  {
    id: 'dis5',
    number: 5,
    name: 'Disengage from Quinte',
    line: 'Provoke Quinte → Disengage outside-low',
    description: 'Threaten the inside-low to draw Quinte. As the pronated blade comes inside, disengage your point to the outside-low line and lunge to the weapon-side thigh.',
    parryTriggered: PARRY_5,
    disengagePose: DISENGAGE_FROM_5,
  },
  {
    id: 'dis6',
    number: 6,
    name: 'Disengage from Sixte',
    line: 'Provoke Sixte → Disengage inside-high',
    description: 'Feint outside-high to draw Sixte. When defender's blade moves to outside, disengage underneath to the inside-high (quarte) line. Classic action exploiting the most common parry.',
    parryTriggered: PARRY_6,
    disengagePose: DISENGAGE_FROM_6,
  },
  {
    id: 'dis7',
    number: 7,
    name: 'Disengage from Septième',
    line: 'Provoke Septième → Disengage outside-low',
    description: 'Threaten the inside-low line to draw Septième. As the blade drops inside, slip your point over or under to the outside-low line and lunge to the thigh or torso.',
    parryTriggered: PARRY_7,
    disengagePose: DISENGAGE_FROM_7,
  },
  {
    id: 'dis8',
    number: 8,
    name: 'Disengage from Octave',
    line: 'Provoke Octave → Disengage inside-low',
    description: 'Threaten the outside-low to draw Octave. As defender's blade sweeps outside-down, disengage to the inside-low (septième) line and lunge to the inner thigh or lower torso.',
    parryTriggered: PARRY_8,
    disengagePose: DISENGAGE_FROM_8,
  },
];
