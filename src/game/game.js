import { GameState } from "./GameState.js";
import { Unit } from "../entities/Unit.js";
import { Tower } from "../entities/Tower.js";

export class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.state = GameState.PLAYING;

    this.units = [];
    this.towers = [];

    // Test data
    this.units.push(new Unit(50, 250));
    this.towers.push(new Tower(700, 230, "enemy"));
  }

  update() {
    if (this.state !== GameState.PLAYING) return;

    this.units.forEach(unit => unit.update());
    this.towers.forEach(tower => tower.update(this.units));

    // Remove dead units
    this.units = this.units.filter(unit => unit.isAlive);
  }

  draw() {
    if (this.state !== GameState.PLAYING) return;

    this.units.forEach(unit => unit.draw(this.ctx));
    this.towers.forEach(tower => tower.draw(this.ctx));
  }
}