import { Unit } from "../entities/Unit.js";

export class Spawner {
  constructor(spawnX, spawnY, direction = 1) {
    this.spawnX = spawnX;
    this.spawnY = spawnY;
    this.direction = direction;

    this.unitsToSpawn = [];
    this.spawnDelay = 30;
    this.timer = 0;
    this.active = false;
  }

  startWave(unitQueue) {
    this.unitsToSpawn = [...unitQueue]; // array of unit types
    this.active = true;
    this.timer = 0;
  }

  update(unitsArray, game) {
    if (!this.active) return;

    this.timer++;

    if (this.timer >= this.spawnDelay && this.unitsToSpawn.length > 0) {
      const nextType = this.unitsToSpawn[0];
      const cost = game.unitCosts[nextType];

      // Player units cost gold
      if (this.direction === 1) {
        if (game.gold < cost) return;
        game.gold -= cost;
      }

      const unit = new Unit(this.spawnX, this.spawnY, nextType);
      unit.speed *= this.direction;

      unitsArray.push(unit);
      this.unitsToSpawn.shift();
      this.timer = 0;
    }

    if (this.unitsToSpawn.length === 0) {
      this.active = false;
    }
  }

  isFinished() {
    return !this.active;
  }
}