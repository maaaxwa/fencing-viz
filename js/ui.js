/**
 * UI controller – populates move lists and wires buttons.
 */

import { DEFENSE_MOVES, OFFENSE_MOVES } from './poses.js';

export class UI {
  constructor({ onModeChange, onMoveSelect, onCameraChange, onPlay, onReset }) {
    this.callbacks = { onModeChange, onMoveSelect, onCameraChange, onPlay, onReset };
    this.mode      = 'defense';
    this.activeId  = null;

    this._buildMoveList('defense');
    this._wireButtons();
  }

  _wireButtons() {
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.mode     = btn.dataset.mode;
        this.activeId = null;
        this._buildMoveList(this.mode);
        this.callbacks.onModeChange(this.mode);
      });
    });

    // Camera buttons
    document.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const hint = document.getElementById('free-cam-hint');
        hint.style.display = btn.dataset.cam === 'free' ? 'block' : 'none';
        this.callbacks.onCameraChange(btn.dataset.cam);
      });
    });

    // Animation controls
    document.getElementById('btn-play').addEventListener('click', () => {
      this.callbacks.onPlay();
    });
    document.getElementById('btn-reset').addEventListener('click', () => {
      this.callbacks.onReset();
    });
  }

  _buildMoveList(mode) {
    const list  = document.getElementById('move-list');
    list.innerHTML = '';
    const moves = mode === 'defense' ? DEFENSE_MOVES : OFFENSE_MOVES;

    moves.forEach(move => {
      const btn = document.createElement('button');
      btn.className   = 'move-btn';
      btn.dataset.id  = move.id;

      const numSpan  = document.createElement('span');
      numSpan.className = 'move-num';
      numSpan.textContent = move.number + '.';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'move-name';
      nameSpan.textContent = move.name;

      const lineSpan = document.createElement('span');
      lineSpan.className = 'move-line';
      lineSpan.textContent = move.line;

      btn.appendChild(numSpan);
      btn.appendChild(nameSpan);
      btn.appendChild(lineSpan);

      btn.addEventListener('click', () => {
        document.querySelectorAll('.move-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeId = move.id;
        this._updateInfo(move);
        this.callbacks.onMoveSelect(move, mode);
      });

      list.appendChild(btn);
    });

    // Auto-select first move
    const first = list.querySelector('.move-btn');
    if (first) first.click();
  }

  _updateInfo(move) {
    document.getElementById('info-name').textContent = `${move.number}. ${move.name}`;
    document.getElementById('info-line').textContent = move.line;
    document.getElementById('info-desc').textContent = move.description;
  }
}
