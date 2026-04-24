import { GameState } from "./GameState.js";
import { Unit } from "../entities/Unit.js";
import { Tower } from "../entities/Tower.js";
import { Spawner } from "../systems/Spawner.js";

export class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;

    this.state = GameState.PLAYING;

    this.units = [];
    this.enemyUnits = [];
    this.towers = [];
    this.selectedTower = null;

    // Waves
    this.currentWave = 1;
    this.waveCooldown = 120;
    this.waveTimer = this.waveCooldown;

    // Spawners
    this.playerSpawner = new Spawner(50, 250, 1);
    this.enemySpawner = new Spawner(850, 250, -1);

    // Initial enemy tower
    this.towers.push(new Tower(700, 230, "enemy"));

    // Input
    this.canvas.addEventListener("click", this.handleClick.bind(this));
  }

  update() {
    if (this.state !== GameState.PLAYING) return;

    // --- Spawner logic ---
    this.playerSpawner.update(this.units);
    this.enemySpawner.update(this.enemyUnits);

    // Start next wave when ready
    if (
      this.playerSpawner.isFinished() &&
      this.enemySpawner.isFinished()
    ) {
      this.waveTimer--;

      if (this.waveTimer <= 0) {
        this.startNextWave();
      }
    }

    // --- Update units ---
    this.units.forEach(unit => unit.update());
    this.enemyUnits.forEach(unit => unit.update());

    // --- Towers attack ---
    this.towers.forEach(tower =>
      tower.update(this.units, this.enemyUnits)
    );

    // --- Capture check ---
    for (const tower of this.towers) {
      if (tower.owner !== "enemy") continue;

      for (const unit of this.units) {
        if (tower.isReachedBy(unit)) {
          this.state = GameState.CAPTURE_DECISION;
          this.selectedTower = tower;
          return;
        }
      }
    }

    // Cleanup
    this.units = this.units.filter(u => u.isAlive);
    this.enemyUnits = this.enemyUnits.filter(u => u.isAlive);
  }

  startNextWave() {
    const count = 2 + this.currentWave;

    this.playerSpawner.startWave(count);
    this.enemySpawner.startWave(count - 1);

    this.currentWave++;
    this.waveTimer = this.waveCooldown;
  }

  draw() {
    this.drawPlaying();

    if (this.state === GameState.CAPTURE_DECISION) {
      this.drawCaptureDecision();
    }

    // Wave info
    this.ctx.fillStyle = "white";
    this.ctx.font = "16px Arial";
    this.ctx.fillText(`Wave: ${this.currentWave}`, 20, 20);
  }

  drawPlaying() {
    this.units.forEach(unit => unit.draw(this.ctx));
    this.enemyUnits.forEach(unit => unit.draw(this.ctx));
    this.towers.forEach(tower => tower.draw(this.ctx));
  }

  // ====================
  // CAPTURE UI
  // ====================

  drawCaptureDecision() {
    this.ctx.fillStyle = "rgba(0,0,0,0.7)";
    this.ctx.fillRect(0, 0, 900, 500);

    this.ctx.fillStyle = "white";
    this.ctx.font = "26px Arial";
    this.ctx.fillText("Tower Reached!", 330, 170);

    this.drawButton(250, 230, 150, 50, "CAPTURE", "green");
    this.drawButton(500, 230, 150, 50, "DESTROY", "red");
  }

  drawButton(x, y, w, h, text, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);

    this.ctx.fillStyle = "white";
    this.ctx.font = "18px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(text, x + w / 2, y + h / 2);

    if (!this.buttons) this.buttons = {};
    this.buttons[text] = { x, y, w, h };
  }

  handleClick(event) {
    if (this.state !== GameState.CAPTURE_DECISION) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.isInside(this.buttons.CAPTURE, x, y)) {
      this.selectedTower.owner = "player";
      this.exitDecisionState();
    }

    if (this.isInside(this.buttons.DESTROY, x, y)) {
      this.towers = this.towers.filter(t => t !== this.selectedTower);
      this.exitDecisionState();
    }
  }

  isInside(b, x, y) {
    return x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h;
  }

  exitDecisionState() {
    this.state = GameState.PLAYING;
    this.selectedTower = null;
    this.buttons = null;
  }
}
