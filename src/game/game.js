import { GameState } from "./GameState.js";
import { Unit } from "../entities/Unit.js";
import { Tower } from "../entities/Tower.js";

export class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;

    this.state = GameState.PLAYING;

    this.units = [];
    this.enemyUnits = [];
    this.towers = [];
    this.selectedTower = null;

    // Test data
    this.units.push(new Unit(50, 250));        // player unit
    this.enemyUnits.push(new Unit(850, 250)); // enemy unit (temporary)

    // Enemy tower
    this.towers.push(new Tower(700, 230, "enemy"));

    // Input
    this.canvas.addEventListener("click", this.handleClick.bind(this));
  }

  update() {
    if (this.state !== GameState.PLAYING) return;

    // Update units
    this.units.forEach(unit => unit.update());
    this.enemyUnits.forEach(unit => unit.update(-1));

    // Towers attack based on ownership
    this.towers.forEach(tower =>
      tower.update(this.units, this.enemyUnits)
    );

    // Check capture condition
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

    // Cleanup dead units
    this.units = this.units.filter(unit => unit.isAlive);
    this.enemyUnits = this.enemyUnits.filter(unit => unit.isAlive);
  }

  draw() {
    this.drawPlaying();

    if (this.state === GameState.CAPTURE_DECISION) {
      this.drawCaptureDecision();
    }
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
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    if (this.isInside(this.buttons.CAPTURE, mx, my)) {
      this.captureTower();
    }

    if (this.isInside(this.buttons.DESTROY, mx, my)) {
      this.destroyTower();
    }
  }

  isInside(b, x, y) {
    return x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h;
  }

  captureTower() {
    this.selectedTower.owner = "player";
    this.exitDecisionState();
  }

  destroyTower() {
    this.towers = this.towers.filter(
      t => t !== this.selectedTower
    );
    this.exitDecisionState();
  }

  exitDecisionState() {
    this.selectedTower = null;
    this.buttons = null;
    this.state = GameState.PLAYING;
  }
}
