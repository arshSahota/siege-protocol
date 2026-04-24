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

    // Test data
    this.units.push(new Unit(50, 250));
    this.towers.push(new Tower(700, 230, "enemy"));
  }

  update() {
    if (this.state !== GameState.PLAYING) return;

    // Update units
    this.units.forEach(unit => unit.update());

    // Update towers (combat)
    this.towers.forEach(tower => tower.update(this.units));

    // Check if a unit reached an enemy tower
    for (const tower of this.towers) {
      if (tower.owner !== "enemy") continue;

      for (const unit of this.units) {
        if (tower.isReachedBy(unit)) {
          this.state = GameState.CAPTURE_DECISION;
          this.selectedTower = tower;
          return; // pause game logic
        }
      }
    }

    // Remove dead units
    this.units = this.units.filter(unit => unit.isAlive);
  }

  draw() {
    if (this.state === GameState.PLAYING) {
      this.drawPlaying();
    }

    if (this.state === GameState.CAPTURE_DECISION) {
      this.drawCaptureDecision();
    }
  }

  drawPlaying() {
    this.units.forEach(unit => unit.draw(this.ctx));
    this.towers.forEach(tower => tower.draw(this.ctx));
  }

  drawCaptureDecision() {
    // Draw game behind overlay
    this.drawPlaying();

    // Dark overlay
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, 900, 500);

    // Text
    this.ctx.fillStyle = "white";
    this.ctx.font = "24px Arial";
    this.ctx.fillText("Tower Reached!", 350, 200);

    this.ctx.font = "18px Arial";
    this.ctx.fillText(
      "Next step: Capture or Destroy",
      300,
      240
    );
  }
}
