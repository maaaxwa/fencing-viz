/**
 * Simple pose animator using smooth step interpolation.
 *
 * Usage:
 *   const anim = new Animator(joints);
 *   anim.play([poseA, poseB, poseC], [duration_AB, duration_BC]);
 *   // Call anim.update(deltaTime) each frame.
 */

function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpPose(poseA, poseB, t, joints) {
  const allKeys = new Set([...Object.keys(poseA), ...Object.keys(poseB)]);
  for (const key of allKeys) {
    const joint = joints[key];
    if (!joint) continue;
    const a = poseA[key] ?? poseB[key]; // fall back to target if no source
    const b = poseB[key] ?? poseA[key];
    joint.rotation.x = lerp(a.x ?? joint.rotation.x, b.x ?? joint.rotation.x, t);
    joint.rotation.y = lerp(a.y ?? joint.rotation.y, b.y ?? joint.rotation.y, t);
    joint.rotation.z = lerp(a.z ?? joint.rotation.z, b.z ?? joint.rotation.z, t);
  }
}

export class Animator {
  constructor(joints) {
    this.joints   = joints;
    this.segments = [];   // { from, to, duration }
    this.segIdx   = 0;
    this.elapsed  = 0;
    this.playing  = false;
    this.onDone   = null; // callback
  }

  /** Play a sequence of poses.
   *  poses:     array of pose objects
   *  durations: array of durations in seconds (length = poses.length - 1)
   *  onDone:    optional callback when sequence finishes
   */
  play(poses, durations, onDone) {
    this.segments = [];
    for (let i = 0; i < poses.length - 1; i++) {
      this.segments.push({
        from:     poses[i],
        to:       poses[i + 1],
        duration: durations[i] ?? 1.0,
      });
    }
    this.segIdx  = 0;
    this.elapsed = 0;
    this.playing = true;
    this.onDone  = onDone ?? null;
  }

  /** Immediately jump to a pose with no animation */
  snap(pose) {
    this.playing = false;
    for (const [key, rot] of Object.entries(pose)) {
      const joint = this.joints[key];
      if (!joint) continue;
      if (rot.x !== undefined) joint.rotation.x = rot.x;
      if (rot.y !== undefined) joint.rotation.y = rot.y;
      if (rot.z !== undefined) joint.rotation.z = rot.z;
    }
  }

  stop() {
    this.playing = false;
  }

  /** Call this from the render loop. deltaTime is in seconds. */
  update(deltaTime) {
    if (!this.playing || this.segments.length === 0) return;

    const seg = this.segments[this.segIdx];
    this.elapsed += deltaTime;

    const raw = Math.min(this.elapsed / seg.duration, 1.0);
    const t   = smoothStep(raw);

    lerpPose(seg.from, seg.to, t, this.joints);

    if (raw >= 1.0) {
      // Snap to exact end pose and advance
      this.snap(seg.to);
      this.segIdx++;
      this.elapsed = 0;

      if (this.segIdx >= this.segments.length) {
        this.playing = false;
        if (this.onDone) this.onDone();
      }
    }
  }

  get isPlaying() { return this.playing; }
}
