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

    // Economy
    this.gold = 50;
    this.unitCosts = {
      basic: 10,
      fast: 12,
      tank: 20
    };

    // Waves
    this.currentWave = 1;
    this.waveCooldown = 120;
    this.waveTimer = this.waveCooldown;

    // Spawners
    this.playerSpawner = new Spawner(50, 250, 1);
    this.enemySpawner = new Spawner(850, 250, -1);

    this.towers.push(new Tower(700, 230, "enemy"));

    this.canvas.addEventListener("click", this.handleClick.bind(this));
  }

  update() {
    if (this.state !== GameState.PLAYING) return;

    this.playerSpawner.update(this.units, this);
    this.enemySpawner.update(this.enemyUnits, this);

    if (
      this.playerSpawner.isFinished() &&
      this.enemySpawner.isFinished()
    ) {
      this.waveTimer--;
      if (this.waveTimer <= 0) {
        this.startNextWave();
      }
    }

    this.units.forEach(u => u.update());
    this.enemyUnits.forEach(u => u.update());

    this.towers.forEach(t =>
      t.update(this.units, this.enemyUnits)
    );

    for (const tower of this.towers) {
      if (tower.owner !== "enemy") continue;

      for (const unit of this.units) {
        if (tower.isReachedBy(unit)) {
          unit.attackTower(tower);
        }
      }
    }

    this.towers = this.towers.filter(t => t.hp > 0);

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

    this.units = this.units.filter(u => u.isAlive);
    this.enemyUnits = this.enemyUnits.filter(u => u.isAlive);
  }

  startNextWave() {
    const playerUnits = [];
    const enemyUnits = [];

    for (let i = 0; i < this.currentWave + 2; i++) {
      playerUnits.push(
        Math.random() < 0.3 ? "fast" :
        Math.random() < 0.2 ? "tank" :
        "basic"
      );
      enemyUnits.push("basic");
    }

    this.playerSpawner.startWave(playerUnits);
    this.enemySpawner.startWave(enemyUnits);

    this.currentWave++;
    this.waveTimer = this.waveCooldown;
  }

  draw() {
    // Draw game world
    this.units.forEach(u => u.draw(this.ctx));
    this.enemyUnits.forEach(u => u.draw(this.ctx));
    this.towers.forEach(t => t.draw(this.ctx));

    // ===== HUD (always visible) =====
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    this.ctx.fillRect(10, 10, 150, 70);

    this.ctx.fillStyle = "white";
    this.ctx.font = "16px Arial";
    this.ctx.fillText(`Wave: ${this.currentWave}`, 20, 30);
    this.ctx.fillText(`Gold: ${this.gold}`, 20, 50);

    // Capture decision overlay
    if (this.state === GameState.CAPTURE_DECISION) {
      this.drawCaptureDecision();
    }
  }

  drawCaptureDecision() {
    // Darken background
    this.ctx.fillStyle = "rgba(0,0,0,0.75)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Instruction box
    this.ctx.fillStyle = "white";
    this.ctx.font = "28px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "Tower Reached!",
      this.canvas.width / 2,
      150
    );

    this.ctx.font = "18px Arial";
    this.ctx.fillText(
      "Choose your strategy:",
      this.canvas.width / 2,
      190
    );

    this.drawButton(
      this.canvas.width / 2 - 180,
      240,
      160,
      60,
      "CAPTURE",
      "green"
    );

    this.drawButton(
      this.canvas.width / 2 + 20,
      240,
      160,
      60,
      "DESTROY",
      "red"
    );

    this.ctx.textAlign = "left";
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
      this.gold += 25;
      this.towers = this.towers.filter(
        t => t !== this.selectedTower
      );
      this.exitDecisionState();
    }
  }

  isInside(b, x, y) {
    return (
      x > b.x &&
      x < b.x + b.w &&
      y > b.y &&
      y < b.y + b.h
    );
  }

  exitDecisionState() {
    this.state = GameState.PLAYING;
    this.selectedTower = null;
    this.buttons = null;
  }
}