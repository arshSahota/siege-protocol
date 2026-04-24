import { GameState } from "./GameState.js";
import { Unit } from "../entities/Unit.js";
import { Tower } from "../entities/Tower.js";

export class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.state = new GameState();

    // Temporary test entities
    this.units = [new Unit(50, 250)];
    this.towers = [new Tower(700, 250, "enemy")];
  }

  update() {
    this.units.forEach(unit => unit.update());
  }

  draw() {
    this.units.forEach(unit => unit.draw(this.ctx));
    this.towers.forEach(tower => tower.draw(this.ctx));
  }
}