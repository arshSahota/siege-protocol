import { GameState } from "./GameState.js";
import { Unit } from "../entities/Unit.js";
import { Tower } from "../entities/Tower.js";

export class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.state = GameState.PLAYING;

    this.units = [];
    this.towers = [];

    // Temporary test data
    this.units.push(new Unit(50, 250));
    this.towers.push(new Tower(700, 230, "enemy"));
  }

  update() {
    if (this.state === GameState.PLAYING) {
      this.updatePlaying();
    }
  }

  updatePlaying() {
    this.units.forEach(unit => unit.update());
  }

  draw() {
    if (this.state === GameState.PLAYING) {
      this.drawPlaying();
    }
  }

  drawPlaying() {
    this.units.forEach(unit => unit.draw(this.ctx));
    this.towers.forEach(tower => tower.draw(this.ctx));
  }
}
