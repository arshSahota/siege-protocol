import { GameState } from "./GameState.js";
import { Unit } from "../entities/Unit.js";
import { Tower } from "../entities/Tower.js";

export class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.state = GameState.PLAYING;

    this.units = [];
    this.towers = [];
    this.selectedTower = null;

    this.canvas = ctx.canvas;

    // Test data
    this.units.push(new Unit(50, 250));
    this.towers.push(new Tower(700, 230, "enemy"));

    // Mouse input
    this.canvas.addEventListener("click", this.handleClick.bind(this));
  }

  update() {
    if (this.state !== GameState.PLAYING) return;

    this.units.forEach(unit => unit.update());
    this.towers.forEach(tower => tower.update(this.units));

    // Check if unit reached an enemy tower
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

    // Remove dead units
    this.units = this.units.filter(unit => unit.isAlive);
  }

  draw() {
    this.drawPlaying();

    if (this.state === GameState.CAPTURE_DECISION) {
      this.drawCaptureDecision();
    }
  }

  drawPlaying() {
    this.units.forEach(unit => unit.draw(this.ctx));
    this.towers.forEach(tower => tower.draw(this.ctx));
  }

  // =========================
  // CAPTURE / DESTROY UI
  // =========================

  drawCaptureDecision() {
    // Dark overlay
    this.ctx.fillStyle = "rgba(0,0,0,0.7)";
    this.ctx.fillRect(0, 0, 900, 500);

    // Title
    this.ctx.fillStyle = "white";
    this.ctx.font = "26px Arial";
    this.ctx.fillText("Tower Reached!", 330, 170);

    // Buttons
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

    // Store button bounds for click detection
    if (!this.buttons) this.buttons = {};
    this.buttons[text] = { x, y, w, h };
  }

  // =========================
  // INPUT HANDLING
  // =========================

  handleClick(event) {
    if (this.state !== GameState.CAPTURE_DECISION) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (this.isInside(this.buttons.CAPTURE, mouseX, mouseY)) {
      this.captureTower();
    }

    if (this.isInside(this.buttons.DESTROY, mouseX, mouseY)) {
      this.destroyTower();
    }
  }

  isInside(button, x, y) {
    return (
      x > button.x &&
      x < button.x + button.w &&
      y > button.y &&
      y < button.y + button.h
    );
  }

  // =========================
  // ACTIONS
  // =========================

  captureTower() {
    if (!this.selectedTower) return;

    this.selectedTower.owner = "player";
    this.selectedTower.hp = 100;

    this.exitDecisionState();
  }

  destroyTower() {
    if (!this.selectedTower) return;

    this.towers = this.towers.filter(
      tower => tower !== this.selectedTower
    );

    this.exitDecisionState();
  }

  exitDecisionState() {
    this.selectedTower = null;
    this.buttons = null;
    this.state = GameState.PLAYING;
  }
}